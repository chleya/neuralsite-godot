"""
Repository基类模块
提供通用的数据访问方法
"""

from typing import TypeVar, Generic, Type, Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

T = TypeVar('T')


class BaseRepository(Generic[T]):
    """
    通用Repository基类
    提供CRUD操作的基础实现
    子类需要指定model_class
    """

    def __init__(self, model_class: Type[T], db: AsyncSession):
        """
        初始化Repository

        Args:
            model_class: SQLAlchemy模型类
            db: 异步数据库会话
        """
        self.model_class = model_class
        self.db = db

    async def get_by_id(self, id: UUID) -> Optional[T]:
        """
        根据ID获取记录

        Args:
            id: 记录UUID

        Returns:
            记录对象或None
        """
        result = await self.db.execute(
            select(self.model_class).where(self.model_class.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[T]:
        """
        获取所有记录（支持分页和过滤）

        Args:
            skip: 跳过记录数
            limit: 返回记录数
            filters: 过滤条件字典

        Returns:
            记录列表
        """
        query = select(self.model_class)

        if filters:
            for key, value in filters.items():
                if hasattr(self.model_class, key):
                    if isinstance(value, list):
                        query = query.where(getattr(self.model_class, key).in_(value))
                    else:
                        query = query.where(getattr(self.model_class, key) == value)

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> T:
        """
        创建新记录

        Args:
            **kwargs: 模型字段值

        Returns:
            创建的记录对象
        """
        instance = self.model_class(**kwargs)
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance

    async def update(self, id: UUID, **kwargs) -> Optional[T]:
        """
        更新记录

        Args:
            id: 记录UUID
            **kwargs: 要更新的字段值

        Returns:
            更新后的记录对象或None
        """
        await self.db.execute(
            update(self.model_class)
            .where(self.model_class.id == id)
            .values(**kwargs)
        )
        await self.db.flush()
        return await self.get_by_id(id)

    async def delete(self, id: UUID) -> bool:
        """
        删除记录

        Args:
            id: 记录UUID

        Returns:
            是否删除成功
        """
        result = await self.db.execute(
            delete(self.model_class).where(self.model_class.id == id)
        )
        await self.db.flush()
        return result.rowcount > 0

    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        统计记录数量

        Args:
            filters: 过滤条件

        Returns:
            记录数量
        """
        query = select(func.count(self.model_class.id))

        if filters:
            conditions = []
            for key, value in filters.items():
                if hasattr(self.model_class, key):
                    conditions.append(getattr(self.model_class, key) == value)
            if conditions:
                query = query.where(and_(*conditions))

        result = await self.db.execute(query)
        return result.scalar() or 0

    async def exists(self, id: UUID) -> bool:
        """
        检查记录是否存在

        Args:
            id: 记录UUID

        Returns:
            是否存在
        """
        result = await self.db.execute(
            select(func.count(self.model_class.id))
            .where(self.model_class.id == id)
        )
        return (result.scalar() or 0) > 0

    async def bulk_create(self, instances: List[T]) -> List[T]:
        """
        批量创建记录

        Args:
            instances: 实例列表

        Returns:
            创建的实例列表
        """
        self.db.add_all(instances)
        await self.db.flush()
        for instance in instances:
            await self.db.refresh(instance)
        return instances

    async def bulk_update(self, ids: List[UUID], **kwargs) -> int:
        """
        批量更新记录

        Args:
            ids: 记录UUID列表
            **kwargs: 要更新的字段值

        Returns:
            更新的记录数量
        """
        result = await self.db.execute(
            update(self.model_class)
            .where(self.model_class.id.in_(ids))
            .values(**kwargs)
        )
        await self.db.flush()
        return result.rowcount
