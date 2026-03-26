"""
语义标签Repository
提供语义标签数据的持久化存储
"""

from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, and_, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository


class SemanticTagRepository:
    """
    语义标签Repository
    管理实体语义画像的持久化
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_entity_tags(
        self,
        entity_id: UUID,
        tags: Dict[str, Dict[str, Any]]
    ) -> bool:
        """
        保存实体的标签

        Args:
            entity_id: 实体ID
            tags: 标签字典 {tag_id: tag_data}

        Returns:
            是否保存成功
        """
        from app.models.semantic_tag import SemanticTag, EntitySemanticProfile

        # 先删除旧标签
        await self.db.execute(
            text("DELETE FROM semantic_tags WHERE entity_id = :entity_id").bindparams(
                entity_id=entity_id
            )
        )

        # 插入新标签
        for tag_id, tag_data in tags.items():
            tag = SemanticTag(
                entity_id=entity_id,
                tag_id=tag_id,
                category=tag_data.get("category"),
                name=tag_data.get("name"),
                value=tag_data.get("value"),
                description=tag_data.get("description"),
                color=tag_data.get("color"),
                priority=tag_data.get("priority", 0),
                metadata=tag_data.get("metadata", {})
            )
            self.db.add(tag)

        try:
            await self.db.flush()
            return True
        except Exception:
            await self.db.rollback()
            return False

    async def add_tag(
        self,
        entity_id: UUID,
        tag_id: str,
        category: str,
        name: str,
        value: str,
        description: Optional[str] = None,
        color: Optional[str] = None,
        priority: int = 0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        添加单个标签

        Args:
            entity_id: 实体ID
            tag_id: 标签ID
            category: 标签分类
            name: 标签名称
            value: 标签值
            description: 描述
            color: 颜色
            priority: 优先级
            metadata: 元数据

        Returns:
            是否添加成功
        """
        from app.models.semantic_tag import SemanticTag

        # 检查是否已存在
        existing = await self.db.execute(
            select(SemanticTag).where(
                and_(
                    SemanticTag.entity_id == entity_id,
                    SemanticTag.tag_id == tag_id
                )
            )
        )

        if existing.scalar_one_or_none():
            # 更新现有标签
            await self.db.execute(
                text("""
                    UPDATE semantic_tags
                    SET category = :category, name = :name, value = :value,
                        description = :description, color = :color, priority = :priority,
                        metadata = :metadata, updated_at = :updated_at
                    WHERE entity_id = :entity_id AND tag_id = :tag_id
                """).bindparams(
                    entity_id=entity_id,
                    tag_id=tag_id,
                    category=category,
                    name=name,
                    value=value,
                    description=description,
                    color=color,
                    priority=priority,
                    metadata=metadata or {},
                    updated_at=datetime.utcnow()
                )
            )
        else:
            # 插入新标签
            tag = SemanticTag(
                entity_id=entity_id,
                tag_id=tag_id,
                category=category,
                name=name,
                value=value,
                description=description,
                color=color,
                priority=priority,
                metadata=metadata or {}
            )
            self.db.add(tag)

        try:
            await self.db.flush()
            return True
        except Exception:
            await self.db.rollback()
            return False

    async def remove_tag(
        self,
        entity_id: UUID,
        tag_id: str
    ) -> bool:
        """
        移除标签

        Args:
            entity_id: 实体ID
            tag_id: 标签ID

        Returns:
            是否移除成功
        """
        from app.models.semantic_tag import SemanticTag

        result = await self.db.execute(
            select(SemanticTag).where(
                and_(
                    SemanticTag.entity_id == entity_id,
                    SemanticTag.tag_id == tag_id
                )
            )
        )
        tag = result.scalar_one_or_none()

        if tag:
            await self.db.delete(tag)
            await self.db.flush()
            return True

        return False

    async def get_entity_tags(
        self,
        entity_id: UUID
    ) -> List[Dict[str, Any]]:
        """
        获取实体的所有标签

        Args:
            entity_id: 实体ID

        Returns:
            标签列表
        """
        from app.models.semantic_tag import SemanticTag

        result = await self.db.execute(
            select(SemanticTag).where(SemanticTag.entity_id == entity_id)
        )
        tags = result.scalars().all()

        return [
            {
                "tag_id": tag.tag_id,
                "category": tag.category,
                "name": tag.name,
                "value": tag.value,
                "description": tag.description,
                "color": tag.color,
                "priority": tag.priority,
                "metadata": tag.metadata
            }
            for tag in tags
        ]

    async def get_entity_tags_by_category(
        self,
        entity_id: UUID,
        category: str
    ) -> List[Dict[str, Any]]:
        """
        获取实体指定分类的标签

        Args:
            entity_id: 实体ID
            category: 标签分类

        Returns:
            标签列表
        """
        from app.models.semantic_tag import SemanticTag

        result = await self.db.execute(
            select(SemanticTag).where(
                and_(
                    SemanticTag.entity_id == entity_id,
                    SemanticTag.category == category
                )
            )
        )
        tags = result.scalars().all()

        return [
            {
                "tag_id": tag.tag_id,
                "name": tag.name,
                "value": tag.value,
                "priority": tag.priority
            }
            for tag in tags
        ]

    async def query_entities_by_tags(
        self,
        tag_ids: List[str],
        match_mode: str = "all"
    ) -> List[UUID]:
        """
        根据标签查询实体

        Args:
            tag_ids: 标签ID列表
            match_mode: 匹配模式 "all" 或 "any"

        Returns:
            匹配的实体ID列表
        """
        from app.models.semantic_tag import SemanticTag

        if match_mode == "all":
            # 必须包含所有指定标签
            # 统计每个实体的标签匹配数
            result = await self.db.execute(
                select(SemanticTag.entity_id)
                .where(SemanticTag.tag_id.in_(tag_ids))
            )
            entity_counts: Dict[UUID, int] = {}
            for row in result.scalars():
                entity_counts[row] = entity_counts.get(row, 0) + 1

            return [eid for eid, count in entity_counts.items() if count == len(tag_ids)]
        else:
            # 包含任一标签
            result = await self.db.execute(
                select(SemanticTag.entity_id)
                .where(SemanticTag.tag_id.in_(tag_ids))
            )
            return list(set(result.scalars().all()))

    async def query_entities_by_category(
        self,
        category: str,
        tag_value: Optional[str] = None
    ) -> List[UUID]:
        """
        根据分类查询实体

        Args:
            category: 标签分类
            tag_value: 标签值过滤

        Returns:
            匹配的实体ID列表
        """
        from app.models.semantic_tag import SemanticTag

        query = select(SemanticTag.entity_id).where(
            SemanticTag.category == category
        )

        if tag_value:
            query = query.where(SemanticTag.value == tag_value)

        result = await self.db.execute(query)
        return list(set(result.scalars().all()))

    async def get_tag_statistics(self) -> Dict[str, Any]:
        """
        获取标签统计信息

        Returns:
            统计信息
        """
        from app.models.semantic_tag import SemanticTag

        # 按分类统计
        category_query = select(
            SemanticTag.category,
            func.count(SemanticTag.tag_id).label("count")
        ).group_by(SemanticTag.category)

        category_result = await self.db.execute(category_query)
        category_stats = {row.category: row.count for row in category_result}

        # 按值统计（仅统计常用值）
        value_query = select(
            SemanticTag.value,
            func.count(SemanticTag.tag_id).label("count")
        ).group_by(SemanticTag.value).order_by(func.count(SemanticTag.tag_id).desc()).limit(10)

        value_result = await self.db.execute(value_query)
        value_stats = {row.value: row.count for row in value_result}

        # 实体覆盖率
        total_entities = await self.db.execute(
            select(func.count(func.distinct(SemanticTag.entity_id)))
        )
        tagged_entities = total_entities.scalar() or 0

        return {
            "by_category": category_stats,
            "top_values": value_stats,
            "tagged_entities": tagged_entities
        }
