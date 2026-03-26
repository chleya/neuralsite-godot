"""
人员管理API路由
"""

import uuid
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.models.personnel import Unit, Department, Personnel, Attendance, UNIT_TYPES, POSITION_TYPES, ATTENDANCE_STATUS


# Pydantic Schemas
class UnitCreate(BaseModel):
    name: str
    unit_type: str
    credit_code: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class PersonnelCreate(BaseModel):
    name: str
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    id_number: Optional[str] = None
    unit_id: Optional[str] = None
    department_id: Optional[str] = None
    position: Optional[str] = None
    position_type: Optional[str] = None
    phone: Optional[str] = None
    entry_date: Optional[date] = None
    status: str = "active"
    qualifications: Optional[list] = []
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class AttendanceCreate(BaseModel):
    personnel_id: str
    attendance_date: date
    status: str
    work_hours: Optional[float] = None
    notes: Optional[str] = None
    recorded_by: Optional[str] = None


router = APIRouter(prefix="/personnel", tags=["人员管理"])


# ========== 单位管理API ==========

@router.post("/units")
async def create_unit(unit: UnitCreate, db: AsyncSession = Depends(get_db)):
    """创建单位"""
    new_unit = Unit(**unit.model_dump())
    db.add(new_unit)
    await db.flush()
    await db.refresh(new_unit)
    await db.commit()
    return {"id": str(new_unit.id), "name": new_unit.name, "unit_type": new_unit.unit_type}


@router.get("/units")
async def list_units(unit_type: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """获取单位列表"""
    query = select(Unit)
    if unit_type:
        query = query.where(Unit.unit_type == unit_type)

    result = await db.execute(query.order_by(Unit.name))
    units = result.scalars().all()
    return {
        "count": len(units),
        "units": [{"id": str(u.id), "name": u.name, "unit_type": u.unit_type, "contact_person": u.contact_person} for u in units]
    }


@router.get("/unit-types")
async def get_unit_types():
    """获取单位类型枚举"""
    return {"types": UNIT_TYPES}


# ========== 人员管理API ==========

@router.post("")
async def create_personnel(personnel: PersonnelCreate, db: AsyncSession = Depends(get_db)):
    """创建人员"""
    new_personnel = Personnel(
        name=personnel.name,
        gender=personnel.gender,
        birth_date=personnel.birth_date,
        id_number=personnel.id_number,
        unit_id=uuid.UUID(personnel.unit_id) if personnel.unit_id else None,
        department_id=uuid.UUID(personnel.department_id) if personnel.department_id else None,
        position=personnel.position,
        position_type=personnel.position_type,
        phone=personnel.phone,
        entry_date=personnel.entry_date,
        status=personnel.status,
        qualifications=personnel.qualifications or [],
        photo_url=personnel.photo_url,
        notes=personnel.notes
    )
    db.add(new_personnel)
    await db.flush()
    await db.refresh(new_personnel)
    await db.commit()
    return {"id": str(new_personnel.id), "name": new_personnel.name, "position": new_personnel.position}


@router.get("")
async def list_personnel(
    unit_id: Optional[str] = None,
    position_type: Optional[str] = None,
    status: Optional[str] = "active",
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """获取人员列表"""
    query = select(Personnel)
    count_query = select(func.count(Personnel.id))

    if unit_id:
        query = query.where(Personnel.unit_id == uuid.UUID(unit_id))
        count_query = count_query.where(Personnel.unit_id == uuid.UUID(unit_id))

    if position_type:
        query = query.where(Personnel.position_type == position_type)
        count_query = count_query.where(Personnel.position_type == position_type)

    if status:
        query = query.where(Personnel.status == status)
        count_query = count_query.where(Personnel.status == status)

    query = query.offset(skip).limit(limit).order_by(Personnel.name)

    result = await db.execute(query)
    personnel_list = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "count": len(personnel_list),
        "total": total,
        "personnel": [
            {"id": str(p.id), "name": p.name, "position": p.position, "position_type": p.position_type, "phone": p.phone, "status": p.status}
            for p in personnel_list
        ]
    }


@router.get("/position-types")
async def get_position_types():
    """获取岗位类型枚举"""
    return {"types": POSITION_TYPES}


@router.get("/{personnel_id}")
async def get_personnel(personnel_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取人员详情"""
    result = await db.execute(select(Personnel).where(Personnel.id == personnel_id))
    personnel = result.scalar_one_or_none()

    if not personnel:
        raise HTTPException(status_code=404, detail="人员不存在")

    return {
        "id": str(personnel.id), "name": personnel.name, "gender": personnel.gender,
        "id_number": personnel.id_number, "unit_id": str(personnel.unit_id) if personnel.unit_id else None,
        "department_id": str(personnel.department_id) if personnel.department_id else None,
        "position": personnel.position, "position_type": personnel.position_type,
        "phone": personnel.phone, "entry_date": personnel.entry_date.isoformat() if personnel.entry_date else None,
        "status": personnel.status, "qualifications": personnel.qualifications,
        "photo_url": personnel.photo_url, "notes": personnel.notes
    }


# ========== 考勤管理API ==========

@router.post("/attendance")
async def create_attendance(attendance: AttendanceCreate, db: AsyncSession = Depends(get_db)):
    """创建考勤记录"""
    new_attendance = Attendance(
        personnel_id=uuid.UUID(attendance.personnel_id),
        attendance_date=attendance.attendance_date,
        status=attendance.status,
        work_hours=attendance.work_hours,
        notes=attendance.notes,
        recorded_by=attendance.recorded_by
    )
    db.add(new_attendance)
    await db.flush()
    await db.refresh(new_attendance)
    await db.commit()
    return {"id": str(new_attendance.id), "status": new_attendance.status}


@router.get("/attendance")
async def list_attendance(
    personnel_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取考勤记录列表"""
    query = select(Attendance)

    if personnel_id:
        query = query.where(Attendance.personnel_id == uuid.UUID(personnel_id))

    if start_date:
        query = query.where(Attendance.attendance_date >= start_date)

    if end_date:
        query = query.where(Attendance.attendance_date <= end_date)

    query = query.order_by(Attendance.attendance_date.desc()).limit(100)

    result = await db.execute(query)
    records = result.scalars().all()

    return {
        "count": len(records),
        "records": [
            {
                "id": str(r.id), "personnel_id": str(r.personnel_id),
                "attendance_date": r.attendance_date.isoformat(), "status": r.status,
                "work_hours": r.work_hours, "recorded_by": r.recorded_by
            }
            for r in records
        ]
    }


@router.get("/attendance-status-types")
async def get_attendance_status_types():
    """获取考勤状态枚举"""
    return {"types": ATTENDANCE_STATUS}
