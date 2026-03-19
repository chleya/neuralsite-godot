# GodotExporter.gd
# Godot数据导出器 - 导出场景数据到GeoJSON或后端API
# 支持: 道路、桥梁、车辆等实体的完整数据导出
extends Node

# ── 配置 ──
@export_group("导出设置", "export_")
@export var use_local_file: bool = true
@export var api_url: String = "http://localhost:8000/api/v2"
@export var output_path: String = "res://data/roads_modified.geojson"
@export var pretty_print: bool = true

# ── 信号 ──
signal export_completed(file_path: String)
signal export_failed(error: String)
signal sync_completed()
signal sync_failed(error: String)
signal progress_updated(current: int, total: int)

# ── 修改记录 ──
var _modifications: Array = []
var _export_stats: Dictionary = {
	"roads": 0,
	"bridges": 0,
	"vehicles": 0,
	"modifications": 0
}

var _last_error: String = ""

func _ready() -> void:
	print("[GodotExporter] Ready")

func record_modification(
	road_id: String, 
	field: String, 
	old_value, 
	new_value
) -> void:
	var mod = {
		"road_id": road_id,
		"field": field,
		"old_value": str(old_value),
		"new_value": str(new_value),
		"timestamp": Time.get_datetime_string_from_system()
	}
	_modifications.append(mod)
	_export_stats["modifications"] += 1
	print("[GodotExporter] Recorded: %s.%s = %s -> %s" % [road_id, field, old_value, new_value])

func export_modifications() -> bool:
	if _modifications.size() == 0:
		print("[GodotExporter] No modifications to export")
		return false
	
	var export_data = {
		"type": "ModificationCollection",
		"version": "1.0",
		"modifications": _modifications,
		"exported_at": Time.get_datetime_string_from_system()
	}
	
	var json_str = _to_json(export_data)
	if json_str.is_empty():
		export_failed.emit("JSON serialization failed")
		return false
	
	var result = _write_to_file(output_path, json_str)
	if result:
		export_completed.emit(output_path)
		print("[GodotExporter] Exported %d modifications to: %s" % [_modifications.size(), output_path])
		return true
	
	export_failed.emit(_last_error)
	return false

func export_all_roads(roads: Array, file_path: String = "") -> bool:
	if file_path.is_empty():
		file_path = output_path
	
	if roads.is_empty():
		push_error("[GodotExporter] No roads to export")
		export_failed.emit("No roads to export")
		return false
	
	var features = []
	_export_stats = {"roads": 0, "bridges": 0, "vehicles": 0, "modifications": 0}
	progress_updated.emit(0, roads.size())
	
	for i in range(roads.size()):
		var road = roads[i]
		var feature = _road_to_feature(road)
		if feature:
			features.append(feature)
			_export_stats["roads"] += 1
		progress_updated.emit(i + 1, roads.size())
	
	var geojson = {
		"type": "FeatureCollection",
		"version": "1.0",
		"features": features,
		"metadata": {
			"exported_at": Time.get_datetime_string_from_system(),
			"generator": "NeuralSite-Godot 4D",
			"road_count": features.size()
		}
	}
	
	var json_str = _to_json(geojson)
	if json_str.is_empty():
		export_failed.emit("JSON serialization failed")
		return false
	
	var result = _write_to_file(file_path, json_str)
	if result:
		export_completed.emit(file_path)
		print("[GodotExporter] Exported %d roads to: %s" % [features.size(), file_path])
		return true
	
	export_failed.emit(_last_error)
	return false

func export_all_entities(entities: Array, file_path: String = "") -> bool:
	if file_path.is_empty():
		file_path = output_path
	
	var features = []
	_export_stats = {"roads": 0, "bridges": 0, "vehicles": 0, "modifications": 0}
	
	for entity in entities:
		if entity is RoadSegment:
			var rd = entity.get("road_data")
			if rd:
				var feature = _road_entity_to_feature(entity, rd)
				if feature:
					features.append(feature)
					_export_stats["roads"] += 1
		elif entity is BridgeEntity:
			var feature = _bridge_to_feature(entity)
			if feature:
				features.append(feature)
				_export_stats["bridges"] += 1
		elif entity is VehicleEntity:
			var feature = _vehicle_to_feature(entity)
			if feature:
				features.append(feature)
				_export_stats["vehicles"] += 1
	
	var geojson = {
		"type": "FeatureCollection",
		"features": features,
		"metadata": {
			"exported_at": Time.get_datetime_string_from_system(),
			"generator": "NeuralSite-Godot 4D",
			"entity_counts": _export_stats
		}
	}
	
	var json_str = _to_json(geojson)
	if json_str.is_empty():
		export_failed.emit("JSON serialization failed")
		return false
	
	var result = _write_to_file(file_path, json_str)
	if result:
		export_completed.emit(file_path)
		print("[GodotExporter] Exported entities: %s" % JSON.stringify(_export_stats))
		return true
	
	export_failed.emit(_last_error)
	return false

func _road_to_feature(road) -> Dictionary:
	if not road is RoadSegment:
		return {}
	
	var rd = road.get("road_data")
	if not rd:
		return {}
	
	return {
		"type": "Feature",
		"geometry": {
			"type": "LineString",
			"coordinates": _points_to_coords(rd.points)
		},
		"properties": {
			"id": rd.id,
			"name": rd.name,
			"lanes": rd.lanes,
			"width": rd.width,
			"phase": rd.phase,
			"progress": rd.current_progress,
			"highway_type": rd.highway_type,
			"surface": rd.surface,
			"exported_at": Time.get_datetime_string_from_system()
		}
	}

