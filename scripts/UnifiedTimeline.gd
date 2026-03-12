# UnifiedTimeline.gd
# 统一时间轴系统 - 事件推动 + 时间记录 + 历史回溯 + 未来预测
# 核心设计：像游戏一样的事件驱动，支持过去/现在/未来
class_name UnifiedTimeline
extends Node

# ============================================================
# 时间轴模式
# ============================================================
enum TimelineMode {
	PLAY,        # 播放
	PAUSE,       # 暂停
	RECORD,      # 录制
	PLAYBACK,    # 回放
}

# ============================================================
# 事件类型
# ============================================================
enum EventType {
	PHASE_CHANGE,      # 阶段变化
	PROGRESS_UPDATE,  # 进度更新
	ENTITY_ADD,       # 实体添加
	ENTITY_REMOVE,    # 实体移除
	ENTITY_MODIFY,    # 实体修改
	BOUNDARY_CHANGE,  # 边界变化
	COLLISION,        # 碰撞事件
	WARNING,          # 警告
	MANUAL_ENTRY,     # 手动录入
	EXTERNAL_INPUT,   # 外部输入
}

# ============================================================
# 导出配置
# ============================================================
@export_group("时间配置", "time_")
@export var start_date: String = "2026-01-01"
@export var current_day: int = 0
@export var total_days: int = 365
@export var time_scale: float = 1.0  # 1秒 = 多少天

@export_group("模式", "mode_")
@export var mode: TimelineMode = TimelineMode.PAUSE
@export var loop_playback: bool = false

# ============================================================
# 实体引用
# ============================================================
var _entities: Dictionary = {}  # entity_id -> entity
var _timeline_events: Array = []  # 所有时间轴事件

# ============================================================
# 历史记录
# ============================================================
var _history: Array = []  # 历史快照
var _history_index: int = -1  # 当前历史位置

# ============================================================
# 信号
# ============================================================
signal day_changed(day: int)
signal event_added(event: Dictionary)
signal state_changed(state: Dictionary)
signal timeline_finished
signal warning_triggered(warning: Dictionary)

# ============================================================
# 内部变量
# ============================================================
var _time_accumulator: float = 0.0
var _is_recording: bool = false
var _record_buffer: Array = []

func _ready() -> void:
	print("[UnifiedTimeline] Initialized from ", start_date)

func _process(delta: float) -> void:
	if mode == TimelineMode.PLAY:
		_time_accumulator += delta * time_scale
		if _time_accumulator >= 1.0:
			var days = int(_time_accumulator)
			_time_accumulator -= days
			_advance_day(days)

# ============================================================
# 时间控制
# ============================================================
func play() -> void:
	mode = TimelineMode.PLAY
	print("[UnifiedTimeline] Playing")

func pause() -> void:
	mode = TimelineMode.PAUSE
	print("[UnifiedTimeline] Paused at day ", current_day)

func reset() -> void:
	current_day = 0
	_time_accumulator = 0.0
	mode = TimelineMode.PAUSE
	_save_snapshot()
	day_changed.emit(current_day)
	print("[UnifiedTimeline] Reset")

func go_to_day(day: int) -> void:
	var old_day = current_day
	current_day = clamp(day, 0, total_days)
	
	if current_day > old_day:
		# 前进：应用事件
		_apply_events_to_day(current_day)
	elif current_day < old_day:
		# 后退：恢复快照
		_restore_snapshot(current_day)
	
	day_changed.emit(current_day)

func set_time_scale(scale: float) -> void:
	time_scale = max(0.1, scale)

# ============================================================
# 实体管理
# ============================================================
func register_entity(entity_id: String, entity: Node) -> void:
	_entities[entity_id] = entity
	
	# 记录事件
	_add_event({
		"type": EventType.ENTITY_ADD,
		"entity_id": entity_id,
		"day": current_day,
		"data": {"name": entity.name if entity.has("name") else entity_id}
	})

