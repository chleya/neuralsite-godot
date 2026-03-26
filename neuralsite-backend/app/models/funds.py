"""
资金管理数据模型 - 计量与支付
"""

import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, DateTime, Date, Text, Integer, ForeignKey, Index, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Measurement(Base):
    """计量申报模型 - 工程款计量"""
    __tablename__ = "measurements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    period: Mapped[str] = mapped_column(String(20), nullable=False)  # 计量期次，如 "2026-01"
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    total_amount: Mapped[Optional[float]] = mapped_column(Numeric(18, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/approved/paid
    audit_opinions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    auditor: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    audit_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (Index("idx_measurement_period", "period"),)


class MeasurementDetail(Base):
    """计量明细模型 - 分项工程计量"""
    __tablename__ = "measurement_details"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    measurement_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("measurements.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    station_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    work_item: Mapped[str] = mapped_column(String(255), nullable=False)  # 分项工程名称
    unit: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # 单位
    quantity: Mapped[Optional[float]] = mapped_column(Numeric(18, 4), nullable=True)  # 完成工程量
    unit_price: Mapped[Optional[float]] = mapped_column(Numeric(18, 2), nullable=True)  # 单价
    amount: Mapped[Optional[float]] = mapped_column(Numeric(18, 2), nullable=True)  # 合计金额
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Payment(Base):
    """工程款支付模型"""
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    measurement_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("measurements.id", ondelete="SET NULL"), nullable=True, index=True)
    payment_no: Mapped[str] = mapped_column(String(50), nullable=False)  # 支付证书编号
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    payment_method: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # 支付方式
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/paid
    payee: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # 收款单位
    bank_account: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # 银行账号
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("idx_payment_no", "payment_no"),)


# 枚举
MEASUREMENT_STATUS = {"pending": "待审核", "approved": "已审核", "rejected": "已退回", "paid": "已支付"}
PAYMENT_STATUS = {"pending": "待支付", "paid": "已支付"}
