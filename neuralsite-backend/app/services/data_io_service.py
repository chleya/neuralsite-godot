"""
数据导入导出服务
支持从CAD、Excel、CSV等格式导入数据
支持导出为GeoJSON、Excel、CSV等格式
"""

import json
import csv
import io
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.core.database import AsyncSessionLocal
from app.services.space_service import space_service


class DataFormat(Enum):
    """支持的导入导出格式"""
    GEOJSON = "geojson"
    CSV = "csv"
    JSON = "json"
    EXCEL = "excel"


class DataValidationError(Exception):
    """数据验证错误"""
    pass


class DataImportService:
    """
    数据导入服务
    支持多种格式的数据导入
    """

    def __init__(self):
        self.validation_errors: List[str] = []

    def parse_station(self, station_str: str) -> Optional[str]:
        """
        解析桩号字符串
        支持多种格式：K0+000, K0+000.000, 0+000, 0+000.000

        Args:
            station_str: 桩号字符串

        Returns:
            标准格式桩号或None
        """
        # 去除空格
        station_str = station_str.strip().upper()

        # 匹配格式1: K0+000.000 或 K0+000
        pattern1 = r'^K(\d+)\+(\d+)\.(\d+)$'
        match = re.match(pattern1, station_str)
        if match:
            km, m, mm = match.groups()
            return f"K{km}+{int(m):03d}.{int(mm):03d}"

        # 匹配格式2: K0+000 (无小数)
        pattern2 = r'^K(\d+)\+(\d+)$'
        match = re.match(pattern2, station_str)
        if match:
            km, m = match.groups()
            return f"K{km}+{int(m):03d}.000"

        # 匹配格式3: 0+000.000 (无K)
        pattern3 = r'^(\d+)\+(\d+)\.(\d+)$'
        match = re.match(pattern3, station_str)
        if match:
            km, m, mm = match.groups()
            return f"K{km}+{int(m):03d}.{int(mm):03d}"

        return None

    def validate_entity_data(self, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        验证实体数据

        Args:
            data: 实体数据字典

        Returns:
            (是否有效, 错误列表)
        """
        errors = []

        # 必填字段检查
        required_fields = ["name", "entity_type", "start_station", "end_station"]
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f"缺少必填字段: {field}")

        # 桩号格式检查
        if "start_station" in data:
            parsed = self.parse_station(str(data["start_station"]))
            if not parsed:
                errors.append(f"起始桩号格式错误: {data['start_station']}")
            else:
                data["start_station"] = parsed

        if "end_station" in data:
            parsed = self.parse_station(str(data["end_station"]))
            if not parsed:
                errors.append(f"终止桩号格式错误: {data['end_station']}")
            else:
                data["end_station"] = parsed

        # 桩号范围检查
        if "start_station" in data and "end_station" in data:
            try:
                start_mm = space_service.parse_station(data["start_station"])
                end_mm = space_service.parse_station(data["end_station"])
                if start_mm > end_mm:
                    errors.append("起始桩号不能大于终止桩号")
            except ValueError as e:
                errors.append(f"桩号解析错误: {e}")

        # 实体类型检查
        valid_types = ["roadbed", "bridge", "culvert", "tunnel", "slope", "drainage", "pavement", "foundation", "auxiliary"]
        if "entity_type" in data and data["entity_type"] not in valid_types:
            errors.append(f"无效的实体类型: {data['entity_type']}")

        return len(errors) == 0, errors

    async def import_from_csv(
        self,
        csv_content: str,
        delimiter: str = ","
    ) -> Dict[str, Any]:
        """
        从CSV导入数据

        Args:
            csv_content: CSV文件内容
            delimiter: 分隔符

        Returns:
            导入结果统计
        """
        reader = csv.DictReader(io.StringIO(csv_content), delimiter=delimiter)
        rows = list(reader)

        imported = []
        errors = []

        for i, row in enumerate(rows):
            # 跳过空行
            if not row.get("name"):
                continue

            # 验证数据
            is_valid, validation_errors = self.validate_entity_data(row)
            if is_valid:
                imported.append(row)
            else:
                errors.append({
                    "row": i + 2,  # +2 因为有表头和从0开始
                    "data": row,
                    "errors": validation_errors
                })

        # 批量导入
        async with AsyncSessionLocal() as db:
            from app.models.entity import Entity

            entities = [Entity(**data) for data in imported]
            if entities:
                db.add_all(entities)
                await db.commit()

        return {
            "total_rows": len(rows),
            "imported": len(imported),
            "errors": len(errors),
            "error_details": errors[:100]  # 只返回前100个错误
        }

    async def import_from_json(
        self,
        json_content: str
    ) -> Dict[str, Any]:
        """
        从JSON导入数据

        Args:
            json_content: JSON文件内容

        Returns:
            导入结果统计
        """
        data = json.loads(json_content)

        # 支持两种格式：单个对象或数组
        if isinstance(data, dict):
            items = [data]
        elif isinstance(data, list):
            items = data
        else:
            return {"error": "不支持的JSON格式"}

        imported = []
        errors = []

        for i, item in enumerate(items):
            # 验证数据
            is_valid, validation_errors = self.validate_entity_data(item)
            if is_valid:
                imported.append(item)
            else:
                errors.append({
                    "index": i,
                    "data": item,
                    "errors": validation_errors
                })

        # 批量导入
        async with AsyncSessionLocal() as db:
            from app.models.entity import Entity

            entities = [Entity(**data) for data in imported]
            if entities:
                db.add_all(entities)
                await db.commit()

        return {
            "total_items": len(items),
            "imported": len(imported),
            "errors": len(errors),
            "error_details": errors[:100]
        }

    async def import_from_geojson(
        self,
        geojson_content: str
    ) -> Dict[str, Any]:
        """
        从GeoJSON导入数据

        Args:
            geojson_content: GeoJSON文件内容

        Returns:
            导入结果统计
        """
        data = json.loads(geojson_content)

        if data.get("type") not in ["FeatureCollection", "Feature"]:
            return {"error": "无效的GeoJSON格式"}

        # 提取要素
        features = []
        if data.get("type") == "FeatureCollection":
            features = data.get("features", [])
        elif data.get("type") == "Feature":
            features = [data]

        imported = []
        errors = []

        for i, feature in enumerate(features):
            props = feature.get("properties", {})
            geometry = feature.get("geometry", {})

            # 从属性中提取必要字段
            entity_data = {
                "name": props.get("name", f"Entity_{i}"),
                "entity_type": props.get("type", "roadbed"),
                "start_station": props.get("start_station", props.get("start", "K0+000.000")),
                "end_station": props.get("end_station", props.get("end", "K0+100.000")),
                "properties": props
            }

            # 验证数据
            is_valid, validation_errors = self.validate_entity_data(entity_data)
            if is_valid:
                imported.append(entity_data)
            else:
                errors.append({
                    "index": i,
                    "data": entity_data,
                    "errors": validation_errors
                })

        # 批量导入
        async with AsyncSessionLocal() as db:
            from app.models.entity import Entity

            entities = [Entity(**data) for data in imported]
            if entities:
                db.add_all(entities)
                await db.commit()

        return {
            "total_features": len(features),
            "imported": len(imported),
            "errors": len(errors),
            "error_details": errors[:100]
        }


class DataExportService:
    """
    数据导出服务
    支持多种格式的数据导出
    """

    def __init__(self):
        pass

    async def export_to_geojson(
        self,
        entity_ids: Optional[List[UUID]] = None,
        start_station: Optional[str] = None,
        end_station: Optional[str] = None,
        entity_type: Optional[str] = None
    ) -> str:
        """
        导出为GeoJSON格式

        Args:
            entity_ids: 实体ID列表
            start_station: 起始桩号
            end_station: 终止桩号
            entity_type: 实体类型

        Returns:
            GeoJSON字符串
        """
        async with AsyncSessionLocal() as db:
            from app.repositories.entity_repository import EntityRepository

            repo = EntityRepository(db)

            if entity_ids:
                entities = [await repo.get_by_id(eid) for eid in entity_ids]
                entities = [e for e in entities if e]
            elif start_station and end_station:
                entities = await repo.get_by_station_range(start_station, end_station, entity_type)
            else:
                entities = await repo.get_all(limit=10000)

        # 转换为GeoJSON
        features = []
        for entity in entities:
            # 计算起点坐标
            start_coord = space_service.station_to_coordinates(entity.start_station, entity.lateral_offset)
            end_coord = space_service.station_to_coordinates(entity.end_station, entity.lateral_offset)

            feature = {
                "type": "Feature",
                "id": str(entity.id),
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [start_coord.x, start_coord.y, start_coord.z],
                        [end_coord.x, end_coord.y, end_coord.z]
                    ]
                },
                "properties": {
                    "id": str(entity.id),
                    "name": entity.name,
                    "type": entity.entity_type,
                    "start_station": entity.start_station,
                    "end_station": entity.end_station,
                    "lateral_offset": entity.lateral_offset,
                    "elevation_base": entity.elevation_base,
                    "width": entity.width,
                    "height": entity.height,
                    "properties": entity.properties or {},
                    "created_at": entity.created_at.isoformat() if entity.created_at else None,
                    "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
                }
            }
            features.append(feature)

        geojson = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {"name": "urn:ogc:def:crs:EPSG::4549"}  # CGCS2000
            },
            "features": features,
            "metadata": {
                "export_time": datetime.now().isoformat(),
                "total_features": len(features),
                "coordinate_system": "CGCS2000"
            }
        }

        return json.dumps(geojson, indent=2, ensure_ascii=False)

    async def export_to_csv(
        self,
        entity_ids: Optional[List[UUID]] = None,
        start_station: Optional[str] = None,
        end_station: Optional[str] = None,
        entity_type: Optional[str] = None
    ) -> str:
        """
        导出为CSV格式

        Args:
            entity_ids: 实体ID列表
            start_station: 起始桩号
            end_station: 终止桩号
            entity_type: 实体类型

        Returns:
            CSV字符串
        """
        async with AsyncSessionLocal() as db:
            from app.repositories.entity_repository import EntityRepository

            repo = EntityRepository(db)

            if entity_ids:
                entities = [await repo.get_by_id(eid) for eid in entity_ids]
                entities = [e for e in entities if e]
            elif start_station and end_station:
                entities = await repo.get_by_station_range(start_station, end_station, entity_type)
            else:
                entities = await repo.get_all(limit=10000)

        # 生成CSV
        output = io.StringIO()
        fieldnames = [
            "id", "name", "entity_type", "start_station", "end_station",
            "lateral_offset", "elevation_base", "width", "height", "notes"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for entity in entities:
            writer.writerow({
                "id": str(entity.id),
                "name": entity.name,
                "entity_type": entity.entity_type,
                "start_station": entity.start_station,
                "end_station": entity.end_station,
                "lateral_offset": entity.lateral_offset,
                "elevation_base": entity.elevation_base,
                "width": entity.width,
                "height": entity.height,
                "notes": entity.notes or ""
            })

        return output.getvalue()

    async def export_to_json(
        self,
        entity_ids: Optional[List[UUID]] = None,
        start_station: Optional[str] = None,
        end_station: Optional[str] = None,
        entity_type: Optional[str] = None
    ) -> str:
        """
        导出为JSON格式

        Args:
            entity_ids: 实体ID列表
            start_station: 起始桩号
            end_station: 终止桩号
            entity_type: 实体类型

        Returns:
            JSON字符串
        """
        async with AsyncSessionLocal() as db:
            from app.repositories.entity_repository import EntityRepository

            repo = EntityRepository(db)

            if entity_ids:
                entities = [await repo.get_by_id(eid) for eid in entity_ids]
                entities = [e for e in entities if e]
            elif start_station and end_station:
                entities = await repo.get_by_station_range(start_station, end_station, entity_type)
            else:
                entities = await repo.get_all(limit=10000)

        # 转换为字典列表
        data = []
        for entity in entities:
            item = {
                "id": str(entity.id),
                "name": entity.name,
                "entity_type": entity.entity_type,
                "start_station": entity.start_station,
                "end_station": entity.end_station,
                "lateral_offset": entity.lateral_offset,
                "elevation_base": entity.elevation_base,
                "width": entity.width,
                "height": entity.height,
                "properties": entity.properties or {},
                "geometry_data": entity.geometry_data,
                "notes": entity.notes,
                "created_at": entity.created_at.isoformat() if entity.created_at else None,
                "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
            }

            # 计算坐标
            start_coord = space_service.station_to_coordinates(entity.start_station, entity.lateral_offset)
            end_coord = space_service.station_to_coordinates(entity.end_station, entity.lateral_offset)
            item["start_coordinate"] = start_coord.to_dict()
            item["end_coordinate"] = end_coord.to_dict()

            data.append(item)

        return json.dumps({
            "export_time": datetime.now().isoformat(),
            "total": len(data),
            "data": data
        }, indent=2, ensure_ascii=False)


# 创建全局服务实例
data_import_service = DataImportService()
data_export_service = DataExportService()
