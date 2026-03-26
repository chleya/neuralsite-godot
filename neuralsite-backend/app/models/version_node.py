"""
版本节点数据模型
存储状态版本链数据
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, DateTime, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VersionNode(Base):
    """
    版本节点模型
    记录状态版本链中的每个节点
    """

    __tablename__ = "version_nodes"

    # 版本ID
    version_id: Mapped[str] = mapped_column(
        String(100),
        primary_key=True
    )

    # 关联实体ID
    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("entities.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # 时间戳
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True
    )

    # 版本类型：baseline, current, planned, simulated, forecast
    version_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )

    # 父版本ID（版本链指针）
    parent_version_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # 版本描述
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 元数据（JSON格式）
    metadata: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=dict
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    # 索引定义
    __table_args__ = (
        # 实体+类型复合索引
        Index("idx_version_entity_type", "entity_id", "version_type"),
        # 实体+时间复合索引
        Index("idx_version_entity_time", "entity_id", "timestamp"),
    )

    def __repr__(self):
        return f"<VersionNode(version_id={self.version_id}, entity_id={self.entity_id}, type={self.version_type})>"


# 版本类型枚举
VERSION_TYPES = {
    "baseline": "设计基准版",
    "current": "当前实际版",
    "planned": "计划版",
    "simulated": "模拟版",
    "forecast": "预测版"
}