func unregister_entity(entity_id: String) -> void:
	if _entities.has(entity_id):
		var entity = _entities[entity_id]
		_entities.erase(entity_id)
		
		_add_event({
			"type": EventType.ENTITY_REMOVE,
			"entity_id": entity_id,
			"day": current_day
		})

func get_entity(entity_id: String) -> Node:
	return _entities.get(entity_id)

func get_all_entities() -> Array:
	return _entities.values()

# ============================================================
# 事件系统
# ============================================================
func _add_event(event_data: Dictionary) -> void:
	event_data["timestamp"] = Time.get_unix_time_from_system()
	_timeline_events.append(event_data)
	event_added.emit(event_data)
	
	if _is_recording:
		_record_buffer.append(event_data)

func add_event(
	event_type: EventType,
	description: String,
	entity_id: String = "",
	data: Dictionary = {}
) -> void:
	var event = {
		"type": event_type,
		"description": description,
		"entity_id": entity_id,
		"day": current_day,
		"data": data
	}
	_add_event(event)

func get_events_at_day(day: int) -> Array:
	return _timeline_events.filter(func(e): return e.get("day") == day)

func get_events_in_range(start_day: int, end_day: int) -> Array:
	return _timeline_events.filter(func(e): 
		var d = e.get("day", 0)
		return d >= start_day and d <= end_day
	)

# ============================================================
# 历史系统 - 保存/恢复状态
# ============================================================
func _save_snapshot() -> void:
	# 移除当前指针之后的历史
	if _history_index < _history.size() - 1:
		_history = _history.slice(0, _history_index + 1)
	
	# 保存当前快照
	var snapshot = {
		"day": current_day,
		"entities": {},
		"timestamp": Time.get_unix_time_from_system()
	}
	
	# 保存每个实体的状态
	for entity_id in _entities:
		var entity = _entities[entity_id]
		snapshot["entities"][entity_id] = _capture_entity_state(entity)
	
	_history.append(snapshot)
	_history_index = _history.size() - 1
	
	# 限制历史长度
	if _history.size() > 1000:
		_history.pop_front()
		_history_index -= 1

func _capture_entity_state(entity: Node) -> Dictionary:
	var state = {
		"position": [entity.position.x, entity.position.y, entity.position.z],
		"rotation": [entity.rotation.x, entity.rotation.y, entity.rotation.z],
		"scale": [entity.scale.x, entity.scale.y, entity.scale.z]
	}
	
	# 捕获自定义属性
	if entity.has("phase"):
		state["phase"] = entity.get("phase")
	if entity.has("progress"):
		state["progress"] = entity.get("progress")
	if entity.has("entity_name"):
		state["entity_name"] = entity.get("entity_name")
	
	return state

func _restore_snapshot(day: int) -> void:
	# 找到最接近目标日期的快照
	var target_snapshot = null
	
	for i in range(_history.size() - 1, -1, -1):
		if _history[i]["day"] <= day:
			target_snapshot = _history[i]
			_history_index = i
			break
	
	if target_snapshot:
		_restore_entity_states(target_snapshot["entities"])
		current_day = target_snapshot["day"]
		day_changed.emit(current_day)

func _restore_entity_states(states: Dictionary) -> void:
	for entity_id in states:
		if not _entities.has(entity_id):
			continue
		
		var entity = _entities[entity_id]
		var state = states[entity_id]
		
		# 恢复位置
		if state.has("position"):
			var pos = state["position"]
			entity.position = Vector3(pos[0], pos[1], pos[2])
		
		if state.has("rotation"):
			var rot = state["rotation"]
			entity.rotation = Vector3(rot[0], rot[1], rot[2])
		
		# 恢复自定义属性
		if state.has("phase"):
			entity.set("phase", state["phase"])
		if state.has("progress"):
			entity.set("progress", state["progress"])

