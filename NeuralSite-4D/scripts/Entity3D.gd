extends Node3D
class_name Entity3D

# 工程实体3D渲染节点
# 对应"毫米级空间+标签"架构中的"实体层（贴纸）"

# 实体数据
var entity_data: Dictionary = {}

# 渲染属性
var elevation_base: float = 0.0
var mesh_instance: MeshInstance3D
var collision_shape: CollisionShape3D
var label_3d: Label3D

# 状态颜色映射
const STATE_COLORS = {
	"planning": Color(0.231, 0.510, 0.965, 0.5),   # 蓝色半透明
	"clearing": Color(0.976, 0.451, 0.086, 0.8),   # 橙色
	"earthwork": Color(0.573, 0.251, 0.055, 0.8),   # 棕色
	"pavement": Color(0.420, 0.451, 0.502, 0.9),    # 灰色
	"finishing": Color(0.133, 0.773, 0.369, 0.9),   # 浅绿色
	"completed": Color(0.216, 0.255, 0.318, 1.0)    # 深灰色
}

# 实体类型颜色
const ENTITY_COLORS = {
	"roadbed": Color(0.6, 0.4, 0.2),
	"bridge": Color(0.7, 0.7, 0.7),
	"culvert": Color(0.4, 0.4, 0.6),
	"tunnel": Color(0.3, 0.3, 0.3),
	"slope": Color(0.5, 0.6, 0.3),
	"drainage": Color(0.3, 0.5, 0.7)
}

func _ready() -> void:
	_setup_node()

func _setup_node() -> void:
	"""初始化节点组件"""
	# 创建MeshInstance3D用于渲染
	mesh_instance = MeshInstance3D.new()
	add_child(mesh_instance)

	# 创建碰撞体（可选）
	collision_shape = CollisionShape3D.new()
	add_child(collision_shape)

	# 创建3D标签
	label_3d = Label3D.new()
	label_3d.name = "Label3D"
	label_3d.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label_3d.font_size = 32
	label_3d.position = Vector3(0, 10, 0)
	add_child(label_3d)

func update_visual(state: Dictionary) -> void:
	"""根据状态更新3D显示"""
	if entity_data.is_empty():
		return

	var state_type = state.get("state_type", "planning")
	var progress = state.get("progress", 0.0)

	# 创建几何体
	_create_geometry(state_type, progress)

	# 设置材质颜色
	_set_material_color(state_type)

	# 更新标签
	_update_label(state_type, progress)

func _create_geometry(state_type: String, progress: float) -> void:
	"""创建3D几何体"""
	var entity_type = entity_data.get("entity_type", "roadbed")
	var width = entity_data.get("width", 10.0)
	var height = entity_data.get("height", 2.0)
	var start_station = entity_data.get("start_station", "K0+000")
	var end_station = entity_data.get("end_station", "K0+100")
	var lateral_offset = entity_data.get("lateral_offset", 0.0)

	# 计算长度（基于桩号差）
	var length = SpaceService.calculate_distance(start_station, end_station)

	# 根据实体类型创建不同的几何体
	match entity_type:
		"roadbed":
			_create_roadbed_geometry(length, width, height)
		"bridge":
			_create_bridge_geometry(length, width, height)
		"culvert":
			_create_culvert_geometry(length, width, height)
		"slope":
			_create_slope_geometry(length, width, height)
		"drainage":
			_create_drainage_geometry(length, width, height)
		_:
			_create_default_geometry(length, width, height)

func _create_roadbed_geometry(length: float, width: float, height: float) -> void:
	"""创建路基几何体（长方体）"""
	var box = BoxMesh.new()
	box.size = Vector3(length, height, width)
	mesh_instance.mesh = box

	# 创建碰撞体
	var shape = BoxShape3D.new()
	shape.size = box.size
	collision_shape.shape = shape

	# 设置位置（居中）
	mesh_instance.position = Vector3(length / 2, height / 2, 0)

