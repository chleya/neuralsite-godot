"""
审计日志API路由
提供审计追踪和历史查询功能
"""

import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.entity_service import entity_service
from app.services.audit_service import AuditService


router = APIRouter(prefix="/audit", tags=["审计追踪"])


class AuditLogResponse(BaseModel):
    """审计日志响应"""

    id: str
    entity_id: str
    action: str
    operator: Optional[str]
    changed_fields: Optional[List[str]]
    old_values: Optional[dict]
    new_values: Optional[dict]
    reason: Optional[str]
    timestamp: str


class EntityHistoryResponse(BaseModel):
    """实体历史响应"""

    entity_id: str
    history: List[AuditLogResponse]


class RollbackRequest(BaseModel):
    """回滚请求"""

    target_audit_log_id: str
    operator: str = "system"
    reason: Optional[str] = None


@router.get("/entity/{entity_id}/history", response_model=EntityHistoryResponse)
async def get_entity_history(
    entity_id: uuid.UUID,
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    db: AsyncSession = Depends(get_db),
):
    """
    获取实体的完整变更历史
    """
    # 检查实体是否存在
    entity = await entity_service.get_by_id(db, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="实体不存在")

    audit_service = AuditService(db)
    logs = await audit_service.get_entity_history(entity_id, limit=limit)

    return EntityHistoryResponse(
        entity_id=str(entity_id),
        history=[
            AuditLogResponse(
                id=str(log.id),
                entity_id=str(log.entity_id),
                action=log.action.value if log.action else str(log.action),
                operator=log.operator,
                changed_fields=log.changed_fields,
                old_values=log.old_values,
                new_values=log.new_values,
                reason=log.reason,
                timestamp=log.timestamp.isoformat() if log.timestamp else None,
            )
            for log in logs
        ],
    )


@router.post("/entity/{entity_id}/rollback")
async def rollback_entity(
    entity_id: uuid.UUID, request: RollbackRequest, db: AsyncSession = Depends(get_db)
):
    """
    回滚实体到指定版本
    """
    # 检查实体是否存在
    entity = await entity_service.get_by_id(db, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="实体不存在")

    try:
        target_id = uuid.UUID(request.target_audit_log_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="无效的审计日志ID")

    audit_service = AuditService(db)

    try:
        # 获取回滚数据
        rollback_data = await audit_service.rollback_to_version(
            entity_id=entity_id,
            target_audit_log_id=target_id,
            operator=request.operator,
            reason=request.reason,
        )

        # 执行回滚更新
        # 注意：这里只更新字段，不创建新的快照（因为 rollback_to_version 返回的是快照数据）
        update_fields = {
            k: v
            for k, v in rollback_data["new_values"].items()
            if k not in ["id", "created_at", "updated_at"]
        }

        if update_fields:
            await entity_service.update(
                db=db,
                entity_id=entity_id,
                operator=f"rollback:{request.operator}",
                **update_fields,
            )
            await db.commit()

        return {
            "message": "回滚成功",
            "entity_id": str(entity_id),
            "target_snapshot_id": rollback_data["target_snapshot_id"],
            "updated_fields": list(update_fields.keys()),
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/logs")
async def query_logs(
    start_time: Optional[datetime] = Query(None, description="开始时间"),
    end_time: Optional[datetime] = Query(None, description="结束时间"),
    operator: Optional[str] = Query(None, description="操作者"),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """
    查询审计日志（按时间范围、操作者等）
    """
    audit_service = AuditService(db)

    if not start_time:
        start_time = datetime(2020, 1, 1)
    if not end_time:
        end_time = datetime.utcnow()

    logs = await audit_service.get_changes_by_time_range(
        start_time=start_time,
        end_time=end_time,
        operator=operator,
        limit=limit,
    )

    return {
        "count": len(logs),
        "logs": [
            {
                "id": str(log.id),
                "entity_id": str(log.entity_id),
                "action": log.action.value if log.action else str(log.action),
                "operator": log.operator,
                "changed_fields": log.changed_fields,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in logs
        ],
    }


@router.get("/entity/{entity_id}/snapshots")
async def get_entity_snapshots(
    entity_id: uuid.UUID,
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    获取实体的快照列表（可用于对比和回滚）
    """
    entity = await entity_service.get_by_id(db, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="实体不存在")

    audit_service = AuditService(db)
    snapshots = await audit_service.get_entity_snapshots(entity_id, limit=limit)

    return {
        "entity_id": str(entity_id),
        "entity_name": entity.name,
        "snapshots": [
            {
                "snapshot_id": str(s.id),
                "audit_log_id": str(s.audit_log_id),
                "action": s.action.value if s.action else str(s.action),
                "entity_data": s.entity_data,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in snapshots
        ],
    }
