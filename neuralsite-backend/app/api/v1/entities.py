"""
实体管理API路由 - 完整版本
支持设计参数、4D进度、质量管理和安全管理
"""

import re
import uuid
from datetime import date, datetime
from typing import Annotated, Optional, List, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.entity_service import entity_service
from app.models.entity import (
    ENTITY_TYPES,
    CONSTRUCTION_PHASES,
    QualityStatus,
    SafetyLevel,
)


# ============ 桩号验证器 ============

STATION_PATTERN = re.compile(r"^K(\d{1,3})\+(\d{3})$")


def validate_station_format(station: str, field_name: str) -> str:
    """验证桩号格式"""
    if not STATION_PATTERN.match(station):
        raise ValueError(f"{field_name} 格式错误，必须是 Kxxx+xxx 格式")
    return station


def parse_station_value(station: str) -> int:
    """解析桩号字符串为数值（米）"""
    match = STATION_PATTERN.match(station)
    if not match:
        raise ValueError(f"无效的桩号格式: {station}")
    return int(match.group(1)) * 1000 + int(match.group(2))


# ============ 设计参数 Schema ============


class DesignParams(BaseModel):
    """设计参数"""

    model_config = ConfigDict(strict=True)

    material_specs: Optional[dict] = None  # 材料规格
    structural_params: Optional[dict] = None  # 结构参数
    grades: Optional[dict] = None  # 纵坡/横坡 {"longitudinal": 0.5, "lateral": 2.0}
    alignment_params: Optional[dict] = None  # 平曲线参数


# ============ 4D 进度 Schema ============


class Schedule4D(BaseModel):
    """4D进度信息"""

    model_config = ConfigDict(strict=True)

    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    planned_duration_days: Optional[int] = Field(None, ge=0)
    actual_duration_days: Optional[int] = Field(None, ge=0)
    progress: Optional[float] = Field(None, ge=0, le=1)
    construction_phase: Optional[str] = None


# ============ 质量管理 Schema ============


class InspectionRecord(BaseModel):
    """检验记录"""

    model_config = ConfigDict(strict=True)

    id: str
    inspection_date: date
    inspector: str
    result: str  # "合格" / "不合格"
    issues: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    notes: Optional[str] = None


class QualityManagement(BaseModel):
    """质量管理信息"""

    model_config = ConfigDict(strict=True)

    quality_status: str = Field(default="pending")
    inspection_records: Optional[List[InspectionRecord]] = None
    acceptance_date: Optional[date] = None
    acceptance_by: Optional[str] = None
    quality_cert_no: Optional[str] = None


# ============ 安全管理 Schema ============


class SafetyInspection(BaseModel):
    """安全检查记录"""

    model_config = ConfigDict(strict=True)

    id: str
    inspection_date: date
    inspector: str
    result: str
    issues: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    notes: Optional[str] = None


class SafetyManagement(BaseModel):
    """安全管理信息"""

    model_config = ConfigDict(strict=True)

    safety_level: str = Field(default="low")
    safety_requirements: Optional[str] = None
    safety_inspections: Optional[List[SafetyInspection]] = None
    high_risk_permit: bool = False
    safety_officer: Optional[str] = None


# ============ 工程量统计 Schema ============


class QuantityStats(BaseModel):
    """工程量统计"""

    model_config = ConfigDict(strict=True)

    concrete_volume: Optional[float] = Field(None, ge=0)  # m³
    rebar_weight: Optional[float] = Field(None, ge=0)  # 吨
    earthwork_volume: Optional[float] = Field(None, ge=0)  # m³
    asphalt_weight: Optional[float] = Field(None, ge=0)  # 吨
    formwork_area: Optional[float] = Field(None, ge=0)  # m²


# ============ 完整 Entity Schema ============


class EntityCreate(BaseModel):
    """实体创建请求 - 完整版"""

    model_config = ConfigDict(strict=True, str_strip_whitespace=True)

    entity_type: Annotated[str, Field(min_length=1, max_length=50)]
    name: Annotated[str, Field(min_length=1, max_length=255)]
    start_station: Annotated[str, Field(min_length=1)]
    end_station: Annotated[str, Field(min_length=1)]

    # 几何尺寸
    lateral_offset: float = Field(default=0.0, ge=-100, le=100)
    elevation_base: Optional[float] = Field(default=None, ge=-100, le=10000)
    width: Optional[float] = Field(default=None, gt=0, le=100)
    height: Optional[float] = Field(default=None, gt=0, le=1000)

    # 设计参数
    design_params: Optional[DesignParams] = None

    # 4D进度
    schedule: Optional[Schedule4D] = None

    # 质量管理
    quality: Optional[QualityManagement] = None

    # 安全管理
    safety: Optional[SafetyManagement] = None

    # 工程量
    quantities: Optional[QuantityStats] = None

    properties: Optional[dict] = Field(default=dict)
    notes: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("entity_type")
    @classmethod
    def validate_entity_type(cls, v: str) -> str:
        if v not in ENTITY_TYPES:
            raise ValueError(f"无效的实体类型: {v}")
        return v

    @field_validator("start_station", "end_station")
    @classmethod
    def validate_station(cls, v: str) -> str:
        return validate_station_format(v, "桩号")

    @model_validator(mode="after")
    def validate_station_range(self) -> "EntityCreate":
        start = parse_station_value(self.start_station)
        end = parse_station_value(self.end_station)
        if start >= end:
            raise ValueError("起始桩号必须小于终止桩号")
        if end - start > 100000:
            raise ValueError("桩号范围不能超过100km")
        return self


