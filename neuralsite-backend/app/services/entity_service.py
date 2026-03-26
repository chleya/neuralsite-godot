"""
实体管理服务模块 - 完整版本
支持设计参数、4D进度、质量管理和安全管理
"""

import uuid
from typing import List, Optional, Tuple, Any
from datetime import date, datetime
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entity import Entity, ENTITY_TYPES
from app.models.audit_log import AuditLog, EntitySnapshot, AuditAction


def entity_to_dict(entity: Entity, include_all: bool = False) -> dict:
    """将实体转换为字典"""
    data = {
        "id": str(entity.id),
        "entity_type": entity.entity_type,
        "name": entity.name,
        "start_station": entity.start_station,
        "end_station": entity.end_station,
        "lateral_offset": float(entity.lateral_offset),
        "elevation_base": float(entity.elevation_base)
        if entity.elevation_base
        else None,
        "width": float(entity.width) if entity.width else None,
        "height": float(entity.height) if entity.height else None,
        "progress": float(entity.progress),
        "properties": entity.properties or {},
        "notes": entity.notes,
        "created_at": entity.created_at.isoformat() if entity.created_at else None,
        "updated_at": entity.updated_at.isoformat() if entity.updated_at else None,
    }

    if include_all:
        data.update(
            {
                "design_params": entity.design_params,
                "planned_start_date": entity.planned_start_date.isoformat()
                if entity.planned_start_date
                else None,
                "planned_end_date": entity.planned_end_date.isoformat()
                if entity.planned_end_date
                else None,
                "actual_start_date": entity.actual_start_date.isoformat()
                if entity.actual_start_date
                else None,
                "actual_end_date": entity.actual_end_date.isoformat()
                if entity.actual_end_date
                else None,
                "planned_duration_days": entity.planned_duration_days,
                "actual_duration_days": entity.actual_duration_days,
                "construction_phase": entity.construction_phase,
                "quality_status": entity.quality_status,
                "inspection_records": entity.inspection_records,
                "acceptance_date": entity.acceptance_date.isoformat()
                if entity.acceptance_date
                else None,
                "acceptance_by": entity.acceptance_by,
                "quality_cert_no": entity.quality_cert_no,
                "safety_level": entity.safety_level,
                "safety_requirements": entity.safety_requirements,
                "safety_inspections": entity.safety_inspections,
                "high_risk_permit": entity.high_risk_permit,
                "safety_officer": entity.safety_officer,
                "concrete_volume": float(entity.concrete_volume)
                if entity.concrete_volume
                else None,
                "rebar_weight": float(entity.rebar_weight)
                if entity.rebar_weight
                else None,
                "earthwork_volume": float(entity.earthwork_volume)
                if entity.earthwork_volume
                else None,
                "asphalt_weight": float(entity.asphalt_weight)
                if entity.asphalt_weight
                else None,
                "formwork_area": float(entity.formwork_area)
                if entity.formwork_area
                else None,
            }
        )

    return data


def get_changed_fields(old_data: dict, new_data: dict) -> List[str]:
    """比较两个字典，返回变化的字段列表"""
    changed = []
    all_keys = set(old_data.keys()) | set(new_data.keys())
    for key in all_keys:
        old_val = old_data.get(key)
        new_val = new_data.get(key)
        if old_val != new_val:
            changed.append(key)
    return changed


def parse_date(value: Any) -> Optional[date]:
    """解析日期"""
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value).date()
        except ValueError:
            return None
    return None


