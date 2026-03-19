# GodotExporter.gd
# Godot数据导出器 - 将修改导出到OpenClaw
# 使用: 在Godot中修改道路后调用导出
extends Node

# ── 配置 ──
@export_group("导出设置", "export_")
@export var use_local_file: bool = true  # true=本地文件, false=HTTP API
@export var api_url: String = "http://localhost:8000/api/v2"
@export var output_path: String = "res://data/roads_modified.geojson"

# ── 信号 ──
signal export_completed(file_path: String)
signal export_failed(error: String)
signal sync_completed()
signal sync_failed(error: String)

# ── 修改记录 ──
var _modifications: Array = []

func _ready() -> void:
	print("[GodotExporter] Ready")

# ── 记录修改 ──
func record_modification(
	road_id: String, 
	field: String, 
	old_value, 
	new_value
) -> void:
	"""记录道路属性的修改"""
	var mod = {
		"road_id": road_id,
		"field": field,
		"old_value": str(old_value),
		"new_value": str(new_value),
		"timestamp": Time.get_datetime_string_from_system()
	}
	_modifications.append(mod)
	print("[GodotExporter] Recorded modification: ", road_id, " ", field)

# ── 导出修改 ──
func export_modifications() -> bool:
	"""导出所有修改到GeoJSON"""
	if _modifications.size() == 0:
		print("[GodotExporter] No modifications to export")
		return false
	
	var export_data = {
		"type": "ModificationCollection",
		"modifications": _modifications,
		"exported_at": Time.get_datetime_string_from_system()
	}
	
	var json_str = JSON.stringify(export_data, "\t")
	
	# 保存到文件
	var file = FileAccess.open(output_path, FileAccess.WRITE)
	if file:
		file.store_string(json_str)
		file.close()
		export_completed.emit(output_path)
		print("[GodotExporter] Exported to: ", output_path)
		return true
	else:
		export_failed.emit("Failed to write file")
		return false

# ── 导出完整道路数据 ──
func export_all_roads(roads: Array, file_path: String = "") -> bool:
	"""导出所有道路数据"""
	if file_path == "":
		file_path = output_path
	
	var features = []
	
	for road in roads:
		if road is RoadSegment and road.road_data:
			var rd = road.road_data
			var coords = _points_to_coords(rd.points)
			
			var feature = {
				"type": "Feature",
				"geometry": {
					"type": "LineString",
					"coordinates": coords
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
			features.append(feature)
	
	var geojson = {
		"type": "FeatureCollection",
		"features": features,
		"metadata": {
			"exported_at": Time.get_datetime_string_from_system(),
			"road_count": features.size()
		}
	}
	
	var json_str = JSON.stringify(geojson, "\t")
	
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	if file:
		file.store_string(json_str)
		file.close()
		export_completed.emit(file_path)
		return true
	
	export_failed.emit("Failed to write file")
	return false

# ── 同步到API ──
func sync_to_api(roads: Array) -> bool:
	"""同步修改到后端API"""
	if use_local_file:
		return export_modifications()
	
	var url = api_url + "/sync"
	var success_count = 0
	var fail_count = 0
	
	for mod in _modifications:
		var result = await _http_post_json(url, mod)
		if result.size() > 0:
			success_count += 1
		else:
			fail_count += 1
	
	if fail_count == 0:
		sync_completed.emit()
		print("[GodotExporter] Synced ", success_count, " modifications to API")
		return true
	else:
		sync_failed.emit("Failed to sync " + str(fail_count) + " items")
		print("[GodotExporter] Sync partially failed: ", success_count, " ok, ", fail_count, " failed")
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
	
	if response[1] == 200:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		return json.get_data()
	return {}

# ── 坐标转换 ──
func _points_to_coords(points: PackedVector3Array) -> Array:
	var coords = []
	for p in points:
		coords.append([p.x, p.y, p.z])
	return coords

# ── 清除修改记录 ──
func clear_modifications() -> void:
	_modifications.clear()
	print("[GodotExporter] Cleared modification history")

# ── 获取修改数量 ──
func get_modification_count() -> int:
	return _modifications.size()

# ── 获取修改列表 ──
func get_modifications() -> Array:
	return _modifications.duplicate()