class EntityUpdate(BaseModel):
    """实体更新请求 - 完整版"""

    model_config = ConfigDict(strict=True, str_strip_whitespace=True, extra="forbid")

    # 基本信息
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    start_station: Optional[str] = Field(default=None, min_length=1)
    end_station: Optional[str] = Field(default=None, min_length=1)

    # 几何尺寸
    lateral_offset: Optional[float] = Field(default=None, ge=-100, le=100)
    elevation_base: Optional[float] = Field(default=None, ge=-100, le=10000)
    width: Optional[float] = Field(default=None, gt=0, le=100)
    height: Optional[float] = Field(default=None, gt=0, le=1000)

    # 设计参数
    design_params: Optional[DesignParams] = None

    # 4D进度
    schedule: Optional[Schedule4D] = None

    # 质量管理
    quality: Optional[QualityManagement] = None

    # 安全管理
    safety: Optional[SafetyManagement] = None

    # 工程量
    quantities: Optional[QuantityStats] = None

    properties: Optional[dict] = None
    notes: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("start_station", "end_station")
    @classmethod
    def validate_station(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_station_format(v, "桩号")
        return v


class EntityResponse(BaseModel):
    """实体响应 - 完整版"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    name: str
    start_station: str
    end_station: str

    lateral_offset: float
    elevation_base: Optional[float]
    width: Optional[float]
    height: Optional[float]

    design_params: Optional[dict]

    # 4D进度
    planned_start_date: Optional[str]
    planned_end_date: Optional[str]
    actual_start_date: Optional[str]
    actual_end_date: Optional[str]
    planned_duration_days: Optional[int]
    actual_duration_days: Optional[int]
    progress: float
    construction_phase: Optional[str]

    # 质量管理
    quality_status: str
    inspection_records: Optional[list]
    acceptance_date: Optional[str]
    acceptance_by: Optional[str]
    quality_cert_no: Optional[str]

    # 安全管理
    safety_level: str
    safety_requirements: Optional[str]
    safety_inspections: Optional[list]
    high_risk_permit: bool
    safety_officer: Optional[str]

    # 工程量
    concrete_volume: Optional[float]
    rebar_weight: Optional[float]
    earthwork_volume: Optional[float]
    asphalt_weight: Optional[float]
    formwork_area: Optional[float]

    properties: dict
    notes: Optional[str]
    created_at: str
    updated_at: str


router = APIRouter(prefix="/entities", tags=["实体管理"])


def convert_entity_to_response(entity) -> EntityResponse:
    """将 Entity 模型转换为响应"""

    def format_date(d):
        return d.isoformat() if d else None

    return EntityResponse(
        id=str(entity.id),
        entity_type=entity.entity_type,
        name=entity.name,
        start_station=entity.start_station,
        end_station=entity.end_station,
        lateral_offset=float(entity.lateral_offset),
        elevation_base=float(entity.elevation_base) if entity.elevation_base else None,
        width=float(entity.width) if entity.width else None,
        height=float(entity.height) if entity.height else None,
        design_params=entity.design_params,
        planned_start_date=format_date(entity.planned_start_date),
        planned_end_date=format_date(entity.planned_end_date),
        actual_start_date=format_date(entity.actual_start_date),
        actual_end_date=format_date(entity.actual_end_date),
        planned_duration_days=entity.planned_duration_days,
        actual_duration_days=entity.actual_duration_days,
        progress=float(entity.progress),
        construction_phase=entity.construction_phase,
        quality_status=entity.quality_status,
        inspection_records=entity.inspection_records,
        acceptance_date=format_date(entity.acceptance_date),
        acceptance_by=entity.acceptance_by,
        quality_cert_no=entity.quality_cert_no,
        safety_level=entity.safety_level,
        safety_requirements=entity.safety_requirements,
        safety_inspections=entity.safety_inspections,
        high_risk_permit=entity.high_risk_permit,
        safety_officer=entity.safety_officer,
        concrete_volume=float(entity.concrete_volume)
        if entity.concrete_volume
        else None,
        rebar_weight=float(entity.rebar_weight) if entity.rebar_weight else None,
        earthwork_volume=float(entity.earthwork_volume)
        if entity.earthwork_volume
        else None,
        asphalt_weight=float(entity.asphalt_weight) if entity.asphalt_weight else None,
        formwork_area=float(entity.formwork_area) if entity.formwork_area else None,
        properties=entity.properties or {},
        notes=entity.notes,
        created_at=entity.created_at.isoformat() if entity.created_at else None,
        updated_at=entity.updated_at.isoformat() if entity.updated_at else None,
    )


@router.post("", response_model=EntityResponse)
async def create_entity(entity: EntityCreate, db: AsyncSession = Depends(get_db)):
    """创建新实体"""
    try:
        created = await entity_service.create_complete(
            db=db,
            entity_type=entity.entity_type,
            name=entity.name,
            start_station=entity.start_station,
            end_station=entity.end_station,
            lateral_offset=entity.lateral_offset,
            elevation_base=entity.elevation_base,
            width=entity.width,
            height=entity.height,
            design_params=entity.design_params.model_dump()
            if entity.design_params
            else None,
            schedule=entity.schedule.model_dump() if entity.schedule else None,
            quality=entity.quality.model_dump() if entity.quality else None,
            safety=entity.safety.model_dump() if entity.safety else None,
            quantities=entity.quantities.model_dump() if entity.quantities else None,
            properties=entity.properties,
            notes=entity.notes,
        )

        await db.commit()
        return convert_entity_to_response(created)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(entity_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取实体详情"""
    entity = await entity_service.get_by_id(db, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="实体不存在")
    return convert_entity_to_response(entity)


@router.put("/{entity_id}", response_model=EntityResponse)
async def update_entity(
    entity_id: uuid.UUID, entity: EntityUpdate, db: AsyncSession = Depends(get_db)
):
    """更新实体"""
    existing = await entity_service.get_by_id(db, entity_id)
    if not existing:
        raise HTTPException(status_code=404, detail="实体不存在")

    try:
        update_data = entity.model_dump(exclude_unset=True)

        # 处理嵌套对象
        if entity.schedule:
            update_data.update(entity.schedule.model_dump())
        if entity.quality:
            update_data.update(entity.quality.model_dump())
        if entity.safety:
            update_data.update(entity.safety.model_dump())
        if entity.quantities:
            update_data.update(entity.quantities.model_dump())
        if entity.design_params:
            update_data["design_params"] = entity.design_params.model_dump()

        updated = await entity_service.update_complete(
            db=db, entity_id=entity_id, **update_data
        )

        await db.commit()
        return convert_entity_to_response(updated)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[EntityResponse])
