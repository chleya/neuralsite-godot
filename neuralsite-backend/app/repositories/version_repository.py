"""
版本节点Repository
提供版本链数据的持久化存储
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, and_, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.repositories.base import BaseRepository


class VersionRepository:
    """
    版本节点Repository
    管理版本链数据的持久化
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_version_node(
        self,
        version_id: str,
        entity_id: UUID,
        timestamp: datetime,
        version_type: str,
        parent_version_id: Optional[str] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        保存版本节点

        Args:
            version_id: 版本ID
            entity_id: 实体ID
            timestamp: 时间戳
            version_type: 版本类型
            parent_version_id: 父版本ID
            description: 描述
            metadata: 元数据

        Returns:
            是否保存成功
        """
        from app.models.version_node import VersionNode

        node = VersionNode(
            version_id=version_id,
            entity_id=entity_id,
            timestamp=timestamp,
            version_type=version_type,
            parent_version_id=parent_version_id,
            description=description,
            metadata=metadata or {}
        )

        self.db.add(node)
        try:
            await self.db.flush()
            return True
        except Exception:
            await self.db.rollback()
            return False

    async def get_version_node(
        self,
        version_id: str
    ) -> Optional[Any]:
        """
        获取版本节点

        Args:
            version_id: 版本ID

        Returns:
            版本节点
        """
        from app.models.version_node import VersionNode

        result = await self.db.execute(
            select(VersionNode).where(VersionNode.version_id == version_id)
        )
        return result.scalar_one_or_none()

    async def get_entity_versions(
        self,
        entity_id: UUID,
        version_type: Optional[str] = None
    ) -> List[Any]:
        """
        获取实体的所有版本

        Args:
            entity_id: 实体ID
            version_type: 版本类型过滤

        Returns:
            版本节点列表
        """
        from app.models.version_node import VersionNode

        query = select(VersionNode).where(
            VersionNode.entity_id == entity_id
        )

        if version_type:
            query = query.where(VersionNode.version_type == version_type)

        query = query.order_by(VersionNode.timestamp)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_latest_version(
        self,
        entity_id: UUID,
        version_type: Optional[str] = None
    ) -> Optional[Any]:
        """
        获取实体的最新版本

        Args:
            entity_id: 实体ID
            version_type: 版本类型

        Returns:
            最新版本节点
        """
        from app.models.version_node import VersionNode

        query = select(VersionNode).where(
            VersionNode.entity_id == entity_id
        )

        if version_type:
            query = query.where(VersionNode.version_type == version_type)

        query = query.order_by(VersionNode.timestamp.desc()).limit(1)

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_versions_in_range(
        self,
        entity_id: UUID,
        start_time: datetime,
        end_time: datetime
    ) -> List[Any]:
        """
        获取时间范围内的版本

        Args:
            entity_id: 实体ID
            start_time: 开始时间
            end_time: 结束时间

        Returns:
            版本节点列表
        """
        from app.models.version_node import VersionNode

        result = await self.db.execute(
            select(VersionNode)
            .where(
                and_(
                    VersionNode.entity_id == entity_id,
                    VersionNode.timestamp >= start_time,
                    VersionNode.timestamp <= end_time
                )
            )
            .order_by(VersionNode.timestamp)
        )
        return list(result.scalars().all())

    async def get_version_chain(
        self,
        entity_id: UUID
    ) -> List[Any]:
        """
        获取完整的版本链

        Args:
            entity_id: 实体ID

        Returns:
            按时间排序的版本列表
        """
        from app.models.version_node import VersionNode

        result = await self.db.execute(
            select(VersionNode)
            .where(VersionNode.entity_id == entity_id)
            .order_by(VersionNode.timestamp)
        )
        return list(result.scalars().all())

    async def get_baseline_version(
        self,
        entity_id: UUID
    ) -> Optional[Any]:
        """
        获取实体的基准版本

        Args:
            entity_id: 实体ID

        Returns:
            基准版本节点
        """
        return await self.get_latest_version(entity_id, "baseline")

    async def get_current_version(
        self,
        entity_id: UUID
    ) -> Optional[Any]:
        """
        获取实体的当前版本

        Args:
            entity_id: 实体ID

        Returns:
            当前版本节点
        """
        return await self.get_latest_version(entity_id, "current")

    async def get_version_statistics(self) -> Dict[str, Any]:
        """
        获取版本统计信息

        Returns:
            统计信息
        """
        from app.models.version_node import VersionNode

        # 统计各类型版本数量
        type_query = select(
            VersionNode.version_type,
            func.count(VersionNode.version_id).label("count")
        ).group_by(VersionNode.version_type)

        type_result = await self.db.execute(type_query)
        type_stats = {row.version_type: row.count for row in type_result}

        # 总版本数
        total = sum(type_stats.values())

        return {
            "total_versions": total,
            "by_type": type_stats
        }

    async def bulk_save_versions(
        self,
        versions: List[Dict[str, Any]]
    ) -> int:
        """
        批量保存版本节点

        Args:
            versions: 版本数据列表

        Returns:
            保存数量
        """
        from app.models.version_node import VersionNode

        nodes = [VersionNode(**v) for v in versions]
        self.db.add_all(nodes)

        try:
            await self.db.flush()
            return len(nodes)
        except Exception:
            await self.db.rollback()
            return 0
