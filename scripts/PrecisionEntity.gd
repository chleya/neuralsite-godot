# PrecisionEntity.gd
# 精确实体系统 - 支持动态精度、LOD、可变边界
# 核心设计：精度等级、边界系统、LOD动态切换
class_name PrecisionEntity
extends Node3D

# ============================================================
# 精度等级定义
# ============================================================
enum PrecisionLevel {
	ROUGH = 0.1,      # 0.1m - 汽车、房子、地形
	NORMAL = 0.01,    # 0.01m - 桥梁、挡墙、路基
	PRECISE = 0.001   # 0.001m - 轴线控制
}

# ============================================================
# 实体类型
# ============================================================
enum EntityCategory {
	INFRASTRUCTURE,  # 基础设施 - 道路、桥梁、隧道
	EARTHWORKS,      # 土方工程 - 路基、填筑
	STRUCTURE,       # 结构物 - 挡墙、护栏
	ANCILLARY,       # 附属设施 - 侧石、排水
	VEHICLE,         # 车辆机械
	ENVIRONMENT,     # 环境 - 地形、房屋
}

# ============================================================
# 导出属性
# ============================================================
@export_group("基础信息", "base_")
@export var entity_id: String = ""
@export var entity_name: String = ""
@export var category: EntityCategory = EntityCategory.INFRASTRUCTURE

@export_group("精度控制", "precision_")
@export var precision_level: PrecisionLevel = PrecisionLevel.NORMAL
@export var auto_precision: bool = true  # 根据距离自动调整

@export_group("LOD控制", "lod_")
@export var lod_near: float = 50.0    # 近处距离
@export var lod_mid: float = 200.0    # 中间距离
@export var lod_far: float = 500.0    # 远处距离
@export var current_lod: int = 1      # 当前LOD等级 0=近,1=中,2=远

@export_group("边界系统", "boundary_")
@export var has_boundary: bool = true
@export var boundary_points: PackedVector3Array = PackedVector3Array()
@export var boundary_closed: bool = true

@export_group("属性", "props_")
@export var phase: String = "planning"
@export var progress: float = 0.0
@export var progress_type: String = "quantity"  # "quantity"=工程量, "cost"=总价
@export var quantity: float = 0.0    # 工程量
@export var unit_price: float = 0.0  # 单价
@export var total_cost: float = 0.0  # 总价

@export_group("时间轴", "timeline_")
@export var start_date: String = ""
@export var planned_days: int = 180
@export var actual_start_date: String = ""
@export var actual_end_date: String = ""
@export var time_events: Array = []  # 时间轴事件记录

# ============================================================
# 边界类型
# ============================================================
enum BoundaryType {
	EDGE,           # 边缘边界
	CONSTRUCTION,   # 施工边界
	PROPERTY,       # 用地边界
	SAFEETY,        # 安全边界
	TEMPORARY,      # 临时边界
}

# ============================================================
# 内部变量
# ============================================================
var _mesh_instances: Array[MeshInstance3D] = []
var _boundary_meshes: Array[MeshInstance3D] = []
var _collision_shapes: Array[CollisionShape3D] = []
var _parent_node: Node3D

# ============================================================
# 信号
# ============================================================
signal precision_changed(old_level: PrecisionLevel, new_level: PrecisionLevel)
signal boundary_changed(boundary_type: BoundaryType, old_points: PackedVector3Array, new_points: PackedVector3Array)
signal lod_changed(old_lod: int, new_lod: int)
signal progress_updated(quantity_progress: float, cost_progress: float)
signal time_event_added(event: Dictionary)

func _ready() -> void:
	print("[PrecisionEntity] Ready: ", entity_name, " precision: ", _get_precision_value())

# ============================================================
# 精度控制
# ============================================================
func _get_precision_value() -> float:
	return precision_level

func set_precision(level: PrecisionLevel) -> void:
	var old = precision_level
	if old != level:
		precision_level = level
		precision_changed.emit(old, level)
		_regenerate_mesh()