async def list_entities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    entity_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """获取实体列表"""
    if entity_type and entity_type not in ENTITY_TYPES:
        raise HTTPException(status_code=400, detail=f"无效的实体类型")

    entities = await entity_service.list_all(
        db=db, skip=skip, limit=limit, entity_type=entity_type
    )
    return [convert_entity_to_response(e) for e in entities]


@router.delete("/{entity_id}")
async def delete_entity(entity_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """删除实体"""
    success = await entity_service.delete(db, entity_id)
    if not success:
        raise HTTPException(status_code=404, detail="实体不存在")
    await db.commit()
    return {"message": "删除成功"}


@router.get("/types")
async def get_entity_types():
    """获取实体类型列表"""
    return {
        "entity_types": ENTITY_TYPES,
        "construction_phases": CONSTRUCTION_PHASES,
        "quality_statuses": [s.value for s in QualityStatus],
        "safety_levels": [s.value for s in SafetyLevel],
    }


@router.get("/stats/summary")
async def get_entity_stats(db: AsyncSession = Depends(get_db)):
    """获取工程量统计汇总"""
    entities = await entity_service.list_all(db=db, limit=10000)

    stats = {
        "total_entities": len(entities),
        "by_type": {},
        "total_quantities": {
            "concrete_volume": 0.0,
            "rebar_weight": 0.0,
            "earthwork_volume": 0.0,
            "asphalt_weight": 0.0,
            "formwork_area": 0.0,
        },
        "quality_summary": {
            "pending": 0,
            "qualified": 0,
            "unqualified": 0,
        },
        "safety_summary": {
            "low": 0,
            "medium": 0,
            "high": 0,
            "critical": 0,
        },
        "progress_summary": {
            "total": 0.0,
            "count": 0,
        },
    }

    for e in entities:
        # 按类型统计
        stats["by_type"][e.entity_type] = stats["by_type"].get(e.entity_type, 0) + 1

        # 工程量汇总
        if e.concrete_volume:
            stats["total_quantities"]["concrete_volume"] += float(e.concrete_volume)
        if e.rebar_weight:
            stats["total_quantities"]["rebar_weight"] += float(e.rebar_weight)
        if e.earthwork_volume:
            stats["total_quantities"]["earthwork_volume"] += float(e.earthwork_volume)
        if e.asphalt_weight:
            stats["total_quantities"]["asphalt_weight"] += float(e.asphalt_weight)
        if e.formwork_area:
            stats["total_quantities"]["formwork_area"] += float(e.formwork_area)

        # 质量统计
        if e.quality_status in stats["quality_summary"]:
            stats["quality_summary"][e.quality_status] += 1

        # 安全统计
        if e.safety_level in stats["safety_summary"]:
            stats["safety_summary"][e.safety_level] += 1

        # 进度统计
        stats["progress_summary"]["total"] += float(e.progress)
        stats["progress_summary"]["count"] += 1

    if stats["progress_summary"]["count"] > 0:
        stats["progress_summary"]["average"] = (
            stats["progress_summary"]["total"] / stats["progress_summary"]["count"]
        )

    return stats
