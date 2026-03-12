# BridgeEntity.gd
# 桥梁实体 - 继承PrecisionEntity
# 支持: 多种桥型、精确建模、时间轴、边界
class_name BridgeEntity
extends PrecisionEntity

# ============================================================
# 桥梁类型
# ============================================================
enum BridgeType {
	BEAM_BRIDGE,    # 梁桥
	ARCH_BRIDGE,    # 拱桥
	CABLE_BRIDGE,   # 斜拉桥
	SUSPENSION_BRIDGE  # 悬索桥
}

# ============================================================
# 导出属性
# ============================================================
@export_group("桥梁属性", "bridge_")
@export var bridge_type: BridgeType = BridgeType.BEAM_BRIDGE
@export var span_count: int = 1  # 跨数
@export var span_lengths: Array = []  # 每跨长度
@export var total_length: float = 0  # 总长
@export var bridge_width: float = 0  # 桥宽
@export var design_load: String = "公路-I级"  # 设计荷载

@export_group("结构部件", "components_")
@export var pile_ids: Array = []  # 桩基ID列表
@export var cap_ids: Array = []  # 承台ID列表
@export var pier_ids: Array = []  # 墩柱ID列表
@export var beam_ids: Array = []  # 梁体ID列表
@export var deck_id: String = ""  # 桥面ID

@export_group("施工信息", "construction_")
@export var start_pier: int = 0  # 起始墩号
@export var end_pier: int = 0  # 结束墩号

# ============================================================
# 内部变量
# ============================================================
var _bridge_mesh: MeshInstance3D

func _ready() -> void:
	entity_type = "bridge"
	category = EntityCategory.BRIDGE
	precision_level = PrecisionLevel.NORMAL  # 0.01m 构件级
	
	super._ready()
	
	# 默认边界
	_setup_default_boundary()
	_generate_bridge_mesh()

func _setup_default_boundary() -> void:
	# 桥梁边界 = 桥面边缘 + 两侧
	if total_length > 0 and bridge_width > 0:
		var boundary = PackedVector3Array()
		# 左侧边界
		boundary.append(position + Vector3(0, 0, -bridge_width/2))
		boundary.append(position + Vector3(total_length, 0, -bridge_width/2))
		# 右侧边界
		boundary.append(position + Vector3(total_length, 0, bridge_width/2))
		boundary.append(position + Vector3(0, 0, bridge_width/2))
		boundary.append(position + Vector3(0, 0, -bridge_width/2))
		set_boundary(boundary, BoundaryType.EDGE, true)

func _generate_bridge_mesh() -> void:
	# 创建桥梁Mesh
	_mesh_instance = MeshInstance3D.new()
	_mesh_instance.name = "BridgeMesh"
	add_child(_mesh_instance)
	
	# 根据桥梁类型生成不同Mesh
	match bridge_type:
		BridgeType.BEAM_BRIDGE:
			_generate_beam_bridge_mesh()
		BridgeType.ARCH_BRIDGE:
			_generate_arch_bridge_mesh()
		BridgeType.CABLE_BRIDGE:
			_generate_cable_bridge_mesh()
		BridgeType.SUSPENSION_BRIDGE:
			_generate_suspension_bridge_mesh()

func _generate_beam_bridge_mesh() -> void:
	# 简化的梁桥Mesh
	var mesh = BoxMesh.new()
	mesh.size = Vector3(total_length, 2, bridge_width)
	_mesh_instance.mesh = mesh

func _generate_arch_bridge_mesh() -> void:
	# 拱桥Mesh (简化)
	var mesh = BoxMesh.new()
	mesh.size = Vector3(total_length, 3, bridge_width)
	_mesh_instance.mesh = mesh

func _generate_cable_bridge_mesh() -> void:
	# 斜拉桥Mesh
	var mesh = BoxMesh.new()
	mesh.size = Vector3(total_length, 1.5, bridge_width)
	_mesh_instance.mesh = mesh

func _generate_suspension_bridge_mesh() -> void:
	# 悬索桥Mesh
	var mesh = BoxMesh.new()
	mesh.size = Vector3(total_length, 1.5, bridge_width)
	_mesh_instance.mesh = mesh

# ============================================================
# 阶段变化回调
# ============================================================
func _on_phase_changed(new_phase: String) -> void:
	super._on_phase_changed(new_phase)
	
	match new_phase:
		"planning":
			_set_bridge_color(Color(0.8, 0.8, 1.0, 0.5))
		"structure":
			_set_bridge_color(Color(0.6, 0.4, 0.2, 0.8))
		"completed":
			_set_bridge_color(Color(0.3, 0.3, 0.3, 1.0))

func _set_bridge_color(color: Color) -> void:
	if _mesh_instance:
		var mat = StandardMaterial3D.new()
		mat.albedo_color = color
		if color.a < 1.0:
			mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		_mesh_instance.material_override = mat

# ============================================================
# 数据导出
# ============================================================
func export_full_data() -> Dictionary:
	var data = super.export_full_data()
	data["bridge_specific"] = {
		"bridge_type": BridgeType.keys()[bridge_type],
		"span_count": span_count,
		"span_lengths": span_lengths,
		"total_length": total_length,
		"bridge_width": bridge_width,
		"design_load": design_load,
		"pile_count": pile_ids.size(),
		"pier_count": pier_ids.size(),
		"components": {
			"piles": pile_ids,
			"caps": cap_ids,
			"piers": pier_ids,
			"beams": beam_ids,
			"deck": deck_id
		}
	}
	return data

# ============================================================
# 静态方法
# ============================================================
static func get_entity_type() -> String:
	return "bridge"

static func get_bridge_type_name(btype: BridgeType) -> String:
	return BridgeType.keys()[btype]
