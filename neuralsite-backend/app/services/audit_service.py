"""
审计日志服务
处理审计日志的创建、查询和回滚
"""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from sqlalchemy.orm import selectinload

from app.models.audit_log import AuditLog, EntitySnapshot, AuditAction, create_audit_log
from app.core.database import Base


class AuditService:
    """审计日志服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_audit_log(
        self,
        entity_id: uuid.UUID,
        action: AuditAction,
        operator: str = "system",
        old_values: Optional[dict] = None,
        new_values: Optional[dict] = None,
        changed_fields: Optional[List[str]] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> AuditLog:
        """
        创建审计日志
        """
        audit_log = AuditLog(
            entity_id=entity_id,
            action=action,
            operator=operator,
            old_values=old_values,
            new_values=new_values,
            changed_fields=changed_fields or [],
            reason=reason,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
            timestamp=datetime.utcnow(),
            is_deleted=False,
        )

        self.db.add(audit_log)
        await self.db.flush()

        return audit_log

    async def create_entity_snapshot(
        self,
        audit_log_id: uuid.UUID,
        entity_id: uuid.UUID,
        action: AuditAction,
        entity_data: dict,
    ) -> EntitySnapshot:
        """
        创建实体快照
        """
        snapshot = EntitySnapshot(
            audit_log_id=audit_log_id,
            entity_id=entity_id,
            action=action,
            entity_data=entity_data,
            created_at=datetime.utcnow(),
        )

        self.db.add(snapshot)
        await self.db.flush()

        return snapshot

    async def get_entity_history(
        self,
        entity_id: uuid.UUID,
        limit: int = 100,
        offset: int = 0,
    ) -> List[AuditLog]:
        """
        获取实体的变更历史
        """
        stmt = (
            select(AuditLog)
            .where(and_(AuditLog.entity_id == entity_id, AuditLog.is_deleted == False))
            .order_by(desc(AuditLog.timestamp))
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_entity_snapshots(
        self,
        entity_id: uuid.UUID,
        limit: int = 10,
    ) -> List[EntitySnapshot]:
        """
        获取实体的快照列表（最新到最老）
        """
        stmt = (
            select(EntitySnapshot)
            .where(EntitySnapshot.entity_id == entity_id)
            .order_by(desc(EntitySnapshot.created_at))
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_snapshot_by_audit_id(
        self,
        audit_log_id: uuid.UUID,
    ) -> Optional[EntitySnapshot]:
        """
        根据审计日志ID获取快照
        """
        stmt = select(EntitySnapshot).where(EntitySnapshot.audit_log_id == audit_log_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_changes_by_time_range(
        self,
        start_time: datetime,
        end_time: datetime,
        entity_type: Optional[str] = None,
        operator: Optional[str] = None,
        limit: int = 1000,
    ) -> List[AuditLog]:
        """
        根据时间范围查询变更记录
        """
        conditions = [
            AuditLog.timestamp >= start_time,
            AuditLog.timestamp <= end_time,
            AuditLog.is_deleted == False,
        ]

        if entity_type:
            # 需要关联查询，这里简化处理
            pass

        if operator:
            conditions.append(AuditLog.operator == operator)

        stmt = (
            select(AuditLog)
            .where(and_(*conditions))
            .order_by(desc(AuditLog.timestamp))
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def rollback_to_version(
        self,
        entity_id: uuid.UUID,
        target_audit_log_id: uuid.UUID,
        operator: str = "system",
        reason: Optional[str] = None,
    ) -> dict:
        """
        回滚实体到指定版本

        Returns:
            包含 old_values 和 new_values 的字典，用于创建新的审计日志
        """
        # 获取目标快照
        target_snapshot = await self.get_snapshot_by_audit_id(target_audit_log_id)
        if not target_snapshot:
            raise ValueError(f"找不到指定的审计日志: {target_audit_log_id}")

        # 获取当前最新快照
        current_snapshots = await self.get_entity_snapshots(entity_id, limit=1)
        current_data = current_snapshots[0].entity_data if current_snapshots else None

        if current_data == target_snapshot.entity_data:
            raise ValueError("目标版本与当前版本相同，无需回滚")

        return {
            "old_values": current_data,
            "new_values": target_snapshot.entity_data,
            "target_snapshot_id": str(target_snapshot.id),
        }


# 全局实例获取函数
_audit_service_cache: Optional[AuditService] = None


async def get_audit_service(db: AsyncSession) -> AuditService:
    """获取审计服务实例"""
    return AuditService(db)
