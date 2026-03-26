"""
实体语义标签系统
实现精细化的实体属性管理和智能标签
"""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, Set
from dataclasses import dataclass, field
from enum import Enum


class TagCategory(Enum):
    """标签分类"""
    CONSTRUCTION = "construction"        # 施工状态
    QUALITY = "quality"                  # 质量等级
    MATERIAL = "material"                # 材料类型
    SAFETY = "safety"                    # 安全等级
    COST = "cost"                        # 成本分类
    PROGRESS = "progress"                # 进度状态
    INSPECTION = "inspection"            # 验收状态
    RISK = "risk"                       # 风险等级
    CUSTOM = "custom"                    # 自定义标签


@dataclass
class SemanticTag:
    """
    语义标签
    用于标记实体的各种属性
    """
    tag_id: str                          # 标签唯一标识
    category: TagCategory                # 标签分类
    name: str                            # 标签名称
    value: str                           # 标签值
    description: Optional[str] = None     # 标签描述
    color: Optional[str] = None          # 标签颜色（用于可视化）
    priority: int = 0                    # 优先级（数字越大优先级越高）
    metadata: Dict[str, Any] = field(default_factory=dict)  # 额外元数据

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tag_id": self.tag_id,
            "category": self.category.value,
            "name": self.name,
            "value": self.value,
            "description": self.description,
            "color": self.color,
            "priority": self.priority,
            "metadata": self.metadata
        }


@dataclass
class EntitySemanticProfile:
    """
    实体语义画像
    记录实体的所有语义标签和属性
    """
    entity_id: uuid.UUID
    tags: Dict[str, SemanticTag] = field(default_factory=dict)  # 标签字典
    attributes: Dict[str, Any] = field(default_factory=dict)    # 额外属性
    relationships: Dict[str, List[uuid.UUID]] = field(default_factory=dict)  # 关联关系
    notes: List[str] = field(default_factory=list)               # 备注历史

    def add_tag(self, tag: SemanticTag):
        """添加标签"""
        self.tags[tag.tag_id] = tag

    def remove_tag(self, tag_id: str):
        """移除标签"""
        if tag_id in self.tags:
            del self.tags[tag_id]

    def get_tags_by_category(self, category: TagCategory) -> List[SemanticTag]:
        """获取指定分类的所有标签"""
        return [tag for tag in self.tags.values() if tag.category == category]

    def has_tag(self, tag_name: str) -> bool:
        """检查是否包含指定名称的标签"""
        return any(tag.name == tag_name for tag in self.tags.values())

    def get_highest_priority_tag(self, category: TagCategory) -> Optional[SemanticTag]:
        """获取指定分类中优先级最高的标签"""
        category_tags = self.get_tags_by_category(category)
        if not category_tags:
            return None
        return max(category_tags, key=lambda t: t.priority)


