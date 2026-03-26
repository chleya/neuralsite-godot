"""
状态快照Repository
提供状态快照的专用数据访问方法
"""

from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, date
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.state import StateSnapshot, STATE_TYPES, QUALITY_STATUS
from app.repositories.base import BaseRepository


class StateRepository(BaseRepository[StateSnapshot]):
    """
    状态快照Repository
    提供状态快照的专用查询方法
    """

    def __init__(self, db: AsyncSession):
        super().__init__(StateSnapshot, db)

    async def get_latest_by_entity(
        self,
        entity_id: UUID
    ) -> Optional[StateSnapshot]:
        """
        获取实体的最新状态快照

        Args:
            entity_id: 实体ID

        Returns:
            最新状态快照
        """
        result = await self.db.execute(
            select(StateSnapshot)
            .where(StateSnapshot.entity_id == entity_id)
            .order_by(desc(StateSnapshot.timestamp))
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_entity_history(
        self,
        entity_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[StateSnapshot]:
        """
        获取实体的状态历史

        Args:
            entity_id: 实体ID
            skip: 跳过记录数
            limit: 返回记录数

        Returns:
            状态快照列表（按时间倒序）
        """
        result = await self.db.execute(
            select(StateSnapshot)
            .where(StateSnapshot.entity_id == entity_id)
            .order_by(desc(StateSnapshot.timestamp))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_at_time(
        self,
        entity_id: UUID,
        target_time: datetime
    ) -> Optional[StateSnapshot]:
        """
        获取实体在指定时间点的状态
        用于时间旅行查询

        Args:
            entity_id: 实体ID
            target_time: 目标时间点

        Returns:
            该时间点之前最近的状态快照
        """
        result = await self.db.execute(
            select(StateSnapshot)
            .where(
                and_(
                    StateSnapshot.entity_id == entity_id,
                    StateSnapshot.timestamp <= target_time
                )
            )
            .order_by(desc(StateSnapshot.timestamp))
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_by_time_range(
        self,
        start_time: datetime,
        end_time: datetime,
        entity_id: Optional[UUID] = None,
        state_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[StateSnapshot]:
        """
        获取时间范围内的状态快照

        Args:
            start_time: 开始时间
            end_time: 结束时间
            entity_id: 实体ID过滤
            state_type: 状态类型过滤
            skip: 跳过记录数
            limit: 返回记录数

        Returns:
            状态快照列表
        """
        query = select(StateSnapshot).where(
            and_(
                StateSnapshot.timestamp >= start_time,
                StateSnapshot.timestamp <= end_time
            )
        )

        if entity_id:
            query = query.where(StateSnapshot.entity_id == entity_id)

        if state_type:
            query = query.where(StateSnapshot.state_type == state_type)

        query = query.order_by(StateSnapshot.timestamp).offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_all_latest(
        self,
        entity_ids: Optional[List[UUID]] = None
    ) -> List[StateSnapshot]:
        """
        获取所有实体的最新状态
        用于批量查询当前进度

        Args:
            entity_ids: 实体ID列表，如果为None则查询所有实体

        Returns:
            最新状态快照列表
        """
        if entity_ids:
            snapshots = []
            for entity_id in entity_ids:
                latest = await self.get_latest_by_entity(entity_id)
                if latest:
                    snapshots.append(latest)
            return snapshots
        else:
            # 使用窗口函数获取每个实体的最新状态
            subquery = (
                select(
                    StateSnapshot.entity_id,
                    func.max(StateSnapshot.timestamp).label("max_timestamp")
                )
                .group_by(StateSnapshot.entity_id)
                .subquery()
            )

            result = await self.db.execute(
                select(StateSnapshot)
                .join(
                    subquery,
                    and_(
                        StateSnapshot.entity_id == subquery.c.entity_id,
                        StateSnapshot.timestamp == subquery.c.max_timestamp
                    )
                )
            )
            return list(result.scalars().all())

    async def get_by_quality_status(
        self,
        quality_status: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[StateSnapshot]:
        """
        按质量状态查询

        Args:
            quality_status: 质量状态
            skip: 跳过记录数
            limit: 返回记录数

        Returns:
            状态快照列表
        """
        result = await self.db.execute(
            select(StateSnapshot)
            .where(StateSnapshot.quality_status == quality_status)
            .order_by(desc(StateSnapshot.timestamp))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_unqualified_states(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[StateSnapshot]:
        """
        获取不合格状态记录

        Args:
            start_time: 开始时间过滤
            end_time: 结束时间过滤

        Returns:
            不合格状态列表
        """
        query = select(StateSnapshot).where(
            StateSnapshot.quality_status == "unqualified"
        )

        if start_time:
            query = query.where(StateSnapshot.timestamp >= start_time)

        if end_time:
            query = query.where(StateSnapshot.timestamp <= end_time)

        query = query.order_by(desc(StateSnapshot.timestamp))

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_progress_statistics(
        self,
        entity_ids: Optional[List[UUID]] = None
    ) -> Dict[str, Any]:
        """
        获取进度统计信息

        Args:
            entity_ids: 实体ID列表

        Returns:
            进度统计信息
        """
        latest_states = await self.get_all_latest(entity_ids)

        if not latest_states:
            return {
                "total_entities": 0,
                "average_progress": 0,
                "completed_count": 0,
                "in_progress_count": 0
            }

        total_progress = sum(s.progress or 0 for s in latest_states)
        completed = len([s for s in latest_states if s.progress and s.progress >= 100])
        in_progress = len([s for s in latest_states if s.progress and 0 < (s.progress or 0) < 100])

        return {
            "total_entities": len(latest_states),
            "average_progress": total_progress / len(latest_states),
            "completed_count": completed,
            "in_progress_count": in_progress,
            "pending_count": len(latest_states) - completed - in_progress
        }

    async def get_states_by_date(
        self,
        target_date: date
    ) -> List[StateSnapshot]:
        """
        获取指定日期的所有状态快照

        Args:
            target_date: 目标日期

        Returns:
            状态快照列表
        """
        start_time = datetime.combine(target_date, datetime.min.time())
        end_time = datetime.combine(target_date, datetime.max.time())

        return await self.get_by_time_range(start_time, end_time)

    async def compare_states(
        self,
        entity_id: UUID,
        time1: datetime,
        time2: datetime
    ) -> Dict[str, Any]:
        """
        比较实体在两个时间点的状态差异

        Args:
            entity_id: 实体ID
            time1: 时间点1
            time2: 时间点2

        Returns:
            差异分析结果
        """
        state1 = await self.get_at_time(entity_id, time1)
        state2 = await self.get_at_time(entity_id, time2)

        if not state1 and not state2:
            return {"error": "两个时间点均无状态记录"}

        return {
            "entity_id": str(entity_id),
            "state_at_time1": {
                "timestamp": state1.timestamp.isoformat() if state1 else None,
                "state_type": state1.state_type if state1 else None,
                "progress": state1.progress if state1 else None,
                "quality_status": state1.quality_status if state1 else None
            },
            "state_at_time2": {
                "timestamp": state2.timestamp.isoformat() if state2 else None,
                "state_type": state2.state_type if state2 else None,
                "progress": state2.progress if state2 else None,
                "quality_status": state2.quality_status if state2 else None
            },
            "progress_change": (state2.progress or 0) - (state1.progress or 0) if state1 and state2 else None
        }
