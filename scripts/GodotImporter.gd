# GodotImporter.gd
# Godot数据导入器 - 从GeoJSON/API导入数据并创建实体
# 支持: 道路、桥梁、车辆等实体类型
extends Node

# ── 配置 ──
@export_group("数据源", "source_")
@export var use_local_file: bool = true
@export var api_url: String = "http://localhost:8000/api/v2"
@export var data_file_path: String = "res://data/roads.geojson"

# ── 信号 ──
signal data_loaded(roads: Array)
signal import_failed(error: String)
signal progress_updated(current: int, total: int)
signal entity_created(entity_id: String, entity_type: String)

# ── 数据存储 ──
var loaded_roads: Array = []
var loaded_entities: Dictionary = {}

var _validation_errors: Array = []
var _import_stats: Dictionary = {
	"roads": 0,
	"bridges": 0,
	"vehicles": 0,
	"errors": 0
}

func _ready() -> void:
	print("[GodotImporter] Ready")

func import_roads() -> Array:
	loaded_roads.clear()
	_validation_errors.clear()
	_import_stats = {"roads": 0, "bridges": 0, "vehicles": 0, "errors": 0}
	
	if use_local_file:
		loaded_roads = _load_from_file()
	else:
		loaded_roads = await _load_from_api()
	
	if loaded_roads.size() > 0:
		data_loaded.emit(loaded_roads)
		print("[GodotImporter] Loaded %d roads (errors: %d)" % [loaded_roads.size(), _validation_errors.size()])
	else:
		import_failed.emit("No roads loaded")
	
	return loaded_roads

func _load_from_file() -> Array:
	if not FileAccess.file_exists(data_file_path):
		push_error("[GodotImporter] File not found: " + data_file_path)
		import_failed.emit("File not found: " + data_file_path)
		return []
	
	var file = FileAccess.open(data_file_path, FileAccess.READ)
	if not file:
		push_error("[GodotImporter] Cannot open file: " + data_file_path)
		import_failed.emit("Cannot open file")
		return []
	
	var json_text = file.get_as_text()
	file.close()
	
	return _parse_geojson(json_text)

func _load_from_api() -> Array:
	var http = HTTPRequest.new()
	add_child(http)
	
	var url = api_url + "/stations"
	var result = await http.request(url, [], HTTPClient.METHOD_GET)
	
	if result != OK:
		import_failed.emit("API request failed: " + str(result))
		http.queue_free()
		return []
	
	var response = await http.request_completed
	http.queue_free()
	
	if response[1] == 200:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		var data = json.get_data()
		return _convert_api_to_roads(data)
	
	import_failed.emit("API returned: " + str(response[1]))
	return []

func _parse_geojson(json_text: String) -> Array:
	var json = JSON.new()
	var parse_result = json.parse(json_text)
	
	if parse_result != OK:
		push_error("[GodotImporter] JSON parse failed at line " + str(json.get_error_line()))
		import_failed.emit("JSON parse failed")
		return []
	
	var data = json.data
	if data.is_empty():
		import_failed.emit("Empty JSON data")
		return []
	
	var features = data.get("features", [])
	if not features.is_empty():
		import_failed.emit("No features found in GeoJSON")
		return []
	
	var roads = []
	progress_updated.emit(0, features.size())
	
	for i in range(features.size()):
		var feature = features[i]
		if not _validate_feature(feature, i):
			continue
		
		var geom = feature.get("geometry", {})
		var props = feature.get("properties", {})
		var coords = geom.get("coordinates", [])
		var points = _coords_to_points(coords)
		
		if points.size() < 2:
			_validation_errors.append("Feature %d: Less than 2 points" % i)
			continue
		
		var road = {
			"id": props.get("id", "road_%d" % i),
			"name": props.get("name", "Road %d" % i),
			"points": points,
			"lanes": int(props.get("lanes", 2)),
			"width": float(props.get("width", 7.0)),
			"phase": _validate_phase(props.get("phase", "planning")),
			"progress": clamp(float(props.get("progress", 0.0)), 0.0, 1.0),
			"highway_type": props.get("highway_type", "secondary"),
			"surface": props.get("surface", "asphalt")
		}
		
		roads.append(road)
		_import_stats["roads"] += 1
		progress_updated.emit(i + 1, features.size())
	
	return roads

func _validate_feature(feature: Dictionary, index: int) -> bool:
	if not feature.has("geometry"):
		_validation_errors.append("Feature %d: Missing geometry" % index)
		return false
	if not feature.has("properties"):
		_validation_errors.append("Feature %d: Missing properties" % index)
		return false
	return true

func _validate_phase(phase: String) -> String:
	var valid_phases = ["planning", "clearing", "earthwork", "pavement", "finishing", "completed"]
	if phase in valid_phases:
		return phase
	_validation_errors.append("Invalid phase '%s', using 'planning'" % phase)
	return "planning"

func _coords_to_points(coords: Array) -> PackedVector3Array:
	var points = PackedVector3Array()
	for coord in coords:
		if coord.size() >= 2:
			var x = float(coord[0])
			var y = float(coord[1]) if coord.size() > 2 else 0.0
			var z = float(coord[2]) if coord.size() > 2 else 0.0
			points.append(Vector3(x, y, z))
	return points

func _convert_api_to_roads(api_data: Dictionary) -> Array:
	var roads = []
	var stations = api_data.get("stations", [])
	
	for station in stations:
		var road = {
			"id": station.get("id", "unknown"),
			"name": station.get("name", "Unknown Road"),
			"points": _create_points_from_station(station),
			"lanes": int(station.get("lanes", 2)),
			"width": float(station.get("width", 7.0)),
			"phase": _validate_phase(station.get("status", "planning")),
			"progress": clamp(float(station.get("progress", 0.0)), 0.0, 1.0),
			"highway_type": station.get("highway_type", "secondary")
		}
		roads.append(road)
		_import_stats["roads"] += 1
	
	return roads

func _create_points_from_station(station: Dictionary) -> PackedVector3Array:
	var points = PackedVector3Array()
	var easting = float(station.get("easting", 0))
	var northing = float(station.get("northing", 0))
	var elevation = float(station.get("elevation", 0))
	
	points.append(Vector3(easting, elevation, northing))
	points.append(Vector3(easting + 100, elevation, northing + 50))
	points.append(Vector3(easting + 200, elevation, northing + 100))
	
	return points

func create_road_segments(parent: Node, factory: EntityFactory = null) -> Array:
	var created = []
	
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
		created.append(segment)
		entity_created.emit(road_data["id"], "road")
	
	print("[GodotImporter] Created %d road segments" % created.size())
	return created

func get_validation_errors() -> Array:
	return _validation_errors.duplicate()

func get_import_stats() -> Dictionary:
	return _import_stats.duplicate()

func has_errors() -> bool:
	return _validation_errors.size() > 0
