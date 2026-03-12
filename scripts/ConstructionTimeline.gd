# ConstructionTimeline.gd
# 建筑时间轴 - 控制所有实体的施工模拟
# 支持: 多实体协调, 时间轴播放, 进度同步
extends Node

# ── 时间设置 ──
@export_group("时间设置", "time_")
@export var start_day: int = 0
@export var current_day: int = 0
@export var total_days: int = 365  # 默认1年
@export var time_scale: float = 1.0  # 1秒 = 多少天

# ── 播放控制 ──
@export_group("播放控制", "playback_")
@export var is_playing: bool = false
@export var loop_timeline: bool = false

# ── 实体管理 ──
@export_group("实体管理", "entities_")
@export var entities: Array[ConstructionEntity] = []

# ── 信号 ──
signal day_changed(day: int)
signal phase_changed(entity: ConstructionEntity, old_phase: String, new_phase: String)
signal milestone_reached(entity: ConstructionEntity, milestone: String)
signal timeline_finished
signal all_completed

# ── 内部变量 ──
var _time_accumulator: float = 0.0

func _ready() -> void:
	print("[ConstructionTimeline] Initialized")

func _process(delta: float) -> void:
	if is_playing:
		_time_accumulator += delta * time_scale
		if _time_accumulator >= 1.0:
			var days_passed = int(_time_accumulator)
			_time_accumulator -= days_passed
			_advance_days(days_passed)

# ── 播放控制 ──
func play() -> void:
	is_playing = true
	print("[ConstructionTimeline] Playing")

func pause() -> void:
	is_playing = false
	print("[ConstructionTimeline] Paused at day ", current_day)

func reset() -> void:
	current_day = start_day
	_time_accumulator = 0.0
	is_playing = false
	_update_all_entities()
	day_changed.emit(current_day)
	print("[ConstructionTimeline] Reset to day ", current_day)

func set_day(day: int) -> void:
	current_day = clamp(day, start_day, total_days)
	_update_all_entities()
	day_changed.emit(current_day)

func set_time_scale(scale: float) -> void:
	time_scale = max(0.1, scale)
	print("[ConstructionTimeline] Time scale: ", time_scale, "x")

# ── 实体注册 ──
func register_entity(entity: ConstructionEntity) -> void:
	if entity not in entities:
		entities.append(entity)
		print("[ConstructionTimeline] Registered: ", entity.entity_name)

func unregister_entity(entity: ConstructionEntity) -> void:
	if entity in entities:
		entities.erase(entity)

func get_entity(entity_id: String) -> ConstructionEntity:
	for entity in entities:
		if entity.entity_id == entity_id:
			return entity
	return null

# ── 内部方法 ──
func _advance_days(days: int) -> void:
	for d in range(days):
		current_day += 1
		
		# 检查是否完成
		if current_day >= total_days:
			_on_timeline_finished()
			break
		
		_update_all_entities()
	
	day_changed.emit(current_day)

func _update_all_entities() -> void:
	for entity in entities:
		if entity and is_instance_valid(entity):
			# 计算实体进度
			var entity_progress = _calculate_entity_progress(entity)
			entity.set_property("progress", entity_progress)
			
			# 自动推进阶段
			var new_phase = _calculate_phase(entity_progress)
			if entity.phase != new_phase:
				var old_phase = entity.phase
				entity.set_property("phase", new_phase)
				phase_changed.emit(entity, old_phase, new_phase)
				milestone_reached.emit(entity, new_phase)

func _calculate_entity_progress(entity: ConstructionEntity) -> float:
	# 根据实体类型计算进度
	match entity.entity_type:
		"road":
			return _calculate_road_progress(entity)
		"vehicle":
			# 车辆进度基于位置
			return _calculate_vehicle_progress(entity)
		"bridge", "tunnel", "building":
			return _calculate_generic_progress(entity)
		_:
			return float(current_day - start_day) / float(total_days)

func _calculate_road_progress(entity: ConstructionEntity) -> float:
	# 简单实现: 基于当前天数
	var entity_days = total_days  # 可以为每个实体设置不同工期
	var progress = float(current_day - start_day) / float(entity_days)
	return clamp(progress, 0.0, 1.0)

func _calculate_vehicle_progress(entity: ConstructionEntity) -> float:
	# 车辆显示当前位置对应的进度
	if entity is VehicleEntity:
		return entity._current_progress
	return 0.0

func _calculate_generic_progress(entity: ConstructionEntity) -> float:
	return float(current_day - start_day) / float(total_days)

func _calculate_phase(progress: float) -> String:
	# 阶段划分
	if progress >= 1.0:
		return "completed"
	elif progress >= 0.9:
		return "finishing"
	elif progress >= 0.7:
		return "pavement"
	elif progress >= 0.3:
		return "earthwork"
	elif progress >= 0.1:
		return "clearing"
	else:
		return "planning"

func _on_timeline_finished() -> void:
	pause()
	timeline_finished.emit()
	
	# 检查是否全部完成
	var all_done = true
	for entity in entities:
		if entity.progress < 1.0:
			all_done = false
			break
	
	if all_done:
		all_completed.emit()
		print("[ConstructionTimeline] All entities completed!")

# ── 阶段管理 ──
func set_phase_for_all(phase: String) -> void:
	for entity in entities:
		if entity:
			entity.set_property("phase", phase)

func get_phase_summary() -> Dictionary:
	var summary = {}
	for entity in entities:
		if entity:
			var phase = entity.phase
			summary[phase] = summary.get(phase, 0) + 1
	return summary

# ── 统计信息 ──
func get_summary() -> Dictionary:
	var total_progress = 0.0
	var by_type = {}
	var by_phase = {}
	
	for entity in entities:
		if entity:
			total_progress += entity.progress
			
			# 按类型统计
			var etype = entity.entity_type
			by_type[etype] = by_type.get(etype, 0) + 1
			
			# 按阶段统计
			var phase = entity.phase
			by_phase[phase] = by_phase.get(phase, 0) + 1
	
	return {
		"current_day": current_day,
		"total_days": total_days,
		"entity_count": entities.size(),
		"avg_progress": total_progress / entities.size() if entities.size() > 0 else 0,
		"by_type": by_type,
		"by_phase": by_phase
	}

func print_summary() -> void:
	var s = get_summary()
	print("=== Timeline Summary ===")
	print("Day: ", s.current_day, "/", s.total_days)
	print("Entities: ", s.entity_count)
	print("Avg Progress: ", snapped(s.avg_progress * 100, 0.1), "%")
	print("By Type: ", s.by_type)
	print("By Phase: ", s.by_phase)
