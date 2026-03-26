"""
施工日志API路由
"""

import uuid
from typing import Optional, List
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.construction_log import ConstructionLog, WEATHER_TYPES


# Pydantic Schemas
class ConstructionLogCreate(BaseModel):
    log_date: date
    weather: Optional[str] = None
    temperature_min: Optional[float] = None
    temperature_max: Optional[float] = None
    station_range: Optional[str] = None
    work_location: Optional[str] = None
    work_team: Optional[str] = None
    work_content: Optional[str] = None
    completed_quantity: Optional[dict] = {}
    personnel_count: Optional[int] = None
    equipment_used: Optional[List[dict]] = []
    material_consumption: Optional[dict] = {}
    issues: Optional[str] = None
    solutions: Optional[str] = None
    notes: Optional[str] = None
    attachments: Optional[List[str]] = []
    created_by: Optional[str] = None


class ConstructionLogResponse(BaseModel):
    id: str
    log_date: str
    weather: Optional[str]
    temperature_min: Optional[float]
    temperature_max: Optional[float]
    station_range: Optional[str]
    work_location: Optional[str]
    work_team: Optional[str]
    work_content: Optional[str]
    completed_quantity: dict
    personnel_count: Optional[int]
    equipment_used: List[dict]
    material_consumption: dict
    issues: Optional[str]
    solutions: Optional[str]
    notes: Optional[str]
    attachments: List[str]
    created_by: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


router = APIRouter(prefix="/construction-logs", tags=["施工日志"])


@router.post("", response_model=ConstructionLogResponse)
async def create_log(log: ConstructionLogCreate, db: AsyncSession = Depends(get_db)):
    """创建施工日志"""
    new_log = ConstructionLog(
        log_date=log.log_date,
        weather=log.weather,
        temperature_min=log.temperature_min,
        temperature_max=log.temperature_max,
        station_range=log.station_range,
        work_location=log.work_location,
        work_team=log.work_team,
        work_content=log.work_content,
        completed_quantity=log.completed_quantity or {},
        personnel_count=log.personnel_count,
        equipment_used=log.equipment_used or [],
        material_consumption=log.material_consumption or {},
        issues=log.issues,
        solutions=log.solutions,
        notes=log.notes,
        attachments=log.attachments or [],
        created_by=log.created_by
    )
    db.add(new_log)
    await db.flush()
    await db.refresh(new_log)
    await db.commit()

    return ConstructionLogResponse(
        id=str(new_log.id), log_date=new_log.log_date.isoformat(), weather=new_log.weather,
        temperature_min=new_log.temperature_min, temperature_max=new_log.temperature_max,
        station_range=new_log.station_range, work_location=new_log.work_location,
        work_team=new_log.work_team, work_content=new_log.work_content,
        completed_quantity=new_log.completed_quantity or {}, personnel_count=new_log.personnel_count,
        equipment_used=new_log.equipment_used or [], material_consumption=new_log.material_consumption or {},
        issues=new_log.issues, solutions=new_log.solutions, notes=new_log.notes,
        attachments=new_log.attachments or [], created_by=new_log.created_by,
        created_at=new_log.created_at.isoformat()
    )


@router.get("")
async def list_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    work_team: Optional[str] = None,
    station_range: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """获取施工日志列表"""
    query = select(ConstructionLog)
    count_query = select(func.count(ConstructionLog.id))

    if start_date:
        query = query.where(ConstructionLog.log_date >= start_date)
        count_query = count_query.where(ConstructionLog.log_date >= start_date)

    if end_date:
        query = query.where(ConstructionLog.log_date <= end_date)
        count_query = count_query.where(ConstructionLog.log_date <= end_date)

    if work_team:
        query = query.where(ConstructionLog.work_team == work_team)
        count_query = count_query.where(ConstructionLog.work_team == work_team)

    if station_range:
        query = query.where(ConstructionLog.station_range.contains(station_range))
        count_query = count_query.where(ConstructionLog.station_range.contains(station_range))

    query = query.order_by(ConstructionLog.log_date.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    logs = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "count": len(logs),
        "total": total,
        "logs": [
            {
                "id": str(l.id), "log_date": l.log_date.isoformat(), "weather": l.weather,
                "work_team": l.work_team, "work_location": l.work_location,
                "work_content": l.work_content[:100] if l.work_content else None,
                "created_by": l.created_by, "created_at": l.created_at.isoformat()
            }
            for l in logs
        ]
    }


@router.get("/teams")
async def list_teams(db: AsyncSession = Depends(get_db)):
    """获取所有施工班组列表"""
    result = await db.execute(
        select(ConstructionLog.work_team).where(ConstructionLog.work_team != None).distinct()
    )
    teams = result.scalars().all()
    return {"teams": [t for t in teams if t]}


@router.get("/weather-types")
async def get_weather_types():
    """获取天气类型枚举"""
    return {"types": WEATHER_TYPES}


@router.get("/{log_id}")
async def get_log(log_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取施工日志详情"""
    result = await db.execute(select(ConstructionLog).where(ConstructionLog.id == log_id))
    log = result.scalar_one_or_none()

    if not log:
        raise HTTPException(status_code=404, detail="日志不存在")

    return {
        "id": str(log.id), "log_date": log.log_date.isoformat(), "weather": log.weather,
        "temperature_min": log.temperature_min, "temperature_max": log.temperature_max,
        "station_range": log.station_range, "work_location": log.work_location,
        "work_team": log.work_team, "work_content": log.work_content,
        "completed_quantity": log.completed_quantity, "personnel_count": log.personnel_count,
        "equipment_used": log.equipment_used, "material_consumption": log.material_consumption,
        "issues": log.issues, "solutions": log.solutions, "notes": log.notes,
        "attachments": log.attachments, "created_by": log.created_by,
        "created_at": log.created_at.isoformat(), "updated_at": log.updated_at.isoformat()
    }


@router.get("/statistics/summary")
async def get_statistics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取施工日志统计汇总"""
    query = select(ConstructionLog)
    if start_date:
        query = query.where(ConstructionLog.log_date >= start_date)
    if end_date:
        query = query.where(ConstructionLog.log_date <= end_date)

    result = await db.execute(query)
    logs = result.scalars().all()

    # 统计
    total_logs = len(logs)
    total_personnel = sum(l.personnel_count or 0 for l in logs)
    teams = set(l.work_team for l in logs if l.work_team)

    # 按天气统计
    weather_count = {}
    for log in logs:
        if log.weather:
            weather_count[log.weather] = weather_count.get(log.weather, 0) + 1

    return {
        "total_logs": total_logs,
        "total_personnel": total_personnel,
        "teams_count": len(teams),
        "weather_distribution": weather_count,
        "date_range": {
            "start": start_date.isoformat() if start_date else None,
            "end": end_date.isoformat() if end_date else None
        }
    }
