"""
事件记录服务模块
实现事件记录的创建、查询功能
"""

import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import EventRecord, EVENT_TYPES


class EventService:
    """
    事件记录服务
    负责施工事件记录的创建、查询、管理
    """

    async def create(
        self,
        db: AsyncSession,
        event_type: str,
        start_time: datetime,
        station_range: Optional[str] = None,
        start_station: Optional[str] = None,
        end_station: Optional[str] = None,
        end_time: Optional[datetime] = None,
        description: Optional[str] = None,
        impact_level: str = "low",
        related_entities: Optional[List[uuid.UUID]] = None,
        attachments: Optional[List[str]] = None,
        extra_data: Optional[dict] = None,
        hash_blockchain: Optional[str] = None
    ) -> EventRecord:
        """
        创建事件记录

        参数:
            db: 数据库会话
            event_type: 事件类型
            start_time: 开始时间
            station_range: 桩号范围字符串
            start_station: 起始桩号
            end_station: 终止桩号
            end_time: 结束时间
            description: 描述
            impact_level: 影响程度
            related_entities: 关联实体IDs
            attachments: 附件URLs
            extra_data: 额外数据
            hash_blockchain: 区块链哈希

        返回:
            EventRecord: 创建的事件记录
        """
        event = EventRecord(
            event_type=event_type,
            start_time=start_time,
            station_range=station_range,
            start_station=start_station,
            end_station=end_station,
            end_time=end_time,
            description=description,
            impact_level=impact_level,
            related_entities=related_entities or [],
            attachments=attachments or [],
            extra_data=extra_data or {},
            hash_blockchain=hash_blockchain
        )

        db.add(event)
        await db.flush()
        await db.refresh(event)

        return event

    async def get_by_id(
        self,
        db: AsyncSession,
        event_id: uuid.UUID
    ) -> Optional[EventRecord]:
        """
        根据ID获取事件记录
        """
        result = await db.execute(
            select(EventRecord).where(EventRecord.id == event_id)
        )
        return result.scalar_one_or_none()

    async def list_all(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        event_type: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[EventRecord]:
        """
        获取事件记录列表

        参数:
            db: 数据库会话
            skip: 跳过记录数
            limit: 返回记录数
            event_type: 事件类型过滤
            start_time: 开始时间过滤
            end_time: 结束时间过滤

        返回:
            List[EventRecord]: 事件记录列表
        """
        query = select(EventRecord)

        if event_type:
            query = query.where(EventRecord.event_type == event_type)

        if start_time:
            query = query.where(EventRecord.start_time >= start_time)

        if end_time:
            query = query.where(EventRecord.start_time <= end_time)

        query = query.order_by(desc(EventRecord.start_time)).offset(skip).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def query_by_station(
        self,
        db: AsyncSession,
        station: str
    ) -> List[EventRecord]:
        """
        根据桩号查询事件记录

        参数:
            db: 数据库会话
            station: 桩号

        返回:
            List[EventRecord]: 匹配的事件记录列表
        """
        result = await db.execute(
            select(EventRecord)
            .where(
                and_(
                    EventRecord.start_station <= station,
                    EventRecord.end_station >= station
                )
            )
            .order_by(desc(EventRecord.start_time))
        )
        return list(result.scalars().all())

    async def query_by_time_range(
        self,
        db: AsyncSession,
        start_time: datetime,
        end_time: datetime
    ) -> List[EventRecord]:
        """
        根据时间范围查询事件记录

        参数:
            db: 数据库会话
            start_time: 开始时间
            end_time: 结束时间

        返回:
            List[EventRecord]: 事件记录列表
        """
        result = await db.execute(
            select(EventRecord)
            .where(
                and_(
                    EventRecord.start_time >= start_time,
                    EventRecord.start_time <= end_time
                )
            )
            .order_by(desc(EventRecord.start_time))
        )
        return list(result.scalars().all())

    async def query_by_entity(
        self,
        db: AsyncSession,
        entity_id: uuid.UUID
    ) -> List[EventRecord]:
        """
        根据实体查询关联的事件记录

        参数:
            db: 数据库会话
            entity_id: 实体ID

        返回:
            List[EventRecord]: 事件记录列表
        """
        # 查询关联实体包含指定ID的事件
        result = await db.execute(
            select(EventRecord)
            .where(EventRecord.related_entities.contains([str(entity_id)]))
            .order_by(desc(EventRecord.start_time))
        )
        return list(result.scalars().all())

    async def get_impact_analysis(
        self,
        db: AsyncSession,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> dict:
        """
        获取事件影响分析

        参数:
            db: 数据库会话
            start_time: 开始时间
            end_time: 结束时间

        返回:
            dict: 影响分析数据
        """
        query = select(EventRecord)

        if start_time:
            query = query.where(EventRecord.start_time >= start_time)
        if end_time:
            query = query.where(EventRecord.start_time <= end_time)

        result = await db.execute(query)
        events = list(result.scalars().all())

        # 统计各类型事件数量
        type_counts = {}
        for event in events:
            type_counts[event.event_type] = type_counts.get(event.event_type, 0) + 1

        # 统计各影响程度数量
        impact_counts = {}
        for event in events:
            impact_counts[event.impact_level] = impact_counts.get(event.impact_level, 0) + 1

        return {
            "total_events": len(events),
            "by_type": type_counts,
            "by_impact": impact_counts,
            "events": [
                {
                    "id": str(e.id),
                    "type": e.event_type,
                    "start_time": e.start_time.isoformat(),
                    "impact_level": e.impact_level,
                    "description": e.description
                }
                for e in events[:10]  # 返回最近10条
            ]
        }


# 创建全局事件服务实例
event_service = EventService()
