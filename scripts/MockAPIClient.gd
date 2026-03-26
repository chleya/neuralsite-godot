# MockAPIClient.gd
# 模拟后端API客户端 - 支持Godot API v1
# 用于开发和测试，实际部署时替换为真实的APIClient
extends Node

# ── 配置 ──
@export_group("API设置", "api_")
@export var use_mock_data: bool = true  # true=模拟数据, false=真实API
@export var api_base_url: String = "http://localhost:8000/api/v1"
@export var mock_latency_ms: int = 100

# ── 信号 ──
signal stations_loaded(stations: Array)
signal state_updated(data: Dictionary)
signal events_loaded(events: Array)
signal stats_updated(data: Dictionary)
signal entities_loaded(entities: Array)
signal states_loaded(states: Array)
signal tags_loaded(entity_id: String, tags: Array)
signal error_occurred(message: String)
signal connection_status_changed(connected: bool)

var _is_connected: bool = false
var _mock_entities: Array = []
var _mock_states: Array = []

# ── 模拟数据生成 ──
func _generate_mock_data() -> void:
	_mock_entities = [
		{
			"id": "road_001",
			"entity_type": "roadbed",
			"name": "K1+000 - K2+000 道路",
			"start_station": "K1+000.000",
			"end_station": "K2+000.000",
			"lateral_offset": 0.0,
			"progress": 0.45,
			"construction_phase": "earthwork",
		},
		{
			"id": "bridge_001",
			"entity_type": "bridge",
			"name": "K1+500 桥梁",
			"start_station": "K1+500.000",
			"end_station": "K1+540.000",
			"lateral_offset": 0.0,
			"progress": 0.75,
			"construction_phase": "pavement",
		},
	]
	_mock_states = []

# ── API 方法 (与v2路由对应) ──

func get_stations() -> Array:
	if use_mock_data:
		# 模拟异步
		await _simulate_latency()
		stations_loaded.emit(_mock_stations)
		return _mock_stations
	return []

func get_station(station_id: String) -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		for s in _mock_stations:
			if s["id"] == station_id:
				return s
	return {}

func update_progress(station_id: String, progress: float) -> bool:
	if use_mock_data:
		await _simulate_latency()
		for s in _mock_stations:
			if s["id"] == station_id:
				s["progress"] = clamp(progress, 0.0, 1.0)
				# 更新状态
				if s["progress"] >= 1.0:
					s["status"] = "completed"
				elif s["progress"] >= 0.7:
					s["status"] = "pavement"
				elif s["progress"] >= 0.3:
					s["status"] = "earthwork"
				elif s["progress"] >= 0.1:
					s["status"] = "clearing"
				else:
					s["status"] = "planning"
				return true
	return false

func get_events(station_id: String = "") -> Array:
	if use_mock_data:
		await _simulate_latency()
		var filtered = _mock_events.duplicate()
		if station_id != "":
			filtered = filtered.filter(func(e): return e["station_id"] == station_id)
		events_loaded.emit(filtered)
		return filtered
	return []

func get_spacetime_state(station_id: String) -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		# 找到对应station
		var station = {}
		for s in _mock_stations:
			if s["id"] == station_id:
				station = s
				break
		
		# 模拟状态数据
		var state = {
			"station_id": station_id,
			"station_name": station.get("name", ""),
			"timestamp": "2026-03-09T12:00:00",
			"status": station.get("status", "planning"),
			"progress": station.get("progress", 0.0),
			"phase": station.get("status", "planning"),
			"temperature": randf_range(15, 25),
			"humidity": randf_range(40, 70),
			"weather": ["sunny", "cloudy"].pick_random(),
			"workers_count": randi_range(10, 40),
			"machines_count": randi_range(5, 15)
		}
		state_updated.emit(state)
		return state
	return {}

func get_project_stats() -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		# 重新计算统计
		var completed = 0
		var total_progress = 0.0
		for s in _mock_stations:
			if s["status"] == "completed":
				completed += 1
			total_progress += s["progress"]
		
		_mock_stats["completed_stations"] = completed
		_mock_stats["in_progress_stations"] = _mock_stations.size() - completed
		_mock_stats["avg_progress"] = round(total_progress / _mock_stations.size() * 10) / 10
		
		stats_updated.emit(_mock_stats)
		return _mock_stats
	return {}

