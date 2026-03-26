"""
实体关系服务
连接人员、资金、进度等数据模型，实现跨域查询
"""

import uuid
from datetime import datetime, date
from typing import Optional, List, Dict, Any, Set
from dataclasses import dataclass, field
from enum import Enum


class RelationshipType(Enum):
    """关系类型"""
    PERSONNEL_ASSIGNED = "personnel_assigned"     # 人员分配
    FUNDS_ALLOCATED = "funds_allocated"         # 资金分配
    EQUIPMENT_USED = "equipment_used"           # 设备使用
    MATERIAL_CONSUMED = "material_consumed"      # 材料消耗
    QUALITY_INSPECTED = "quality_inspected"      # 质量检查
    SAFETY_CHECKED = "safety_checked"           # 安全检查
    DOCUMENT_REFERENCED = "document_referenced"  # 文档关联
    WORK_ORDER_ISSUED = "work_order_issued"     # 工作指令


@dataclass
class EntityRelationship:
    """
    实体关系记录
    记录实体与其他资源的关联关系
    """
    relationship_id: str
    source_entity_id: uuid.UUID           # 源实体（通常是工程实体）
    relationship_type: RelationshipType
    target_type: str                      # 目标类型：personnel, funds, equipment, material, document, etc.
    target_id: str                        # 目标ID
    target_name: str                      # 目标名称
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)  # 额外信息

    def to_dict(self) -> Dict[str, Any]:
        return {
            "relationship_id": self.relationship_id,
            "source_entity_id": str(self.source_entity_id),
            "relationship_type": self.relationship_type.value,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "target_name": self.target_name,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "metadata": self.metadata
        }


@dataclass
class PersonnelAssignment:
    """
    人员分配记录
    """
    personnel_id: str
    personnel_name: str
    role: str                      # 角色：项目经理、技术员、安全员等
    team: str                     # 班组
    qualifications: List[str] = field(default_factory=list)  # 资质证书
    assigned_entities: List[str] = field(default_factory=list)  # 负责的实体IDs


@dataclass
class FundsAllocation:
    """
    资金分配记录
    """
    allocation_id: str
    amount: float                 # 金额（元）
    currency: str = "CNY"         # 货币
    category: str                 # 类别：材料费、人工费、机械费、管理费等
    purpose: str                  # 用途
    allocated_entities: List[str] = field(default_factory=list)  # 关联实体
    status: str = "allocated"     # 状态：allocated, spent, reserved


@dataclass
class ScheduleMilestone:
    """
    进度里程碑
    """
    milestone_id: str
    name: str
    target_date: date
    actual_date: Optional[date] = None
    status: str = "pending"       # pending, in_progress, completed, delayed
    related_entities: List[str] = field(default_factory=list)
    deliverables: List[str] = field(default_factory=list)


@dataclass
class CostBenefitAnalysis:
    """
    成本效益分析
    """
    entity_id: str
    planned_cost: float
    actual_cost: float
    budget_variance: float
    cost_per_unit: float
    productivity_index: float  # 生产力指数：计划产出/实际产出


