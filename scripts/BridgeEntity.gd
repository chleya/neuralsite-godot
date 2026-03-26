# BridgeEntity.gd
# 桥梁实体 - 继承PrecisionEntity
# 支持: 多种桥型、精确建模、时间轴、边界、建设动画
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
# 建造阶段
# ============================================================
enum ConstructionStage {
	PLANNING,      # 规划
	FOUNDATION,    # 桩基
	SUBSTRUCTURE,  # 承台/基础
	PIER,          # 墩柱
	BEAM,          # 梁体
	DECK,          # 桥面
	FINISHING,     # 仕上げ
	COMPLETED      # 完成
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

@export_group("建设动画", "construction_anim_")
@export var construction_progress: float = 0.0  # 0.0 - 1.0
@export var anim_stage: ConstructionStage = ConstructionStage.PLANNING

# ============================================================
# 内部变量
# ============================================================
var _bridge_mesh: MeshInstance3D
var _foundation_mesh: MeshInstance3D
var _pier_meshes: Array = []
var _beam_mesh: MeshInstance3D
var _deck_mesh: MeshInstance3D

var _pile_height: float = 15.0
var _pier_height: float = 20.0
var _beam_height: float = 2.0
var _deck_height: float = 0.5

func _ready() -> void:
	entity_type = "bridge"
	category = EntityCategory.STRUCTURE
	precision_level = PrecisionLevel.NORMAL  # 0.01m 构件级
	
	super._ready()
	
	# 默认边界
	_setup_default_boundary()
	_generate_bridge_components()
	_update_construction_visibility()

func _setup_default_boundary() -> void:
	if total_length > 0 and bridge_width > 0:
		var boundary = PackedVector3Array()
		boundary.append(position + Vector3(0, 0, -bridge_width/2))
		boundary.append(position + Vector3(total_length, 0, -bridge_width/2))
		boundary.append(position + Vector3(total_length, 0, bridge_width/2))
		boundary.append(position + Vector3(0, 0, bridge_width/2))
		boundary.append(position + Vector3(0, 0, -bridge_width/2))
		set_boundary(boundary, BoundaryType.EDGE, true)

func _generate_bridge_components() -> void:
	_clear_component_meshes()
	
	var mat_planning = _create_transparent_material(Color(0.8, 0.8, 1.0, 0.3))
	var mat_foundation = _create_solid_material(Color(0.5, 0.35, 0.2))
	var mat_pier = _create_solid_material(Color(0.6, 0.6, 0.6))
	var mat_beam = _create_solid_material(Color(0.4, 0.4, 0.45))
	var mat_deck = _create_solid_material(Color(0.3, 0.3, 0.3))
	
	_foundation_mesh = MeshInstance3D.new()
	_foundation_mesh.name = "FoundationMesh"
	_foundation_mesh.visible = false
	add_child(_foundation_mesh)
	
	for i in range(span_count + 1):
		var pier_mesh = MeshInstance3D.new()
		pier_mesh.name = "PierMesh_%d" % i
		pier_mesh.visible = false
		add_child(pier_mesh)
		_pier_meshes.append(pier_mesh)
	
	_beam_mesh = MeshInstance3D.new()
	_beam_mesh.name = "BeamMesh"
	_beam_mesh.visible = false
	add_child(_beam_mesh)
	
	_deck_mesh = MeshInstance3D.new()
	_deck_mesh.name = "DeckMesh"
	_deck_mesh.visible = false
	add_child(_deck_mesh)

func _clear_component_meshes() -> void:
	for child in get_children():
		if child is MeshInstance3D and child.name != "BridgeMesh":
			child.queue_free()
	_pier_meshes.clear()

func _create_transparent_material(color: Color) -> Material:
	var mat = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	return mat

func _create_solid_material(color: Color) -> Material:
	var mat = StandardMaterial3D.new()
	mat.albedo_color = color
	return mat

func _update_construction_visibility() -> void:
	var p = construction_progress
	