class EntityService:
    """实体管理服务"""

    def __init__(self):
        pass

    async def create_complete(
        self,
        db: AsyncSession,
        entity_type: str,
        name: str,
        start_station: str,
        end_station: str,
        lateral_offset: float = 0.0,
        elevation_base: Optional[float] = None,
        width: Optional[float] = None,
        height: Optional[float] = None,
        design_params: Optional[dict] = None,
        schedule: Optional[dict] = None,
        quality: Optional[dict] = None,
        safety: Optional[dict] = None,
        quantities: Optional[dict] = None,
        properties: Optional[dict] = None,
        notes: Optional[str] = None,
        operator: str = "system",
    ) -> Entity:
        """创建完整实体"""
        entity = Entity(
            entity_type=entity_type,
            name=name,
            start_station=start_station,
            end_station=end_station,
            lateral_offset=lateral_offset,
            elevation_base=elevation_base,
            width=width,
            height=height,
            design_params=design_params,
            notes=notes,
            properties=properties or {},
            progress=0.0,
            quality_status="pending",
            safety_level="low",
            high_risk_permit=False,
        )

        # 4D进度
        if schedule:
            entity.planned_start_date = parse_date(schedule.get("planned_start_date"))
            entity.planned_end_date = parse_date(schedule.get("planned_end_date"))
            entity.actual_start_date = parse_date(schedule.get("actual_start_date"))
            entity.actual_end_date = parse_date(schedule.get("actual_end_date"))
            entity.planned_duration_days = schedule.get("planned_duration_days")
            entity.actual_duration_days = schedule.get("actual_duration_days")
            entity.progress = schedule.get("progress", 0.0)
            entity.construction_phase = schedule.get("construction_phase")

        # 质量管理
        if quality:
            entity.quality_status = quality.get("quality_status", "pending")
            entity.inspection_records = quality.get("inspection_records")
            entity.acceptance_date = parse_date(quality.get("acceptance_date"))
            entity.acceptance_by = quality.get("acceptance_by")
            entity.quality_cert_no = quality.get("quality_cert_no")

        # 安全管理
        if safety:
            entity.safety_level = safety.get("safety_level", "low")
            entity.safety_requirements = safety.get("safety_requirements")
            entity.safety_inspections = safety.get("safety_inspections")
            entity.high_risk_permit = safety.get("high_risk_permit", False)
            entity.safety_officer = safety.get("safety_officer")

        # 工程量
        if quantities:
            entity.concrete_volume = quantities.get("concrete_volume")
            entity.rebar_weight = quantities.get("rebar_weight")
            entity.earthwork_volume = quantities.get("earthwork_volume")
            entity.asphalt_weight = quantities.get("asphalt_weight")
            entity.formwork_area = quantities.get("formwork_area")

        db.add(entity)
        await db.flush()
        await db.refresh(entity)

        # 记录审计日志
        await self._create_audit_log(
            db=db,
            entity=entity,
            action=AuditAction.CREATE,
            operator=operator,
        )

        return entity

    async def update_complete(
        self, db: AsyncSession, entity_id: uuid.UUID, operator: str = "system", **kwargs
    ) -> Optional[Entity]:
        """更新完整实体"""
        entity = await self.get_by_id(db, entity_id)
        if not entity:
            return None

        # 记录旧值
        old_data = entity_to_dict(entity, include_all=True)

        # 处理日期字段
        for date_field in [
            "planned_start_date",
            "planned_end_date",
            "actual_start_date",
            "actual_end_date",
            "acceptance_date",
        ]:
            if date_field in kwargs:
                kwargs[date_field] = parse_date(kwargs[date_field])

        # 更新字段
        for key, value in kwargs.items():
            if hasattr(entity, key) and value is not None:
                setattr(entity, key, value)

        entity.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(entity)

        # 记录审计日志
        new_data = entity_to_dict(entity, include_all=True)
        changed_fields = get_changed_fields(old_data, new_data)

        if changed_fields:
            await self._create_audit_log(
                db=db,
                entity=entity,
                action=AuditAction.UPDATE,
                operator=operator,
                old_values={k: old_data[k] for k in changed_fields if k in old_data},
                new_values={k: new_data[k] for k in changed_fields if k in new_data},
                changed_fields=changed_fields,
            )

        return entity

    async def _create_audit_log(
        self,
        db: AsyncSession,
        entity: Entity,
        action: AuditAction,
        operator: str = "system",
        old_values: Optional[dict] = None,
        new_values: Optional[dict] = None,
        changed_fields: Optional[List[str]] = None,
    ):
        """创建审计日志"""
        entity_data = entity_to_dict(entity, include_all=True)

        audit_log = AuditLog(
            entity_id=entity.id,
            action=action,
            operator=operator,
            old_values=old_values,
            new_values=new_values,
            changed_fields=changed_fields or list(entity_data.keys()),
            timestamp=datetime.utcnow(),
            is_deleted=False,
        )
        db.add(audit_log)
        await db.flush()

        # 创建快照
        snapshot = EntitySnapshot(
            audit_log_id=audit_log.id,
            entity_id=entity.id,
            action=action,
            entity_data=entity_data,
            created_at=datetime.utcnow(),
        )
        db.add(snapshot)
        await db.flush()

    # 兼容旧接口
    async def create(
        self,
        db: AsyncSession,
        entity_type: str,
        name: str,
        start_station: str,
        end_station: str,
        lateral_offset: float = 0.0,
        elevation_base: Optional[float] = None,
        width: Optional[float] = None,
        height: Optional[float] = None,
        properties: Optional[dict] = None,
        notes: Optional[str] = None,
        operator: str = "system",
    ) -> Entity:
        return await self.create_complete(
            db=db,
            entity_type=entity_type,
            name=name,
            start_station=start_station,
            end_station=end_station,
            lateral_offset=lateral_offset,
            elevation_base=elevation_base,
            width=width,
            height=height,
            properties=properties,
            notes=notes,
            operator=operator,
        )

    async def update(
        self, db: AsyncSession, entity_id: uuid.UUID, operator: str = "system", **kwargs
    ) -> Optional[Entity]:
        return await self.update_complete(
            db=db, entity_id=entity_id, operator=operator, **kwargs
        )

    async def get_by_id(
        self, db: AsyncSession, entity_id: uuid.UUID
    ) -> Optional[Entity]:
        result = await db.execute(select(Entity).where(Entity.id == entity_id))
        return result.scalar_one_or_none()

    async def list_all(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        entity_type: Optional[str] = None,
    ) -> List[Entity]:
        query = select(Entity)
        if entity_type:
            query = query.where(Entity.entity_type == entity_type)
        query = query.offset(skip).limit(limit).order_by(Entity.start_station)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def delete(
        self, db: AsyncSession, entity_id: uuid.UUID, operator: str = "system"
    ) -> bool:
        entity = await self.get_by_id(db, entity_id)
        if not entity:
            return False

        # 记录审计日志
        await self._create_audit_log(
            db=db,
            entity=entity,
            action=AuditAction.DELETE,
            operator=operator,
        )

        await db.delete(entity)
        await db.flush()
        return True

    async def query_by_station(
        self, db: AsyncSession, station: str, entity_type: Optional[str] = None
    ) -> List[Entity]:
        query = select(Entity).where(
            and_(Entity.start_station <= station, Entity.end_station >= station)
        )
        if entity_type:
            query = query.where(Entity.entity_type == entity_type)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def query_by_range(
        self,
        db: AsyncSession,
        start_station: str,
        end_station: str,
        entity_type: Optional[str] = None,
    ) -> List[Entity]:
        query = select(Entity).where(
            and_(
                Entity.start_station <= end_station, Entity.end_station >= start_station
            )
        )
        if entity_type:
            query = query.where(Entity.entity_type == entity_type)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_entity_history(
        self,
        db: AsyncSession,
        entity_id: uuid.UUID,
        limit: int = 100,
    ) -> List[AuditLog]:
        stmt = (
            select(AuditLog)
            .where(and_(AuditLog.entity_id == entity_id, AuditLog.is_deleted == False))
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())


entity_service = EntityService()
