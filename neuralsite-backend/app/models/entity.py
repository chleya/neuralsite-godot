"""
工程实体数据模型 - 完整版本
包含设计参数、4D进度、质量管理和安全管理
"""

import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import (
    String,
    Numeric,
    DateTime,
    Text,
    Index,
    Boolean,
    Integer,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class QualityStatus(str, enum.Enum):
    """质量状态枚举"""

    PENDING = "pending"  # 待检验
    INSPECTING = "inspecting"  # 检验中
    QUALIFIED = "qualified"  # 合格
    UNQUALIFIED = "unqualified"  # 不合格
    ACCEPTED = "accepted"  # 已验收


class SafetyLevel(str, enum.Enum):
    """安全风险等级"""

    LOW = "low"  # 低风险
    MEDIUM = "medium"  # 中风险
    HIGH = "high"  # 高风险
    CRITICAL = "critical"  # 极高风险


class Entity(Base):
    """
    工程实体模型
    代表道路工程中的各种实体：路基、桥梁、涵洞、隧道、边坡、排水设施等
    包含完整的设计参数、4D进度、质量和安全信息
    """

    __tablename__ = "entities"

    # ============ 基本信息 ============
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # ============ 空间位置 (桩号) ============
    start_station: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    end_station: Mapped[str] = mapped_column(String(50), nullable=False)

    # ============ 几何尺寸 ============
    lateral_offset: Mapped[float] = mapped_column(Numeric(10, 3), default=0.0)

    elevation_base: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 3), nullable=True
    )

    width: Mapped[Optional[float]] = mapped_column(Numeric(10, 3), nullable=True)

    height: Mapped[Optional[float]] = mapped_column(Numeric(10, 3), nullable=True)

    # ============ 设计参数 (JSON) ============
    # 存储完整的设计参数，包括：
    # - 材料规格 (material_specs)
    # - 结构参数 (structural_params)
    # - 纵坡/横坡 (grades)
    # - 平曲线参数 (alignment_params)
    design_params: Mapped[Optional[dict]] = mapped_column(
        JSONB, nullable=True, default=dict
    )

    # ============ 4D 施工进度 ============
    # 计划日期
    planned_start_date: Mapped[Optional[date]] = mapped_column(nullable=True)

    planned_end_date: Mapped[Optional[date]] = mapped_column(nullable=True)

    # 实际日期
    actual_start_date: Mapped[Optional[date]] = mapped_column(nullable=True)

    actual_end_date: Mapped[Optional[date]] = mapped_column(nullable=True)

    # 计划工期（天）
    planned_duration_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # 实际工期（天）
    actual_duration_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # 进度百分比 (0.0 - 1.0)
    progress: Mapped[float] = mapped_column(Numeric(5, 4), default=0.0)

    # 施工阶段
    construction_phase: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # ============ 质量管理 ============
    quality_status: Mapped[str] = mapped_column(
        String(20), default=QualityStatus.PENDING.value
    )

    # 检验记录列表
    inspection_records: Mapped[Optional[list]] = mapped_column(
        JSONB, nullable=True, default=list
    )

    # 验收日期
    acceptance_date: Mapped[Optional[date]] = mapped_column(nullable=True)

    # 验收人
    acceptance_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # 质量证书编号
    quality_cert_no: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # ============ 安全管理 ============
    safety_level: Mapped[str] = mapped_column(String(20), default=SafetyLevel.LOW.value)

    # 安全要求描述
    safety_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 安全检查记录
    safety_inspections: Mapped[Optional[list]] = mapped_column(
        JSONB, nullable=True, default=list
    )

    # 高风险作业许可
    high_risk_permit: Mapped[bool] = mapped_column(Boolean, default=False)

    # 安全员
    safety_officer: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # ============ 工程量统计 ============
    # 混凝土方量 (m³)
    concrete_volume: Mapped[Optional[float]] = mapped_column(
        Numeric(12, 4), nullable=True
    )

    # 钢筋用量 (吨)
    rebar_weight: Mapped[Optional[float]] = mapped_column(Numeric(10, 4), nullable=True)

    # 土方量 (m³)
    earthwork_volume: Mapped[Optional[float]] = mapped_column(
        Numeric(12, 4), nullable=True
    )

    # 沥青用量 (吨)
    asphalt_weight: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 4), nullable=True
    )

    # 模板面积 (m²)
    formwork_area: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 4), nullable=True
    )

    # ============ 其他 ============
    geometry_data: Mapped[Optional[bytes]] = mapped_column(Text, nullable=True)

    properties: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ============ 时间戳 ============
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # ============ 关系 ============
    states: Mapped[List["StateSnapshot"]] = relationship(
        "StateSnapshot", back_populates="entity", cascade="all, delete-orphan"
    )

    # ============ 索引 ============
    __table_args__ = (
        Index("idx_entities_station_range", "start_station", "end_station"),
        Index("idx_entities_type_station", "entity_type", "start_station"),
        Index("idx_entities_progress", "progress"),
        Index("idx_entities_quality", "quality_status"),
        Index("idx_entities_safety", "safety_level"),
        Index("idx_entities_planned_dates", "planned_start_date", "planned_end_date"),
    )

    def __repr__(self):
        return f"<Entity(id={self.id}, name={self.name}, type={self.entity_type})>"

    @property
    def station_range_length(self) -> int:
        """计算桩号范围长度（米）"""
        return self._parse_station(self.end_station) - self._parse_station(
            self.start_station
        )

    @staticmethod
    def _parse_station(station: str) -> int:
        """解析桩号为米"""
        import re

        match = re.match(r"K(\d+)\+(\d+)", station)
        if match:
            return int(match.group(1)) * 1000 + int(match.group(2))
        return 0

    @property
    def is_overdue(self) -> bool:
        """是否延期"""
        if self.planned_end_date and self.progress < 1.0:
            return datetime.now().date() > self.planned_end_date
        return False

    @property
    def delay_days(self) -> Optional[int]:
        """延期天数"""
        if self.is_overdue and self.planned_end_date:
            return (datetime.now().date() - self.planned_end_date).days
        return None


# ============ 实体类型枚举 ============
ENTITY_TYPES = {
    "roadbed": "路基",
    "bridge": "桥梁",
    "culvert": "涵洞",
    "tunnel": "隧道",
    "slope": "边坡",
    "drainage": "排水设施",
    "pavement": "路面",
    "foundation": "基础",
    "auxiliary": "附属设施",
}

# 施工阶段枚举
CONSTRUCTION_PHASES = {
    "preparation": "准备阶段",
    "clearing": "清表工程",
    "earthwork": "土方工程",
    "subgrade": "路基工程",
    "pavement": "路面工程",
    "bridge_superstructure": "桥梁上部结构",
    "bridge_substructure": "桥梁下部结构",
    "finishing": "收尾工程",
    "completed": "已完成",
}


# 导入避免循环依赖
from app.models.state import StateSnapshot
