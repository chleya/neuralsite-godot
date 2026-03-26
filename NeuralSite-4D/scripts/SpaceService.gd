extends Node
class_name SpaceService

# 空间计算服务
# 实现"毫米级空间"架构：空间是连续的，只计算不存储

# 默认线路参数
var default_azimuth: float = 0.0  # 线路方位角（度）
var default_start_coord: Vector3 = Vector3(500000, 3500000, 0)  # 起点坐标

# 信号定义
signal coordinate_converted(station: String, coord: Vector3)
signal station_converted(coord: Vector3, station: String)

func _ready() -> void:
	print("[SpaceService] 空间计算服务初始化")

# ========== 桩号解析 ==========

func parse_station(station: String) -> float:
	"""
	解析桩号为总毫米数
	例如：K0+000.000 -> 0
	      K1+500.500 -> 1500500
	"""
	# 匹配桩号格式：K数字+数字.数字 或 K数字+数字
	var pattern_full = r'^K(\d+)\+(\d+)\.(\d+)$'
	var pattern_simple = r'^K(\d+)\+(\d+)$'

	var regex = RegEx.new()
	regex.compile(pattern_full)
	var match = regex.search(station)

	if match:
		var km = match.group(1).to_int()
		var m = match.group(2).to_int()
		var mm = match.group(3).to_int()
		return km * 1000000 + m * 1000 + mm

	# 尝试简单格式
	regex.compile(pattern_simple)
	match = regex.search(station)
	if match:
		var km = match.group(1).to_int()
		var m = match.group(2).to_int()
		return km * 1000000 + m * 1000

	print("[SpaceService] 警告: 无效的桩号格式: ", station)
	return 0.0

func format_station(total_mm: float) -> String:
	"""
	将总毫米数格式化为桩号字符串
	例如：1500500 -> K1+500.500
	"""
	if total_mm < 0:
		total_mm = 0

	var km = int(total_mm / 1000000)
	var remaining = int(total_mm) % 1000000
	var m = remaining / 1000
	var mm = remaining % 1000

	return "K%d+%03d.%03d" % [km, m, mm]

# ========== 坐标转换 ==========

func station_to_coord3d(station: String, lateral_offset: float = 0.0, elevation: float = 0.0) -> Vector3:
	"""
	桩号转三维坐标
	核心函数：将连续的桩号转换为三维空间坐标
	"""
	# 解析桩号
	var total_mm = parse_station(station)

	# 计算沿线路距离（米）
	var along_distance = total_mm / 1000.0

	# 计算坐标（简化计算，假设直线）
	# 实际应用中需要根据平曲线参数计算
	var rad = deg_to_rad(default_azimuth)

	# 起点坐标 + 沿线路方向的位移
	var x = default_start_coord.x + along_distance * sin(rad)
	var y = default_start_coord.y + along_distance * cos(rad)

	# 添加横向偏移
	x += lateral_offset * cos(rad)
	y -= lateral_offset * sin(rad)

	# 高程
	var z = elevation if elevation != 0.0 else default_start_coord.z

	coordinate_converted.emit(station, Vector3(x, y, z))
	return Vector3(x, y, z)

func coord_to_station3d(coord: Vector3, lateral_offset: float = 0.0) -> String:
	"""
	三维坐标转桩号（反算）
	"""
	# 计算相对于起点的位移
	var dx = coord.x - default_start_coord.x
	var dy = coord.y - default_start_coord.y

	# 去除横向偏移的影响
	var rad = deg_to_rad(default_azimuth)
	dx -= lateral_offset * cos(rad)
	dy += lateral_offset * sin(rad)

	# 计算沿线路距离
	var along_distance = dy * cos(rad) + dx * sin(rad)

	# 转换为毫米数
	var total_mm = along_distance * 1000

	station_converted.emit(coord, format_station(total_mm))
	return format_station(total_mm)

# ========== 距离计算 ==========

func calculate_distance(station1: String, station2: String) -> float:
	"""
	计算两个桩号之间的距离（米）
	"""
	var mm1 = parse_station(station1)
	var mm2 = parse_station(station2)

	return abs(mm2 - mm1) / 1000.0

func is_station_in_range(station: String, start_station: String, end_station: String) -> bool:
	"""
	判断桩号是否在范围内
	"""
	var mm = parse_station(station)
	var start_mm = parse_station(start_station)
	var end_mm = parse_station(end_station)

	return start_mm <= mm and mm <= end_mm

# ========== 邻近搜索 ==========

func get_nearby_stations(station: String, count: int = 5, interval: float = 1000.0) -> Array:
	"""
	获取附近的桩号列表
	用于邻近桩号搜索功能
	"""
	var total_mm = parse_station(station)
	var stations: Array = []

	for i in range(-count / 2, count / 2 + 1):
		var nearby_mm = total_mm + i * interval
		if nearby_mm >= 0:
			stations.append(format_station(nearby_mm))

	return stations

# ========== 坐标变换 ==========

func local_to_global(local_pos: Vector3, station: String, lateral_offset: float = 0.0) -> Vector3:
	"""
	局部坐标转全局坐标
	"""
	var base_coord = station_to_coord3d(station, lateral_offset)
	return base_coord + local_pos

func global_to_local(global_pos: Vector3, station: String, lateral_offset: float = 0.0) -> Vector3:
	"""
	全局坐标转局部坐标
	"""
	var base_coord = station_to_coord3d(station, lateral_offset)
	return global_pos - base_coord

# ========== 辅助函数 ==========

func get_station_range_length(start_station: String, end_station: String) -> float:
	"""
	获取桩号范围的长度（米）
	"""
	return calculate_distance(start_station, end_station)

func split_station_range(start_station: String, end_station: String, segment_count: int) -> Array:
	"""
	将桩号范围分割为多个段
	返回分割点的桩号列表
	"""
	var start_mm = parse_station(start_station)
	var end_mm = parse_station(end_station)
	var total_mm = end_mm - start_mm
	var segment_mm = total_mm / segment_count

	var stations: Array = []
	stations.append(start_station)

	for i in range(1, segment_count):
		var mm = start_mm + i * segment_mm
		stations.append(format_station(mm))

	stations.append(end_station)
	return stations
