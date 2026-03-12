# GodotImporter.gd
# Godot数据导入器 - 从OpenClaw获取数据并导入场景
# 使用: 在Godot中调用导入函数
extends Node

# ── 配置 ──
@export_group("数据源", "source_")
@export var use_local_file: bool = true  # true=本地文件, false=HTTP API
@export var api_url: String = "http://localhost:8000/api/v2"
@export var data_file_path: String = "res://data/roads.geojson"

# ── 信号 ──
signal data_loaded(roads: Array)
signal import_failed(error: String)
signal progress_updated(current: int, total: int)

# ── 数据存储 ──
var loaded_roads: Array = []

func _ready() -> void:
	print("[GodotImporter] Ready")

# ── 主导入方法 ──
func import_roads() -> Array:
	"""导入道路数据"""
	loaded_roads.clear()
	
	if use_local_file:
		loaded_roads = _load_from_file()
	else:
		loaded_roads = await _load_from_api()
	
	if loaded_roads.size() > 0:
		data_loaded.emit(loaded_roads)
		print("[GodotImporter] Loaded ", loaded_roads.size(), " roads")
	else:
		import_failed.emit("No roads loaded")
	
	return loaded_roads

# ── 文件导入 ──
func _load_from_file() -> Array:
	var file = FileAccess.open(data_file_path, FileAccess.READ)
	if not file:
		push_error("[GodotImporter] File not found: " + data_file_path)
		import_failed.emit("File not found")
		return []
	
	var json_text = file.get_as_text()
	file.close()
	
	return _parse_geojson(json_text)

# ── API导入 ──
func _load_from_api() -> Array:
	var http = HTTPRequest.new()
	add_child(http)
	
	var url = api_url + "/stations"
	var result = await http.request(url, [], HTTPClient.METHOD_GET)
	
	if result != OK:
		import_failed.emit("API request failed")
		return []
	
	var response = await http.request_completed
	http.queue_free()
	
	if response[1] == 200:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		var data = json.get_data()
		
		# 转换为内部格式
		return _convert_api_to_roads(data)
	
	return []

# ── GeoJSON解析 ──
func _parse_geojson(json_text: String) -> Array:
	var json = JSON.new()
	var parse_result = json.parse(json_text)
	
	if parse_result != OK:
		push_error("[GodotImporter] JSON parse failed")
		import_failed.emit("JSON parse failed")
		return []
	
	var data = json.data
	var features = data.get("features", [])
	var roads = []
	
	progress_updated.emit(0, features.size())
	
	for i in range(features.size()):
		var feature = features[i]
		var geom = feature.get("geometry", {})
		var props = feature.get("properties", {})
		
		# 转换坐标
		var coords = geom.get("coordinates", [])
		var points = _coords_to_points(coords)
		
		var road = {
			"id": props.get("id", "road_%d" % i),
			"name": props.get("name", "未命名"),
			"points": points,
			"lanes": int(props.get("lanes", 2)),
			"width": float(props.get("width", 7.0)),
			"phase": props.get("phase", "planning"),
			"progress": float(props.get("progress", 0.0)),
			"highway_type": props.get("highway_type", "secondary"),
			"surface": props.get("surface", "asphalt")
		}
		
		roads.append(road)
		progress_updated.emit(i + 1, features.size())
	
	return roads

# ── 坐标转换 ──
func _coords_to_points(coords: Array) -> PackedVector3Array:
	var points = PackedVector3Array()
	for coord in coords:
		if coord.size() >= 2:
			# [x, y, z] 直接使用
			var x = float(coord[0])
			var y = float(coord[1]) if coord.size() > 2 else 0.0
			var z = float(coord[2]) if coord.size() > 2 else 0.0
			points.append(Vector3(x, y, z))
	return points

# ── API数据转换 ──
func _convert_api_to_roads(api_data: Dictionary) -> Array:
	var roads = []
	var stations = api_data.get("stations", [])
	
	for station in stations:
		var road = {
			"id": station.get("id"),
			"name": station.get("name"),
			"points": _create_points_from_station(station),
			"lanes": int(station.get("lanes", 2)),
			"width": float(station.get("width", 7.0)),
			"phase": station.get("status", "planning"),
			"progress": float(station.get("progress", 0.0)),
			"highway_type": "secondary"
		}
		roads.append(road)
	
	return roads

func _create_points_from_station(station: Dictionary) -> PackedVector3Array:
	var points = PackedVector3Array()
	var easting = float(station.get("easting", 0))
	var northing = float(station.get("northing", 0))
	var elevation = float(station.get("elevation", 0))
	
	# 创建3个点表示一个路段
	points.append(Vector3(easting, elevation, northing))
	points.append(Vector3(easting + 100, elevation, northing + 50))
	points.append(Vector3(easting + 200, elevation, northing + 100))
	
	return points

# ── 创建道路节点 ──
func create_road_segments(parent: Node) -> void:
	for road_data in loaded_roads:
		var segment = RoadSegment.new()
		segment.name = road_data["id"]
		
		var rd = RoadData.new()
		rd.id = road_data["id"]
		rd.name = road_data["name"]
		rd.points = road_data["points"]
		rd.lanes = road_data["lanes"]
		rd.width = road_data["width"]
		rd.phase = road_data["phase"]
		rd.current_progress = road_data["progress"]
		
		segment.road_data = rd
		parent.add_child(segment)
	
	print("[GodotImporter] Created ", loaded_roads.size(), " road segments")
