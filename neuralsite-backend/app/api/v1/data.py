"""
数据导入导出API路由
"""

import json
import uuid
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.entity import Entity
from app.models.state import StateSnapshot


router = APIRouter(prefix="/data", tags=["数据集成"])


# ========== GeoJSON导入导出 ==========

@router.post("/import/geojson")
async def import_geojson(data: dict, db: AsyncSession = Depends(get_db)):
    """
    导入GeoJSON格式的工程数据
    支持导入道路中心线和实体数据
    """
    imported_count = 0
    errors = []

    try:
        features = data.get("features", [])

        for feature in features:
            try:
                properties = feature.get("properties", {})
                geometry = feature.get("geometry", {})

                entity_type = properties.get("entity_type", "roadbed")
                name = properties.get("name", "")
                start_station = properties.get("start_station", "K0+000")
                end_station = properties.get("end_station", "K0+100")
                lateral_offset = properties.get("lateral_offset", 0)
                elevation_base = properties.get("elevation_base")
                width = properties.get("width")
                height = properties.get("height")

                # 创建实体
                entity = Entity(
                    entity_type=entity_type,
                    name=name,
                    start_station=start_station,
                    end_station=end_station,
                    lateral_offset=lateral_offset,
                    elevation_base=elevation_base,
                    width=width,
                    height=height,
                    properties=properties
                )
                db.add(entity)
                imported_count += 1

            except Exception as e:
                errors.append({"feature": feature.get("properties", {}), "error": str(e)})

        await db.commit()

        return {
            "success": True,
            "imported_count": imported_count,
            "errors": errors
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/export/entities/geojson")
async def export_entities_geojson(
    entity_type: Optional[str] = None,
    start_station: Optional[str] = None,
    end_station: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """导出实体数据为GeoJSON格式"""
    query = select(Entity)

    if entity_type:
        query = query.where(Entity.entity_type == entity_type)

    result = await db.execute(query)
    entities = result.scalars().all()

    features = []
    for entity in entities:
        # 计算简化的坐标
        from app.services.space_service import space_service
        start_coord = space_service.station_to_coordinates(entity.start_station)
        end_coord = space_service.station_to_coordinates(entity.end_station)

        features.append({
            "type": "Feature",
            "properties": {
                "id": str(entity.id),
                "entity_type": entity.entity_type,
                "name": entity.name,
                "start_station": entity.start_station,
                "end_station": entity.end_station,
                "lateral_offset": entity.lateral_offset,
                "elevation_base": entity.elevation_base,
                "width": entity.width,
                "height": entity.height,
                "properties": entity.properties
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [start_coord.x, start_coord.y, start_coord.z],
                    [end_coord.x, end_coord.y, end_coord.z]
                ]
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


# ========== Excel模板导出 ==========

@router.get("/export/template/progress")
async def get_progress_template():
    """获取进度填报Excel模板结构"""
    return {
        "template_name": "进度填报模板",
        "columns": [
            {"field": "station_range", "title": "桩号范围", "required": True},
            {"field": "work_item", "title": "施工部位", "required": True},
            {"field": "planned_quantity", "title": "计划工程量", "required": True},
            {"field": "completed_quantity", "title": "实际完成工程量", "required": True},
            {"field": "progress_percent", "title": "完成百分比", "required": True},
            {"field": "report_date", "title": "填报日期", "required": True},
            {"field": "reporter", "title": "填报人", "required": False},
            {"field": "notes", "title": "备注", "required": False}
        ],
        "example": [
            {"station_range": "K0+000-K1+000", "work_item": "路基土方", "planned_quantity": 10000, "completed_quantity": 5000, "progress_percent": 50, "report_date": "2026-03-15", "reporter": "张三", "notes": ""}
        ]
    }


# ========== Godot客户端数据对接 ==========

@router.get("/godot/entities")
async def get_godot_entities(db: AsyncSession = Depends(get_db)):
    """
    获取适配Godot客户端的实体渲染数据
    返回包含位置、颜色、透明度等渲染参数的数据
    """
    # 获取所有实体
    result = await db.execute(select(Entity))
    entities = result.scalars().all()

    # 获取所有实体的最新状态
    from sqlalchemy import func
    latest_states_query = (
        select(StateSnapshot.entity_id, func.max(StateSnapshot.timestamp).label("max_timestamp"))
        .group_by(StateSnapshot.entity_id)
        .subquery()
    )

    entity_data = []
    for entity in entities:
        # 获取该实体的最新状态
        state_result = await db.execute(
            select(StateSnapshot).where(
                StateSnapshot.entity_id == entity.id
            ).order_by(StateSnapshot.timestamp.desc()).limit(1)
        )
        latest_state = state_result.scalar_one_or_none()

        # 计算坐标
        from app.services.space_service import space_service
        start_coord = space_service.station_to_coordinates(entity.start_station)

        # 确定颜色和透明度
        state_type = latest_state.state_type if latest_state else "planning"
        color, opacity = _get_state_style(state_type)

        entity_data.append({
            "id": str(entity.id),
            "name": entity.name,
            "entity_type": entity.entity_type,
            "position": {"x": start_coord.x, "y": start_coord.z, "z": start_coord.y},
            "dimensions": {
                "length": space_service.calculate_distance(entity.start_station, entity.end_station),
                "width": entity.width or 10,
                "height": entity.height or 2
            },
            "state": {
                "state_type": state_type,
                "progress": latest_state.progress if latest_state else 0,
                "color": color,
                "opacity": opacity
            }
        })

    return {
        "entities": entity_data,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/godot/states")
async def get_godot_states(
    entity_ids: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取适配Godot客户端的状态数据"""
    query = select(StateSnapshot)

    if entity_ids:
        ids = [uuid.UUID(x.strip()) for x in entity_ids.split(",")]
        query = query.where(StateSnapshot.entity_id.in_(ids))

    # 获取每个实体的最新状态
    from sqlalchemy import func
    subquery = (
        select(
            StateSnapshot.entity_id,
            func.max(StateSnapshot.timestamp).label("max_timestamp")
        )
        .group_by(StateSnapshot.entity_id)
        .subquery()
    )

    result = await db.execute(
        select(StateSnapshot)
        .join(
            subquery,
            (StateSnapshot.entity_id == subquery.c.entity_id) &
            (StateSnapshot.timestamp == subquery.c.max_timestamp)
        )
    )
    states = result.scalars().all()

    state_data = []
    for state in states:
        color, opacity = _get_state_style(state.state_type)
        state_data.append({
            "entity_id": str(state.entity_id),
            "timestamp": state.timestamp.isoformat(),
            "state_type": state.state_type,
            "progress": state.progress,
            "quality_status": state.quality_status,
            "color": color,
            "opacity": opacity
        })

    return {
        "states": state_data,
        "timestamp": datetime.utcnow().isoformat()
    }


def _get_state_style(state_type: str):
    """获取状态对应的颜色和透明度"""
    styles = {
        "planning": ("#3B82F6", 0.5),
        "clearing": ("#F97316", 0.8),
        "earthwork": ("#92400E", 0.8),
        "pavement": ("#6B7280", 0.9),
        "finishing": ("#22C55E", 0.9),
        "completed": ("#374151", 1.0)
    }
    return styles.get(state_type, ("#9CA3AF", 0.5))


# ========== 统计接口 ==========

@router.get("/statistics/project")
async def get_project_statistics(db: AsyncSession = Depends(get_db)):
    """获取项目统计信息"""
    # 实体统计
    entity_result = await db.execute(select(func.count(Entity.id)))
    total_entities = entity_result.scalar()

    # 状态统计
    from sqlalchemy import distinct
    state_result = await db.execute(
        select(distinct(StateSnapshot.entity_id))
    )
    entities_with_state = len(state_result.scalars().all())

    return {
        "total_entities": total_entities,
        "entities_with_state": entities_with_state,
        "timestamp": datetime.utcnow().isoformat()
    }
