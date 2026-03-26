extends Node
class_name SpaceService

signal coordinate_converted(station: String, coord: Vector3)
signal station_converted(coord: Vector3, station: String)
signal mouse_position_changed(coord: Vector3, station: String)

var default_azimuth: float = 0.0
var default_start_coord: Vector3 = Vector3(500000, 3500000, 0)

var _grid_size: float = 1.0
var _snap_enabled: bool = true
var _snap_mode: String = "grid"

var _last_mouse_coord: Vector3
var _last_mouse_station: String

func _ready() -> void:
	print("[SpaceService] 空间计算服务初始化")

func parse_station(station: String) -> float:
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

	regex.compile(pattern_simple)
	match = regex.search(station)
	if match:
		var km = match.group(1).to_int()
		var m = match.group(2).to_int()
		return km * 1000000 + m * 1000

	print("[SpaceService] 警告: 无效的桩号格式: ", station)
	return 0.0

func format_station(total_mm: float) -> String:
	if total_mm < 0:
		total_mm = 0

	var km = int(total_mm / 1000000)
	var remaining = int(total_mm) % 1000000
	var m = remaining / 1000
	var mm = remaining % 1000

	return "K%d+%03d.%03d" % [km, m, mm]

func format_station_short(total_mm: float) -> String:
	if total_mm < 0:
		total_mm = 0

	var km = int(total_mm / 1000000)
	var remaining = int(total_mm) % 1000000
	var m = remaining / 1000

	return "K%d+%03d" % [km, m]

func format_length(meters: float) -> String:
	if abs(meters) >= 1000:
		return "%.2f km" % (meters / 1000)
	return "%.2f m" % meters

func format_length_short(meters: float) -> String:
	return "%.1f" % meters

func format_coord(coord: Vector3) -> String:
	return "X:%.1f Y:%.1f Z:%.1f" % [coord.x, coord.y, coord.z]

func format_coord_station(coord: Vector3) -> String:
	var station = coord_to_station3d(coord)
	return "%s  %s" % [station, format_coord(coord)]

func station_to_coord3d(station: String, lateral_offset: float = 0.0, elevation: float = 0.0) -> Vector3:
	var total_mm = parse_station(station)
	var along_distance = total_mm / 1000.0

	var rad = deg_to_rad(default_azimuth)

	var x = default_start_coord.x + along_distance * sin(rad)
	var y = default_start_coord.y + along_distance * cos(rad)

	x += lateral_offset * cos(rad)
	y -= lateral_offset * sin(rad)

	var z = elevation if elevation != 0.0 else default_start_coord.z

	coordinate_converted.emit(station, Vector3(x, y, z))
	return Vector3(x, y, z)

func coord_to_station3d(coord: Vector3, lateral_offset: float = 0.0) -> String:
	var dx = coord.x - default_start_coord.x
	var dy = coord.y - default_start_coord.y

	var rad = deg_to_rad(default_azimuth)
	dx -= lateral_offset * cos(rad)
	dy += lateral_offset * sin(rad)

	var along_distance = dy * cos(rad) + dx * sin(rad)
	var total_mm = along_distance * 1000

	station_converted.emit(coord, format_station(total_mm))
	return format_station(total_mm)

func calculate_distance(station1: String, station2: String) -> float:
	var mm1 = parse_station(station1)
	var mm2 = parse_station(station2)
	return abs(mm2 - mm1) / 1000.0

func is_station_in_range(station: String, start_station: String, end_station: String) -> bool:
	var mm = parse_station(station)
	var start_mm = parse_station(start_station)
	var end_mm = parse_station(end_station)
	return start_mm <= mm and mm <= end_mm

func get_nearby_stations(station: String, count: int = 5, interval: float = 1000.0) -> Array:
	var total_mm = parse_station(station)
	var stations: Array = []

	for i in range(-count / 2, count / 2 + 1):
		var nearby_mm = total_mm + i * interval
		if nearby_mm >= 0:
			stations.append(format_station(nearby_mm))

	return stations