class TagDefinition:
    """
    标签定义管理器
    管理系统中所有可用的标签定义
    """

    # 预定义标签
    PREDEFINED_TAGS = {
        # 施工状态标签
        "construction_pending": SemanticTag(
            tag_id="construction_pending",
            category=TagCategory.CONSTRUCTION,
            name="待施工",
            value="pending",
            description="尚未开始施工",
            color="#808080",
            priority=0
        ),
        "construction_in_progress": SemanticTag(
            tag_id="construction_in_progress",
            category=TagCategory.CONSTRUCTION,
            name="施工中",
            value="in_progress",
            description="正在进行施工",
            color="#FFA500",
            priority=1
        ),
        "construction_completed": SemanticTag(
            tag_id="construction_completed",
            category=TagCategory.CONSTRUCTION,
            name="已完成",
            value="completed",
            description="施工已完成",
            color="#008000",
            priority=2
        ),
        "construction_suspended": SemanticTag(
            tag_id="construction_suspended",
            category=TagCategory.CONSTRUCTION,
            name="已停工",
            value="suspended",
            description="施工暂停",
            color="#FF0000",
            priority=1
        ),

        # 质量等级标签
        "quality_excellent": SemanticTag(
            tag_id="quality_excellent",
            category=TagCategory.QUALITY,
            name="优良",
            value="excellent",
            description="质量评定为优良",
            color="#00FF00",
            priority=3
        ),
        "quality_qualified": SemanticTag(
            tag_id="quality_qualified",
            category=TagCategory.QUALITY,
            name="合格",
            value="qualified",
            description="质量评定为合格",
            color="#90EE90",
            priority=2
        ),
        "quality_unqualified": SemanticTag(
            tag_id="quality_unqualified",
            category=TagCategory.QUALITY,
            name="不合格",
            value="unqualified",
            description="质量评定为不合格",
            color="#FF0000",
            priority=1
        ),
        "quality_pending_inspection": SemanticTag(
            tag_id="quality_pending_inspection",
            category=TagCategory.QUALITY,
            name="待检",
            value="pending",
            description="等待质量检查",
            color="#FFFF00",
            priority=0
        ),

        # 安全等级标签
        "safety_normal": SemanticTag(
            tag_id="safety_normal",
            category=TagCategory.SAFETY,
            name="安全",
            value="normal",
            description="安全风险正常",
            color="#00FF00",
            priority=2
        ),
        "safety_warning": SemanticTag(
            tag_id="safety_warning",
            category=TagCategory.SAFETY,
            name="注意",
            value="warning",
            description="存在一定安全风险",
            color="#FFFF00",
            priority=1
        ),
        "safety_danger": SemanticTag(
            tag_id="safety_danger",
            category=TagCategory.SAFETY,
            name="危险",
            value="danger",
            description="存在重大安全风险",
            color="#FF0000",
            priority=0
        ),

        # 风险等级标签
        "risk_low": SemanticTag(
            tag_id="risk_low",
            category=TagCategory.RISK,
            name="低风险",
            value="low",
            description="风险等级低",
            color="#00FF00",
            priority=0
        ),
        "risk_medium": SemanticTag(
            tag_id="risk_medium",
            category=TagCategory.RISK,
            name="中风险",
            value="medium",
            description="风险等级中等",
            color="#FFFF00",
            priority=1
        ),
        "risk_high": SemanticTag(
            tag_id="risk_high",
            category=TagCategory.RISK,
            name="高风险",
            value="high",
            description="风险等级高",
            color="#FFA500",
            priority=2
        ),
        "risk_critical": SemanticTag(
            tag_id="risk_critical",
            category=TagCategory.RISK,
            name="极高风险",
            value="critical",
            description="风险等级极高",
            color="#FF0000",
            priority=3
        ),

        # 验收状态标签
        "inspection_not_started": SemanticTag(
            tag_id="inspection_not_started",
            category=TagCategory.INSPECTION,
            name="未验收",
            value="not_started",
            description="尚未开始验收",
            color="#808080",
            priority=0
        ),
        "inspection_in_progress": SemanticTag(
            tag_id="inspection_in_progress",
            category=TagCategory.INSPECTION,
            name="验收中",
            value="in_progress",
            description="正在验收中",
            color="#FFA500",
            priority=1
        ),
        "inspection_passed": SemanticTag(
            tag_id="inspection_passed",
            category=TagCategory.INSPECTION,
            name="验收通过",
            value="passed",
            description="验收已通过",
            color="#00FF00",
            priority=2
        ),
        "inspection_failed": SemanticTag(
            tag_id="inspection_failed",
            category=TagCategory.INSPECTION,
            name="验收未通过",
            value="failed",
            description="验收未通过",
            color="#FF0000",
            priority=1
        ),
    }

    def __init__(self):
        self._custom_tags: Dict[str, SemanticTag] = {}

    def get_tag(self, tag_id: str) -> Optional[SemanticTag]:
        """获取标签定义"""
        return self.PREDEFINED_TAGS.get(tag_id) or self._custom_tags.get(tag_id)

    def get_all_tags(self) -> List[SemanticTag]:
        """获取所有标签"""
        return list(self.PREDEFINED_TAGS.values()) + list(self._custom_tags.values())

    def get_tags_by_category(self, category: TagCategory) -> List[SemanticTag]:
        """获取指定分类的所有标签"""
        all_tags = self.get_all_tags()
        return [tag for tag in all_tags if tag.category == category]

    def register_custom_tag(self, tag: SemanticTag):
        """注册自定义标签"""
        tag.category = TagCategory.CUSTOM
        self._custom_tags[tag.tag_id] = tag

    def get_category_display_name(self, category: TagCategory) -> str:
        """获取分类显示名称"""
        names = {
            TagCategory.CONSTRUCTION: "施工状态",
            TagCategory.QUALITY: "质量等级",
            TagCategory.MATERIAL: "材料类型",
            TagCategory.SAFETY: "安全等级",
            TagCategory.COST: "成本分类",
            TagCategory.PROGRESS: "进度状态",
            TagCategory.INSPECTION: "验收状态",
            TagCategory.RISK: "风险等级",
            TagCategory.CUSTOM: "自定义"
        }
        return names.get(category, "未知")


