"""
事件记录API路由
"""

import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.event_service import event_service
from app.models.event import EVENT_TYPES, IMPACT_LEVELS


# Pydantic schemas
class EventCreate(BaseModel):
    """事件创建请求"""
    event_type: str = Field(..., description="事件类型")
    start_time: datetime = Field(..., description="开始时间")
    station_range: Optional[str] = Field(default=None, description="桩号范围字符串")
    start_station: Optional[str] = Field(default=None, description="起始桩号")
    end_station: Optional[str] = Field(default=None, description="终止桩号")
    end_time: Optional[datetime] = Field(default=None, description="结束时间")
    description: Optional[str] = Field(default=None, description="描述")
    impact_level: str = Field(default="low", description="影响程度")
    related_entities: Optional[List[str]] = Field(default=list, description="关联实体IDs")
    attachments: Optional[List[str]] = Field(default=list, description="附件URLs")
    extra_data: Optional[dict] = Field(default=dict, description="额外数据")


class EventResponse(BaseModel):
    """事件响应"""
    id: str
    event_type: str
    station_range: Optional[str]
    start_station: Optional[str]
    end_station: Optional[str]
    start_time: str
    end_time: Optional[str]
    description: Optional[str]
    impact_level: str
    related_entities: List[str]
    attachments: List[str]
    extra_data: dict
    hash_blockchain: Optional[str]

    class Config:
        from_attributes = True


router = APIRouter(prefix="/events", tags=["事件管理"])


@router.post("", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    创建事件记录
    """
    # 验证事件类型
    if event.event_type not in EVENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"无效的事件类型: {event.event_type}"
        )

    # 验证影响程度
    if event.impact_level not in IMPACT_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"无效的影响程度: {event.impact_level}"
        )

    # 转换实体ID
    related_ids = None
    if event.related_entities:
        related_ids = [uuid.UUID(x) for x in event.related_entities]

    created = await event_service.create(
        db=db,
        event_type=event.event_type,
        start_time=event.start_time,
        station_range=event.station_range,
        start_station=event.start_station,
        end_station=event.end_station,
        end_time=event.end_time,
        description=event.description,
        impact_level=event.impact_level,
        related_entities=related_ids,
        attachments=event.attachments,
        extra_data=event.extra_data
    )

    await db.commit()

    return EventResponse(
        id=str(created.id),
        event_type=created.event_type,
        station_range=created.station_range,
        start_station=created.start_station,
        end_station=created.end_station,
        start_time=created.start_time.isoformat(),
        end_time=created.end_time.isoformat() if created.end_time else None,
        description=created.description,
        impact_level=created.impact_level,
        related_entities=[str(x) for x in (created.related_entities or [])],
        attachments=created.attachments,
        extra_data=created.extra_data,
        hash_blockchain=created.hash_blockchain
    )


@router.get("", response_model=List[EventResponse])
async def list_events(
    skip: int = Query(0, description="跳过记录数"),
    limit: int = Query(100, description="返回记录数"),
    event_type: Optional[str] = Query(None, description="事件类型过滤"),
    start_time: Optional[datetime] = Query(None, description="开始时间过滤"),
    end_time: Optional[datetime] = Query(None, description="结束时间过滤"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取事件记录列表
    """
    events = await event_service.list_all(
        db=db,
        skip=skip,
        limit=limit,
        event_type=event_type,
        start_time=start_time,
        end_time=end_time
    )

    return [
        EventResponse(
            id=str(e.id),
            event_type=e.event_type,
            station_range=e.station_range,
            start_station=e.start_station,
            end_station=e.end_station,
            start_time=e.start_time.isoformat(),
            end_time=e.end_time.isoformat() if e.end_time else None,
            description=e.description,
            impact_level=e.impact_level,
            related_entities=[str(x) for x in (e.related_entities or [])],
            attachments=e.attachments,
            extra_data=e.extra_data,
            hash_blockchain=e.hash_blockchain
        )
        for e in events
    ]


@router.get("/types")
async def get_event_types():
    """
    获取事件类型列表
    """
    return {"types": EVENT_TYPES}


@router.get("/impact-analysis")
async def get_impact_analysis(
    start_time: Optional[datetime] = Query(None, description="开始时间"),
    end_time: Optional[datetime] = Query(None, description="结束时间"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取事件影响分析
    """
    analysis = await event_service.get_impact_analysis(
        db=db,
        start_time=start_time,
        end_time=end_time
    )

    return analysis


@router.get("/at-station")
async def query_events_at_station(
    station: str = Query(..., description="桩号"),
    db: AsyncSession = Depends(get_db)
):
    """
    根据桩号查询事件记录
    """
    events = await event_service.query_by_station(db, station)

    return {
        "station": station,
        "count": len(events),
        "events": [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "start_time": e.start_time.isoformat(),
                "impact_level": e.impact_level,
                "description": e.description
            }
            for e in events
        ]
    }