func get_station_stats() -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		var by_status = {}
		var progress_dist = {"0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0}
		
		for s in _mock_stations:
			var status = s["status"]
			by_status[status] = by_status.get(status, 0) + 1
			
			var p = s["progress"]
			if p < 0.25:
				progress_dist["0-25%"] += 1
			elif p < 0.50:
				progress_dist["25-50%"] += 1
			elif p < 0.75:
				progress_dist["50-75%"] += 1
			else:
				progress_dist["75-100%"] += 1
		
		return {
			"by_status": by_status,
			"progress_distribution": progress_dist,
			"total": _mock_stations.size()
		}
	return {}

# ── Godot API v1 兼容方法 ──

func get_godot_entities() -> Array:
	if use_mock_data:
		await _simulate_latency()
		entities_loaded.emit(_mock_entities)
		_is_connected = true
		return _mock_entities
	else:
		return await _fetch_entities_from_api()

func get_godot_states() -> Array:
	if use_mock_data:
		await _simulate_latency()
		states_loaded.emit(_mock_states)
		_is_connected = true
		return _mock_states
	else:
		return await _fetch_states_from_api()

# ── 真实API调用 ──

func _fetch_entities_from_api() -> Array:
	var http = HTTPRequest.new()
	add_child(http)
	
	var url = api_base_url + "/entities"
	var err = http.request(url)
	if err != OK:
		http.queue_free()
		_is_connected = false
		error_occurred.emit("Failed to fetch entities: " + str(err))
		return []
	
	var response = await http.request_completed
	http.queue_free()
	
	var response_code = response[1]
	var body = response[3].get_string_from_utf8()
	
	if response_code >= 200 and response_code < 300:
		_is_connected = true
		connection_status_changed.emit(true)
		var json = JSON.new()
		var parse_result = json.parse(body)
		if parse_result == OK:
			var data = json.get_data()
			if data is Array:
				entities_loaded.emit(data)
				return data
			elif data is Dictionary and data.has("entities"):
				entities_loaded.emit(data["entities"])
				return data["entities"]
	else:
		_is_connected = false
		connection_status_changed.emit(false)
		error_occurred.emit("API error: " + str(response_code))
	
	return []

func _fetch_states_from_api() -> Array:
	return []  # 后端暂无独立states端点

# ── 辅助方法 ──

func get_entity_state(entity_id: String) -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		for state in _mock_states:
			if state.get("entity_id") == entity_id:
				return state
	return {}

func get_entity_state_history(entity_id: String) -> Array:
	if use_mock_data:
		await _simulate_latency()
		return []
	else:
		return []  # 后端暂无历史状态API

func get_entity_semantic_tags(entity_id: String) -> Array:
	if use_mock_data:
		await _simulate_latency()
		return []
	return []

func apply_semantic_tag(entity_id: String, tag_data: Dictionary) -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		return {"success": true}
	return {"error": "Mock mode"}

func get_entities_at_location(station: int, range_half: int = 100) -> Array:
	if use_mock_data:
		await _simulate_latency()
		return _mock_entities
	else:
		var entities = await _fetch_entities_from_api()
		return entities  # 后续可按station过滤

func get_realtime_state(station: int = 0) -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		return {}
	else:
		return {}

func get_project_statistics() -> Dictionary:
	if use_mock_data:
		await _simulate_latency()
		return {
			"total_entities": _mock_entities.size(),
			"avg_progress": 0.5,
		}
	else:
		var entities = await _fetch_entities_from_api()
		if entities.size() > 0:
			var total_progress = 0.0
			for e in entities:
				total_progress += e.get("progress", 0.0)
			return {
				"total_entities": entities.size(),
				"avg_progress": total_progress / entities.size(),
			}
		return {"total_entities": 0, "avg_progress": 0.0}

func is_connected() -> bool:
	return _is_connected

# ── 辅助方法 ──
func _simulate_latency() -> void:
	if mock_latency_ms > 0:
		await get_tree().create_timer(float(mock_latency_ms) / 1000.0).timeout

# ── 调试 ──
func print_data() -> void:
	print("=== MockAPIClient ===")
	print("Entities: ", _mock_entities.size())
	print("States: ", _mock_states.size())