	# 基础/桩基 (0% - 20%)
	_foundation_mesh.visible = p > 0.0
	if _foundation_mesh.visible:
		_generate_foundation_mesh(min(p / 0.2, 1.0))
	
	# 墩柱 (15% - 40%)
	for i in range(_pier_meshes.size()):
		_pier_meshes[i].visible = p > 0.15
		if _pier_meshes[i].visible:
			var pier_progress = clamp((p - 0.15) / 0.25, 0.0, 1.0)
			_generate_pier_mesh(_pier_meshes[i], i, pier_progress)
	
	# 梁体 (35% - 60%)
	_beam_mesh.visible = p > 0.35
	if _beam_mesh.visible:
		_generate_beam_mesh(clamp((p - 0.35) / 0.25, 0.0, 1.0))
	
	# 桥面 (55% - 80%)
	_deck_mesh.visible = p > 0.55
	if _deck_mesh.visible:
		_generate_deck_mesh(clamp((p - 0.55) / 0.25, 0.0, 1.0))
	
	# 根据进度更新阶段显示
	_update_stage_from_progress()

func _generate_foundation_mesh(progress: float) -> void:
	var mesh = BoxMesh.new()
	mesh.size = Vector3(total_length * progress, 2, bridge_width + 2)
	_foundation_mesh.mesh = mesh
	_foundation_mesh.position = Vector3(total_length * progress / 2, -1, 0)
	_foundation_mesh.material_override = _create_solid_material(Color(0.5, 0.35, 0.2))

func _generate_pier_mesh(pier_mesh: MeshInstance3D, index: int, progress: float) -> void:
	var mesh = BoxMesh.new()
	var pier_x = (float(index) / float(span_count)) * total_length
	mesh.size = Vector3(3, _pier_height * progress, 3)
	pier_mesh.mesh = mesh
	pier_mesh.position = Vector3(pier_x, _pier_height * progress / 2 - 5, 0)
	pier_mesh.material_override = _create_solid_material(Color(0.6, 0.6, 0.6))

func _generate_beam_mesh(progress: float) -> void:
	var mesh = BoxMesh.new()
	mesh.size = Vector3(total_length * progress, _beam_height, bridge_width)
	_beam_mesh.mesh = mesh
	_beam_mesh.position = Vector3(total_length * progress / 2, _pier_height - 5 + _beam_height / 2, 0)
	_beam_mesh.material_override = _create_solid_material(Color(0.4, 0.4, 0.45))

func _generate_deck_mesh(progress: float) -> void:
	var mesh = BoxMesh.new()
	mesh.size = Vector3(total_length * progress, _deck_height, bridge_width)
	_deck_mesh.mesh = mesh
	_deck_mesh.position = Vector3(total_length * progress / 2, _pier_height - 5 + _beam_height + _deck_height / 2, 0)
	_deck_mesh.material_override = _create_solid_material(Color(0.3, 0.3, 0.3))

func _update_stage_from_progress() -> void:
	var p = construction_progress
	if p >= 0.95:
		anim_stage = ConstructionStage.COMPLETED
	elif p >= 0.8:
		anim_stage = ConstructionStage.FINISHING
	elif p >= 0.55:
		anim_stage = ConstructionStage.DECK
	elif p >= 0.35:
		anim_stage = ConstructionStage.BEAM
	elif p >= 0.15:
		anim_stage = ConstructionStage.PIER
	elif p >= 0.05:
		anim_stage = ConstructionStage.SUBSTRUCTURE
	elif p > 0.0:
		anim_stage = ConstructionStage.FOUNDATION
	else:
		anim_stage = ConstructionStage.PLANNING

func set_construction_progress(progress: float) -> void:
	construction_progress = clamp(progress, 0.0, 1.0)
	_update_construction_visibility()

func get_construction_stage_name() -> String:
	return ConstructionStage.keys()[anim_stage]

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
		"construction_progress": construction_progress,
		"construction_stage": get_construction_stage_name(),
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
