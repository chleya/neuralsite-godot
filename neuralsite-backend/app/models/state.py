"""
状态快照数据模型
状态是实体在特定时间点的快照
"""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Numeric, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class StateSnapshot(Base):
    """
    状态快照模型
    记录工程实体在特定时间点的状态
    每个时间点对应一个状态快照
    """

    __tablename__ = "state_snapshots"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 外键：关联的实体ID
    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("entities.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # 时间戳：状态记录的时间点
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True
    )

    # 状态类型
    # planning(规划)、clearing(清表)、earthwork(土方)、pavement(路面)、finishing(收尾)、completed(完成)
    state_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # 进度百分比（0-100）
    progress: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 2),
        default=0.0
    )

    # 质量状态：qualified(合格)、unqualified(不合格)、pending(待检)
    quality_status: Mapped[Optional[str]] = mapped_column(
        String(20),
        default="pending"
    )

    # 现场照片URLs（JSON数组）
    images: Mapped[Optional[List[str]]] = mapped_column(
        JSONB,
        default=list
    )

    # 备注说明
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 工程量数据（JSON）
    # 存储该状态下的工程量统计：土方量、混凝土量等
    quantities: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=dict
    )

    # 区块链哈希存证
    hash_blockchain: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    # 关系：关联的实体
    entity: Mapped["Entity"] = relationship(
        "Entity",
        back_populates="states"
    )

    # 索引定义
    __table_args__ = (
        # 实体+时间复合索引，用于快速查询某实体的历史状态
        Index("idx_states_entity_time", "entity_id", "timestamp"),
        # 时间索引，用于查询某时间点的所有状态
        Index("idx_states_time", "timestamp"),
    )

    def __repr__(self):
        return f"<StateSnapshot(id={self.id}, entity_id={self.entity_id}, timestamp={self.timestamp}, progress={self.progress})>"


# 状态类型枚举
STATE_TYPES = {
    "planning": "规划",
    "clearing": "清表",
    "earthwork": "土方施工",
    "pavement": "路面铺装",
    "finishing": "收尾",
    "completed": "完成"
}

# 质量状态枚举
QUALITY_STATUS = {
    "qualified": "合格",
    "unqualified": "不合格",
    "pending": "待检"
}


# 向前引用避免循环依赖
from app.models.entity import Entity
