"""
增强版状态快照服务
支持版本链和时间旅行查询
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum


class VersionType(Enum):
    """版本类型"""
    BASELINE = "baseline"          # 基准版本（设计版）
    CURRENT = "current"            # 当前实际版本
    PLANNED = "planned"            # 计划版本
    SIMULATED = "simulated"        # 模拟版本
    FORECAST = "forecast"          # 预测版本


@dataclass
class VersionNode:
    """
    版本节点
    表示状态版本链中的一个节点
    """
    version_id: str
    entity_id: uuid.UUID
    timestamp: datetime
    version_type: VersionType
    parent_version_id: Optional[str] = None
    description: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "version_id": self.version_id,
            "entity_id": str(self.entity_id),
            "timestamp": self.timestamp.isoformat(),
            "version_type": self.version_type.value,
            "parent_version_id": self.parent_version_id,
            "description": self.description,
            "metadata": self.metadata
        }


class StateVersionManager:
    """
    状态版本管理器
    管理实体的版本链，支持时间旅行查询
    """

    def __init__(self):
        # 版本链存储：entity_id -> list of VersionNode
        self._version_chains: Dict[uuid.UUID, List[VersionNode]] = {}
        # 版本索引：version_id -> VersionNode
        self._version_index: Dict[str, VersionNode] = {}

    def create_baseline(
        self,
        entity_id: uuid.UUID,
        timestamp: datetime,
        description: str = "设计基准版"
    ) -> str:
        """
        创建基准版本
        通常在设计完成后创建，代表设计状态
        """
        version_id = f"baseline_{entity_id}_{timestamp.strftime('%Y%m%d%H%M%S')}"

        version_node = VersionNode(
            version_id=version_id,
            entity_id=entity_id,
            timestamp=timestamp,
            version_type=VersionType.BASELINE,
            description=description
        )

        self._add_version_node(entity_id, version_node)
        return version_id

    def create_current_version(
        self,
        entity_id: uuid.UUID,
        timestamp: datetime,
        parent_version_id: Optional[str] = None,
        description: str = "当前状态"
    ) -> str:
        """
        创建当前实际版本
        代表实体的当前实际状态
        """
        version_id = f"current_{entity_id}_{timestamp.strftime('%Y%m%d%H%M%S')}"

        version_node = VersionNode(
            version_id=version_id,
            entity_id=entity_id,
            timestamp=timestamp,
            version_type=VersionType.CURRENT,
            parent_version_id=parent_version_id,
            description=description
        )

        self._add_version_node(entity_id, version_node)
        return version_id

    def create_planned_version(
        self,
        entity_id: uuid.UUID,
        timestamp: datetime,
        parent_version_id: Optional[str] = None,
        planned_completion: Optional[datetime] = None,
        description: str = "计划状态"
    ) -> str:
        """
        创建计划版本
        代表计划中的未来状态
        """
        version_id = f"planned_{entity_id}_{timestamp.strftime('%Y%m%d%H%M%S')}"

        version_node = VersionNode(
            version_id=version_id,
            entity_id=entity_id,
            timestamp=timestamp,
            version_type=VersionType.PLANNED,
            parent_version_id=parent_version_id,
            description=description,
            metadata={"planned_completion": planned_completion.isoformat() if planned_completion else None}
        )

        self._add_version_node(entity_id, version_node)
        return version_id

    def create_simulated_version(
        self,
        entity_id: uuid.UUID,
        timestamp: datetime,
        simulation_params: Dict[str, Any],
        parent_version_id: Optional[str] = None,
        description: str = "模拟状态"
    ) -> str:
        """
        创建模拟版本
        用于假设情景分析
        """
        version_id = f"sim_{entity_id}_{timestamp.strftime('%Y%m%d%H%M%S')}"

        version_node = VersionNode(
            version_id=version_id,
            entity_id=entity_id,
            timestamp=timestamp,
            version_type=VersionType.SIMULATED,
            parent_version_id=parent_version_id,
            description=description,
            metadata={"simulation_params": simulation_params}
        )

        self._add_version_node(entity_id, version_node)
        return version_id

    def create_forecast_version(
        self,
        entity_id: uuid.UUID,
        forecast_time: datetime,
        forecast_value: float,
        confidence: float,
        parent_version_id: Optional[str] = None,
        description: str = "预测状态"
    ) -> str:
        """
        创建预测版本
        基于历史数据预测的未来状态
        """
        version_id = f"forecast_{entity_id}_{forecast_time.strftime('%Y%m%d%H%M%S')}"

        version_node = VersionNode(
            version_id=version_id,
            entity_id=entity_id,
            timestamp=forecast_time,
            version_type=VersionType.FORECAST,
            parent_version_id=parent_version_id,
            description=description,
            metadata={
                "forecast_value": forecast_value,
                "confidence": confidence
            }
        )

        self._add_version_node(entity_id, version_node)
        return version_id

    def _add_version_node(self, entity_id: uuid.UUID, version_node: VersionNode):
        """添加版本节点"""
        if entity_id not in self._version_chains:
            self._version_chains[entity_id] = []

        self._version_chains[entity_id].append(version_node)
        self._version_index[version_node.version_id] = version_node

    def get_version_chain(self, entity_id: uuid.UUID) -> List[VersionNode]:
        """获取实体的版本链"""
        return self._version_chains.get(entity_id, [])

    def get_version(self, version_id: str) -> Optional[VersionNode]:
        """获取指定版本"""
        return self._version_index.get(version_id)

    def get_latest_version(
        self,
        entity_id: uuid.UUID,
        version_type: Optional[VersionType] = None
    ) -> Optional[VersionNode]:
        """获取实体的最新版本"""
        chain = self._version_chains.get(entity_id, [])
        if not chain:
            return None

        if version_type is None:
            return chain[-1]

        # 倒序查找最新指定类型的版本
        for node in reversed(chain):
            if node.version_type == version_type:
                return node

        return None

    def time_travel_query(
        self,
        entity_id: uuid.UUID,
        target_time: datetime
    ) -> Optional[VersionNode]:
        """
        时间旅行查询
        查找指定时间点的状态版本
        """
        chain = self._version_chains.get(entity_id, [])
        if not chain:
            return None

        # 找到时间最接近但不超过目标时间的版本
        best_match = None
        for node in chain:
            if node.timestamp <= target_time:
                if best_match is None or node.timestamp > best_match.timestamp:
                    best_match = node

        return best_match

    def get_versions_in_range(
        self,
        entity_id: uuid.UUID,
        start_time: datetime,
        end_time: datetime
    ) -> List[VersionNode]:
        """
        获取时间范围内的所有版本
        """
        chain = self._version_chains.get(entity_id, [])
        return [
            node for node in chain
            if start_time <= node.timestamp <= end_time
        ]

    def compare_versions(
        self,
        version_id1: str,
        version_id2: str
    ) -> Dict[str, Any]:
        """
        比较两个版本的差异
        """
        node1 = self._version_index.get(version_id1)
        node2 = self._version_index.get(version_id2)

        if not node1 or not node2:
            return {"error": "版本不存在"}

        return {
            "version1": node1.to_dict(),
            "version2": node2.to_dict(),
            "time_difference_days": (node2.timestamp - node1.timestamp).days,
            "metadata_changes": self._compare_metadata(node1.metadata, node2.metadata)
        }

    def _compare_metadata(
        self,
        metadata1: Dict[str, Any],
        metadata2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """比较元数据的差异"""
        all_keys = set(metadata1.keys()) | set(metadata2.keys())
        changes = {}

        for key in all_keys:
            val1 = metadata1.get(key)
            val2 = metadata2.get(key)

            if val1 != val2:
                changes[key] = {
                    "from": val1,
                    "to": val2
                }

        return changes

    def get_entity_summary(self, entity_id: uuid.UUID) -> Dict[str, Any]:
        """获取实体的版本历史摘要"""
        chain = self._version_chains.get(entity_id, [])
        if not chain:
            return {"entity_id": str(entity_id), "exists": False}

        # 按类型统计
        type_counts = {}
        for node in chain:
            type_key = node.version_type.value
            type_counts[type_key] = type_counts.get(type_key, 0) + 1

        return {
            "entity_id": str(entity_id),
            "exists": True,
            "total_versions": len(chain),
            "version_counts_by_type": type_counts,
            "first_version_time": chain[0].timestamp.isoformat() if chain else None,
            "latest_version_time": chain[-1].timestamp.isoformat() if chain else None,
            "baseline_version": self.get_latest_version(entity_id, VersionType.BASELINE).version_id if self.get_latest_version(entity_id, VersionType.BASELINE) else None,
            "current_version": self.get_latest_version(entity_id, VersionType.CURRENT).version_id if self.get_latest_version(entity_id, VersionType.CURRENT) else None
        }


# 创建全局版本管理器实例
state_version_manager = StateVersionManager()


class ProgressCalculator:
    """
    进度计算器
    基于状态快照计算施工进度
    """

    def calculate_entity_progress(
        self,
        entity_id: uuid.UUID,
        current_version: Optional[VersionNode] = None
    ) -> float:
        """
        计算实体的当前进度
        基于最新版本的时间推算
        """
        if current_version is None:
            current_version = state_version_manager.get_latest_version(
                entity_id,
                VersionType.CURRENT
            )

        if current_version is None:
            return 0.0

        # 从元数据中获取进度百分比
        progress = current_version.metadata.get("progress", 0.0)
        return float(progress)

    def calculate_range_progress(
        self,
        start_station: str,
        end_station: str,
        entities_progress: Dict[uuid.UUID, float]
    ) -> Dict[str, Any]:
        """
        计算桩号范围内的整体进度
        按长度加权平均
        """
        total_length = 0.0
        weighted_progress = 0.0

        for entity_id, progress in entities_progress.items():
            # 简化：假设每个实体长度相同
            entity_length = 100.0  # 米
            total_length += entity_length
            weighted_progress += progress * entity_length

        if total_length == 0:
            return {"overall_progress": 0.0, "entity_count": 0}

        return {
            "overall_progress": weighted_progress / total_length,
            "total_length_m": total_length,
            "entity_count": len(entities_progress)
        }

    def forecast_completion(
        self,
        entity_id: uuid.UUID,
        planned_end_time: datetime
    ) -> Dict[str, Any]:
        """
        预测完成时间
        基于当前进度趋势预测完成时间
        """
        current_version = state_version_manager.get_latest_version(
            entity_id,
            VersionType.CURRENT
        )

        if current_version is None:
            return {"error": "无当前版本数据"}

        progress = current_version.metadata.get("progress", 0.0)
        if progress >= 100:
            return {
                "status": "completed",
                "actual_completion_time": current_version.timestamp.isoformat()
            }

        # 简化预测：线性外推
        days_elapsed = (datetime.now() - current_version.timestamp).days
        if days_elapsed == 0:
            return {"error": "需要更多历史数据"}

        daily_progress = progress / days_elapsed if days_elapsed > 0 else 0
        remaining_progress = 100 - progress

        if daily_progress <= 0:
            return {"status": "stalled", "message": "进度停滞"}

        days_to_complete = remaining_progress / daily_progress
        predicted_completion = datetime.now()

        return {
            "status": "in_progress",
            "current_progress": progress,
            "daily_progress": daily_progress,
            "days_to_complete": days_to_complete,
            "predicted_completion_date": predicted_completion.isoformat(),
            "planned_end_date": planned_end_time.isoformat(),
            "on_schedule": predicted_completion <= planned_end_time
        }


# 创建全局进度计算器
progress_calculator = ProgressCalculator()
