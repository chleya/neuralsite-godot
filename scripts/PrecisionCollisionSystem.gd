# PrecisionCollisionSystem.gd
# 精确碰撞检测系统 - 静态精确 + 动态包围盒
# 核心设计：主体静态精确检测，施工动态包围盒检测
class_name PrecisionCollisionSystem
extends Node

# ============================================================
# 碰撞类型
# ============================================================
enum CollisionType {
	STATIC_EXACT,    # 静态精确检测 - 主体结构
	DYNAMIC_BOX,     # 动态包围盒 - 机械人员
}

# ============================================================
# 检测对象
# ============================================================
enum DetectedObject {
	STRUCTURE,        # 结构物
	VEHICLE,         # 车辆
	MACHINE,          # 机械设备
	PERSONNEL,       # 人员
	MATERIAL,         # 材料
	BOUNDARY,        # 边界
}

# ============================================================
# 导出配置
# ============================================================
@export_group("静态检测", "static_")
@export var static_detection_enabled: bool = true
@export var static_precision: float = 0.01  # 0.01m精确检测

@export_group("动态检测", "dynamic_")
@export var dynamic_detection_enabled: bool = true
@export var dynamic_box_size: Vector3 = Vector3(4, 2, 2)  # 默认车辆尺寸
@export var check_interval: float = 0.1  # 检测间隔秒

# ============================================================
# 实体注册
# ============================================================
var _static_entities: Array[Node3D] = []   # 静态实体
var _dynamic_objects: Array[Dictionary] = []  # 动态对象
var _collision_pairs: Array[Dictionary] = []   # 碰撞对

# ============================================================
# 信号
# ============================================================
signal static_collision(entity_a: Node3D, entity_b: Node3D, point: Vector3)
signal dynamic_collision(dynamic: Dictionary, static_entity: Node3D, point: Vector3)
signal boundary_violation(entity: Node3D, boundary_type: String, point: Vector3)
signal safety_warning(warning_type: String, description: String)

# ============================================================
# 内部变量
# ============================================================
var _timer: float = 0.0

func _ready() -> void:
	print("[PrecisionCollisionSystem] Initialized")

func _process(delta: float) -> void:
	if not dynamic_detection_enabled:
		return
	
	_timer += delta
	if _timer >= check_interval:
		_timer = 0.0
		_check_dynamic_collisions()

# ============================================================
# 实体注册
# ============================================================
func register_static_entity(entity: Node3D, precision: float = 0.01) -> void:
	if entity not in _static_entities:
		_static_entities.append(entity)
		entity.set_meta("collision_precision", precision)
		print("[PrecisionCollisionSystem] Registered static: ", entity.name)

func unregister_static_entity(entity: Node3D) -> void:
	if entity in _static_entities:
		_static_entities.erase(entity)

func register_dynamic_object(
	obj: Node3D,
	object_type: DetectedObject,
	box_size: Vector3 = Vector3.ZERO
) -> void:
	var dynamic_obj = {
		"node": obj,
		"type": object_type,
		"box_size": box_size if box_size != Vector3.ZERO else dynamic_box_size,
		"velocity": Vector3.ZERO,
		"last_position": obj.global_position
	}
	_dynamic_objects.append(dynamic_obj)
	print("[PrecisionCollisionSystem] Registered dynamic: ", obj.name, " type: ", DetectedObject.keys()[object_type])

func unregister_dynamic_object(obj: Node3D) -> void:
	_dynamic_objects = _dynamic_objects.filter(func(d): return d["node"] != obj)

# ============================================================
# 静态精确检测
# ============================================================
func check_static_collision(entity_a: Node3D, entity_b: Node3D) -> Dictionary:
	if not static_detection_enabled:
		return {"colliding": false}
	
	var result = {
		"colliding": false,
		"point": Vector3.ZERO,
		"distance": 999.0,
		"precision": static_precision
	}
	
	# 获取两实体的Mesh
	var mesh_a = _get_entity_mesh(entity_a)
	var mesh_b = _get_entity_mesh(entity_b)
	
	if mesh_a and mesh_b:
		# 简化的Mesh碰撞检测
		# 实际应使用Godot的Shape3D检测
		var aabb_a = mesh_a.get_aabb()
		var aabb_b = mesh_b.get_aabb()
		
		# 转换到世界坐标
		aabb_a.position += entity_a.global_position
		aabb_b.position += entity_b.global_position
		
		if aabb_a.intersects(aabb_b):
			result["colliding"] = true
			result["point"] = aabb_a.get_endpoint(0).lerp(aabb_b.get_endpoint(0), 0.5)
			result["distance"] = 0.0
			static_collision.emit(entity_a, entity_b, result["point"])
	
	return result

