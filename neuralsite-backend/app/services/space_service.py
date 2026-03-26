"""
空间计算服务模块
实现桩号与三维坐标的相互转换
空间层：只计算，不存储
支持平曲线、纵曲线等复杂线路参数
"""

import re
import math
from dataclasses import dataclass, field
from typing import Optional, Tuple, List, Dict, Any
from datetime import datetime
from enum import Enum


class CurveType(Enum):
    """曲线类型枚举"""
    LINE = "line"              # 直线
    CIRCULAR = "circular"      # 圆曲线
    SPIRAL = "spiral"          # 缓和曲线


@dataclass
class Coordinate3D:
    """
    三维坐标类
    """
    x: float  # X坐标（东向）
    y: float  # Y坐标（北向）
    z: float  # 高程

    def to_dict(self):
        return {"x": self.x, "y": self.y, "z": self.z}

    def distance_to(self, other: 'Coordinate3D') -> float:
        """计算到另一个坐标的距离"""
        dx = self.x - other.x
        dy = self.y - other.y
        dz = self.z - other.z
        return math.sqrt(dx*dx + dy*dy + dz*dz)


@dataclass
class StationRange:
    """
    桩号范围
    """
    start_station: str
    end_station: str

    def contains(self, station: str) -> bool:
        """判断桩号是否在范围内"""
        return self.start_station <= station <= self.end_station


@dataclass
class HorizontalCurve:
    """
    平曲线参数
    描述一段平曲线的几何参数
    """
    curve_type: CurveType = CurveType.LINE
    start_station: str = ""           # 曲线起点桩号
    end_station: str = ""             # 曲线终点桩号
    start_radius: float = float('inf')  # 起点曲率半径（米），直线为无穷大
    end_radius: float = float('inf')     # 终点曲率半径（米），直线为无穷大
    length: float = 0.0               # 曲线长度（米）
    azimuth_change: float = 0.0       # 方位角变化量（度）
    direction: int = 1                # 转向：1=左转，-1=右转

    def get_radius_at_offset(self, offset: float) -> float:
        """
        计算曲线内某偏移位置处的曲率半径
        offset: 距离起点的偏移量（米）
        """
        if self.curve_type == CurveType.LINE:
            return float('inf')
        elif self.curve_type == CurveType.CIRCULAR:
            return self.start_radius
        elif self.curve_type == CurveType.SPIRAL:
            # 缓和曲线：半径线性变化
            ratio = offset / self.length if self.length > 0 else 0
            if abs(self.start_radius) < 1e10 and abs(self.end_radius) < 1e10:
                # 从起点半径渐变到终点半径
                r = 1.0 / self.start_radius + ratio * (1.0 / self.end_radius - 1.0 / self.start_radius)
                return 1.0 / r if abs(r) > 1e-10 else float('inf')
            return self.start_radius
        return float('inf')


@dataclass
class VerticalCurve:
    """
    纵曲线参数
    描述一段纵曲线的几何参数
    """
    curve_type: CurveType = CurveType.LINE
    start_station: str = ""           # 曲线起点桩号
    end_station: str = ""             # 曲线终点桩号
    start_elevation: float = 0.0      # 起点高程（米）
    start_grade: float = 0.0          # 起点坡度（%）
    end_grade: float = 0.0            # 终点坡度（%）
    length: float = 0.0               # 曲线长度（米）
    pvi_station: str = ""             # 变坡点桩号
    pvi_elevation: float = 0.0        # 变坡点高程（米）
    radius: float = float('inf')      # 竖曲线半径（米）

    def get_elevation_at_offset(self, offset: float) -> float:
        """
        计算纵曲线内某偏移位置处的高程
        offset: 距离起点的偏移量（米）
        """
        if self.curve_type == CurveType.LINE:
            # 直线：线性插值
            if self.length > 0:
                ratio = offset / self.length
                return self.start_elevation + ratio * (self.pvi_elevation - self.start_elevation)
            return self.start_elevation
        elif self.curve_type == CurveType.CIRCULAR:
            # 圆曲线：抛物线近似
            if self.length > 0:
                # 抛物线公式计算高程
                grade_at_start = self.start_grade / 100  # 转换为小数
                grade_change = (self.end_grade - self.start_grade) / 100
                A = grade_change / (2 * self.length)  # 二次项系数
                elevation = self.start_elevation + grade_at_start * offset + A * offset * offset
                return elevation
            return self.start_elevation
        return self.start_elevation


