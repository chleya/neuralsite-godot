"""
空间计算 API 路由
暴露桩号↔坐标转换功能给前端
"""

import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.space_service import space_service, Coordinate3D


router = APIRouter(prefix="/space", tags=["空间计算"])


class StationToCoordRequest(BaseModel):
    station: str = Field(..., description="桩号，如 K1+500")
    lateral_offset: float = Field(default=0.0, ge=-100, le=100)
    elevation: Optional[float] = Field(default=None)


class CoordToStationRequest(BaseModel):
    x: float
    y: float
    z: Optional[float] = 0.0
    lateral_offset: float = Field(default=0.0)


class StationRangeRequest(BaseModel):
    start_station: str
    end_station: str
    lateral_offset: float = Field(default=0.0)
    interval: float = Field(default=10.0, gt=0, le=100)


class StationToCoordResponse(BaseModel):
    station: str
    x: float
    y: float
    z: float
    lateral_offset: float


class CoordToStationResponse(BaseModel):
    x: float
    y: float
    z: float
    station: str
    distance: float


class RangeToCoordsResponse(BaseModel):
    start_station: str
    end_station: str
    length: float
    points: list[dict]
    start_coord: dict
    end_coord: dict


class RouteInfoResponse(BaseModel):
    route_id: str
    route_name: str
    start_station: str
    end_station: str
    start_coord: dict
    start_azimuth: float
    has_horizontal_curves: bool
    has_vertical_curves: bool


@router.post("/station-to-coord", response_model=StationToCoordResponse)
async def station_to_coord(req: StationToCoordRequest):
    """桩号转三维坐标"""
    try:
        coord = space_service.station_to_coordinates(
            station=req.station,
            lateral_offset=req.lateral_offset,
            elevation=req.elevation,
        )
        return StationToCoordResponse(
            station=req.station,
            x=round(coord.x, 3),
            y=round(coord.y, 3),
            z=round(coord.z, 3),
            lateral_offset=req.lateral_offset,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/coord-to-station", response_model=CoordToStationResponse)
async def coord_to_station(req: CoordToStationRequest):
    """三维坐标转桩号（反算）"""
    try:
        coord = Coordinate3D(x=req.x, y=req.y, z=req.z or 0.0)
        station = space_service.coordinate_to_station(
            coord=coord, lateral_offset=req.lateral_offset
        )
        start_coord = space_service.route_params.start_coord
        distance = coord.distance_to(start_coord)

        return CoordToStationResponse(
            x=req.x,
            y=req.y,
            z=req.z or 0.0,
            station=station,
            distance=round(distance, 3),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/range-to-coords", response_model=RangeToCoordsResponse)
async def range_to_coords(req: StationRangeRequest):
    """桩号范围转坐标点列表"""
    try:
        start_coord = space_service.station_to_coordinates(
            req.start_station, req.lateral_offset
        )
        end_coord = space_service.station_to_coordinates(
            req.end_station, req.lateral_offset
        )
        length = space_service.calculate_distance(req.start_station, req.end_station)

        points = []
        steps = max(2, int(length / req.interval))
        for i in range(steps + 1):
            t = i / steps
            x = start_coord.x + (end_coord.x - start_coord.x) * t
            y = start_coord.y + (end_coord.y - start_coord.y) * t
            z = start_coord.z + (end_coord.z - start_coord.z) * t
            points.append({"x": round(x, 3), "y": round(y, 3), "z": round(z, 3)})

        return RangeToCoordsResponse(
            start_station=req.start_station,
            end_station=req.end_station,
            length=round(length, 3),
            points=points,
            start_coord={
                "x": round(start_coord.x, 3),
                "y": round(start_coord.y, 3),
                "z": round(start_coord.z, 3),
            },
            end_coord={
                "x": round(end_coord.x, 3),
                "y": round(end_coord.y, 3),
                "z": round(end_coord.z, 3),
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/route-info", response_model=RouteInfoResponse)
async def get_route_info():
    """获取当前线路参数"""
    rp = space_service.route_params
    return RouteInfoResponse(
        route_id=rp.route_id,
        route_name=rp.route_name,
        start_station=rp.start_station,
        end_station=rp.end_station,
        start_coord={
            "x": rp.start_coord.x,
            "y": rp.start_coord.y,
            "z": rp.start_coord.z,
        },
        start_azimuth=rp.start_azimuth,
        has_horizontal_curves=len(rp.horizontal_curves) > 0,
        has_vertical_curves=len(rp.vertical_curves) > 0,
    )


@router.get("/nearby")
async def get_nearby_stations(
    station: str = Query(..., description="参考桩号"),
    count: int = Query(5, ge=1, le=20),
    interval: float = Query(1000.0, gt=0, le=10000),
):
    """获取附近的桩号列表"""
    try:
        stations = space_service.get_nearby_stations(station, count, interval)
        return {"stations": stations}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cross-section/{station}")
async def get_cross_section(
    station: str,
    width: float = Query(20.0, gt=0, le=200),
    interval: float = Query(1.0, gt=0, le=10),
):
    """获取指定桩号处的横断面点列表"""
    try:
        points = space_service.get_cross_section(
            station=station, width=width, interval=interval
        )
        return {
            "station": station,
            "width": width,
            "points": [
                {"x": round(p.x, 3), "y": round(p.y, 3), "z": round(p.z, 3)}
                for p in points
            ],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate-station")
async def validate_station(station: str):
    """验证桩号格式"""
    pattern = r"^K(\d+)\+(\d{3})\.(\d{3})$"
    match = re.match(pattern, station)
    if match:
        km, m, mm = int(match.group(1)), int(match.group(2)), int(match.group(3))
        total_mm = km * 1000000 + m * 1000 + mm
        return {
            "valid": True,
            "station": station,
            "km": km,
            "m": m,
            "mm": mm,
            "total_mm": total_mm,
        }
    return {"valid": False, "error": "桩号格式必须是 Kxxx+xxx.xxx"}


@router.get("/distance")
async def calculate_distance(station1: str = Query(...), station2: str = Query(...)):
    """计算两个桩号之间的距离（米）"""
    try:
        distance = space_service.calculate_distance(station1, station2)
        return {"station1": station1, "station2": station2, "distance_meters": distance}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/spatial-distance")
async def calculate_spatial_distance(
    station1: str = Query(...),
    lateral1: float = Query(0),
    station2: str = Query(...),
    lateral2: float = Query(0),
):
    """计算两个空间点之间的三维距离"""
    try:
        distance = space_service.calculate_spatial_distance(
            station1, lateral1, station2, lateral2
        )
        return {
            "station1": station1,
            "lateral1": lateral1,
            "station2": station2,
            "lateral2": lateral2,
            "distance_meters": round(distance, 3),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/coord-to-station", response_model=CoordToStationResponse)
async def coord_to_station_query(
    x: float = Query(...),
    y: float = Query(...),
    z: float = Query(0),
    lateral: float = Query(0),
):
    """三维坐标转桩号（GET方式）"""
    req = CoordToStationRequest(x=x, y=y, z=z, lateral_offset=lateral)
    return await coord_to_station(req)