func check_all_static_collisions() -> Array:
	var collisions = []
	for i in range(_static_entities.size()):
		for j in range(i + 1, _static_entities.size()):
			var entity_a = _static_entities[i]
			var entity_b = _static_entities[j]
			var result = check_static_collision(entity_a, entity_b)
			if result["colliding"]:
				collisions.append(result)
				_collision_pairs.append({
					"type": "static",
					"entity_a": entity_a.name,
					"entity_b": entity_b.name,
					"point": result["point"]
				})
	return collisions

# ============================================================
# 动态包围盒检测
# ============================================================
func _check_dynamic_collisions() -> void:
	for dynamic in _dynamic_objects:
		var obj = dynamic["node"]
		if not is_instance_valid(obj):
			continue
		
		var obj_pos = obj.global_position
		var box_size = dynamic["box_size"]
		
		# 更新速度
		dynamic["velocity"] = (obj_pos - dynamic["last_position"]) / check_interval
		dynamic["last_position"] = obj_pos
		
		# 检测与静态实体的碰撞
		for static_entity in _static_entities:
			if not is_instance_valid(static_entity):
				continue
			
			if _check_box_vs_entity(obj_pos, box_size, static_entity):
				var collision_point = _calculate_collision_point(obj_pos, static_entity.global_position)
				dynamic_collision.emit(dynamic, static_entity, collision_point)
		
		# 检测边界
		_check_boundary_violation(obj_pos, box_size, dynamic.get("boundaries", []))

func _check_box_vs_entity(box_center: Vector3, box_size: Vector3, entity: Node3D) -> bool:
	# 简化的AABB检测
	var entity_mesh = _get_entity_mesh(entity)
	if not entity_mesh:
		return false
	
	var aabb = entity_mesh.get_aabb()
	aabb.position += entity.global_position
	
	var box_aabb = AABB(
		box_center - box_size / 2,
		box_size
	)
	
	return box_aabb.intersects(aabb)

func _calculate_collision_point(dynamic_pos: Vector3, static_pos: Vector3) -> Vector3:
	return dynamic_pos.lerp(static_pos, 0.5)

# ============================================================
# 边界检测
# ============================================================
func _check_boundary_violation(obj_pos: Vector3, box_size: Vector3, boundaries: Array) -> void:
	# 检测是否超出边界
	for boundary in boundaries:
		var points = boundary.get("points", PackedVector3Array())
		if points.size() < 2:
			continue
		
		# 简化：检测点到线段距离
		for i in range(points.size() - 1):
			var p1 = points[i]
			var p2 = points[i + 1]
			var dist = _point_to_segment_distance(obj_pos, p1, p2)
			
			if dist < box_size.x / 2:  # 超出边界
				boundary_violation.emit(null, boundary.get("type", "unknown"), obj_pos)
				safety_warning.emit("BOUNDARY", "Object outside boundary at point ", obj_pos)

func check_boundary_for_entity(entity: Node3D, boundary_points: PackedVector3Array) -> bool:
	var pos = entity.global_position
	var box_size = dynamic_box_size  # 默认尺寸
	
	for i in range(boundary_points.size() - 1):
		var p1 = boundary_points[i]
		var p2 = boundary_points[i + 1]
		var dist = _point_to_segment_distance(pos, p1, p2)
		
		if dist < box_size.x / 2:
			return true  # 在边界内
	
	return false

# ============================================================
# 辅助方法
# ============================================================
func _get_entity_mesh(entity: Node3D) -> MeshInstance3D:
	# 递归查找MeshInstance3D
	if entity is MeshInstance3D:
		return entity
	
	for child in entity.get_children():
		if child is MeshInstance3D:
			return child
		var found = _get_entity_mesh(child)
		if found:
			return found
	
	return null

func _point_to_segment_distance(point: Vector3, a: Vector3, b: Vector3) -> float:
	var ab = b - a
	var ap = point - a
	var t = clamp(ap.dot(ab) / ab.dot(ab), 0.0, 1.0)
	var closest = a + ab * t
	return point.distance_to(closest)

# ============================================================
# 状态查询
# ============================================================
func get_collision_summary() -> Dictionary:
	return {
		"static_entities": _static_entities.size(),
		"dynamic_objects": _dynamic_objects.size(),
		"collision_pairs": _collision_pairs.size(),
		"recent_collisions": _collision_pairs.slice(-10)
	}

func clear_collision_history() -> void:
	_collision_pairs.clear()