@dataclass
class RouteParameters:
    """
    线路参数
    包含整条线路的完整几何参数
    """
    route_id: str = ""
    route_name: str = ""
    start_station: str = "K0+000.000"           # 起点桩号
    end_station: str = "K100+000.000"            # 终点桩号
    start_coord: Coordinate3D = field(default_factory=lambda: Coordinate3D(500000, 3500000, 0))
    start_azimuth: float = 0.0                    # 起点方位角（度，北向为0）
    horizontal_curves: List[HorizontalCurve] = field(default_factory=list)  # 平曲线列表
    vertical_curves: List[VerticalCurve] = field(default_factory=list)    # 纵曲线列表

    def get_azimuth_at_distance(self, distance: float) -> float:
        """
        计算沿线路某距离处的方位角
        distance: 距起点的距离（米）
        """
        azimuth = self.start_azimuth
        accumulated_length = 0.0

        for curve in self.horizontal_curves:
            if distance >= accumulated_length + curve.length:
                # 完全在该曲线之后
                azimuth += curve.azimuth_change
                accumulated_length += curve.length
            elif distance >= accumulated_length:
                # 在该曲线范围内
                offset = distance - accumulated_length
                if curve.curve_type == CurveType.CIRCULAR:
                    # 圆曲线：角度线性变化
                    ratio = offset / curve.length if curve.length > 0 else 0
                    azimuth += curve.azimuth_change * ratio
                elif curve.curve_type == CurveType.SPIRAL:
                    # 缓和曲线：近似线性
                    ratio = offset / curve.length if curve.length > 0 else 0
                    azimuth += curve.azimuth_change * ratio
                break

        return azimuth % 360

    def get_horizontal_curve_at_distance(self, distance: float) -> Optional[HorizontalCurve]:
        """获取某距离处的平曲线"""
        accumulated_length = 0.0
        for curve in self.horizontal_curves:
            if distance >= accumulated_length and distance < accumulated_length + curve.length:
                return curve
            accumulated_length += curve.length
        return None

    def get_vertical_curve_at_distance(self, distance: float) -> Optional[VerticalCurve]:
        """获取某距离处的纵曲线"""
        accumulated_length = 0.0
        for curve in self.vertical_curves:
            if distance >= accumulated_length and distance < accumulated_length + curve.length:
                return curve
            accumulated_length += curve.length
        return None


