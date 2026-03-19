# VehicleEntity.gd
# 车辆实体 - 支持时间轴运动和碰撞检测
class_name VehicleEntity
extends ConstructionEntity

# ── 车辆类型 ──
enum VehicleType { DUMP_TRUCK, EXCAVATOR, BULLDOZER, CRANE, PAVER, ROLLER, GENERIC }

@export_group("车辆属性", "vehicle_")
@export var vehicle_type: VehicleType = VehicleType.GENERIC
@export var vehicle_name: String = "施工车辆"
@export var max_speed: float = 50.0  # km/h
@export var current_speed: float = 0.0

# ── 运动参数 ──
@export_group("运动参数", "movement_")
@export var follow_path: bool = true
@export var path_node: Node3D  # 绑定的路径
@export var speed_multiplier: float = 1.0

# ── 施工状态 ──
@export_group("施工状态", "work_")
@export var is_working: bool = false
@export var attached_road: String = ""  # 绑定的道路ID

# ── 内部变量 ──
var _path3d: Path3D
var _path_follow: PathFollow3D
var _current_progress: float = 0.0  # 0.0 - 1.0

func _ready() -> void:
	entity_type = "vehicle"
	super._ready()
	_setup_vehicle()

func _setup_vehicle() -> void:
	# 创建PathFollow用于沿路径移动
	_path_follow = PathFollow3D.new()
	_path_follow.name = "PathFollow"
	_path_follow.loop = true
	add_child(_path_follow)
	
	# 查找或创建Path3D
	if follow_path:
		_path3d = _find_parent_path()
		if _path3d:
			_path_follow.path = _path3d.get_path()
	
	# 设置默认碰撞形状
	_setup_vehicle_collision()
	
	# 设置默认Mesh (如果没有)
	_setup_default_mesh()

func _find_parent_path() -> Path3D:
	var parent = get_parent()
	while parent:
		if parent is Path3D:
			return parent
		parent = parent.get_parent()
	return null

func _setup_vehicle_collision() -> void:
	# 简化的盒形碰撞
	var shape = BoxShape3D.new()
	shape.size = Vector3(4, 2, 2)  # 4米长, 2米宽, 2米高
	_collision_shape.shape = shape
	_hover_shape.shape = shape

func _setup_default_mesh() -> void:
	# 简单Mesh用于调试
	var mesh_instance = _find_first_child_of_type(self, MeshInstance3D)
	if not mesh_instance:
		mesh_instance = MeshInstance3D.new()
		mesh_instance.name = "VehicleMesh"
		add_child(mesh_instance)
	
	# 创建简单车体
	var box = BoxMesh.new()
	box.size = Vector3(4, 2, 2)
	mesh_instance.mesh = box
	
	# 颜色根据车辆类型
	var mat = StandardMaterial3D.new()
	match vehicle_type:
		VehicleType.DUMP_TRUCK:
			mat.albedo_color = Color(1, 0.6, 0)  # 橙色
		VehicleType.EXCAVATOR:
			mat.albedo_color = Color(1, 1, 0)  # 黄色
		VehicleType.BULLDOZER:
			mat.albedo_color = Color(0.8, 0.8, 0.2)  # 土黄色
		VehicleType.CRANE:
			mat.albedo_color = Color(1, 0.8, 0.2)  # 金色
		VehicleType.PAVER:
			mat.albedo_color = Color(0.5, 0.5, 0.5)  # 灰色
		VehicleType.ROLLER:
			mat.albedo_color = Color(0.3, 0.3, 0.3)  # 深灰
		_:
			mat.albedo_color = Color(0.5, 0.5, 1)  # 蓝色
	
	mesh_instance.material_override = mat

# ── 时间轴运动 ──
func set_progress_from_timeline(day: int, total_days: int) -> void:
	# 根据时间计算位置
	var timeline_progress = clamp(float(day) / float(total_days), 0.0, 1.0)
	
	if _path_follow and _path_follow.path:
		_path_follow.progress_ratio = timeline_progress
		
		# 同步位置
		global_position = _path_follow.global_position
		global_rotation = _path_follow.global_rotation
	
	# 更新速度
	current_speed = max_speed * speed_multiplier * (1.0 - timeline_progress * 0.5)