func get_precision_for_category() -> PrecisionLevel:
	# 根据类别自动确定精度
	match category:
		EntityCategory.INFRASTRUCTURE:
			return PrecisionLevel.PRECISE
		EntityCategory.EARTHWORKS:
			return PrecisionLevel.NORMAL
		EntityCategory.STRUCTURE:
			return PrecisionLevel.PRECISE
		EntityCategory.ANCILLARY:
			return PrecisionLevel.NORMAL
		EntityCategory.VEHICLE:
			return PrecisionLevel.ROUGH
		EntityCategory.ENVIRONMENT:
			return PrecisionLevel.ROUGH
		_:
			return PrecisionLevel.NORMAL

# ============================================================
# LOD系统
# ============================================================
func update_lod(distance_to_camera: float) -> void:
	var old_lod = current_lod
	
	if distance_to_camera < lod_near:
		current_lod = 0  # 近：精细
	elif distance_to_camera < lod_mid:
		current_lod = 1  # 中：标准
	else:
		current_lod = 2  # 远：简化
	
	if old_lod != current_lod:
		lod_changed.emit(old_lod, current_lod)
		_apply_lod()

func _apply_lod() -> void:
	match current_lod:
		0:  # 近 - 精确模型
			_set_mesh_detail(1.0)
		1:  # 中 - 标准模型
			_set_mesh_detail(0.5)
		2:  # 远 - 简化模型
			_set_mesh_detail(0.1)

func _set_mesh_detail(detail: float) -> void:
	# 简化Mesh细节
	for mesh_inst in _mesh_instances:
		if mesh_inst and mesh_inst.mesh:
			# 可根据detail调整LOD
			pass

func _regenerate_mesh() -> void:
	# 根据精度重新生成Mesh
	pass

# ============================================================
# 边界系统
# ============================================================
func set_boundary(points: PackedVector3Array, boundary_type: BoundaryType = BoundaryType.EDGE, closed: bool = true) -> void:
	var old_points = boundary_points.duplicate()
	boundary_points = points
	boundary_closed = closed
	boundary_changed.emit(boundary_type, old_points, points)
	_generate_boundary_mesh(boundary_type)

func add_boundary_point(point: Vector3, index: int = -1) -> void:
	if index < 0:
		boundary_points.append(point)
	else:
		boundary_points.insert(index, point)
	_generate_boundary_mesh(BoundaryType.EDGE)

func remove_boundary_point(index: int) -> void:
	if index >= 0 and index < boundary_points.size():
		boundary_points.remove_at(index)
		_generate_boundary_mesh(BoundaryType.EDGE)

func move_boundary_point(index: int, new_position: Vector3) -> void:
	if index >= 0 and index < boundary_points.size():
		boundary_points[index] = new_position
		_generate_boundary_mesh(BoundaryType.EDGE)

func _generate_boundary_mesh(boundary_type: BoundaryType) -> void:
	if boundary_points.size() < 2:
		return
	
	# 创建边界线Mesh
	var mesh = ImmediateMesh.new()
	var mat = StandardMaterial3D.new()
	
	# 根据边界类型设置颜色
	match boundary_type:
		BoundaryType.EDGE:
			mat.albedo_color = Color.WHITE
		BoundaryType.CONSTRUCTION:
			mat.albedo_color = Color(1, 1, 0)  # 黄色
		BoundaryType.PROPERTY:
			mat.albedo_color = Color(0, 1, 0)  # 绿色
		BoundaryType.SAFEETY:
			mat.albedo_color = Color(1, 0, 0)  # 红色
		BoundaryType.TEMPORARY:
			mat.albedo_color = Color(1, 0.5, 0)  # 橙色
	
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	
	mesh.surface_begin(Mesh.PRIMITIVE_LINES, mat)
	for i in range(boundary_points.size()):
		mesh.surface_add_vertex(boundary_points[i])
	mesh.surface_end()
	
	# 更新或创建MeshInstance
	# (简化实现)
	print("[PrecisionEntity] Boundary updated with ", boundary_points.size(), " points")

