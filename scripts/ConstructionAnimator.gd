class_name ConstructionAnimator
extends Node

enum AnimationType { 
	IDLE, 
	WORKING, 
	MOVING, 
	PAUSED,
	COMPLETED
}

enum WorkAnimation {
	PILING,      # 打桩
	ROLLING,      # 压实
	EXCAVATING,   # 挖掘
	POURING,      # 浇注
	DISMANTLING   # 拆除
}

signal animation_started(entity_id: String, anim_type: int)
signal animation_completed(entity_id: String, anim_type: int)
signal animation_updated(entity_id: String, progress: float)

var _entity_animations: Dictionary = {}
var _active_animations: int = 0

func _ready() -> void:
	print("[ConstructionAnimator] Initialized")

func play_work_animation(entity: Node, anim_type: WorkAnimation) -> void:
	if not entity or not entity.has("entity_id"):
		return
	
	var entity_id = entity.entity_id if entity.has("entity_id") else str(entity.get_instance_id())
	
	var anim_data = {
		"entity": entity,
		"type": anim_type,
		"state": AnimationType.WORKING,
		"progress": 0.0,
		"duration": _get_animation_duration(anim_type),
		"start_position": entity.position if entity.has("position") else Vector3.ZERO,
		"start_rotation": entity.rotation if entity.has("rotation") else Vector3.ZERO
	}
	
	_entity_animations[entity_id] = anim_data
	_active_animations += 1
	
	animation_started.emit(entity_id, anim_type)
	print("[ConstructionAnimator] Started %s animation for %s" % [WorkAnimation.keys()[anim_type], entity_id])

func stop_animation(entity: Node) -> void:
	if not entity or not entity.has("entity_id"):
		return
	
	var entity_id = entity.entity_id if entity.has("entity_id") else str(entity.get_instance_id())
	
	if _entity_animations.has(entity_id):
		var anim = _entity_animations[entity_id]
		anim["state"] = AnimationType.IDLE
		_entity_animations.erase(entity_id)
		_active_animations -= 1
		
		animation_completed.emit(entity_id, anim["type"])
		print("[ConstructionAnimator] Stopped animation for %s" % entity_id)

func _process(delta: float) -> void:
	var completed: Array = []
	
	for entity_id in _entity_animations:
		var anim = _entity_animations[entity_id]
		
		if anim["state"] == AnimationType.WORKING:
			anim["progress"] += delta / anim["duration"]
			
			if anim["progress"] >= 1.0:
				anim["progress"] = 1.0
				anim["state"] = AnimationType.COMPLETED
				completed.append(entity_id)
				_apply_animation_frame(anim)
				animation_completed.emit(entity_id, anim["type"])
			else:
				_apply_animation_frame(anim)
				animation_updated.emit(entity_id, anim["progress"])

func _apply_animation_frame(anim: Dictionary) -> void:
	var entity = anim["entity"]
	if not is_instance_valid(entity):
		return
	
	var p = anim["progress"]
	var t = anim["type"]
	
	match t:
		WorkAnimation.PILING:
			_apply_piling_animation(entity, p)
		WorkAnimation.ROLLING:
			_apply_rolling_animation(entity, p)
		WorkAnimation.EXCAVATING:
			_apply_excavating_animation(entity, p)
		WorkAnimation.POURING:
			_apply_pouring_animation(entity, p)
		WorkAnimation.DISMANTLING:
			_apply_dismantling_animation(entity, p)

func _apply_piling_animation(entity: Node, progress: float) -> void:
	if entity.has("position"):
		var base_pos = entity.position
		var hammer_y = sin(progress * PI * 8) * 0.5
		var impact = 1.0 if progress > 0.9 else 1.0 - (abs(progress - 0.9) * 10)
		
		if entity.has("position"):
			var offset = Vector3(0, hammer_y, 0)
			if entity.has("hammer_mesh"):
				entity.hammer_mesh.position.y = hammer_y

func _apply_rolling_animation(entity: Node, progress: float) -> void:
	if entity.has("rotation"):
		var vibration = sin(progress * PI * 20) * 0.02
		entity.rotation.z = vibration
		
	if entity.has("position"):
		var forward = Vector3(0, 0, 1) if entity.has("forward_direction") else Vector3.FORWARD
		entity.position.y = abs(sin(progress * PI * 4)) * 0.05

func _apply_excavating_animation(entity: Node, progress: float) -> void:
	if entity.has("rotation"):
		var arm_angle = sin(progress * PI * 2) * 0.5
		entity.rotation.x = arm_angle
		
	if entity.has("bucket_open"):
		entity.bucket_open = sin(progress * PI) > 0.5

func _apply_pouring_animation(entity: Node, progress: float) -> void:
	if entity.has("pour_intensity"):
		entity.pour_intensity = sin(progress * PI)

func _apply_dismantling_animation(entity: Node, progress: float) -> void:
	if entity.has("dismantle_progress"):
		entity.dismantle_progress = progress
		
	if entity.has("opacity"):
		entity.opacity = 1.0 - progress

func _get_animation_duration(anim_type: WorkAnimation) -> float:
	match anim_type:
		WorkAnimation.PILING:
			return 3.0
		WorkAnimation.ROLLING:
			return 2.0
		WorkAnimation.EXCAVATING:
			return 4.0
		WorkAnimation.POURING:
			return 5.0
		WorkAnimation.DISMANTLING:
			return 6.0
	return 2.0

func get_active_animation_count() -> int:
	return _active_animations

func get_animation_state(entity_id: String) -> int:
	if _entity_animations.has(entity_id):
		return _entity_animations[entity_id]["state"]
	return AnimationType.IDLE

func get_animation_progress(entity_id: String) -> float:
	if _entity_animations.has(entity_id):
		return _entity_animations[entity_id]["progress"]
	return 0.0
