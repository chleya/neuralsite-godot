"""
操作日志/审计追踪数据模型
记录所有实体变更历史
"""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, DateTime, Index, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class AuditAction(str, enum.Enum):
    """操作类型枚举"""

    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    READ = "read"  # 可选：记录查询


class AuditLog(Base):
    """
    审计日志模型
    记录所有实体变更操作，支持追溯和回滚
    """

    __tablename__ = "audit_logs"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # 关联实体
    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )

    # 操作类型
    action: Mapped[AuditAction] = mapped_column(
        SQLEnum(AuditAction, name="audit_action_enum"), nullable=False, index=True
    )

    # 操作者（可选，未来对接用户系统）
    operator: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, index=True, default="system"
    )

    # 变更字段列表
    changed_fields: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String(100)), nullable=True
    )

    # 变更前的值（JSON格式，只记录变化的字段）
    old_values: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # 变更后的值（JSON格式，只记录变化的字段）
    new_values: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # IP地址（可选）
    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),  # IPv6 最大长度
        nullable=True,
    )

    # 用户代理（可选）
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 变更原因（可选）
    reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # 请求追踪ID（用于关联多个操作）
    request_id: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, index=True
    )

    # 时间戳
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, index=True
    )

    # 软删除标记
    is_deleted: Mapped[bool] = mapped_column(default=False, nullable=False)

    # 索引定义
    __table_args__ = (
        # 实体 + 时间复合索引，用于查询某个实体的历史
        Index("idx_audit_entity_time", "entity_id", "timestamp"),
        # 操作类型 + 时间索引
        Index("idx_audit_action_time", "action", "timestamp"),
        # 操作者 + 时间索引
        Index("idx_audit_operator_time", "operator", "timestamp"),
    )

    def __repr__(self):
        return f"<AuditLog(id={self.id}, entity_id={self.entity_id}, action={self.action})>"


class EntitySnapshot(Base):
    """
    实体快照表
    存储实体的完整历史状态，用于回滚和对比
    """

    __tablename__ = "entity_snapshots"

    # 主键
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # 关联审计日志
    audit_log_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )

    # 关联实体
    entity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )

    # 操作类型
    action: Mapped[AuditAction] = mapped_column(
        SQLEnum(AuditAction, name="audit_action_enum"), nullable=False
    )

    # 完整的实体数据快照
    entity_data: Mapped[dict] = mapped_column(JSONB, nullable=False)

    # 创建时间
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # 索引
    __table_args__ = (Index("idx_snapshot_entity", "entity_id", "created_at"),)

    def __repr__(self):
        return f"<EntitySnapshot(id={self.id}, entity_id={self.entity_id})>"


def create_audit_log(
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
) -> dict:
    """
    创建立即返回的审计日志字典（用于异步保存）
    """
    return {
        "id": uuid.uuid4(),
        "entity_id": entity_id,
        "action": action,
        "operator": operator,
        "old_values": old_values,
        "new_values": new_values,
        "changed_fields": changed_fields
        or list(set((list(old_values or {}).keys()) + (list(new_values or {}).keys()))),
        "reason": reason,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "request_id": request_id,
        "timestamp": datetime.utcnow(),
        "is_deleted": False,
    }
