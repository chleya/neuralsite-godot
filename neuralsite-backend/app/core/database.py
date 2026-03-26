"""
数据库连接和会话管理模块
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """
    SQLAlchemy声明式基类
    所有模型类都需要继承此类
    """

    pass


# 创建异步数据库引擎
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
)

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db():
    """
    初始化数据库连接
    启动时创建所有表
    """
    async with engine.begin() as conn:
        # 导入所有模型以确保它们被注册
        from app.models import entity, state, event, audit_log

        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """
    关闭数据库连接
    应用关闭时调用
    """
    await engine.dispose()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    获取数据库会话的依赖函数
    用于FastAPI的Depends注入

    用法示例:
    @app.get("/items")
    async def get_items(db: AsyncSession = Depends(get_db)):
        ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_session() -> AsyncSession:
    """
    获取数据库会话（手动管理）
    返回一个数据库会话实例，调用者负责管理事务
    """
    return AsyncSessionLocal()
