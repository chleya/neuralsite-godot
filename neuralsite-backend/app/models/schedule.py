"""
进度管理数据模型 - 施工计划
"""

import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, DateTime, Date, Text, Integer, ForeignKey, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SchedulePlan(Base):
    """施工计划模型 - 多层级计划"""
    __tablename__ = "schedule_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan_type: Mapped[str] = mapped_column(String(20), nullable=False)  # year/month/week
    plan_year: Mapped[int] = mapped_column(Integer, nullable=False)
    plan_month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    plan_week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft/approved
    total_quantity: Mapped[Optional[float]] = mapped_column(Numeric(18, 4), nullable=True)
    total_amount: Mapped[Optional[float]] = mapped_column(Numeric(18, 2), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    approved_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    approved_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_plan_type_date", "plan_type", "plan_year", "plan_month"),
    )


class ScheduleTask(Base):
    """计划任务模型 - 具体的施工任务"""
    __tablename__ = "schedule_tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("schedule_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    station_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    work_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    planned_quantity: Mapped[Optional[float]] = mapped_column(Numeric(18, 4), nullable=True)
    planned_amount: Mapped[Optional[float]] = mapped_column(Numeric(18, 2), nullable=True)
    work_team: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ScheduleProgress(Base):
    """进度填报模型 - 实际完成情况"""
    __tablename__ = "schedule_progress"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("schedule_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    report_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    completed_quantity: Mapped[Optional[float]] = mapped_column(Numeric(18, 4), nullable=True)
    completed_amount: Mapped[Optional[float]] = mapped_column(Numeric(18, 2), nullable=True)
    progress_percent: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)  # 0-100
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/approved
    auditor: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    audit_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reported_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# 枚举
PLAN_TYPES = {"year": "年度计划", "month": "月度计划", "week": "周计划"}
PLAN_STATUS = {"draft": "草稿", "approved": "已审批"}
PROGRESS_STATUS = {"pending": "待审核", "approved": "已审核"}