class SpaceService:
    """
    空间计算服务
    实现桩号与三维坐标的转换
    这是系统的核心：空间是连续的，不存储每个毫米点，而是通过计算函数实现转换
    支持平曲线和纵曲线的精确计算
    """

    def __init__(self):
        # 当前线路参数
        self.route_params = self._create_default_route()
        # 缓存已计算的坐标以提高性能
        self._coord_cache: Dict[str, Coordinate3D] = {}
        self._cache_enabled = True

    def _create_default_route(self) -> RouteParameters:
        """创建默认的线路参数"""
        return RouteParameters(
            route_id="default",
            route_name="默认线路",
            start_station="K0+000.000",
            end_station="K100+000.000",
            start_coord=Coordinate3D(500000, 3500000, 0),
            start_azimuth=0.0,
            horizontal_curves=[
                # 示例：K5+000到K6+000有一段左转的圆曲线
                HorizontalCurve(
                    curve_type=CurveType.CIRCULAR,
                    start_station="K5+000.000",
                    end_station="K6+000.000",
                    start_radius=1000.0,
                    end_radius=1000.0,
                    length=1000.0,
                    azimuth_change=57.3,  # 约1弧度
                    direction=1
                ),
            ],
            vertical_curves=[
                # 示例：K3+000处有变坡
                VerticalCurve(
                    curve_type=CurveType.CIRCULAR,
                    start_station="K2+500.000",
                    end_station="K3+500.000",
                    start_elevation=100.0,
                    start_grade=2.0,  # 2%上坡
                    end_grade=-1.5,   # 1.5%下坡
                    length=1000.0,
                    pvi_station="K3+000.000",
                    pvi_elevation=105.0,
                    radius=15000.0
                ),
            ]
        )

    def set_route_parameters(self, params: RouteParameters):
        """设置线路参数"""
        self.route_params = params
        self._coord_cache.clear()  # 清除缓存

    def get_route_parameters(self) -> RouteParameters:
        """获取当前线路参数"""
        return self.route_params

    def parse_station(self, station: str) -> float:
        """
        解析桩号为总毫米数
        例如：K0+000.000 -> 0
              K1+500.500 -> 1500500
        """
        # 匹配桩号格式：K数字+数字.数字
        pattern = r'^K(\d+)\+(\d+)\.(\d+)$'
        match = re.match(pattern, station)

        if not match:
            raise ValueError(f"无效的桩号格式: {station}")

        km = int(match.group(1))  # 公里数
        m = int(match.group(2))   # 米数
        mm = int(match.group(3))  # 毫米数

        return km * 1000000 + m * 1000 + mm

    def format_station(self, total_mm: float) -> str:
        """
        将总毫米数格式化为桩号字符串
        例如：1500500 -> K1+500.500
        """
        km = int(total_mm // 1000000)
        remaining = int(total_mm % 1000000)
        m = remaining // 1000
        mm = remaining % 1000

        return f"K{km}+{m:03d}.{mm:03d}"

    def _calculate_along_distance(self, total_mm: float) -> float:
        """
        计算沿线路的距离（考虑曲线加长）
        注意：简化实现，假设直线
        """
        return total_mm / 1000.0

    def station_to_coordinates(
        self,
        station: str,
        lateral_offset: float = 0.0,
        elevation: Optional[float] = None,
        use_cache: bool = True
    ) -> Coordinate3D:
        """
        桩号转三维坐标（核心函数）
        将连续的桩号转换为三维空间坐标，支持平曲线和纵曲线

        参数:
            station: 桩号，如 "K0+000"
            lateral_offset: 横向偏移（米），道路中线为0
            elevation: 高程（米），如果为None则自动计算
            use_cache: 是否使用缓存

        返回:
            Coordinate3D: 三维坐标
        """
        # 检查缓存
        cache_key = f"{station}_{lateral_offset}_{elevation}"
        if use_cache and self._cache_enabled and cache_key in self._coord_cache:
            return self._coord_cache[cache_key]

        # 解析桩号
        total_mm = self.parse_station(station)
        along_distance = total_mm / 1000.0

        # 获取该位置处的方位角（考虑平曲线）
        azimuth = self.route_params.get_azimuth_at_distance(along_distance)
        rad = math.radians(azimuth)

        # 计算沿线路方向的位移
        start_coord = self.route_params.start_coord
        x = start_coord.x + along_distance * math.sin(rad)
        y = start_coord.y + along_distance * math.cos(rad)

        # 添加横向偏移
        # 正偏移向左，负偏移向右
        x += lateral_offset * math.cos(rad)
        y -= lateral_offset * math.sin(rad)

        # 计算高程（考虑纵曲线）
        z = elevation
        if z is None:
            z = self._calculate_elevation(along_distance)

        coord = Coordinate3D(x=x, y=y, z=z)

        # 缓存结果
        if self._cache_enabled:
            self._coord_cache[cache_key] = coord

        return coord

    def _calculate_elevation(self, along_distance: float) -> float:
        """
        计算沿线路某距离处的高程（考虑纵曲线）
        """
        vcurve = self.route_params.get_vertical_curve_at_distance(along_distance)

        if vcurve is None:
            # 没有纵曲线，使用线性插值（简化处理）
            start_mm = self.parse_station(self.route_params.start_station)
            end_mm = self.parse_station(self.route_params.end_station)
            total_mm = along_distance * 1000

            if end_mm > start_mm:
                ratio = (total_mm - start_mm) / (end_mm - start_mm)
                # 简化假设：全程2%上坡
                start_z = self.route_params.start_coord.z
                return start_z + along_distance * 0.02 * 1000 / 100
            return self.route_params.start_coord.z

        # 在纵曲线范围内，计算偏移
        start_mm = self.parse_station(vcurve.start_station)
        offset = along_distance - start_mm / 1000.0

        return vcurve.get_elevation_at_offset(offset)

    def coordinate_to_station(
        self,
        coord: Coordinate3D,
        lateral_offset: float = 0.0
    ) -> str:
        """
        三维坐标转桩号（反算）
        这是桩号转坐标的逆运算

        参数:
            coord: 三维坐标
            lateral_offset: 横向偏移（米）

        返回:
            str: 桩号字符串
        """
        # 简化实现：二分查找最接近的桩号
        start_mm = self.parse_station(self.route_params.start_station)
        end_mm = self.parse_station(self.route_params.end_station)

        left = start_mm
        right = end_mm
        tolerance = 1  # 毫米级精度

        best_station = self.route_params.start_station
        best_distance = float('inf')

        while right - left > tolerance:
            mid = (left + right) // 2
            station = self.format_station(mid)
            calc_coord = self.station_to_coordinates(station, lateral_offset, use_cache=False)
            distance = calc_coord.distance_to(coord)

            if distance < best_distance:
                best_distance = distance
                best_station = station

            if calc_coord.x < coord.x:
                left = mid + tolerance
            else:
                right = mid - tolerance

        return best_station

    def get_nearby_stations(
        self,
        station: str,
        count: int = 5,
        interval: float = 1000.0
    ) -> List[str]:
        """
        获取附近的桩号列表
        用于邻近桩号搜索功能

        参数:
            station: 参考桩号
            count: 返回数量
            interval: 间隔（米）

        返回:
            List[str]: 附近的桩号列表
        """
        total_mm = self.parse_station(station)
        interval_mm = int(interval * 1000)

        stations = []
        start_idx = -count // 2
        end_idx = count // 2 + 1

        for i in range(start_idx, end_idx):
            nearby_mm = total_mm + i * interval_mm
            if nearby_mm >= 0:
                stations.append(self.format_station(nearby_mm))

        return stations

    def calculate_distance(
        self,
        station1: str,
        station2: str
    ) -> float:
        """
        计算两个桩号之间的距离（米）
        """
        mm1 = self.parse_station(station1)
        mm2 = self.parse_station(station2)

        return abs(mm2 - mm1) / 1000.0

    def calculate_spatial_distance(
        self,
        station1: str,
        lateral1: float,
        station2: str,
        lateral2: float
    ) -> float:
        """
        计算两个空间点之间的三维距离（米）
        考虑横向偏移
        """
        coord1 = self.station_to_coordinates(station1, lateral1)
        coord2 = self.station_to_coordinates(station2, lateral2)
        return coord1.distance_to(coord2)

    def is_station_in_range(
        self,
        station: str,
        start_station: str,
        end_station: str
    ) -> bool:
        """
        判断桩号是否在范围内
        """
        mm = self.parse_station(station)
        start_mm = self.parse_station(start_station)
        end_mm = self.parse_station(end_station)

        return start_mm <= mm <= end_mm

    def get_cross_section(
        self,
        station: str,
        width: float = 20.0,
        interval: float = 1.0
    ) -> List[Coordinate3D]:
        """
        获取指定桩号处的横断面点列表
        用于生成横断面图

        参数:
            station: 桩号
            width: 总宽度（米），默认20米
            interval: 采样间隔（米），默认1米

        返回:
            List[Coordinate3D]: 横断面上的点列表
        """
        points = []
        half_width = width / 2
        num_points = int(width / interval) + 1

        for i in range(num_points):
            lateral = -half_width + i * interval
            coord = self.station_to_coordinates(station, lateral)
            points.append(coord)

        return points

    def clear_cache(self):
        """清除坐标缓存"""
        self._coord_cache.clear()

    def enable_cache(self, enabled: bool):
        """启用/禁用缓存"""
        self._cache_enabled = enabled
        if not enabled:
            self._coord_cache.clear()


# 创建全局空间计算服务实例
space_service = SpaceService()
