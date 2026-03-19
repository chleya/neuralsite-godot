class_name PerformanceMonitor
extends Node

signal performance_warning(warning_type: String, value: float)
signal frame_time_exceeded(threshold: float, actual: float)

@export var target_fps: float = 60.0
@export var warning_fps: float = 30.0
@export var memory_warning_threshold: float = 500.0
@export var enable_profiling: bool = false

var _frame_count: int = 0
var _fps: float = 60.0
var _avg_frame_time: float = 0.016
var _min_fps: float = 60.0
var _max_fps: float = 0.0

var _memory_usage: float = 0.0
var _entity_count: int = 0
var _draw_calls: int = 0

var _frame_times: Array = []
var _frame_time_history_size: int = 60

var _last_warning_time: float = 0.0
var _warning_cooldown: float = 5.0

func _ready() -> void:
	print("[PerformanceMonitor] Initialized - Target FPS: %.0f" % target_fps)

func _process(delta: float) -> void:
	_frame_count += 1
	_update_fps(delta)
	_check_performance_warnings()

func _update_fps(delta: float) -> void:
	var current_fps = 1.0 / max(delta, 0.001)
	
	_fps = (_fps * 0.9) + (current_fps * 0.1)
	
	_avg_frame_time = (_avg_frame_time * 0.9) + (delta * 0.1)
	
	_min_fps = min(_min_fps, current_fps) if _min_fps > 0 else current_fps
	_max_fps = max(_max_fps, current_fps)
	
	_frame_times.append(delta)
	if _frame_times.size() > _frame_time_history_size:
		_frame_times.pop_front()

func _check_performance_warnings() -> void:
	var now = Time.get_unix_time_from_system()
	
	if now - _last_warning_time < _warning_cooldown:
		return
	
	if _fps < warning_fps:
		_last_warning_time = now
		performance_warning.emit("low_fps", _fps)
		print("[PerformanceMonitor] WARNING: FPS dropped to %.1f" % _fps)
	
	if Engine.get_process_memory() / 1024.0 / 1024.0 > memory_warning_threshold:
		_last_warning_time = now
		performance_warning.emit("high_memory", _memory_usage)
		print("[PerformanceMonitor] WARNING: Memory usage high")

func update_stats() -> void:
	_entity_count = _count_entities()
	_draw_calls = Performance.get_monitor(Performance.RENDER_USAGE_FRAME_TIME)

func _count_entities() -> int:
	var count = 0
	var root = get_tree().root
	var main = root.get_node_or_null("Main")
	if main:
		var container = main.get_node_or_null("EntityContainer")
		if container:
			count = container.get_child_count()
	return count

func get_current_fps() -> float:
	return _fps

func get_frame_time() -> float:
	return _avg_frame_time

func get_stats() -> Dictionary:
	var memory_mb = Engine.get_process_memory() / 1024.0 / 1024.0
	
	var frame_time_p95 = 0.0
	if _frame_times.size() > 0:
		var sorted_times = _frame_times.duplicate()
		sorted_times.sort()
		var p95_index = int(float(sorted_times.size()) * 0.95)
		frame_time_p95 = sorted_times[p95_index]
	
	return {
		"fps": _fps,
		"target_fps": target_fps,
		"min_fps": _min_fps,
		"max_fps": _max_fps,
		"avg_frame_time_ms": _avg_frame_time * 1000.0,
		"p95_frame_time_ms": frame_time_p95 * 1000.0,
		"memory_mb": memory_mb,
		"entity_count": _entity_count,
		"draw_calls": _draw_calls
	}

func print_stats() -> void:
	var stats = get_stats()
	print("=== Performance Stats ===")
	print("FPS: %.1f (target: %.0f)" % [stats["fps"], stats["target_fps"]])
	print("Frame Time: %.2fms (avg), %.2fms (p95)" % [stats["avg_frame_time_ms"], stats["p95_frame_time_ms"]])
	print("Memory: %.1f MB" % stats["memory_mb"])
	print("Entities: %d" % stats["entity_count"])
	print("========================")

func is_performance_acceptable() -> bool:
	return _fps >= warning_fps

func get_performance_rating() -> String:
	if _fps >= target_fps * 0.9:
		return "Excellent"
	elif _fps >= target_fps * 0.6:
		return "Good"
	elif _fps >= warning_fps:
		return "Fair"
	else:
		return "Poor"

func reset_stats() -> void:
	_frame_count = 0
	_fps = 60.0
	_avg_frame_time = 0.016
	_min_fps = 60.0
	_max_fps = 0.0
	_frame_times.clear()
	print("[PerformanceMonitor] Stats reset")
