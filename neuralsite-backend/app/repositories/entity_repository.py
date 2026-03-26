"""
工程实体Repository
提供工程实体的专用数据访问方法
"""

from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, and_, or_, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.models.entity import Entity, ENTITY_TYPES
from app.repositories.base import BaseRepository


class EntityRepository(BaseRepository[Entity]):
    """
    工程实体Repository
    提供工程实体的专用查询方法
    """

    def __init__(self, db: AsyncSession):
        super().__init__(Entity, db)

    async def get_by_station_range(
        self,
        start_station: str,
        end_station: str,
        entity_type: Optional[str] = None
    ) -> List[Entity]:
        """
        根据桩号范围查询实体
        支持空间范围查询

        Args:
            start_station: 起始桩号
            end_station: 终止桩号
            entity_type: 实体类型过滤

        Returns:
            匹配的实体列表
        """
        # 解析桩号为毫米数进行数值比较
        query = select(Entity).where(
            and_(
                Entity.start_station <= end_station,
                Entity.end_station >= start_station
            )
        )

        if entity_type:
            query = query.where(Entity.entity_type == entity_type)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_type(self, entity_type: str) -> List[Entity]:
        """
        根据类型获取所有实体

        Args:
            entity_type: 实体类型

        Returns:
            实体列表
        """
        result = await self.db.execute(
            select(Entity).where(Entity.entity_type == entity_type)
        )
        return list(result.scalars().all())

    async def get_with_latest_state(self, entity_id: UUID) -> Optional[Entity]:
        """
        获取实体及其最新状态

        Args:
            entity_id: 实体ID

        Returns:
            实体对象（包含关联状态）
        """
        result = await self.db.execute(
            select(Entity)
            .options(selectinload(Entity.states))
            .where(Entity.id == entity_id)
        )
        entity = result.scalar_one_or_none()

        if entity and entity.states:
            # 按时间排序获取最新状态
            entity.states.sort(key=lambda s: s.timestamp, reverse=True)

        return entity

    async def get_entities_with_states(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Entity]:
        """
        获取所有实体及其状态

        Args:
            skip: 跳过记录数
            limit: 返回记录数

        Returns:
            实体列表
        """
        result = await self.db.execute(
            select(Entity)
            .options(selectinload(Entity.states))
            .offset(skip)
            .limit(limit)
        )
        entities = list(result.scalars().all())

        # 为每个实体排序状态
        for entity in entities:
            if entity.states:
                entity.states.sort(key=lambda s: s.timestamp, reverse=True)

        return entities

    async def search_by_name(self, keyword: str) -> List[Entity]:
        """
        根据名称模糊搜索实体

        Args:
            keyword: 搜索关键词

        Returns:
            匹配的实体列表
        """
        result = await self.db.execute(
            select(Entity).where(Entity.name.ilike(f"%{keyword}%"))
        )
        return list(result.scalars().all())

    async def get_entity_statistics(self) -> Dict[str, Any]:
        """
        获取实体统计信息

        Returns:
            统计信息字典
        """
        # 按类型统计
        type_query = select(
            Entity.entity_type,
            func.count(Entity.id).label("count")
        ).group_by(Entity.entity_type)

        type_result = await self.db.execute(type_query)
        type_stats = {row.entity_type: row.count for row in type_result}

        # 总数
        total = await self.count()

        return {
            "total": total,
            "by_type": type_stats,
            "types": list(ENTITY_TYPES.values())
        }

    async def get_station_statistics(self) -> Dict[str, Any]:
        """
        获取桩号范围统计

        Returns:
            桩号统计信息
        """
        # 获取最小起始桩号和最大终止桩号
        result = await self.db.execute(
            select(
                func.min(Entity.start_station).label("min_start"),
                func.max(Entity.end_station).label("max_end"),
                func.count(Entity.id).label("entity_count")
            )
        )
        row = result.one()

        return {
            "min_start_station": row.min_start,
            "max_end_station": row.max_end,
            "entity_count": row.entity_count
        }

    async def get_entities_by_properties(
        self,
        property_key: str,
        property_value: Any
    ) -> List[Entity]:
        """
        根据属性值查询实体
        使用PostgreSQL的JSONB查询

        Args:
            property_key: 属性键
            property_value: 属性值

        Returns:
            匹配的实体列表
        """
        # 使用PostgreSQL的JSONB操作符
        query = select(Entity).where(
            text(f"properties->>:key = :value").bindparams(
                key=property_key,
                value=str(property_value)
            )
        )

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_adjacent_entities(
        self,
        entity_id: UUID,
        distance: int = 1
    ) -> Tuple[Optional[Entity], Optional[Entity]]:
        """
        获取相邻实体
        在桩号方向上前后的实体

        Args:
            entity_id: 当前实体ID
            distance: 距离（1表示直接相邻）

        Returns:
            (前一个实体, 后一个实体)
        """
        # 获取当前实体
        current = await self.get_by_id(entity_id)
        if not current:
            return None, None

        # 查找前一个（在桩号方向上）
        prev_query = select(Entity).where(
            and_(
                Entity.end_station < current.start_station
            )
        ).order_by(Entity.end_station.desc()).limit(1)

        prev_result = await self.db.execute(prev_query)
        prev_entity = prev_result.scalar_one_or_none()

        # 查找后一个
        next_query = select(Entity).where(
            and_(
                Entity.start_station > current.end_station
            )
        ).order_by(Entity.start_station.asc()).limit(1)

        next_result = await self.db.execute(next_query)
        next_entity = next_result.scalar_one_or_none()

        return prev_entity, next_entity

    async def bulk_create_from_dict(
        self,
        entities_data: List[Dict[str, Any]]
    ) -> List[Entity]:
        """
        批量从字典创建实体

        Args:
            entities_data: 实体数据字典列表

        Returns:
            创建的实体列表
        """
        entities = [Entity(**data) for data in entities_data]
        return await self.bulk_create(entities)
