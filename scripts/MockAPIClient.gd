# MockAPIClient.gd
# 模拟后端API客户端 - v2版本
# 用于开发和测试，实际部署时替换为真实的APIClient
extends Node

# ── 配置 ──
@export_group("API设置", "api_")
@export var use_mock_data: bool = true  # true=模拟数据, false=真实API
@export var api_base_url: String = "http://localhost:8000/api/v2"
@export var mock_latency_ms: int = 100

# ── 信号 ──
signal stations_loaded(stations: Array)
signal state_updated(data: Dictionary)
signal events_loaded(events: Array)
signal stats_updated(data: Dictionary)
signal error_occurred(message: String)

# ── 模拟数据 ──
var _mock_stations: Array = []
var _mock_events: Array = []
var _mock_stats: Dictionary = {}

func _ready() -> void:
	if use_mock_data:
		_generate_mock_data()
		print("[MockAPIClient v2] Initialized with mock data")
		print("[MockAPIClient v2] API URL would be: ", api_base_url)

# ── 模拟数据生成 ──
func _generate_mock_data() -> void:
	# 15个桩号
	var statuses = ["completed", "completed", "completed", "completed", "completed",
	                "pavement", "pavement", "earthwork", "earthwork", "earthwork",
	                "clearing", "clearing", "planning", "planning", "planning"]
	var progresses = [1.0, 1.0, 1.0, 1.0, 1.0,
	                 0.85, 0.75, 0.55, 0.45, 0.35,
	                 0.20, 0.10, 0.0, 0.0, 0.0]
	
	_mock_stations = []
	for i in range(15):
		var station = {
			"id": "station_%03d" % (i+1),
			"name": "K%d+000" % i,
			"station": float(i * 1000),
			"easting": 500000 + i * 100,
			"northing": 4000000 + i * 50,
			"elevation": 50 + i * 2,
			"status": statuses[i],
			"progress": progresses[i],
			"project_id": "proj_001"
		}
		_mock_stations.append(station)
	
	# 30个事件
	var event_types = ["phase_start", "phase_complete", "quality_check", "safety_inspection", "milestone"]
	_mock_events = []
	for i in range(30):
		var event = {
			"id": "event_%03d" % (i+1),
			"event_type": event_types[i % event_types.size()],
			"station_id": "station_%03d" % ((i % 15) + 1),
			"description": "事件 %d" % (i+1),
			"timestamp": "2026-03-09T10:00:00"
		}
		_mock_events.append(event)
	
	# 统计
	_mock_stats = {
		"project_id": "proj_001",
		"total_stations": 15,
		"completed_stations": 5,
		"in_progress_stations": 10,
		"avg_progress": 43.3,
		"total_events": 30,
		"open_issues": 3,
		"photos_count": 8
	}

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

# ── 辅助方法 ──
func _simulate_latency() -> void:
	if mock_latency_ms > 0:
		await get_tree().create_timer(float(mock_latency_ms) / 1000.0).timeout

# ── 调试 ──
func print_data() -> void:
	print("=== MockAPIClient v2 ===")
	print("Stations: ", _mock_stations.size())
	print("Events: ", _mock_events.size())
	print("Stats: ", _mock_stats)
