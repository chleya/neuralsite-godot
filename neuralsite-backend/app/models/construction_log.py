"""
施工日志数据模型
"""

import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, DateTime, Date, Text, Integer, ForeignKey, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ConstructionLog(Base):
    """
    施工日志模型
    记录每日施工过程的核心数据
    """

    __tablename__ = "construction_logs"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 施工日期
    log_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True
    )

    # 天气：晴、阴、雨、雪、风、雾等
    weather: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )

    # 温度范围（摄氏度）
    temperature_min: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 1),
        nullable=True
    )
    temperature_max: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 1),
        nullable=True
    )

    # 施工桩号范围
    station_range: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # 施工部位/分项工程
    work_location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    # 作业班组
    work_team: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # 施工内容
    work_content: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 完成工程量（JSON格式）
    completed_quantity: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=dict
    )

    # 投入人员数量
    personnel_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )

    # 使用设备（JSON数组）
    equipment_used: Mapped[Optional[List[dict]]] = mapped_column(
        JSONB,
        default=list
    )

    # 材料消耗（JSON格式）
    material_consumption: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        default=dict
    )

    # 存在问题
    issues: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 处理措施
    solutions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 备注
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 附件URLs（JSON数组）
    attachments: Mapped[Optional[List[str]]] = mapped_column(
        JSONB,
        default=list
    )

    # 记录人
    created_by: Mapped[Optional[str]] = mapped_column(
        String(100),
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
        Index("idx_logs_date_team", "log_date", "work_team"),
        Index("idx_logs_station", "station_range"),
    )

    def __repr__(self):
        return f"<ConstructionLog(id={self.id}, log_date={self.log_date}, work_team={self.work_team})>"


class ConstructionPhoto(Base):
    """
    施工照片模型
    存储现场施工照片的元数据
    """

    __tablename__ = "construction_photos"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # 照片标题
    title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    # 照片描述
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # 文件路径
    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    # 拍摄日期
    capture_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    # 拍摄位置（桩号）
    station: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )

    # 照片分类：施工前、施工中、施工后、隐蔽工程、质量问题、安全隐患
    photo_category: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        index=True
    )

    # 标签（JSON数组）
    tags: Mapped[Optional[List[str]]] = mapped_column(
        JSONB,
        default=list
    )

    # 关联实体ID
    related_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
    )

    # 关联施工日志ID
    related_log_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
    )

    # 拍摄人
    photographer: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )

    # GPS坐标
    gps_latitude: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 7),
        nullable=True
    )
    gps_longitude: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 7),
        nullable=True
    )

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    def __repr__(self):
        return f"<ConstructionPhoto(id={self.id}, title={self.title}, capture_date={self.capture_date})>"


# 天气类型枚举
WEATHER_TYPES = {
    "sunny": "晴",
    "cloudy": "阴",
    "overcast": "多云",
    "rain": "雨",
    "heavy_rain": "大雨",
    "snow": "雪",
    "fog": "雾",
    "wind": "风",
    "storm": "暴风雨"
}

# 照片分类枚举
PHOTO_CATEGORIES = {
    "before": "施工前",
    "during": "施工中",
    "after": "施工后",
    "hidden": "隐蔽工程",
    "quality": "质量问题",
    "safety": "安全隐患",
    "general": "一般照片"
}
