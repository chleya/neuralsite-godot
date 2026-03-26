"""
查询与模拟API路由
这是系统的核心功能：
1. 实时查询 - "这个位置现在是什么状态？"
2. 版本模拟 - "这个施工步骤完成后会是什么样子？"
"""

import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.space_service import space_service, Coordinate3D
from app.services.entity_service import entity_service
from app.services.state_service import state_service
from app.services.event_service import event_service


router = APIRouter(tags=["查询与模拟"])


@router.get("/realtime")
async def query_realtime(
    station: str = Query(..., description="桩号，如K0+000"),
    lateral: float = Query(0, description="横向偏移（米）"),
    elevation: Optional[float] = Query(None, description="高程（米）"),
    db: AsyncSession = Depends(get_db)
):
    """
    实时查询：指定位置当前状态
    这是用户最常用的功能："这个位置现在是什么状态？"

    返回指定桩号位置的所有实体及其当前状态
    """
    # 1. 将桩号转换为坐标
    coord = space_service.station_to_coordinates(station, lateral, elevation)

    # 2. 查询该位置的所有实体
    entities = await entity_service.query_by_station(db, station)

    # 3. 获取每个实体的当前状态
    results = []
    for entity in entities:
        # 获取当前状态
        current_state = await state_service.get_entity_latest(db, entity.id)

        results.append({
            "entity": {
                "id": str(entity.id),
                "name": entity.name,
                "entity_type": entity.entity_type,
                "start_station": entity.start_station,
                "end_station": entity.end_station,
                "lateral_offset": entity.lateral_offset,
                "properties": entity.properties
            },
            "state": {
                "timestamp": current_state.timestamp.isoformat() if current_state else None,
                "state_type": current_state.state_type if current_state else None,
                "progress": current_state.progress if current_state else 0,
                "quality_status": current_state.quality_status if current_state else "pending"
            } if current_state else None
        })

    # 4. 查询该位置的相关事件
    events = await event_service.query_by_station(db, station)

    return {
        "query": {
            "station": station,
            "lateral_offset": lateral,
            "elevation": elevation,
            "coordinate": coord.to_dict()
        },
        "timestamp": datetime.now().isoformat(),
        "entities_count": len(entities),
        "entities": results,
        "recent_events": [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "start_time": e.start_time.isoformat(),
                "impact_level": e.impact_level,
                "description": e.description
            }
            for e in events[:5]  # 最近5条事件
        ]
    }


