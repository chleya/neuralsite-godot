"""
图纸管理API路由
"""

import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.drawing import Drawing, DrawingFolder, DrawingVersion, DRAWING_TYPES, SPECIALTIES


# Pydantic Schemas
class DrawingCreate(BaseModel):
    name: str
    drawing_no: Optional[str] = None
    file_path: str
    file_type: str
    file_size: Optional[int] = None
    specialty: Optional[str] = None
    drawing_type: Optional[str] = None
    parent_id: Optional[str] = None
    related_entities: Optional[List[str]] = []
    station_range: Optional[str] = None
    notes: Optional[str] = None


class DrawingResponse(BaseModel):
    id: str
    name: str
    drawing_no: Optional[str]
    file_path: str
    file_type: str
    file_size: Optional[int]
    specialty: Optional[str]
    drawing_type: Optional[str]
    version: int
    parent_id: Optional[str]
    related_entities: List[str]
    station_range: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class DrawingFolderCreate(BaseModel):
    name: str
    parent_id: Optional[str] = None
    folder_type: Optional[str] = None
    notes: Optional[str] = None


class DrawingFolderResponse(BaseModel):
    id: str
    name: str
    parent_id: Optional[str]
    folder_type: Optional[str]
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


router = APIRouter(prefix="/drawings", tags=["图纸管理"])


# ========== 图纸目录API ==========

@router.post("/folders", response_model=DrawingFolderResponse)
async def create_folder(folder: DrawingFolderCreate, db: AsyncSession = Depends(get_db)):
    """创建图纸目录"""
    new_folder = DrawingFolder(
        name=folder.name,
        parent_id=uuid.UUID(folder.parent_id) if folder.parent_id else None,
        folder_type=folder.folder_type,
        notes=folder.notes
    )
    db.add(new_folder)
    await db.flush()
    await db.refresh(new_folder)
    await db.commit()
    return DrawingFolderResponse(
        id=str(new_folder.id), name=new_folder.name,
        parent_id=str(new_folder.parent_id) if new_folder.parent_id else None,
        folder_type=new_folder.folder_type, notes=new_folder.notes,
        created_at=new_folder.created_at.isoformat()
    )


@router.get("/folders")
async def list_folders(parent_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """获取图纸目录列表"""
    query = DrawingFolder.select()
    if parent_id:
        query = query.where(DrawingFolder.parent_id == uuid.UUID(parent_id))
    else:
        query = query.where(DrawingFolder.parent_id == None)

    from sqlalchemy import select
    result = await db.execute(select(DrawingFolder).where(
        DrawingFolder.parent_id == (uuid.UUID(parent_id) if parent_id else None)
    ))
    folders = result.scalars().all()
    return {
        "count": len(folders),
        "folders": [
            {"id": str(f.id), "name": f.name, "parent_id": str(f.parent_id) if f.parent_id else None, "folder_type": f.folder_type}
            for f in folders
        ]
    }


# ========== 图纸API ==========

@router.post("", response_model=DrawingResponse)
async def create_drawing(drawing: DrawingCreate, db: AsyncSession = Depends(get_db)):
    """创建图纸记录"""
    new_drawing = Drawing(
        name=drawing.name,
        drawing_no=drawing.drawing_no,
        file_path=drawing.file_path,
        file_type=drawing.file_type,
        file_size=drawing.file_size,
        specialty=drawing.specialty,
        drawing_type=drawing.drawing_type,
        parent_id=uuid.UUID(drawing.parent_id) if drawing.parent_id else None,
        related_entities=[uuid.UUID(x) for x in drawing.related_entities] if drawing.related_entities else [],
        station_range=drawing.station_range,
        notes=drawing.notes
    )
    db.add(new_drawing)
    await db.flush()
    await db.refresh(new_drawing)
    await db.commit()
    return DrawingResponse(
        id=str(new_drawing.id), name=new_drawing.name, drawing_no=new_drawing.drawing_no,
        file_path=new_drawing.file_path, file_type=new_drawing.file_type, file_size=new_drawing.file_size,
        specialty=new_drawing.specialty, drawing_type=new_drawing.drawing_type, version=new_drawing.version,
        parent_id=str(new_drawing.parent_id) if new_drawing.parent_id else None,
        related_entities=[str(x) for x in (new_drawing.related_entities or [])],
        station_range=new_drawing.station_range, notes=new_drawing.notes,
        created_at=new_drawing.created_at.isoformat(), updated_at=new_drawing.updated_at.isoformat()
    )


@router.get("")
async def list_drawings(
    parent_id: Optional[str] = None,
    specialty: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """获取图纸列表"""
    from sqlalchemy import select, func

    query = select(Drawing)
    count_query = select(func.count(Drawing.id))

    if parent_id:
        query = query.where(Drawing.parent_id == uuid.UUID(parent_id))
        count_query = count_query.where(Drawing.parent_id == uuid.UUID(parent_id))

    if specialty:
        query = query.where(Drawing.specialty == specialty)
        count_query = count_query.where(Drawing.specialty == specialty)

    query = query.offset(skip).limit(limit).order_by(Drawing.created_at.desc())

    result = await db.execute(query)
    drawings = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "count": len(drawings),
        "total": total,
        "drawings": [
            {
                "id": str(d.id), "name": d.name, "drawing_no": d.drawing_no,
                "file_type": d.file_type, "specialty": d.specialty, "version": d.version,
                "station_range": d.station_range, "created_at": d.created_at.isoformat()
            }
            for d in drawings
        ]
    }


@router.get("/types")
async def get_drawing_types():
    """获取图纸类型枚举"""
    return {"types": DRAWING_TYPES, "specialties": SPECIALTIES}


@router.get("/{drawing_id}")
async def get_drawing(drawing_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """获取图纸详情"""
    from sqlalchemy import select
    result = await db.execute(select(Drawing).where(Drawing.id == drawing_id))
    drawing = result.scalar_one_or_none()

    if not drawing:
        raise HTTPException(status_code=404, detail="图纸不存在")

    return {
        "id": str(drawing.id), "name": drawing.name, "drawing_no": drawing.drawing_no,
        "file_path": drawing.file_path, "file_type": drawing.file_type, "file_size": drawing.file_size,
        "specialty": drawing.specialty, "drawing_type": drawing.drawing_type, "version": drawing.version,
        "parent_id": str(drawing.parent_id) if drawing.parent_id else None,
        "related_entities": [str(x) for x in (drawing.related_entities or [])],
        "station_range": drawing.station_range, "notes": drawing.notes,
        "created_at": drawing.created_at.isoformat(), "updated_at": drawing.updated_at.isoformat()
    }


@router.get("/at-station/{station}")
async def get_drawings_at_station(station: str, db: AsyncSession = Depends(get_db)):
    """根据桩号查询关联图纸"""
    from sqlalchemy import select

    # 简单的模糊匹配，实际需要更精确的范围判断
    result = await db.execute(
        select(Drawing).where(Drawing.station_range.contains(station))
    )
    drawings = result.scalars().all()

    return {
        "station": station,
        "count": len(drawings),
        "drawings": [
            {"id": str(d.id), "name": d.name, "drawing_no": d.drawing_no, "station_range": d.station_range}
            for d in drawings
        ]
    }
