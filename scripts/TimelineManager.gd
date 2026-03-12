# TimelineManager.gd
# 时间轴管理器 - 控制建设模拟的时间流逝和阶段推进
# 使用: 作为Autoload单例或挂载在主场景
extends Node

# ── 时间控制 ──
@export_group("时间设置", "time_")
@export var simulation_start_day: int = 0
@export var current_day: int = 0 :
	set(v):
		current_day = v
		_day_changed.emit(current_day)
@export var time_scale: float = 1.0  # 1秒 = 多少模拟天
@export var is_playing: bool = false

# ── 阶段配置 ──
@export_group("阶段设置", "phase_")
@export var phases: Array[Dictionary] = [
	{"name": "planning", "duration_days": 60, "color": Color(0.8, 0.8, 1.0, 0.5)},
	{"name": "clearing", "duration_days": 30, "color": Color(1.0, 0.8, 0.4, 0.8)},
	{"name": "earthwork", "duration_days": 90, "color": Color(0.6, 0.4, 0.2, 0.8)},
	{"name": "pavement", "duration_days": 60, "color": Color(0.3, 0.3, 0.3, 1.0)},
	{"name": "finishing", "duration_days": 30, "color": Color(0.4, 0.6, 0.4, 1.0)},
	{"name": "completed", "duration_days": 0, "color": Color(0.2, 0.2, 0.2, 1.0)}
]

# ── 道路段引用 ──
@export_group("道路管理", "road_")
@export var road_segments: Array[RoadSegment] = []

# ── 事件日志 ──
@export_group("事件日志", "event_")
var event_log: Array[Dictionary] = []

# ── 信号 ──
signal day_changed(day: int)
signal phase_changed(segment_id: String, old_phase: String, new_phase: String)
signal milestone_reached(segment_id: String, milestone: String)
signal timeline_finished

# ── 内部变量 ──
var _time_accumulator: float = 0.0

func _ready() -> void:
	print("[TimelineManager] Initialized")

func _process(delta: float) -> void:
	if is_playing:
		_time_accumulator += delta * time_scale
		if _time_accumulator >= 1.0:
			var days_passed = int(_time_accumulator)
			_time_accumulator -= days_passed
			_advance_days(days_passed)

# ── 时间控制 ──
func play() -> void:
	is_playing = true
	print("[TimelineManager] Playing at ", time_scale, "x speed")

func pause() -> void:
	is_playing = false
	print("[TimelineManager] Paused at day ", current_day)

func reset() -> void:
	current_day = simulation_start_day
	_time_accumulator = 0.0
	is_playing = false
	_day_changed.emit(current_day)
	print("[TimelineManager] Reset to day ", current_day)

func set_day(day: int) -> void:
	current_day = day
	_update_all_segments()

func set_time_scale(scale: float) -> void:
	time_scale = max(0.1, scale)
	print("[TimelineManager] Time scale: ", time_scale, "x")

# ── 内部方法 ──
func _advance_days(days: int) -> void:
	for d in range(days):
		current_day += 1
		_day_changed.emit(current_day)
		_update_all_segments()
	
	if current_day >= simulation_start_day + 365:  # 1年后自动停止
		pause()
		timeline_finished.emit()

func _update_all_segments() -> void:
	for segment in road_segments:
		if segment and segment.road_data:
			var rd = segment.road_data
			
			# 计算进度
			var days_elapsed = current_day - rd.start_day
			var expected_progress = clamp(float(days_elapsed) / float(rd.planned_days), 0.0, 1.0)
			
			# 自动推进阶段
			var new_phase = _calculate_phase(expected_progress)
			if rd.phase != new_phase:
				var old_phase = rd.phase
				rd.set_phase(new_phase)
				phase_changed.emit(rd.id, old_phase, new_phase)
				_log_event(rd.id, "phase_change", "从 %s阶段 变为 %s" % [old_phase, new_phase])
				milestone_reached.emit(rd.id, new_phase)
			
			# 更新进度（可能受外部影响）
			# rd.set_progress(expected_progress)

func _calculate_phase(progress: float) -> String:
	# 根据进度计算当前阶段
	var cumulative = 0.0
	for phase_info in phases:
		var duration = phase_info.get("duration_days", 30)
		var ratio = duration / 360.0  # 总周期约360天
		cumulative += ratio
		if progress <= cumulative:
			return phase_info["name"]
	return "completed"

# ── 道路管理 ──
func register_road_segment(segment: RoadSegment) -> void:
	if segment and not segment in road_segments:
		road_segments.append(segment)
		print("[TimelineManager] Registered: ", segment.name)

func unregister_road_segment(segment: RoadSegment) -> void:
	if segment in road_segments:
		road_segments.erase(segment)

func get_segment(id: String) -> RoadSegment:
	for segment in road_segments:
		if segment.road_data and segment.road_data.id == id:
			return segment
	return null

# ── 事件日志 ──
func _log_event(segment_id: String, event_type: String, description: String, params: Dictionary = {}) -> void:
	var event = {
		"day": current_day,
		"segment_id": segment_id,
		"type": event_type,
		"description": description,
		"params": params
	}
	event_log.append(event)
	print("[TimelineManager] Event: [Day %d] %s - %s" % [current_day, segment_id, description])

func get_events(segment_id: String = "") -> Array[Dictionary]:
	if segment_id == "":
		return event_log
	return event_log.filter(func(e): return e.get("segment_id") == segment_id)

func clear_events() -> void:
	event_log.clear()

# ── 阶段操作 ──
func get_phase_info(phase_name: String) -> Dictionary:
	for phase in phases:
		if phase["name"] == phase_name:
			return phase
	return {}

func get_current_phase_for_segment(segment_id: String) -> String:
	var segment = get_segment(segment_id)
	if segment and segment.road_data:
		return segment.road_data.phase
	return "planning"

# ── 批量操作 ──
func set_all_segments_phase(phase: String) -> void:
	for segment in road_segments:
		if segment and segment.road_data:
			var old_phase = segment.road_data.phase
			segment.set_phase(phase)
			phase_changed.emit(segment.road_data.id, old_phase, phase)

func reset_all_segments() -> void:
	for segment in road_segments:
		if segment and segment.road_data:
			segment.road_data.current_progress = 0.0
			segment.road_data.phase = "planning"
			segment.road_data.start_day = current_day
	reset()

# ── 统计信息 ──
func get_summary() -> Dictionary:
	var summary = {
		"current_day": current_day,
		"total_segments": road_segments.size(),
		"phases": {},
		"avg_progress": 0.0,
		"total_events": event_log.size()
	}
	
	var total_progress = 0.0
	for segment in road_segments:
		if segment and segment.road_data:
			var phase = segment.road_data.phase
			summary["phases"][phase] = summary["phases"].get(phase, 0) + 1
			total_progress += segment.road_data.current_progress
	
	if road_segments.size() > 0:
		summary["avg_progress"] = total_progress / road_segments.size()
	
	return summary

func print_summary() -> void:
	var s = get_summary()
	print("=== Timeline Summary ===")
	print("  Day: ", s.current_day)
	print("  Segments: ", s.total_segments)
	print("  Phases: ", s.phases)
	print("  Avg Progress: ", snapped(s.avg_progress * 100, 0.1), "%")
	print("  Events: ", s.total_events)