# ============================================================
# 预测系统
# ============================================================
func predict_future_state(target_day: int) -> Dictionary:
	var predictions = {}
	
	# 基于当前状态和历史趋势预测
	for entity_id in _entities:
		var entity = _entities[entity_id]
		var prediction = _predict_entity_state(entity, target_day)
		predictions[entity_id] = prediction
	
	return {
		"target_day": target_day,
		"predictions": predictions,
		"generated_at": Time.get_unix_time_from_system()
	}

func _predict_entity_state(entity: Node, target_day: int) -> Dictionary:
	var current_progress = entity.get("progress", 0.0) if entity.has("progress") else 0.0
	var planned_days = entity.get("planned_days", 180) if entity.has("planned_days") else 180
	
	var days_elapsed = current_day
	var remaining_days = target_day - days_elapsed
	
	# 线性预测
	var predicted_progress = current_progress + (remaining_days / planned_days) * (1.0 - current_progress)
	predicted_progress = clamp(predicted_progress, 0.0, 1.0)
	
	var predicted_phase = _phase_from_progress(predicted_progress)
	
	return {
		"current_progress": current_progress,
		"predicted_progress": predicted_progress,
		"predicted_phase": predicted_phase,
		"confidence": _calculate_prediction_confidence(days_elapsed, planned_days)
	}

func _calculate_prediction_confidence(days_elapsed: int, total_days: int) -> float:
	# 越接近完成，预测越准确
	var completion_ratio = float(days_elapsed) / float(total_days) if total_days > 0 else 0.0
	return clamp(0.3 + completion_ratio * 0.6, 0.3, 0.9)

func _phase_from_progress(p: float) -> String:
	if p >= 1.0: return "completed"
	elif p >= 0.9: return "finishing"
	elif p >= 0.7: return "pavement"
	elif p >= 0.3: return "earthwork"
	elif p >= 0.1: return "clearing"
	else: return "planning"

# ============================================================
# 内部方法
# ============================================================
func _advance_day(days: int) -> void:
	for d in range(days):
		current_day += 1
		
		# 保存快照
		_save_snapshot()
		
		# 应用事件
		_apply_events_to_day(current_day)
		
		day_changed.emit(current_day)
		
		if current_day >= total_days:
			_on_timeline_finished()
			break

func _apply_events_to_day(day: int) -> void:
	var events = get_events_at_day(day)
	for event in events:
		_apply_single_event(event)

func _apply_single_event(event: Dictionary) -> void:
	match event.get("type"):
		EventType.PHASE_CHANGE:
			var entity_id = event.get("entity_id", "")
			if _entities.has(entity_id):
				var entity = _entities[entity_id]
				if entity.has("phase"):
					entity.set("phase", event.get("data", {}).get("new_phase", ""))
		
		EventType.PROGRESS_UPDATE:
			var entity_id = event.get("entity_id", "")
			if _entities.has(entity_id):
				var entity = _entities[entity_id]
				if entity.has("progress"):
					entity.set("progress", event.get("data", {}).get("progress", 0.0))

func _on_timeline_finished() -> void:
	pause()
	timeline_finished.emit()
	print("[UnifiedTimeline] Finished at day ", current_day)

# ============================================================
# 统计与导出
# ============================================================
func get_summary() -> Dictionary:
	var phase_counts = {}
	var entity_count = _entities.size()
	var event_count = _timeline_events.size()
	
	for entity in _entities.values():
		if entity.has("phase"):
			var phase = entity.get("phase", "unknown")
			phase_counts[phase] = phase_counts.get(phase, 0) + 1
	
	return {
		"current_day": current_day,
		"total_days": total_days,
		"entity_count": entity_count,
		"event_count": event_count,
		"phase_distribution": phase_counts,
		"mode": TimelineMode.keys()[mode]
	}

func export_timeline() -> Dictionary:
	return {
		"start_date": start_date,
		"total_days": total_days,
		"current_day": current_day,
		"events": _timeline_events,
		"snapshots_count": _history.size()
	}