func _create_bridge_geometry(length: float, width: float, height: float) -> void:
	"""创建桥梁几何体（简化：带墩的长方体）"""
	# 主梁
	var box = BoxMesh.new()
	box.size = Vector3(length, height * 0.6, width)
	mesh_instance.mesh = box

	# 墩柱
	var pillar = BoxMesh.new()
	pillar.size = Vector3(length * 0.1, height, width * 0.3)

	var pillar_mesh = MeshInstance3D.new()
	pillar_mesh.mesh = pillar
	pillar_mesh.position = Vector3(length * 0.25, -height * 0.2, 0)
	add_child(pillar_mesh)

	var pillar_mesh2 = MeshInstance3D.new()
	pillar_mesh2.mesh = pillar
	pillar_mesh2.position = Vector3(length * 0.75, -height * 0.2, 0)
	add_child(pillar_mesh2)

	# 碰撞体
	var shape = BoxShape3D.new()
	shape.size = box.size
	collision_shape.shape = shape

	mesh_instance.position = Vector3(length / 2, height * 0.8, 0)

func _create_culvert_geometry(length: float, width: float, height: float) -> void:
	"""创建涵洞几何体（圆管）"""
	var cylinder = CylinderMesh.new()
	cylinder.top_radius = width / 2
	cylinder.bottom_radius = width / 2
	cylinder.height = length
	mesh_instance.mesh = cylinder

	# 旋转90度使其沿线路方向
	mesh_instance.rotation_degrees.x = 90

	# 碰撞体
	var shape = CylinderShape3D.new()
	shape.radius = width / 2
	shape.height = length
	collision_shape.shape = shape

func _create_slope_geometry(length: float, width: float, height: float) -> void:
	"""创建边坡几何体（斜面）"""
	var prism = PrismMesh.new()
	prism.size = Vector3(length, height, width)
	mesh_instance.mesh = prism

	mesh_instance.rotation_degrees.z = 30  # 倾斜

	# 碰撞体
	var shape = BoxShape3D.new()
	shape.size = Vector3(length, height, width)
	collision_shape.shape = shape

func _create_drainage_geometry(length: float, width: float, height: float) -> void:
	"""创建排水沟几何体（梯形）"""
	var box = BoxMesh.new()
	box.size = Vector3(length, height, width)
	mesh_instance.mesh = box

	mesh_instance.position = Vector3(length / 2, -height / 2, 0)

	# 碰撞体
	var shape = BoxShape3D.new()
	shape.size = box.size
	collision_shape.shape = shape

func _create_default_geometry(length: float, width: float, height: float) -> void:
	"""创建默认几何体"""
	_create_roadbed_geometry(length, width, height)

func _set_material_color(state_type: String) -> void:
	"""设置材质颜色"""
	var color = STATE_COLORS.get(state_type, STATE_COLORS["planning"])

	# 创建标准材质
	var material = StandardMaterial3D.new()
	material.albedo_color = color
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA if color.a < 1.0 else BaseMaterial3D.TRANSPARENCY_DISABLED

	# 根据实体类型添加一些变化
	var entity_type = entity_data.get("entity_type", "roadbed")
	if entity_type in ENTITY_COLORS:
		var entity_color = ENTITY_COLORS[entity_type]
		material.albedo_color = color.lerp(entity_color, 0.3)

	mesh_instance.material_override = material

func _update_label(state_type: String, progress: float) -> void:
	"""更新3D标签"""
	var name = entity_data.get("name", "未知实体")
	var state_text = _get_state_text(state_type)

	label_3d.text = "%s\n%s (%.0f%%)" % [name, state_text, progress]

func _get_state_text(state_type: String) -> String:
	"""获取状态文本"""
	var state_texts = {
		"planning": "规划",
		"clearing": "清表",
		"earthwork": "土方",
		"pavement": "路面",
		"finishing": "收尾",
		"completed": "完成"
	}
	return state_texts.get(state_type, "未知")

func get_entity_info() -> Dictionary:
	"""获取实体信息"""
	return {
		"id": name,
		"entity_type": entity_data.get("entity_type", "unknown"),
		"name": entity_data.get("name", "未知实体"),
		"start_station": entity_data.get("start_station", ""),
		"end_station": entity_data.get("end_station", ""),
		"position": position,
		"elevation": elevation_base
	}