# ============================================================
# 进度系统（两种）
# ============================================================
func set_progress(new_progress: float, progress_type: String = "quantity") -> void:
	progress = clamp(new_progress, 0.0, 1.0)
	self.progress_type = progress_type
	
	var qty_progress = 0.0
	var cost_progress = 0.0
	
	match progress_type:
		"quantity":
			qty_progress = progress
			cost_progress = progress  # 简化计算
		"cost":
			cost_progress = progress
			if total_cost > 0:
				qty_progress = (progress * total_cost) / (quantity * unit_price) if quantity > 0 and unit_price > 0 else 0
	
	progress_updated.emit(qty_progress, cost_progress)

func get_quantity_progress() -> float:
	if progress_type == "quantity":
		return progress
	else:
		# 从总价反推
		if total_cost > 0:
			return progress * total_cost / (quantity * unit_price) if quantity > 0 and unit_price > 0 else 0
	return 0.0

func get_cost_progress() -> float:
	if progress_type == "cost":
		return progress
	else:
		# 从工程量计算
		return progress * quantity * unit_price / total_cost if total_cost > 0 else 0

func calculate_total_cost() -> void:
	total_cost = quantity * unit_price
	print("[PrecisionEntity] Total cost: ", total_cost)

# ============================================================
# 时间轴系统
# ============================================================
func add_time_event(event_type: String, description: String, data: Dictionary = {}) -> void:
	var event = {
		"type": event_type,
		"description": description,
		"timestamp": Time.get_unix_time_from_system(),
		"date": Time.get_datetime_string_from_system(),
		"progress": progress,
		"data": data
	}
	time_events.append(event)
	time_event_added.emit(event)
	print("[PrecisionEntity] Time event: ", event_type)

func get_event_at_day(day: int) -> Array:
	# 返回指定日期的事件
	return time_events  # 简化实现

func get_past_state(day: int) -> Dictionary:
	# 回到过去状态
	var state = {
		"day": day,
		"phase": phase,
		"progress": 0.0,
		"events": []
	}
	# 根据事件重建历史状态
	for event in time_events:
		# 简化：取最近的事件
		pass
	return state

func predict_future_state(target_day: int) -> Dictionary:
	# 预测未来状态
	var days_elapsed = target_day - Time.get_unix_time_from_system() / 86400
	var predicted_progress = clamp(days_elapsed / planned_days, 0.0, 1.0)
	
	return {
		"day": target_day,
		"predicted_progress": predicted_progress,
		"predicted_phase": _phase_from_progress(predicted_progress)
	}

func _phase_from_progress(p: float) -> String:
	if p >= 1.0: return "completed"
	elif p >= 0.9: return "finishing"
	elif p >= 0.7: return "pavement"
	elif p >= 0.3: return "earthwork"
	elif p >= 0.1: return "clearing"
	else: return "planning"

# ============================================================
# 数据导出
# ============================================================
func export_full_data() -> Dictionary:
	return {
		"entity_id": entity_id,
		"entity_name": entity_name,
		"category": EntityCategory.keys()[category],
		"precision_level": PrecisionLevel.keys()[precision_level],
		"precision_value": _get_precision_value(),
		"lod": current_lod,
		"boundary": {
			"has_boundary": has_boundary,
			"point_count": boundary_points.size(),
			"closed": boundary_closed,
			"points": _points_to_array(boundary_points)
		},
		"progress": {
			"type": progress_type,
			"value": progress,
			"quantity": quantity,
			"unit_price": unit_price,
			"total_cost": total_cost
		},
		"timeline": {
			"start_date": start_date,
			"planned_days": planned_days,
			"events": time_events
		},
		"position": [position.x, position.y, position.z]
	}

func _points_to_array(points: PackedVector3Array) -> Array:
	var arr = []
	for p in points:
		arr.append([p.x, p.y, p.z])
	return arr
