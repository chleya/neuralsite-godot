"""
语义标签数据模型
存储实体的语义标签和画像数据
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SemanticTag(Base):
    """
    语义标签模型
    存储实体关联的语义标签
    """

    __tablename__ = "semantic_tags"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 实体ID
    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("entities.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # 标签ID
    tag_id: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    # 标签分类
    category: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )

    # 标签名称
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # 标签值
    value: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # 描述
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 颜色（用于可视化）
    color: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )

    # 优先级
    priority: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    # 元数据
    metadata: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=dict
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
        # 实体+标签ID唯一索引
        Index("idx_semantic_tag_entity_unique", "entity_id", "tag_id", unique=True),
        # 分类+值索引
        Index("idx_semantic_tag_category_value", "category", "value"),
    )

    def __repr__(self):
        return f"<SemanticTag(entity_id={self.entity_id}, tag_id={self.tag_id}, value={self.value})>"


class EntitySemanticProfile(Base):
    """
    实体语义画像模型
    存储实体的完整语义画像
    """

    __tablename__ = "entity_semantic_profiles"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 实体ID
    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("entities.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    # 扩展属性（JSON）
    attributes: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=dict
    )

    # 关联关系（JSON）
    relationships: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=dict
    )

    # 备注历史
    notes: Mapped[Optional[List[str]]] = mapped_column(
        JSONB,
        default=list
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

    def __repr__(self):
        return f"<EntitySemanticProfile(entity_id={self.entity_id})>"


# 标签分类枚举
TAG_CATEGORIES = {
    "construction": "施工状态",
    "quality": "质量等级",
    "material": "材料类型",
    "safety": "安全等级",
    "cost": "成本分类",
    "progress": "进度状态",
    "inspection": "验收状态",
    "risk": "风险等级",
    "custom": "自定义"
}

# 预定义标签
PREDEFINED_TAGS = {
    # 施工状态
    "construction_pending": {"category": "construction", "name": "待施工", "value": "pending", "color": "#808080"},
    "construction_in_progress": {"category": "construction", "name": "施工中", "value": "in_progress", "color": "#FFA500"},
    "construction_completed": {"category": "construction", "name": "已完成", "value": "completed", "color": "#008000"},
    "construction_suspended": {"category": "construction", "name": "已停工", "value": "suspended", "color": "#FF0000"},

    # 质量等级
    "quality_excellent": {"category": "quality", "name": "优良", "value": "excellent", "color": "#00FF00"},
    "quality_qualified": {"category": "quality", "name": "合格", "value": "qualified", "color": "#90EE90"},
    "quality_unqualified": {"category": "quality", "name": "不合格", "value": "unqualified", "color": "#FF0000"},
    "quality_pending_inspection": {"category": "quality", "name": "待检", "value": "pending", "color": "#FFFF00"},

    # 安全等级
    "safety_normal": {"category": "safety", "name": "安全", "value": "normal", "color": "#00FF00"},
    "safety_warning": {"category": "safety", "name": "注意", "value": "warning", "color": "#FFFF00"},
    "safety_danger": {"category": "safety", "name": "危险", "value": "danger", "color": "#FF0000"},

    # 风险等级
    "risk_low": {"category": "risk", "name": "低风险", "value": "low", "color": "#00FF00"},
    "risk_medium": {"category": "risk", "name": "中风险", "value": "medium", "color": "#FFFF00"},
    "risk_high": {"category": "risk", "name": "高风险", "value": "high", "color": "#FFA500"},
    "risk_critical": {"category": "risk", "name": "极高风险", "value": "critical", "color": "#FF0000"},

    # 验收状态
    "inspection_not_started": {"category": "inspection", "name": "未验收", "value": "not_started", "color": "#808080"},
    "inspection_in_progress": {"category": "inspection", "name": "验收中", "value": "in_progress", "color": "#FFA500"},
    "inspection_passed": {"category": "inspection", "name": "验收通过", "value": "passed", "color": "#00FF00"},
    "inspection_failed": {"category": "inspection", "name": "验收未通过", "value": "failed", "color": "#FF0000"},
}