@router.get("/entity/{entity_id}/realtime")
async def query_entity_realtime(
    entity_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    实时查询：指定实体的当前状态
    """
    # 获取实体信息
    entity = await entity_service.get_by_id(db, entity_id)

    if not entity:
        raise HTTPException(status_code=404, detail="实体不存在")

    # 获取当前状态
    current_state = await state_service.get_entity_latest(db, entity_id)

    # 获取最近的事件
    events = await event_service.query_by_entity(db, entity_id)

    return {
        "entity": {
            "id": str(entity.id),
            "name": entity.name,
            "entity_type": entity.entity_type,
            "start_station": entity.start_station,
            "end_station": entity.end_station,
            "lateral_offset": entity.lateral_offset,
            "properties": entity.properties
        },
        "current_state": {
            "timestamp": current_state.timestamp.isoformat() if current_state else None,
            "state_type": current_state.state_type if current_state else None,
            "progress": current_state.progress if current_state else 0,
            "quality_status": current_state.quality_status if current_state else "pending",
            "images": current_state.images if current_state else [],
            "notes": current_state.notes if current_state else None
        } if current_state else None,
        "recent_events": [
            {
                "id": str(e.id),
                "event_type": e.event_type,
                "start_time": e.start_time.isoformat(),
                "impact_level": e.impact_level,
                "description": e.description
            }
            for e in events[:5]
        ]
    }


@router.get("/simulation/entity/{entity_id}")
async def simulate_entity_state(
    entity_id: uuid.UUID,
    target_time: datetime = Query(..., description="目标时间点"),
    db: AsyncSession = Depends(get_db)
):
    """
    版本模拟：预测实体在目标时间点的状态
    用于回答："这个施工步骤完成后会是什么样子？"
    """
    # 获取实体信息
    entity = await entity_service.get_by_id(db, entity_id)

    if not entity:
        raise HTTPException(status_code=404, detail="实体不存在")

    # 模拟状态
    simulated = await state_service.simulate_state(db, entity_id, target_time)

    return {
        "entity": {
            "id": str(entity.id),
            "name": entity.name,
            "entity_type": entity.entity_type,
            "start_station": entity.start_station,
            "end_station": entity.end_station
        },
        "target_time": target_time.isoformat(),
        "simulated_state": simulated,
        "visualization_data": {
            "state_type": simulated.get("state_type"),
            "color_code": _get_state_color(simulated.get("state_type")),
            "progress": simulated.get("progress", 0)
        }
    }


@router.get("/simulation/project")
async def simulate_project(
    target_time: datetime = Query(..., description="目标时间点"),
    start_station: Optional[str] = Query(None, description="起始桩号"),
    end_station: Optional[str] = Query(None, description="终止桩号"),
    entity_type: Optional[str] = Query(None, description="实体类型过滤"),
    db: AsyncSession = Depends(get_db)
):
    """
    版本模拟：项目在目标时间点的整体状态
    这是施工模拟的核心接口，可以预测整个项目在某时间点的形象进度

    返回：
    - 所有实体的预测状态
    - 可视化数据（可用于Godot客户端）
    """
    # 1. 获取所有实体（或指定范围的实体）
    if start_station and end_station:
        entities = await entity_service.query_by_range(
            db, start_station, end_station, entity_type
        )
    else:
        entities = await entity_service.list_all(db, limit=1000)

    # 2. 模拟每个实体的状态
    simulated_states = []
    for entity in entities:
        simulated = await state_service.simulate_state(db, entity.id, target_time)
        simulated_states.append({
            "entity": {
                "id": str(entity.id),
                "name": entity.name,
                "entity_type": entity.entity_type,
                "start_station": entity.start_station,
                "end_station": entity.end_station,
                "lateral_offset": entity.lateral_offset
            },
            "simulated_state": simulated,
            "visualization": {
                "state_type": simulated.get("state_type"),
                "color_code": _get_state_color(simulated.get("state_type")),
                "progress": simulated.get("progress", 0),
                "opacity": _get_state_opacity(simulated.get("state_type"))
            }
        })

    # 3. 统计状态分布
    state_distribution = {}
    for state in simulated_states:
        stype = state["simulated_state"].get("state_type", "unknown")
        state_distribution[stype] = state_distribution.get(stype, 0) + 1

    # 4. 生成GeoJSON格式的可视化数据
    geojson_features = []
    for entity in entities:
        coord = space_service.station_to_coordinates(entity.start_station)
        end_coord = space_service.station_to_coordinates(entity.end_station)

        simulated = next(
            (s for s in simulated_states if s["entity"]["id"] == str(entity.id)),
            None
        )

        if simulated:
            geojson_features.append({
                "type": "Feature",
                "properties": {
                    "id": str(entity.id),
                    "name": entity.name,
                    "type": entity.entity_type,
                    "state_type": simulated["simulated_state"].get("state_type"),
                    "progress": simulated["simulated_state"].get("progress", 0),
                    "color": simulated["visualization"]["color_code"]
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [coord.x, coord.y, coord.z],
                        [end_coord.x, end_coord.y, end_coord.z]
                    ]
                }
            })

    return {
        "target_time": target_time.isoformat(),
        "query_range": {
            "start_station": start_station,
            "end_station": end_station
        },
        "total_entities": len(entities),
        "state_distribution": state_distribution,
        "entities": simulated_states,
        "geojson": {
            "type": "FeatureCollection",
            "features": geojson_features
        }
    }


def _get_state_color(state_type: Optional[str]) -> str:
    """获取状态对应的颜色代码"""
    colors = {
        "planning": "#3B82F6",   # 蓝色
        "clearing": "#F97316",   # 橙色
        "earthwork": "#92400E",  # 棕色
        "pavement": "#6B7280",   # 灰色
        "finishing": "#22C55E",  # 浅绿色
        "completed": "#374151"   # 深灰色
    }
    return colors.get(state_type, "#9CA3AF")


def _get_state_opacity(state_type: Optional[str]) -> float:
    """获取状态对应的透明度"""
    opacities = {
        "planning": 0.5,
        "clearing": 0.8,
        "earthwork": 0.8,
        "pavement": 0.9,
        "finishing": 0.9,
        "completed": 1.0
    }
    return opacities.get(state_type, 0.5)
