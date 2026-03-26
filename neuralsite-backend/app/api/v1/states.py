"""
状态快照API路由
"""

import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.state_service import state_service
from app.models.state import STATE_TYPES, QUALITY_STATUS


# Pydantic schemas
class StateCreate(BaseModel):
    """状态快照创建请求"""
    entity_id: str = Field(..., description="实体ID")
    timestamp: datetime = Field(..., description="时间戳")
    state_type: str = Field(..., description="状态类型")
    progress: float = Field(default=0.0, description="进度百分比（0-100）")
    quality_status: str = Field(default="pending", description="质量状态")
    images: Optional[List[str]] = Field(default=list, description="现场照片URLs")
    notes: Optional[str] = Field(default=None, description="备注")
    quantities: Optional[dict] = Field(default=dict, description="工程量数据")


class StateResponse(BaseModel):
    """状态快照响应"""
    id: str
    entity_id: str
    timestamp: str
    state_type: str
    progress: float
    quality_status: str
    images: List[str]
    notes: Optional[str]
    quantities: dict
    hash_blockchain: Optional[str]

    class Config:
        from_attributes = True


router = APIRouter(prefix="/states", tags=["状态管理"])


@router.post("", response_model=StateResponse)
async def create_state(
    state: StateCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    创建状态快照
    """
    # 验证状态类型
    if state.state_type not in STATE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"无效的状态类型: {state.state_type}"
        )

    # 验证质量状态
    if state.quality_status not in QUALITY_STATUS:
        raise HTTPException(
            status_code=400,
            detail=f"无效的质量状态: {state.quality_status}"
        )

    created = await state_service.create(
        db=db,
        entity_id=uuid.UUID(state.entity_id),
        timestamp=state.timestamp,
        state_type=state.state_type,
        progress=state.progress,
        quality_status=state.quality_status,
        images=state.images,
        notes=state.notes,
        quantities=state.quantities
    )

    await db.commit()

    return StateResponse(
        id=str(created.id),
        entity_id=str(created.entity_id),
        timestamp=created.timestamp.isoformat(),
        state_type=created.state_type,
        progress=created.progress,
        quality_status=created.quality_status,
        images=created.images,
        notes=created.notes,
        quantities=created.quantities,
        hash_blockchain=created.hash_blockchain
    )


@router.get("/entity/{entity_id}/latest")
async def get_entity_latest(
    entity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    获取实体的最新状态快照
    """
    state = await state_service.get_entity_latest(db, entity_id)

    if not state:
        raise HTTPException(status_code=404, detail="未找到状态记录")

    return StateResponse(
        id=str(state.id),
        entity_id=str(state.entity_id),
        timestamp=state.timestamp.isoformat(),
        state_type=state.state_type,
        progress=state.progress,
        quality_status=state.quality_status,
        images=state.images,
        notes=state.notes,
        quantities=state.quantities,
        hash_blockchain=state.hash_blockchain
    )


@router.get("/entity/{entity_id}/history")
async def get_entity_history(
    entity_id: uuid.UUID,
    skip: int = Query(0, description="跳过记录数"),
    limit: int = Query(100, description="返回记录数"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取实体的历史状态快照列表
    """
    states = await state_service.get_entity_history(
        db=db,
        entity_id=entity_id,
        skip=skip,
        limit=limit
    )

    return {
        "entity_id": str(entity_id),
        "count": len(states),
        "states": [
            {
                "id": str(s.id),
                "timestamp": s.timestamp.isoformat(),
                "state_type": s.state_type,
                "progress": s.progress,
                "quality_status": s.quality_status
            }
            for s in states
        ]
    }


@router.get("/current")
async def get_current_states(
    entity_ids: Optional[str] = Query(None, description="实体ID列表，逗号分隔"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取所有实体的当前状态
    用于实时查询功能
    """
    if entity_ids:
        ids = [uuid.UUID(x.strip()) for x in entity_ids.split(",")]
    else:
        ids = None

    states = await state_service.get_current_states(db, ids)

    return {
        "timestamp": datetime.now().isoformat(),
        "count": len(states),
        "states": [
            {
                "entity_id": str(s.entity_id),
                "timestamp": s.timestamp.isoformat(),
                "state_type": s.state_type,
                "progress": s.progress,
                "quality_status": s.quality_status
            }
            for s in states
        ]
    }


@router.get("/types")
async def get_state_types():
    """
    获取状态类型列表
    """
    return {"types": STATE_TYPES}


@router.get("/quality-statuses")
async def get_quality_statuses():
    """
    获取质量状态列表
    """
    return {"statuses": QUALITY_STATUS}
