# CapEntity.gd
# 承台实体 - 继承PrecisionEntity
# 支持: 承台几何、关联桩基、钢筋
class_name CapEntity
extends PrecisionEntity

# ============================================================
# 导出属性
# ============================================================
@export_group("承台属性", "cap_")
@export var cap_number: int = 1  # 承台编号
@export var cap_length: float = 6.0  # 长度(m)
@export var cap_width: float = 3.0  # 宽度(m)
@export var cap_height: float = 2.0  # 高度(m)

@export_group("位置信息", "position_")
@export var station_id: String = ""  # 关联桩号
@export var pier_id: String = ""  # 关联墩柱ID
@export var pile_ids: Array = []  # 关联桩基ID列表

@export_group("结构配筋", "reinforcement_")
@export var top_bar_count: int = 20  # 顶层钢筋根数
@export var bottom_bar_count: int = 20  # 底层钢筋根数
@export var bar_diameter: float = 25.0  # 钢筋直径(mm)
@export var stirrup_count: int = 30  # 箍筋肢数

@export_group("施工记录", "construction_")
@export var concrete_grade: String = "C35"
@export var concrete_volume: float = 0

# ============================================================
# 内部变量
# ============================================================
var _cap_mesh: MeshInstance3D

func _ready() -> void:
	entity_type = "cap"
	category = EntityCategory.STRUCTURE
	precision_level = PrecisionLevel.NORMAL
	
	if entity_name == "":
		entity_name = "%d号承台" % cap_number
	
	if cap_height > 0:
		calculate_concrete_volume()
	
	super._ready()
	
	_setup_cap_boundary()
	_generate_cap_mesh()

func _setup_cap_boundary() -> void:
	var boundary = PackedVector3Array()
	var w = cap_width / 2.0 + 1.0
	var l = cap_length / 2.0 + 1.0
	
	boundary.append(Vector3(-w, 0, -l))
	boundary.append(Vector3(w, 0, -l))
	boundary.append(Vector3(w, 0, l))
	boundary.append(Vector3(-w, 0, l))
	boundary.append(Vector3(-w, 0, -l))
	
	set_boundary(boundary, BoundaryType.CONSTRUCTION, true)

func _generate_cap_mesh() -> void:
	_cap_mesh = MeshInstance3D.new()
	_cap_mesh.name = "CapMesh"
	add_child(_cap_mesh)
	
	var box = BoxMesh.new()
	box.size = Vector3(cap_width, cap_height, cap_length)
	_cap_mesh.mesh = box
	
	_update_cap_color()

func _update_cap_color() -> void:
	if not _cap_mesh:
		return
	
	var mat = StandardMaterial3D.new()
	
	match phase:
		"planning":
			mat.albedo_color = Color(0.8, 0.8, 1.0, 0.5)
		"clearing":
			mat.albedo_color = Color(1.0, 0.8, 0.4, 0.8)
		"structure":
			mat.albedo_color = Color(0.6, 0.4, 0.2, 0.8)
		"completed":
			mat.albedo_color = Color(0.4, 0.4, 0.4, 1.0)
		_:
			mat.albedo_color = Color.GRAY
	
	if mat.albedo_color.a < 1.0:
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	
	_cap_mesh.material_override = mat

func _on_phase_changed(new_phase: String) -> void:
	super._on_phase_changed(new_phase)
	_update_cap_color()

func calculate_concrete_volume() -> float:
	concrete_volume = cap_length * cap_width * cap_height
	concrete_volume = round(concrete_volume * 100) / 100
	return concrete_volume

func calculate_reinforcement() -> Dictionary:
	var top_length = cap_length - 0.1
	var bottom_length = cap_length - 0.1
	
	return {
		"top_bar_count": top_bar_count,
		"bottom_bar_count": bottom_bar_count,
		"bar_diameter": bar_diameter,
		"stirrup_count": stirrup_count,
		"total_reinforcement_weight": round((top_length * top_bar_count + bottom_length * bottom_bar_count) * 0.00617 * pow(bar_diameter/10, 2) * 100) / 100
	}

func export_full_data() -> Dictionary:
	var data = super.export_full_data()
	var reinforcement = calculate_reinforcement()
	
	data["cap_specific"] = {
		"cap_number": cap_number,
		"cap_length": cap_length,
		"cap_width": cap_width,
		"cap_height": cap_height,
		"station_id": station_id,
		"pier_id": pier_id,
		"pile_ids": pile_ids,
		"reinforcement": reinforcement,
		"concrete_grade": concrete_grade,
		"concrete_volume": concrete_volume
	}
	return data

static func get_entity_type() -> String:
	return "cap"
