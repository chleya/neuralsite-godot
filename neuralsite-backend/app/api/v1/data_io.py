"""
数据导入导出API路由
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.data_io_service import (
    data_import_service,
    data_export_service,
    DataFormat
)


router = APIRouter(prefix="/data", tags=["数据导入导出"])


@router.post("/import/csv")
async def import_from_csv(
    file: UploadFile = File(..., description="CSV文件"),
    delimiter: str = Query(",", description="CSV分隔符")
):
    """
    从CSV文件导入数据
    支持的列：name, entity_type, start_station, end_station, lateral_offset, elevation_base, width, height, notes
    """
    content = await file.read()
    try:
        result = await data_import_service.import_from_csv(
            content.decode("utf-8"),
            delimiter
        )
        return {
            "success": True,
            "message": f"成功导入 {result['imported']} 条记录",
            "details": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"导入失败: {str(e)}"
        }


@router.post("/import/json")
async def import_from_json(file: UploadFile = File(..., description="JSON文件")):
    """
    从JSON文件导入数据
    支持格式：
    - 单个对象: {"name": "xxx", ...}
    - 数组: [{"name": "xxx", ...}, ...]
    - GeoJSON: {"type": "FeatureCollection", ...}
    """
    content = await file.read()

    # 自动检测格式
    text = content.decode("utf-8").strip()
    if text.startswith("{") and '"type"' in text and '"Feature' in text:
        # GeoJSON格式
        result = await data_import_service.import_from_geojson(text)
    else:
        # 普通JSON
        result = await data_import_service.import_from_json(text)

    if "error" in result:
        return {
            "success": False,
            "message": result["error"]
        }

    return {
        "success": True,
        "message": f"成功导入 {result['imported']} 条记录",
        "details": result
    }


@router.post("/import/geojson")
async def import_from_geojson(file: UploadFile = File(..., description="GeoJSON文件")):
    """
    从GeoJSON文件导入数据
    支持FeatureCollection和Feature格式
    """
    content = await file.read()
    try:
        result = await data_import_service.import_from_geojson(content.decode("utf-8"))
        return {
            "success": True,
            "message": f"成功导入 {result['imported']} 条记录",
            "details": result
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"导入失败: {str(e)}"
        }


@router.get("/export")
async def export_data(
    format: DataFormat = Query(DataFormat.GEOJSON, description="导出格式"),
    entity_ids: Optional[str] = Query(None, description="实体ID列表，逗号分隔"),
    start_station: Optional[str] = Query(None, description="起始桩号"),
    end_station: Optional[str] = Query(None, description="终止桩号"),
    entity_type: Optional[str] = Query(None, description="实体类型")
):
    """
    导出数据
    支持GeoJSON、CSV、JSON格式
    """
    # 解析实体ID列表
    ids = None
    if entity_ids:
        try:
            ids = [UUID(id.strip()) for id in entity_ids.split(",")]
        except ValueError:
            return {
                "success": False,
                "message": "无效的实体ID格式"
            }

    # 根据格式导出
    if format == DataFormat.GEOJSON:
        content = await data_export_service.export_to_geojson(ids, start_station, end_station, entity_type)
        return Response(
            content=content,
            media_type="application/geo+json",
            headers={
                "Content-Disposition": "attachment; filename=entities.geojson"
            }
        )
    elif format == DataFormat.CSV:
        content = await data_export_service.export_to_csv(ids, start_station, end_station, entity_type)
        return Response(
            content=content,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=entities.csv"
            }
        )
    elif format == DataFormat.JSON:
        content = await data_export_service.export_to_json(ids, start_station, end_station, entity_type)
        return Response(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": "attachment; filename=entities.json"
            }
        )
    else:
        return {
            "success": False,
            "message": f"不支持的格式: {format}"
        }


@router.post("/import/batch")
async def batch_import(
    files: List[UploadFile] = File(..., description="多个文件")
):
    """
    批量导入多个文件
    自动识别每个文件的格式
    """
    results = []

    for file in files:
        filename = file.filename or "unknown"
        content = await file.read()

        try:
            text = content.decode("utf-8").strip()

            if filename.endswith(".csv"):
                result = await data_import_service.import_from_csv(text)
            elif filename.endswith(".geojson") or filename.endswith(".json"):
                if '"type"' in text and '"Feature' in text:
                    result = await data_import_service.import_from_geojson(text)
                else:
                    result = await data_import_service.import_from_json(text)
            else:
                result = {"error": f"不支持的文件类型: {filename}"}

            results.append({
                "filename": filename,
                "success": "error" not in result,
                "details": result
            })
        except Exception as e:
            results.append({
                "filename": filename,
                "success": False,
                "error": str(e)
            })

    total_imported = sum(r.get("details", {}).get("imported", 0) for r in results if r.get("success"))
    total_errors = sum(1 for r in results if not r.get("success"))

    return {
        "summary": {
            "total_files": len(files),
            "total_imported": total_imported,
            "total_errors": total_errors
        },
        "results": results
    }


@router.get("/template/csv")
async def download_csv_template():
    """
    下载CSV导入模板
    """
    template = """name,entity_type,start_station,end_station,lateral_offset,elevation_base,width,height,notes
K0+000-K0+100路基,roadbed,K0+000.000,K0+100.000,0,100.5,28.5,2.5,路基填方段
K0+100-K0+200桥梁,bridge,K0+100.000,K0+200.000,0,105.2,28.5,,上部结构现浇箱梁
K0+200-K0+300涵洞,culvert,K0+200.000,K0+300.000,0,102.1,6,,钢筋混凝土圆管涵
"""
    return Response(
        content=template,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=import_template.csv"
        }
    )


@router.get("/template/geojson")
async def download_geojson_template():
    """
    下载GeoJSON导入模板
    """
    template = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "示例路基",
                    "type": "roadbed",
                    "start_station": "K0+000.000",
                    "end_station": "K0+100.000"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[500000, 3500000, 100], [501000, 3500000, 102]]
                }
            }
        ]
    }
    import json
    return Response(
        content=json.dumps(template, indent=2),
        media_type="application/geo+json",
        headers={
            "Content-Disposition": "attachment; filename=import_template.geojson"
        }
    )
