"""
进度管理API路由 - 施工计划
"""

import uuid
from typing import Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.models.schedule import SchedulePlan, ScheduleTask, ScheduleProgress, PLAN_TYPES, PLAN_STATUS


# Pydantic Schemas
class SchedulePlanCreate(BaseModel):
    plan_name: str
    plan_type: str  # year/month/week
    plan_year: int
    plan_month: Optional[int] = None
    plan_week: Optional[int] = None
    start_date: date
    end_date: date
    total_quantity: Optional[float] = None
    total_amount: Optional[float] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None


class ScheduleTaskCreate(BaseModel):
    plan_id: str
    task_name: str
    entity_id: Optional[str] = None
    station_range: Optional[str] = None
    work_content: Optional[str] = None
    start_date: date
    end_date: date
    planned_quantity: Optional[float] = None
    planned_amount: Optional[float] = None
    work_team: Optional[str] = None
    sort_order: int = 0


class ScheduleProgressCreate(BaseModel):
    task_id: str
    report_date: date
    completed_quantity: Optional[float] = None
    completed_amount: Optional[float] = None
    progress_percent: Optional[float] = None
    reported_by: Optional[str] = None
    notes: Optional[str] = None


router = APIRouter(prefix="/schedule", tags=["进度管理"])


# ========== 计划管理API ==========

@router.post("/plans")
async def create_plan(plan: SchedulePlanCreate, db: AsyncSession = Depends(get_db)):
    """创建施工计划"""
    new_plan = SchedulePlan(
        plan_name=plan.plan_name,
        plan_type=plan.plan_type,
        plan_year=plan.plan_year,
        plan_month=plan.plan_month,
        plan_week=plan.plan_week,
        start_date=plan.start_date,
        end_date=plan.end_date,
        total_quantity=plan.total_quantity,
        total_amount=plan.total_amount,
        notes=plan.notes,
        created_by=plan.created_by
    )
    db.add(new_plan)
    await db.flush()
    await db.refresh(new_plan)
    await db.commit()
    return {"id": str(new_plan.id), "plan_name": new_plan.plan_name, "plan_type": new_plan.plan_type}


