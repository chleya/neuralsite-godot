"""
事件记录数据模型
事件是施工过程中的各种扰动记录
"""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, DateTime, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EventRecord(Base):
    """
    事件记录模型
    记录施工过程中的各种扰动事件
    包括天气影响、停工、问题、检查、支付、人员变动等
    """

    __tablename__ = "event_records"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 事件类型
    # weather(天气影响)、stoppage(停工)、issue(问题)、inspection(检查)、payment(支付)、personnel(人员变动)
    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    # 桩号范围（可选），如 K0+000～K1+000
    station_range: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # 起始桩号（用于空间查询）
    start_station: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )

    # 终止桩号
    end_station: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )

    # 事件开始时间
    start_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True
    )

    # 事件结束时间（可选）
    end_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True
    )

    # 事件描述
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 影响程度：low(低)、medium(中)、high(高)
    impact_level: Mapped[Optional[str]] = mapped_column(
        String(20),
        default="low"
    )

    # 关联的实体IDs（JSON数组）
    related_entities: Mapped[Optional[List[uuid.UUID]]] = mapped_column(
        JSONB,
        default=list
    )

    # 附件URLs（JSON数组）
    attachments: Mapped[Optional[List[str]]] = mapped_column(
        JSONB,
        default=list
    )

    # 额外属性（JSON）
    # 存储事件相关的扩展信息
    extra_data: Mapped[Optional[dict]] = mapped_column(
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

    # 更新时间
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # 索引定义
    __table_args__ = (
        # 事件类型+时间索引
        Index("idx_events_type_time", "event_type", "start_time"),
        # 桩号范围索引
        Index("idx_events_station", "start_station", "end_station"),
    )

    def __repr__(self):
        return f"<EventRecord(id={self.id}, type={self.event_type}, start_time={self.start_time})>"


# 事件类型枚举
EVENT_TYPES = {
    "weather": "天气影响",
    "stoppage": "停工",
    "issue": "问题",
    "inspection": "检查",
    "payment": "支付",
    "personnel": "人员变动",
    "material": "材料供应",
    "equipment": "设备",
    "quality": "质量问题",
    "safety": "安全事故",
    "design": "设计变更",
    "other": "其他"
}

# 影响程度枚举
IMPACT_LEVELS = {
    "low": "低",
    "medium": "中",
    "high": "高"
}
