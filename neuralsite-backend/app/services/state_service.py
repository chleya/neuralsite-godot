"""
状态快照服务模块
实现状态快照的创建、查询功能
"""

import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.state import StateSnapshot, STATE_TYPES
from app.models.entity import Entity


class StateService:
    """
    状态快照服务
    负责工程实体状态快照的创建、查询、管理
    """

    async def create(
        self,
        db: AsyncSession,
        entity_id: uuid.UUID,
        timestamp: datetime,
        state_type: str,
        progress: float = 0.0,
        quality_status: str = "pending",
        images: Optional[List[str]] = None,
        notes: Optional[str] = None,
        quantities: Optional[dict] = None,
        hash_blockchain: Optional[str] = None
    ) -> StateSnapshot:
        """
        创建状态快照

        参数:
            db: 数据库会话
            entity_id: 实体ID
            timestamp: 时间戳
            state_type: 状态类型
            progress: 进度百分比（0-100）
            quality_status: 质量状态
            images: 现场照片URLs
            notes: 备注
            quantities: 工程量数据
            hash_blockchain: 区块链哈希

        返回:
            StateSnapshot: 创建的状态快照
        """
        snapshot = StateSnapshot(
            entity_id=entity_id,
            timestamp=timestamp,
            state_type=state_type,
            progress=progress,
            quality_status=quality_status,
            images=images or [],
            notes=notes,
            quantities=quantities or {},
            hash_blockchain=hash_blockchain
        )

        db.add(snapshot)
        await db.flush()
        await db.refresh(snapshot)

        return snapshot

    async def get_by_id(
        self,
        db: AsyncSession,
        snapshot_id: uuid.UUID
    ) -> Optional[StateSnapshot]:
        """
        根据ID获取状态快照
        """
        result = await db.execute(
            select(StateSnapshot).where(StateSnapshot.id == snapshot_id)
        )
        return result.scalar_one_or_none()

    async def get_entity_latest(
        self,
        db: AsyncSession,
        entity_id: uuid.UUID
    ) -> Optional[StateSnapshot]:
        """
        获取实体的最新状态快照

        参数:
            db: 数据库会话
            entity_id: 实体ID

        返回:
            StateSnapshot: 最新状态快照
        """
        result = await db.execute(
            select(StateSnapshot)
            .where(StateSnapshot.entity_id == entity_id)
            .order_by(desc(StateSnapshot.timestamp))
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_entity_history(
        self,
        db: AsyncSession,
        entity_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[StateSnapshot]:
        """
        获取实体的历史状态快照

        参数:
            db: 数据库会话
            entity_id: 实体ID
            skip: 跳过记录数
            limit: 返回记录数

        返回:
            List[StateSnapshot]: 状态快照列表
        """
        result = await db.execute(
            select(StateSnapshot)
            .where(StateSnapshot.entity_id == entity_id)
            .order_by(desc(StateSnapshot.timestamp))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_entity_at_time(
        self,
        db: AsyncSession,
        entity_id: uuid.UUID,
        timestamp: datetime
    ) -> Optional[StateSnapshot]:
        """
        获取实体在指定时间点的状态快照
        用于版本模拟功能

        参数:
            db: 数据库会话
            entity_id: 实体ID
            timestamp: 指定时间点

        返回:
            StateSnapshot: 时刻的状态快照
        """
        result = await db.execute(
            select(StateSnapshot)
            .where(
                and_(
                    StateSnapshot.entity_id == entity_id,
                    StateSnapshot.timestamp <= timestamp
                )
            )
            .order_by(desc(StateSnapshot.timestamp))
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def list_by_time_range(
        self,
        db: AsyncSession,
        start_time: datetime,
        end_time: datetime,
        entity_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[StateSnapshot]:
        """
        根据时间范围查询状态快照

        参数:
            db: 数据库会话
            start_time: 开始时间
            end_time: 结束时间
            entity_id: 实体ID过滤
            skip: 跳过记录数
            limit: 返回记录数

        返回:
            List[StateSnapshot]: 状态快照列表
        """
        query = select(StateSnapshot).where(
            and_(
                StateSnapshot.timestamp >= start_time,
                StateSnapshot.timestamp <= end_time
            )
        )

        if entity_id:
            query = query.where(StateSnapshot.entity_id == entity_id)

        query = query.order_by(StateSnapshot.timestamp).offset(skip).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_current_states(
        self,
        db: AsyncSession,
        entity_ids: Optional[List[uuid.UUID]] = None
    ) -> List[StateSnapshot]:
        """
        获取所有实体的当前状态
        用于实时查询功能

        参数:
            db: 数据库会话
            entity_ids: 实体ID列表，如果为None则查询所有实体

        返回:
            List[StateSnapshot]: 当前状态快照列表
        """
        # 获取每个实体的最新状态
        if entity_ids:
            snapshots = []
            for entity_id in entity_ids:
                latest = await self.get_entity_latest(db, entity_id)
                if latest:
                    snapshots.append(latest)
            return snapshots
        else:
            # 查询所有实体的最新状态
            # 使用子查询获取每个实体的最新时间戳
            from sqlalchemy import func

            subquery = (
                select(
                    StateSnapshot.entity_id,
                    func.max(StateSnapshot.timestamp).label("max_timestamp")
                )
                .group_by(StateSnapshot.entity_id)
                .subquery()
            )

            result = await db.execute(
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

    async def simulate_state(
        self,
        db: AsyncSession,
        entity_id: uuid.UUID,
        target_time: datetime
    ) -> dict:
        """
        模拟实体在目标时间点的状态
        用于版本模拟功能：预测未来状态

        参数:
            db: 数据库会话
            entity_id: 实体ID
            target_time: 目标时间点

        返回:
            dict: 模拟的状态数据
        """
        # 获取目标时间点之前的状态
        current_state = await self.get_entity_at_time(db, entity_id, target_time)

        if current_state:
            # 如果存在历史状态，基于历史状态进行简单预测
            return {
                "entity_id": str(entity_id),
                "timestamp": target_time.isoformat(),
                "state_type": current_state.state_type,
                "progress": current_state.progress,
                "quality_status": current_state.quality_status,
                "simulated": True,
                "based_on": str(current_state.id)
            }
        else:
            # 如果不存在历史状态，返回初始状态
            return {
                "entity_id": str(entity_id),
                "timestamp": target_time.isoformat(),
                "state_type": "planning",
                "progress": 0.0,
                "quality_status": "pending",
                "simulated": True,
                "based_on": None
            }


# 创建全局状态服务实例
state_service = StateService()