# ── 沿路径移动 ──
func move_to_position(progress: float) -> void:
	_current_progress = clamp(progress, 0.0, 1.0)
	if _path_follow and _path_follow.path:
		_path_follow.progress_ratio = _current_progress
		global_position = _path_follow.global_position
		global_rotation = _path_follow.global_rotation

func move_forward(delta: float) -> void:
	if _path_follow and _path_follow.path:
		var move_amount = (max_speed * speed_multiplier * delta) / 1000.0
		_path_follow.progress += move_amount
		global_position = _path_follow.global_position
		global_rotation = _path_follow.global_rotation

func move_backward(delta: float) -> void:
	move_forward(-delta)

# ── 工作状态 ──
func start_working() -> void:
	is_working = true
	status = "working"
	print("[VehicleEntity] ", vehicle_name, " started working")

func stop_working() -> void:
	is_working = false
	status = "idle"
	print("[VehicleEntity] ", vehicle_name, " stopped working")

# ── 绑定道路 ──
func attach_to_road(road_id: String) -> void:
	attached_road = road_id
	print("[VehicleEntity] Attached to road: ", road_id)

func detach_from_road() -> void:
	attached_road = ""
	print("[VehicleEntity] Detached from road")

# ── 绑定到道路并沿路径移动 ──
var _road_path_points: PackedVector3Array = PackedVector3Array()
var _path_index: int = 0
var _path_segment_progress: float = 0.0

func bind_to_road_path(path_points: PackedVector3Array) -> void:
	_road_path_points = path_points
	_path_index = 0
	_path_segment_progress = 0.0
	print("[VehicleEntity] Bound to road path with ", path_points.size(), " points")

func update_position_on_timeline(progress: float) -> void:
	if _road_path_points.size() < 2:
		return
	
	var total_length: float = 0.0
	var segment_lengths: Array = []
	
	for i in range(_road_path_points.size() - 1):
		var seg_len = _road_path_points[i].distance_to(_road_path_points[i + 1])
		segment_lengths.append(seg_len)
		total_length += seg_len
	
	if total_length <= 0.0:
		return
	
	var target_distance = progress * total_length
	var accumulated: float = 0.0
	
	for i in range(segment_lengths.size()):
		if accumulated + segment_lengths[i] >= target_distance:
			_path_index = i
			_path_segment_progress = (target_distance - accumulated) / segment_lengths[i] if segment_lengths[i] > 0 else 0.0
			break
		accumulated += segment_lengths[i]
	
	var p0 = _road_path_points[_path_index]
	var p1 = _road_path_points[_path_index + 1] if _path_index + 1 < _road_path_points.size() else p0
	
	global_position = p0.lerp(p1, _path_segment_progress)
	
	var direction = (p1 - p0).normalized()
	if direction.length() > 0.1:
		global_rotation.y = atan2(direction.x, direction.z)

# ── 碰撞检测回调 ──
func _on_collision(other_entity: Node) -> void:
	if other_entity is ConstructionEntity:
		print("[VehicleEntity] Collision with: ", other_entity.entity_name)
		# 可以触发事件或停止移动

# ── 数据导出 ──
func export_model_data() -> Dictionary:
	var data = super.export_model_data()
	data["vehicle_specific"] = {
		"vehicle_type": VehicleType.keys()[vehicle_type],
		"vehicle_name": vehicle_name,
		"max_speed": max_speed,
		"current_speed": current_speed,
		"is_working": is_working,
		"attached_road": attached_road,
		"path_progress": _current_progress
	}
	return data

# ── 静态方法 ──
static func get_entity_type() -> String:
	return "vehicle"

static func get_vehicle_type_name(vtype: VehicleType) -> String:
	return VehicleType.keys()[vtype]