func local_to_global(local_pos: Vector3, station: String, lateral_offset: float = 0.0) -> Vector3:
	var base_coord = station_to_coord3d(station, lateral_offset)
	return base_coord + local_pos

func global_to_local(global_pos: Vector3, station: String, lateral_offset: float = 0.0) -> Vector3:
	var base_coord = station_to_coord3d(station, lateral_offset)
	return global_pos - base_coord

func get_station_range_length(start_station: String, end_station: String) -> float:
	return calculate_distance(start_station, end_station)

func split_station_range(start_station: String, end_station: String, segment_count: int) -> Array:
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

func update_mouse_position(coord: Vector3) -> Dictionary:
	_last_mouse_coord = coord
	_last_mouse_station = coord_to_station3d(coord)
	mouse_position_changed.emit(coord, _last_mouse_station)
	return {"coord": coord, "station": _last_mouse_station}

func get_mouse_position() -> Dictionary:
	return {"coord": _last_mouse_coord, "station": _last_mouse_station}

func set_grid_size(size: float) -> void:
	_grid_size = max(0.1, size)

func get_grid_size() -> float:
	return _grid_size

func set_snap_enabled(enabled: bool) -> void:
	_snap_enabled = enabled

func is_snap_enabled() -> bool:
	return _snap_enabled

func set_snap_mode(mode: String) -> void:
	_snap_mode = mode

func get_snap_mode() -> String:
	return _snap_mode

func snap_to_grid(coord: Vector3) -> Vector3:
	if not _snap_enabled or _snap_mode != "grid":
		return coord
	return Vector3(
		round(coord.x / _grid_size) * _grid_size,
		round(coord.y / _grid_size) * _grid_size,
		round(coord.z / _grid_size) * _grid_size
	)

func snap_to_station(coord: Vector3, interval: float = 100.0) -> Vector3:
	if not _snap_enabled or _snap_mode != "station":
		return coord
	var station = coord_to_station3d(coord)
	var mm = parse_station(station)
	var snapped_mm = round(mm / interval) * interval
	return station_to_coord3d(format_station(snapped_mm))
}

func snap_to_interval(coord: Vector3, axis: String, interval: float) -> Vector3:
	if not _snap_enabled:
		return coord

	match axis:
		"x":
			return Vector3(round(coord.x / interval) * interval, coord.y, coord.z)
		"y":
			return Vector3(coord.x, round(coord.y / interval) * interval, coord.z)
		"z":
			return Vector3(coord.x, coord.y, round(coord.z / interval) * interval)
		_:
			return coord

func get_snap_status() -> String:
	if not _snap_enabled:
		return "Snap: OFF"
	match _snap_mode:
		"grid":
			return "Snap: Grid(%.1fm)" % _grid_size
		"station":
			return "Snap: Station"
		"object":
			return "Snap: Object"
		_:
			return "Snap: %s" % _snap_mode

func create_station_range(start: String, end: String, lateral: float = 0.0) -> Dictionary:
	var start_coord = station_to_coord3d(start, lateral)
	var end_coord = station_to_coord3d(end, lateral)
	var length = calculate_distance(start, end)

	var points = PackedVector3Array()
	var steps = max(2, int(length / 10))
	for i in range(steps + 1):
		var t = float(i) / steps
		var x = lerp(start_coord.x, end_coord.x, t)
		var y = lerp(start_coord.y, end_coord.y, t)
		var z = lerp(start_coord.z, end_coord.z, t)
		points.append(Vector3(x, y, z))

	return {
		"start": start,
		"end": end,
		"start_coord": start_coord,
		"end_coord": end_coord,
		"length": length,
		"points": points,
		"lateral": lateral
	}

func set_alignment_params(azimuth: float, start_coord: Vector3) -> void:
	default_azimuth = azimuth
	default_start_coord = start_coord

func get_alignment_params() -> Dictionary:
	return {
		"azimuth": default_azimuth,
		"start_coord": default_start_coord
	}