@router.get("/plans")
async def list_plans(
    plan_type: Optional[str] = None,
    plan_year: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """获取施工计划列表"""
    query = select(SchedulePlan)
    count_query = select(func.count(SchedulePlan.id))

    if plan_type:
        query = query.where(SchedulePlan.plan_type == plan_type)
        count_query = count_query.where(SchedulePlan.plan_type == plan_type)

    if plan_year:
        query = query.where(SchedulePlan.plan_year == plan_year)
        count_query = count_query.where(SchedulePlan.plan_year == plan_year)

    if status:
        query = query.where(SchedulePlan.status == status)
        count_query = count_query.where(SchedulePlan.status == status)

    query = query.order_by(SchedulePlan.plan_year.desc(), SchedulePlan.plan_month.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    plans = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "count": len(plans),
        "total": total,
        "plans": [
            {
                "id": str(p.id), "plan_name": p.plan_name, "plan_type": p.plan_type,
                "plan_year": p.plan_year, "plan_month": p.plan_month,
                "start_date": p.start_date.isoformat(), "end_date": p.end_date.isoformat(),
                "status": p.status, "total_amount": float(p.total_amount) if p.total_amount else 0
            }
            for p in plans
        ]
    }


@router.get("/plan-types")
async def get_plan_types():
    """获取计划类型枚举"""
    return {"types": PLAN_TYPES, "status": PLAN_STATUS}


@router.get("/plans/{plan_id}")
async def get_plan(plan_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取计划详情"""
    result = await db.execute(select(SchedulePlan).where(SchedulePlan.id == plan_id))
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=404, detail="计划不存在")

    # 获取任务列表
    tasks_result = await db.execute(
        select(ScheduleTask).where(ScheduleTask.plan_id == plan_id).order_by(ScheduleTask.sort_order)
    )
    tasks = tasks_result.scalars().all()

    return {
        "id": str(plan.id), "plan_name": plan.plan_name, "plan_type": plan.plan_type,
        "plan_year": plan.plan_year, "plan_month": plan.plan_month,
        "start_date": plan.start_date.isoformat(), "end_date": plan.end_date.isoformat(),
        "status": plan.status, "total_quantity": plan.total_quantity, "total_amount": float(plan.total_amount) if plan.total_amount else 0,
        "notes": plan.notes,
        "tasks": [
            {
                "id": str(t.id), "task_name": t.task_name, "station_range": t.station_range,
                "start_date": t.start_date.isoformat(), "end_date": t.end_date.isoformat(),
                "planned_quantity": t.planned_quantity, "planned_amount": float(t.planned_amount) if t.planned_amount else 0,
                "work_team": t.work_team
            }
            for t in tasks
        ]
    }


@router.post("/plans/{plan_id}/approve")
async def approve_plan(plan_id: uuid.UUID, approver: str, db: AsyncSession = Depends(get_db)):
    """审批施工计划"""
    result = await db.execute(select(SchedulePlan).where(SchedulePlan.id == plan_id))
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=404, detail="计划不存在")

    plan.status = "approved"
    plan.approved_by = approver
    plan.approved_date = datetime.utcnow()

    await db.commit()
    return {"id": str(plan.id), "status": plan.status}


# ========== 任务管理API ==========

@router.post("/tasks")
async def create_task(task: ScheduleTaskCreate, db: AsyncSession = Depends(get_db)):
    """创建计划任务"""
    new_task = ScheduleTask(
        plan_id=uuid.UUID(task.plan_id),
        task_name=task.task_name,
        entity_id=uuid.UUID(task.entity_id) if task.entity_id else None,
        station_range=task.station_range,
        work_content=task.work_content,
        start_date=task.start_date,
        end_date=task.end_date,
        planned_quantity=task.planned_quantity,
        planned_amount=task.planned_amount,
        work_team=task.work_team,
        sort_order=task.sort_order
    )
    db.add(new_task)
    await db.flush()
    await db.refresh(new_task)
    await db.commit()
    return {"id": str(new_task.id), "task_name": new_task.task_name}


# ========== 进度填报API ==========

@router.post("/progress")
async def create_progress(progress: ScheduleProgressCreate, db: AsyncSession = Depends(get_db)):
    """创建进度填报"""
    new_progress = ScheduleProgress(
        task_id=uuid.UUID(progress.task_id),
        report_date=progress.report_date,
        completed_quantity=progress.completed_quantity,
        completed_amount=progress.completed_amount,
        progress_percent=progress.progress_percent,
        reported_by=progress.reported_by,
        notes=progress.notes
    )
    db.add(new_progress)
    await db.flush()
    await db.refresh(new_progress)
    await db.commit()
    return {"id": str(new_progress.id), "progress_percent": new_progress.progress_percent}


@router.get("/progress/{task_id}")
async def get_task_progress(task_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取任务进度填报历史"""
    result = await db.execute(
        select(ScheduleProgress).where(ScheduleProgress.task_id == task_id).order_by(ScheduleProgress.report_date.desc())
    )
    progress_list = result.scalars().all()

    return {
        "count": len(progress_list),
        "progress": [
            {
                "id": str(p.id), "report_date": p.report_date.isoformat(),
                "completed_quantity": p.completed_quantity, "progress_percent": p.progress_percent,
                "status": p.status, "reported_by": p.reported_by
            }
            for p in progress_list
        ]
    }


# ========== 进度统计API ==========

@router.get("/statistics/progress")
async def get_progress_statistics(
    plan_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取进度统计"""
    # 获取所有任务
    query = select(ScheduleTask)
    if plan_id:
        query = query.where(ScheduleTask.plan_id == uuid.UUID(plan_id))

    result = await db.execute(query)
    tasks = result.scalars().all()

    total_planned = sum(t.planned_quantity or 0 for t in tasks)

    # 获取最新进度
    total_completed = 0
    for task in tasks:
        progress_result = await db.execute(
            select(ScheduleProgress).where(ScheduleProgress.task_id == task.id).order_by(ScheduleProgress.report_date.desc()).limit(1)
        )
        latest_progress = progress_result.scalar_one_or_none()
        if latest_progress and latest_progress.completed_quantity:
            total_completed += latest_progress.completed_quantity

    progress_percent = (total_completed / total_planned * 100) if total_planned > 0 else 0

    return {
        "total_planned": total_planned,
        "total_completed": total_completed,
        "progress_percent": round(progress_percent, 2),
        "tasks_count": len(tasks)
    }
