"""
资金管理API路由 - 计量与支付
"""

import uuid
from typing import Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.models.funds import Measurement, MeasurementDetail, Payment, MEASUREMENT_STATUS, PAYMENT_STATUS


# Pydantic Schemas
class MeasurementCreate(BaseModel):
    period: str
    period_start: date
    period_end: date
    total_amount: Optional[float] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None


class MeasurementDetailCreate(BaseModel):
    measurement_id: str
    entity_id: Optional[str] = None
    station_range: Optional[str] = None
    work_item: str
    unit: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    amount: Optional[float] = None
    notes: Optional[str] = None


class PaymentCreate(BaseModel):
    measurement_id: Optional[str] = None
    payment_no: str
    payment_date: date
    amount: float
    payment_method: Optional[str] = None
    status: str = "pending"
    payee: Optional[str] = None
    bank_account: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None


router = APIRouter(prefix="/funds", tags=["资金管理"])


# ========== 计量管理API ==========

@router.post("/measurements")
async def create_measurement(measurement: MeasurementCreate, db: AsyncSession = Depends(get_db)):
    """创建计量申报"""
    new_measurement = Measurement(
        period=measurement.period,
        period_start=measurement.period_start,
        period_end=measurement.period_end,
        total_amount=measurement.total_amount,
        notes=measurement.notes,
        created_by=measurement.created_by
    )
    db.add(new_measurement)
    await db.flush()
    await db.refresh(new_measurement)
    await db.commit()
    return {"id": str(new_measurement.id), "period": new_measurement.period, "status": new_measurement.status}


@router.get("/measurements")
async def list_measurements(
    status: Optional[str] = None,
    period: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """获取计量申报列表"""
    query = select(Measurement)
    count_query = select(func.count(Measurement.id))

    if status:
        query = query.where(Measurement.status == status)
        count_query = count_query.where(Measurement.status == status)

    if period:
        query = query.where(Measurement.period == period)
        count_query = count_query.where(Measurement.period == period)

    query = query.order_by(Measurement.period.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    measurements = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "count": len(measurements),
        "total": total,
        "measurements": [
            {
                "id": str(m.id), "period": m.period,
                "period_start": m.period_start.isoformat(), "period_end": m.period_end.isoformat(),
                "total_amount": float(m.total_amount) if m.total_amount else 0,
                "status": m.status, "created_at": m.created_at.isoformat()
            }
            for m in measurements
        ]
    }


@router.get("/measurement-status-types")
async def get_measurement_status_types():
    """获取计量状态枚举"""
    return {"types": MEASUREMENT_STATUS}


@router.get("/measurements/{measurement_id}")
async def get_measurement(measurement_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取计量详情"""
    result = await db.execute(select(Measurement).where(Measurement.id == measurement_id))
    measurement = result.scalar_one_or_none()

    if not measurement:
        raise HTTPException(status_code=404, detail="计量记录不存在")

    # 获取明细
    details_result = await db.execute(
        select(MeasurementDetail).where(MeasurementDetail.measurement_id == measurement_id)
    )
    details = details_result.scalars().all()

    return {
        "id": str(measurement.id), "period": measurement.period,
        "period_start": measurement.period_start.isoformat(), "period_end": measurement.period_end.isoformat(),
        "total_amount": float(measurement.total_amount) if measurement.total_amount else 0,
        "status": measurement.status, "audit_opinions": measurement.audit_opinions,
        "auditor": measurement.auditor, "audit_date": measurement.audit_date.isoformat() if measurement.audit_date else None,
        "notes": measurement.notes,
        "details": [
            {"id": str(d.id), "work_item": d.work_item, "quantity": d.quantity,
             "unit_price": d.unit_price, "amount": d.amount}
            for d in details
        ]
    }


@router.post("/measurements/{measurement_id}/approve")
async def approve_measurement(measurement_id: uuid.UUID, auditor: str, opinions: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """审核计量申报"""
    result = await db.execute(select(Measurement).where(Measurement.id == measurement_id))
    measurement = result.scalar_one_or_none()

    if not measurement:
        raise HTTPException(status_code=404, detail="计量记录不存在")

    measurement.status = "approved"
    measurement.auditor = auditor
    measurement.audit_opinions = opinions
    measurement.audit_date = datetime.utcnow()

    await db.commit()
    return {"id": str(measurement.id), "status": measurement.status}


# ========== 支付管理API ==========

@router.post("/payments")
async def create_payment(payment: PaymentCreate, db: AsyncSession = Depends(get_db)):
    """创建支付记录"""
    new_payment = Payment(
        measurement_id=uuid.UUID(payment.measurement_id) if payment.measurement_id else None,
        payment_no=payment.payment_no,
        payment_date=payment.payment_date,
        amount=payment.amount,
        payment_method=payment.payment_method,
        status=payment.status,
        payee=payment.payee,
        bank_account=payment.bank_account,
        notes=payment.notes,
        created_by=payment.created_by
    )
    db.add(new_payment)
    await db.flush()
    await db.refresh(new_payment)
    await db.commit()
    return {"id": str(new_payment.id), "payment_no": new_payment.payment_no, "status": new_payment.status}


@router.get("/payments")
async def list_payments(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """获取支付记录列表"""
    query = select(Payment)
    count_query = select(func.count(Payment.id))

    if status:
        query = query.where(Payment.status == status)
        count_query = count_query.where(Payment.status == status)

    query = query.order_by(Payment.payment_date.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    payments = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "count": len(payments),
        "total": total,
        "payments": [
            {
                "id": str(p.id), "payment_no": p.payment_no,
                "payment_date": p.payment_date.isoformat(), "amount": float(p.amount),
                "status": p.status, "payee": p.payee
            }
            for p in payments
        ]
    }


@router.get("/payment-status-types")
async def get_payment_status_types():
    """获取支付状态枚举"""
    return {"types": PAYMENT_STATUS}


# ========== 资金统计API ==========

@router.get("/statistics/summary")
async def get_funds_summary(db: AsyncSession = Depends(get_db)):
    """获取资金统计汇总"""
    # 计量统计
    measurement_result = await db.execute(
        select(func.sum(Measurement.total_amount)).where(Measurement.status == "approved")
    )
    total_measurement = measurement_result.scalar() or 0

    # 支付统计
    payment_result = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == "paid")
    )
    total_paid = payment_result.scalar() or 0

    # 待支付
    pending_payment = total_measurement - total_paid

    return {
        "total_measurement": float(total_measurement),
        "total_paid": float(total_paid),
        "pending_payment": float(pending_payment),
        "payment_ratio": float(total_paid / total_measurement * 100) if total_measurement > 0 else 0
    }