class SemanticTagManager:
    """
    语义标签管理器
    管理实体的语义标签操作
    """

    def __init__(self):
        self.tag_definition = TagDefinition()
        # 存储实体的语义画像
        self._profiles: Dict[uuid.UUID, EntitySemanticProfile] = {}

    def get_or_create_profile(self, entity_id: uuid.UUID) -> EntitySemanticProfile:
        """获取或创建实体的语义画像"""
        if entity_id not in self._profiles:
            self._profiles[entity_id] = EntitySemanticProfile(entity_id=entity_id)
        return self._profiles[entity_id]

    def apply_predefined_tag(self, entity_id: uuid.UUID, tag_id: str) -> bool:
        """应用预定义标签"""
        tag = self.tag_definition.get_tag(tag_id)
        if tag is None:
            return False

        profile = self.get_or_create_profile(entity_id)
        profile.add_tag(tag)
        return True

    def remove_tag(self, entity_id: uuid.UUID, tag_id: str) -> bool:
        """移除标签"""
        if entity_id not in self._profiles:
            return False
        profile = self._profiles[entity_id]
        profile.remove_tag(tag_id)
        return True

    def get_entity_tags(self, entity_id: uuid.UUID) -> List[SemanticTag]:
        """获取实体的所有标签"""
        if entity_id not in self._profiles:
            return []
        return list(self._profiles[entity_id].tags.values())

    def get_entity_tags_by_category(
        self,
        entity_id: uuid.UUID,
        category: TagCategory
    ) -> List[SemanticTag]:
        """获取实体指定分类的标签"""
        if entity_id not in self._profiles:
            return []
        return self._profiles[entity_id].get_tags_by_category(category)

    def query_entities_by_tags(
        self,
        tag_ids: List[str],
        match_mode: str = "all"  # "all" 或 "any"
    ) -> List[uuid.UUID]:
        """
        根据标签查询实体
        match_mode: "all" 要求匹配所有标签，"any" 匹配任一标签
        """
        matching_entities = []

        for entity_id, profile in self._profiles.items():
            entity_tag_ids = set(profile.tags.keys())

            if match_mode == "all":
                if all(tag_id in entity_tag_ids for tag_id in tag_ids):
                    matching_entities.append(entity_id)
            elif match_mode == "any":
                if any(tag_id in entity_tag_ids for tag_id in tag_ids):
                    matching_entities.append(entity_id)

        return matching_entities

    def query_entities_by_category(
        self,
        category: TagCategory,
        tag_value: Optional[str] = None
    ) -> List[uuid.UUID]:
        """
        根据分类查询实体
        如果指定tag_value，则进一步筛选该分类下指定值的标签
        """
        matching_entities = []

        for entity_id, profile in self._profiles.items():
            category_tags = profile.get_tags_by_category(category)
            if not category_tags:
                continue

            if tag_value is None:
                matching_entities.append(entity_id)
            else:
                if any(tag.value == tag_value for tag in category_tags):
                    matching_entities.append(entity_id)

        return matching_entities

    def export_profile(self, entity_id: uuid.UUID) -> Dict[str, Any]:
        """导出具象画像"""
        if entity_id not in self._profiles:
            return {}

        profile = self._profiles[entity_id]
        return {
            "entity_id": str(entity_id),
            "tags": [tag.to_dict() for tag in profile.tags.values()],
            "attributes": profile.attributes,
            "relationships": {k: [str(v) for v in v_list] for k, v_list in profile.relationships.items()},
            "notes": profile.notes
        }


# 创建全局标签管理器实例
tag_manager = SemanticTagManager()