"""
语义标签API路由
"""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.services.semantic_tag_service import (
    tag_manager,
    TagCategory,
    SemanticTag,
    TagDefinition
)


router = APIRouter(prefix="/semantic", tags=["语义标签"])


# 请求/响应模型
class ApplyTagRequest(BaseModel):
    """应用标签请求"""
    entity_id: str
    tag_id: str


class RemoveTagRequest(BaseModel):
    """移除标签请求"""
    entity_id: str
    tag_id: str


class QueryByTagsRequest(BaseModel):
    """按标签查询请求"""
    tag_ids: List[str]
    match_mode: str = "all"  # "all" 或 "any"


class QueryByCategoryRequest(BaseModel):
    """按分类查询请求"""
    category: str
    tag_value: Optional[str] = None


@router.get("/tags/definitions")
async def get_tag_definitions():
    """
    获取所有标签定义
    """
    tag_def = TagDefinition()
    all_tags = tag_def.get_all_tags()

    # 按分类组织
    categorized_tags = {}
    for tag in all_tags:
        category = tag.category.value
        if category not in categorized_tags:
            categorized_tags[category] = []
        categorized_tags[category].append(tag.to_dict())

    return {
        "tags": categorized_tags,
        "categories": {
            "construction": "施工状态",
            "quality": "质量等级",
            "material": "材料类型",
            "safety": "安全等级",
            "cost": "成本分类",
            "progress": "进度状态",
            "inspection": "验收状态",
            "risk": "风险等级",
            "custom": "自定义"
        }
    }


@router.post("/tags/apply")
async def apply_tag(request: ApplyTagRequest):
    """
    应用标签到实体
    """
    try:
        entity_id = uuid.UUID(request.entity_id)
        success = tag_manager.apply_predefined_tag(entity_id, request.tag_id)

        if success:
            return {
                "success": True,
                "message": f"标签 {request.tag_id} 已应用到实体",
                "entity_id": request.entity_id
            }
        else:
            return {
                "success": False,
                "message": f"标签 {request.tag_id} 不存在"
            }
    except ValueError:
        return {
            "success": False,
            "message": "无效的实体ID格式"
        }


@router.post("/tags/remove")
async def remove_tag(request: RemoveTagRequest):
    """
    从实体移除标签
    """
    try:
        entity_id = uuid.UUID(request.entity_id)
        success = tag_manager.remove_tag(entity_id, request.tag_id)

        if success:
            return {
                "success": True,
                "message": f"标签 {request.tag_id} 已从实体移除",
                "entity_id": request.entity_id
            }
        else:
            return {
                "success": False,
                "message": "标签不存在或实体无此标签"
            }
    except ValueError:
        return {
            "success": False,
            "message": "无效的实体ID格式"
        }


@router.get("/tags/entity/{entity_id}")
async def get_entity_tags(entity_id: str):
    """
    获取实体的所有标签
    """
    try:
        entity_uuid = uuid.UUID(entity_id)
        tags = tag_manager.get_entity_tags(entity_uuid)

        return {
            "entity_id": entity_id,
            "tags": [tag.to_dict() for tag in tags],
            "count": len(tags)
        }
    except ValueError:
        return {
            "success": False,
            "message": "无效的实体ID格式"
        }


@router.get("/tags/entity/{entity_id}/category/{category}")
async def get_entity_tags_by_category(entity_id: str, category: str):
    """
    获取实体指定分类的标签
    """
    try:
        entity_uuid = uuid.UUID(entity_id)

        # 验证分类
        try:
            cat = TagCategory(category)
        except ValueError:
            return {
                "success": False,
                "message": f"无效的分类: {category}"
            }

        tags = tag_manager.get_entity_tags_by_category(entity_uuid, cat)

        return {
            "entity_id": entity_id,
            "category": category,
            "tags": [tag.to_dict() for tag in tags],
            "count": len(tags)
        }
    except ValueError:
        return {
            "success": False,
            "message": "无效的实体ID格式"
        }


@router.post("/tags/query/by-tags")
async def query_entities_by_tags(request: QueryByTagsRequest):
    """
    根据标签查询实体
    match_mode: "all" 匹配所有标签，"any" 匹配任一标签
    """
    matching = tag_manager.query_entities_by_tags(
        request.tag_ids,
        request.match_mode
    )

    return {
        "tag_ids": request.tag_ids,
        "match_mode": request.match_mode,
        "matching_entities": [str(eid) for eid in matching],
        "count": len(matching)
    }


@router.post("/tags/query/by-category")
async def query_entities_by_category(request: QueryByCategoryRequest):
    """
    根据分类查询实体
    """
    try:
        cat = TagCategory(request.category)
    except ValueError:
        return {
            "success": False,
            "message": f"无效的分类: {request.category}"
        }

    matching = tag_manager.query_entities_by_category(cat, request.tag_value)

    return {
        "category": request.category,
        "tag_value": request.tag_value,
        "matching_entities": [str(eid) for eid in matching],
        "count": len(matching)
    }


@router.get("/profile/{entity_id}")
async def get_entity_profile(entity_id: str):
    """
    获取实体的完整语义画像
    """
    try:
        entity_uuid = uuid.UUID(entity_id)
        profile = tag_manager.export_profile(entity_uuid)

        if not profile:
            return {
                "entity_id": entity_id,
                "exists": False,
                "message": "该实体尚无语义画像"
            }

        return {
            "entity_id": entity_id,
            "exists": True,
            "profile": profile
        }
    except ValueError:
        return {
            "success": False,
            "message": "无效的实体ID格式"
        }


@router.get("/tags/categories")
async def get_categories():
    """
    获取所有分类及其显示名称
    """
    tag_def = TagDefinition()
    categories = {}

    for cat in TagCategory:
        categories[cat.value] = {
            "name": tag_def.get_category_display_name(cat),
            "tags": [
                tag.to_dict() for tag in tag_def.get_tags_by_category(cat)
            ]
        }

    return {
        "categories": categories
    }