func _road_entity_to_feature(entity: RoadSegment, rd) -> Dictionary:
	return {
		"type": "Feature",
		"geometry": {
			"type": "LineString",
			"coordinates": _points_to_coords(rd.points)
		},
		"properties": {
			"entity_type": "road",
			"id": rd.id,
			"name": rd.name,
			"lanes": rd.lanes,
			"width": rd.width,
			"phase": rd.phase,
			"progress": rd.current_progress,
			"position": [entity.position.x, entity.position.y, entity.position.z],
			"exported_at": Time.get_datetime_string_from_system()
		}
	}

func _bridge_to_feature(bridge: BridgeEntity) -> Dictionary:
	return {
		"type": "Feature",
		"geometry": {
			"type": "LineString",
			"coordinates": [
				[bridge.position.x, bridge.position.y, bridge.position.z],
				[bridge.position.x + bridge.total_length, bridge.position.y, bridge.position.z]
			]
		},
		"properties": {
			"entity_type": "bridge",
			"id": bridge.entity_id,
			"name": bridge.entity_name,
			"bridge_type": BridgeEntity.BridgeType.keys()[bridge.bridge_type],
			"total_length": bridge.total_length,
			"bridge_width": bridge.bridge_width,
			"span_count": bridge.span_count,
			"construction_progress": bridge.construction_progress,
			"position": [bridge.position.x, bridge.position.y, bridge.position.z],
			"exported_at": Time.get_datetime_string_from_system()
		}
	}

func _vehicle_to_feature(vehicle: VehicleEntity) -> Dictionary:
	return {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [vehicle.position.x, vehicle.position.y, vehicle.position.z]
		},
		"properties": {
			"entity_type": "vehicle",
			"id": vehicle.entity_id,
			"name": vehicle.entity_name,
			"vehicle_type": VehicleEntity.VehicleType.keys()[vehicle.vehicle_type],
			"attached_road": vehicle.attached_road,
			"is_working": vehicle.is_working,
			"position": [vehicle.position.x, vehicle.position.y, vehicle.position.z],
			"exported_at": Time.get_datetime_string_from_system()
		}
	}

func sync_to_api(roads: Array) -> bool:
	if use_local_file:
		return export_modifications()
	
	if roads.is_empty():
		push_error("[GodotExporter] No roads to sync")
		return false
	
	var url = api_url + "/sync"
	var success_count = 0
	var fail_count = 0
	var total = _modifications.size() if _modifications.size() > 0 else roads.size()
	progress_updated.emit(0, total)
	
	if _modifications.size() > 0:
		for i in range(_modifications.size()):
			var result = await _http_post_json(url, _modifications[i])
			if result.size() > 0:
				success_count += 1
			else:
				fail_count += 1
			progress_updated.emit(i + 1, total)
	else:
		for i in range(roads.size()):
			var road = roads[i]
			var rd = road.get("road_data") if road is RoadSegment else null
			if rd:
				var data = {
					"id": rd.id,
					"phase": rd.phase,
					"progress": rd.current_progress
				}
				var result = await _http_post_json(url, data)
				if result.size() > 0:
					success_count += 1
				else:
					fail_count += 1
			progress_updated.emit(i + 1, total)
	
	if fail_count == 0:
		sync_completed.emit()
		print("[GodotExporter] Synced %d items to API" % success_count)
		return true
	else:
		sync_failed.emit("Failed: %d, Success: %d" % [fail_count, success_count])
		print("[GodotExporter] Sync partial failure: %d ok, %d failed" % [success_count, fail_count])
		return false

func _http_post_json(url: String, body: Dictionary) -> Dictionary:
	var http = HTTPRequest.new()
	add_child(http)
	
	var body_json = JSON.stringify(body)
	var headers = ["Content-Type: application/json"]
	
	var request_result = await http.request(url, headers, HTTPClient.METHOD_POST, body_json)
	if request_result != OK:
		http.queue_free()
		return {}
	
	var response = await http.request_completed
	http.queue_free()
	
	if response[1] >= 200 and response[1] < 300:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		return json.get_data()
	
	return {}

func _points_to_coords(points: PackedVector3Array) -> Array:
	var coords = []
	for p in points:
		coords.append([p.x, p.y, p.z])
	return coords

func _to_json(data: Dictionary) -> String:
	var json = JSON.new()
	if pretty_print:
		return JSON.stringify(data, "\t")
	return JSON.stringify(data)

func _write_to_file(path: String, content: String) -> bool:
	var dir = path.get_base_dir()
	if not DirAccess.dir_exists_absolute(dir):
		DirAccess.make_dir_recursive_absolute(dir)
	
	var file = FileAccess.open(path, FileAccess.WRITE)
	if not file:
		_last_error = "Cannot open file for writing: " + path
		push_error("[GodotExporter] " + _last_error)
		return false
	
	file.store_string(content)
	file.close()
	return true

func clear_modifications() -> void:
	_modifications.clear()
	print("[GodotExporter] Cleared modification history")

func get_modification_count() -> int:
	return _modifications.size()

func get_modifications() -> Array:
	return _modifications.duplicate()

func get_export_stats() -> Dictionary:
	return _export_stats.duplicate()

func get_last_error() -> String:
	return _last_error