class EntityRelationshipManager:
    """
    实体关系管理器
    管理工程实体与其他资源的关系
    """

    def __init__(self):
        # 关系存储：source_entity_id -> list of EntityRelationship
        self._relationships: Dict[uuid.UUID, List[EntityRelationship]] = {}
        # 索引：target_type + target_id -> list of EntityRelationship
        self._target_index: Dict[str, List[EntityRelationship]] = {}
        # 人员分配记录
        self._personnel_assignments: Dict[str, PersonnelAssignment] = {}
        # 资金分配记录
        self._funds_allocations: Dict[str, FundsAllocation] = {}
        # 进度里程碑
        self._milestones: Dict[str, ScheduleMilestone] = {}

    def add_relationship(
        self,
        source_entity_id: uuid.UUID,
        relationship_type: RelationshipType,
        target_type: str,
        target_id: str,
        target_name: str,
        metadata: Optional[Dict[str, Any]] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> str:
        """
        添加实体关系
        """
        relationship_id = f"rel_{source_entity_id}_{relationship_type.value}_{target_id}"

        relationship = EntityRelationship(
            relationship_id=relationship_id,
            source_entity_id=source_entity_id,
            relationship_type=relationship_type,
            target_type=target_type,
            target_id=target_id,
            target_name=target_name,
            start_time=start_time,
            end_time=end_time,
            metadata=metadata or {}
        )

        # 存储关系
        if source_entity_id not in self._relationships:
            self._relationships[source_entity_id] = []
        self._relationships[source_entity_id].append(relationship)

        # 更新索引
        index_key = f"{target_type}:{target_id}"
        if index_key not in self._target_index:
            self._target_index[index_key] = []
        self._target_index[index_key].append(relationship)

        return relationship_id

    def get_entity_relationships(
        self,
        entity_id: uuid.UUID,
        relationship_type: Optional[RelationshipType] = None,
        target_type: Optional[str] = None
    ) -> List[EntityRelationship]:
        """
        获取实体的所有关系
        """
        relationships = self._relationships.get(entity_id, [])

        if relationship_type:
            relationships = [r for r in relationships if r.relationship_type == relationship_type]

        if target_type:
            relationships = [r for r in relationships if r.target_type == target_type]

        return relationships

    def get_target_relationships(
        self,
        target_type: str,
        target_id: str
    ) -> List[EntityRelationship]:
        """
        获取目标资源的所有关联关系
        """
        index_key = f"{target_type}:{target_id}"
        return self._target_index.get(index_key, [])

    def assign_personnel(
        self,
        personnel_id: str,
        personnel_name: str,
        role: str,
        team: str,
        entity_ids: List[str],
        qualifications: Optional[List[str]] = None
    ) -> PersonnelAssignment:
        """
        分配人员到实体
        """
        assignment = PersonnelAssignment(
            personnel_id=personnel_id,
            personnel_name=personnel_name,
            role=role,
            team=team,
            qualifications=qualifications or [],
            assigned_entities=entity_ids
        )

        self._personnel_assignments[personnel_id] = assignment

        # 为每个实体添加关系
        for entity_id in entity_ids:
            try:
                entity_uuid = uuid.UUID(entity_id)
                self.add_relationship(
                    source_entity_id=entity_uuid,
                    relationship_type=RelationshipType.PERSONNEL_ASSIGNED,
                    target_type="personnel",
                    target_id=personnel_id,
                    target_name=personnel_name,
                    metadata={
                        "role": role,
                        "team": team
                    }
                )
            except ValueError:
                continue

        return assignment

    def allocate_funds(
        self,
        amount: float,
        category: str,
        purpose: str,
        entity_ids: List[str],
        currency: str = "CNY"
    ) -> FundsAllocation:
        """
        分配资金到实体
        """
        allocation_id = f"funds_{uuid.uuid4().hex[:8]}"

        allocation = FundsAllocation(
            allocation_id=allocation_id,
            amount=amount,
            currency=currency,
            category=category,
            purpose=purpose,
            allocated_entities=entity_ids
        )

        self._funds_allocations[allocation_id] = allocation

        # 为每个实体添加关系
        for entity_id in entity_ids:
            try:
                entity_uuid = uuid.UUID(entity_id)
                self.add_relationship(
                    source_entity_id=entity_uuid,
                    relationship_type=RelationshipType.FUNDS_ALLOCATED,
                    target_type="funds",
                    target_id=allocation_id,
                    target_name=f"{category}: {purpose}",
                    metadata={
                        "amount": amount,
                        "currency": currency
                    }
                )
            except ValueError:
                continue

        return allocation

    def create_milestone(
        self,
        name: str,
        target_date: date,
        related_entity_ids: Optional[List[str]] = None,
        deliverables: Optional[List[str]] = None
    ) -> ScheduleMilestone:
        """
        创建进度里程碑
        """
        milestone_id = f"milestone_{uuid.uuid4().hex[:8]}"

        milestone = ScheduleMilestone(
            milestone_id=milestone_id,
            name=name,
            target_date=target_date,
            related_entities=related_entity_ids or [],
            deliverables=deliverables or []
        )

        self._milestones[milestone_id] = milestone
        return milestone

    def get_entity_cost_summary(self, entity_id: uuid.UUID) -> Dict[str, Any]:
        """
        获取实体的成本汇总
        """
        relationships = self.get_entity_relationships(
            entity_id,
            relationship_type=RelationshipType.FUNDS_ALLOCATED
        )

        total_allocated = 0.0
        by_category = {}

        for rel in relationships:
            metadata = rel.metadata
            amount = metadata.get("amount", 0.0)
            total_allocated += amount

            # 按类别统计
            category = rel.target_name.split(":")[0] if ":" in rel.target_name else "other"
            if category not in by_category:
                by_category[category] = 0.0
            by_category[category] += amount

        return {
            "entity_id": str(entity_id),
            "total_allocated": total_allocated,
            "by_category": by_category,
            "relationship_count": len(relationships)
        }

    def get_entity_personnel_summary(self, entity_id: uuid.UUID) -> Dict[str, Any]:
        """
        获取实体的人员汇总
        """
        relationships = self.get_entity_relationships(
            entity_id,
            relationship_type=RelationshipType.PERSONNEL_ASSIGNED
        )

        personnel_list = []
        roles = set()

        for rel in relationships:
            personnel_list.append({
                "personnel_id": rel.target_id,
                "personnel_name": rel.target_name,
                "role": rel.metadata.get("role", "unknown"),
                "team": rel.metadata.get("team", "unknown")
            })
            roles.add(rel.metadata.get("role", "unknown"))

        return {
            "entity_id": str(entity_id),
            "personnel_count": len(personnel_list),
            "unique_roles": list(roles),
            "personnel": personnel_list
        }

    def generate_entity_report(self, entity_id: uuid.UUID) -> Dict[str, Any]:
        """
        生成实体的完整报告
        包含人员、资金、进度等信息
        """
        return {
            "entity_id": str(entity_id),
            "cost_summary": self.get_entity_cost_summary(entity_id),
            "personnel_summary": self.get_entity_personnel_summary(entity_id),
            "relationships": {
                rel.relationship_type.value: len([
                    r for r in self.get_entity_relationships(entity_id)
                    if r.relationship_type == rel.relationship_type
                ])
                for rel in self.get_entity_relationships(entity_id)
            }
        }


# 创建全局关系管理器实例
entity_relationship_manager = EntityRelationshipManager()


class DataAggregationService:
    """
    数据聚合服务
    实现跨域数据聚合和分析
    """

    def __init__(self):
        self.relationship_manager = entity_relationship_manager

    def aggregate_by_station_range(
        self,
        start_station: str,
        end_station: str,
        entity_ids: List[str]
    ) -> Dict[str, Any]:
        """
        按桩号范围聚合数据
        """
        total_cost = 0.0
        personnel_count = 0
        funds_breakdown = {}
        roles = set()

        for entity_id in entity_ids:
            try:
                entity_uuid = uuid.UUID(entity_id)

                # 汇总成本
                cost_summary = self.relationship_manager.get_entity_cost_summary(entity_uuid)
                total_cost += cost_summary["total_allocated"]
                for cat, amt in cost_summary["by_category"].items():
                    funds_breakdown[cat] = funds_breakdown.get(cat, 0.0) + amt

                # 汇总人员
                personnel_summary = self.relationship_manager.get_entity_personnel_summary(entity_uuid)
                personnel_count += personnel_summary["personnel_count"]
                roles.update(personnel_summary["unique_roles"])

            except ValueError:
                continue

        return {
            "station_range": {
                "start": start_station,
                "end": end_station
            },
            "total_entities": len(entity_ids),
            "total_cost": total_cost,
            "funds_breakdown": funds_breakdown,
            "total_personnel": personnel_count,
            "unique_roles": list(roles)
        }

    def generate_progress_dashboard(
        self,
        entity_ids: List[str],
        baseline_versions: Dict[str, float],
        current_versions: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        生成进度仪表盘数据
        """
        total_planned = sum(baseline_versions.values())
        total_current = sum(current_versions.values())

        entity_details = []
        delayed_entities = []

        for entity_id in entity_ids:
            planned = baseline_versions.get(entity_id, 0)
            current = current_versions.get(entity_id, 0)
            variance = current - planned

            detail = {
                "entity_id": entity_id,
                "planned_progress": planned,
                "current_progress": current,
                "variance": variance,
                "status": "on_track" if variance >= -5 else ("delayed" if variance >= -20 else "critical")
            }

            entity_details.append(detail)

            if variance < -10:
                delayed_entities.append(entity_id)

        return {
            "summary": {
                "total_entities": len(entity_ids),
                "total_planned_progress": total_planned / len(entity_ids) if entity_ids else 0,
                "total_current_progress": total_current / len(entity_ids) if entity_ids else 0,
                "overall_variance": (total_current - total_planned) / len(entity_ids) if entity_ids else 0,
                "on_track_count": len([e for e in entity_details if e["status"] == "on_track"]),
                "delayed_count": len(delayed_entities)
            },
            "entity_details": entity_details,
            "delayed_entities": delayed_entities
        }


# 创建全局数据聚合服务
data_aggregation_service = DataAggregationService()