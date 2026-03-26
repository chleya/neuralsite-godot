"""
图纸管理数据模型
"""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Drawing(Base):
    """
    图纸管理模型
    存储工程图纸的元数据、版本与关联关系
    """

    __tablename__ = "drawings"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 图纸名称
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # 图纸编号
    drawing_no: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # 文件路径
    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    # 文件类型：dwg, dxf, pdf, jpg, png
    file_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # 文件大小（字节）
    file_size: Mapped[Optional[int]] = mapped_column(
        nullable=True
    )

    # 图纸专业：道路、桥梁、涵洞、隧道、排水、设施
    specialty: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        index=True
    )

    # 图纸类型：初步设计、施工图设计、变更设计
    drawing_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )

    # 版本号
    version: Mapped[int] = mapped_column(
        default=1
    )

    # 上级目录ID
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        index=True
    )

    # 关联实体IDs（JSON数组）
    related_entities: Mapped[Optional[List[uuid.UUID]]] = mapped_column(
        JSONB,
        default=list
    )

    # 关联桩号范围
    station_range: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )

    # 备注
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 创建人
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
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
        Index("idx_drawings_parent", "parent_id"),
        Index("idx_drawings_specialty", "specialty"),
        Index("idx_drawings_name", "name"),
    )

    def __repr__(self):
        return f"<Drawing(id={self.id}, name={self.name}, version={self.version})>"


class DrawingFolder(Base):
    """
    图纸目录模型
    用于组织图纸的层级目录结构
    """

    __tablename__ = "drawing_folders"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 目录名称
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # 上级目录ID
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        index=True
    )

    # 目录类型：专业、标段、项目
    folder_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )

    # 排序
    sort_order: Mapped[int] = mapped_column(
        default=0
    )

    # 备注
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
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
        return f"<DrawingFolder(id={self.id}, name={self.name})>"


class DrawingVersion(Base):
    """
    图纸版本记录模型
    存储图纸的版本变更历史
    """

    __tablename__ = "drawing_versions"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 关联图纸ID
    drawing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("drawings.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # 版本号
    version: Mapped[int] = mapped_column(
        nullable=False
    )

    # 文件路径
    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    # 变更说明
    change_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 创建人
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    def __repr__(self):
        return f"<DrawingVersion(id={self.id}, drawing_id={self.drawing_id}, version={self.version})>"


# 图纸类型枚举
DRAWING_TYPES = {
    "preliminary": "初步设计",
    "construction": "施工图设计",
    "change": "变更设计",
    "as_built": "竣工图"
}

# 专业类型枚举
SPECIALTIES = {
    "road": "道路",
    "bridge": "桥梁",
    "culvert": "涵洞",
    "tunnel": "隧道",
    "drainage": "排水",
    "facility": "设施",
    "general": "综合"
}
