# ConstructionEntity.gd
# 建筑实体基类 - 所有可交互实体的父类
# 支持: 碰撞检测, 3D交互, 属性修改, 精确建模, 时间轴运动
class_name ConstructionEntity
extends Node3D

# ── 实体标识 ──
@export_group("实体标识", "entity_")
@export var entity_id: String = ""
@export var entity_name: String = ""
@export var entity_type: String = "generic"  # road, vehicle, bridge, tunnel, building

# ── 碰撞检测 ──
@export_group("碰撞设置", "collision_")
@export var collision_enabled: bool = true
@export var collision_layer: int = 1
@export var collision_mask: int = 1

# ── 交互设置 ──
@export_group("交互设置", "interaction_")
@export var interactable: bool = true
@export var highlight_on_hover: bool = true
@export var highlight_color: Color = Color(1, 1, 0, 0.3)

# ── 属性系统 ──
@export_group("实体属性", "props_")
@export var phase: String = "planning"
@export var progress: float = 0.0  # 0.0 - 1.0
@export var status: String = "idle"  # idle, working, completed, delayed

# ── 精确建模数据 ──
@export_group("建模数据", "model_")
@export var mesh_data: Dictionary = {}  # 存储精确Mesh数据

# ── 时间轴动画 ──
@export_group("时间轴", "timeline_")
@export var animation_player: AnimationPlayer
@export var auto_animate: bool = false

# ── 信号 ──
signal entity_clicked(entity: ConstructionEntity)
signal entity_hovered(entity: ConstructionEntity, hovered: bool)
signal entity_modified(entity: ConstructionEntity, property: String, old_value, new_value)
signal phase_changed(old_phase: String, new_phase: String)
signal progress_changed(old_progress: float, new_progress: float)

# ── 内部变量 ──
var _static_body: StaticBody3D
var _collision_shape: CollisionShape3D
var _area: Area3D
var _hover_shape: CollisionShape3D
var _original_material: Material
var _is_highlighted: bool = false

func _ready() -> void:
	_setup_collision()
	_setup_interaction()
	_setup_mesh_data()
	print("[ConstructionEntity] Ready: ", entity_name, " (", entity_type, ")")

# ── 碰撞设置 ──
func _setup_collision() -> void:
	if not collision_enabled:
		return
	
	# StaticBody for physics
	_static_body = StaticBody3D.new()
	_static_body.name = "StaticBody"
	_static_body.collision_layer = collision_layer
	_static_body.collision_mask = collision_mask
	add_child(_static_body)
	
	# 默认碰撞形状 (会被子类覆盖)
	_collision_shape = CollisionShape3D.new()
	_collision_shape.name = "CollisionShape"
	_static_body.add_child(_collision_shape)

func _setup_interaction() -> void:
	if not interactable:
		return
	
	# Area for mouse detection
	_area = Area3D.new()
	_area.name = "InteractionArea"
	_area.collision_layer = 0
	_area.collision_mask = 0  # 不参与物理检测
	add_child(_area)
	
	# 碰撞形状用于检测
	_hover_shape = CollisionShape3D.new()
	_hover_shape.name = "HoverShape"
	_area.add_child(_hover_shape)
	
	# 连接信号
	_area.mouse_entered.connect(_on_mouse_entered)
	_area.mouse_exited.connect(_on_mouse_exited)
	
	# 点击检测
	set_process_input(true)

# ── 精确建模数据采集 ──
func _setup_mesh_data() -> void:
	# 获取Mesh数据
	var mesh_instance = _find_first_child_of_type(self, MeshInstance3D)
	if mesh_instance and mesh_instance.mesh:
		var mesh = mesh_instance.mesh
		mesh_data = {
			"vertex_count": mesh.get_vertex_count() if mesh.get_vertex_count() > 0 else 0,
			"primitive_type": mesh.get_primitive_type(),
			"aabb": {
				"position": [mesh.get_aabb().position.x, mesh.get_aabb().position.y, mesh.get_aabb().position.z],
				"size": [mesh.get_aabb().size.x, mesh.get_aabb().size.y, mesh.get_aabb().size.z]
			}
		}

func _find_first_child_of_type(node: Node, type: String) -> Node:
	for child in node.get_children():
		if child.get_class() == type:
			return child
		var found = _find_first_child_of_type(child, type)
		if found:
			return found
	return null

# ── 交互事件 ──
func _on_mouse_entered() -> void:
	if highlight_on_hover:
		_set_highlight(true)
	entity_hovered.emit(self, true)

func _on_mouse_exited() -> void:
	if highlight_on_hover:
		_set_highlight(false)
	entity_hovered.emit(self, false)

func _input_event(_camera, event, _position, _normal, _shape_idx):
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		entity_clicked.emit(self)

func _set_highlight(enabled: bool) -> void:
	_is_highlighted = enabled
	var mesh_instance = _find_first_child_of_type(self, MeshInstance3D)
	if mesh_instance:
		if enabled:
			# 创建高亮材质
			var highlight_mat = StandardMaterial3D.new()
			highlight_mat.albedo_color = highlight_color
			highlight_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			mesh_instance.material_override = highlight_mat
		else:
			mesh_instance.material_override = _original_material

# ── 属性修改 ──
func set_property(prop_name: String, value) -> void:
	var old_value = get(prop_name)
	if old_value == value:
		return
	
	set(prop_name, value)
	entity_modified.emit(self, prop_name, old_value, value)
	
	# 特殊处理
	match prop_name:
		"phase":
			phase_changed.emit(old_value, value)
			_on_phase_changed(value)
		"progress":
			progress_changed.emit(old_value, value)
			_on_progress_changed(value)

func get_property(prop_name: String):
	return get(prop_name)

# ── 阶段变化回调 ──
func _on_phase_changed(new_phase: String) -> void:
	# 子类可重写实现具体效果
	print("[ConstructionEntity] Phase changed: ", new_phase)

# ── 进度变化回调 ──
func _on_progress_changed(new_progress: float) -> void:
	# 子类可重写实现具体效果
	pass

# ── 精确数据导出 ──
func export_model_data() -> Dictionary:
	var data = {
		"entity_id": entity_id,
		"entity_name": entity_name,
		"entity_type": entity_type,
		"position": [position.x, position.y, position.z],
		"rotation": [rotation.x, rotation.y, rotation.z],
		"scale": [scale.x, scale.y, scale.z],
		"phase": phase,
		"progress": progress,
		"status": status,
		"mesh_data": mesh_data,
		"properties": _get_all_properties()
	}
	return data

func _get_all_properties() -> Dictionary:
	var props = {}
	for prop in get_property_list():
		if prop.usage & PROPERTY_USAGE_SCRIPT_VARIABLE:
			props[prop.name] = get(prop.name)
	return props

# ── 时间轴控制 ──
func play_animation(anim_name: String) -> void:
	if animation_player and animation_player.has_animation(anim_name):
		animation_player.play(anim_name)

func set_progress_from_timeline(day: int, total_days: int) -> void:
	# 根据时间轴计算进度
	var new_progress = clamp(float(day) / float(total_days), 0.0, 1.0)
	set_property("progress", new_progress)

# ── 静态方法 ──
static func get_entity_type() -> String:
	return "generic"
