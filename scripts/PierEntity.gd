# PierEntity.gd
# 墩柱实体 - 继承PrecisionEntity
# 支持: 精确尺寸、关联桩基、施工进度
class_name PierEntity
extends PrecisionEntity

# ============================================================
# 墩柱类型
# ============================================================
enum PierType {
	RECTANGULAR,   # 矩形墩
	CIRCULAR,       # 圆形墩
	VAULTED,       # 拱形墩
	MULTI_COLUMN,  # 多柱式
}

# ============================================================
# 导出属性
# ============================================================
@export_group("墩柱属性", "pier_")
@export var pier_type: PierType = PierType.CIRCULAR
@export var pier_number: int = 1  # 墩号
@export var pier_height: float = 0  # 墩高(m)
@export var pier_diameter: float = 1.5  # 墩径(m) - 圆形
@export var pier_width: float = 2.0  # 墩宽(m) - 矩形
@export var pier_length: float = 3.0  # 墩长(m) - 矩形

@export_group("位置信息", "position_")
@export var station_id: String = ""  # 关联桩号
@export var pile_ids: Array = []  # 关联桩基ID列表
@export var cap_id: String = ""  # 关联承台ID

@export_group("结构配筋", "reinforcement_")
@export var main_bar_count: int = 16  # 主筋根数
@export var main_bar_diameter: float = 25.0  # 主筋直径(mm)
@export var hoop_diameter: float = 12.0  # 箍筋直径(mm)
@export var hoop_spacing: float = 150.0  # 箍筋间距(mm)

@export_group("施工记录", "construction_")
@export var concrete_grade: String = "C40"  # 混凝土等级
@export var concrete_volume: float = 0  # 混凝土用量

# ============================================================
# 内部变量
# ============================================================
var _pier_mesh: MeshInstance3D

func _ready() -> void:
	entity_type = "pier"
	category = EntityCategory.STRUCTURE
	precision_level = PrecisionLevel.NORMAL  # 0.01m
	
	# 自动生成名称
	if entity_name == "":
		entity_name = "%d号墩" % pier_number
	
	# 计算混凝土方量
	if pier_height > 0:
		calculate_concrete_volume()
	
	super._ready()
	
	# 设置边界
	_setup_pier_boundary()
	_generate_pier_mesh()

func _setup_pier_boundary() -> void:
	# 墩柱边界
	var boundary = PackedVector3Array()
	
	match pier_type:
		PierType.CIRCULAR:
			var radius = pier_diameter / 2.0 + 1.0  # 加1m施工空间
			for i in range(16):
				var angle = i * TAU / 16
				var x = cos(angle) * radius
				var z = sin(angle) * radius
				boundary.append(Vector3(x, 0, z))
		
		PierType.RECTANGULAR, PierType.VAULTED:
			var w = pier_width / 2.0 + 1.0
			var l = pier_length / 2.0 + 1.0
			boundary.append(Vector3(-w, 0, -l))
			boundary.append(Vector3(w, 0, -l))
			boundary.append(Vector3(w, 0, l))
			boundary.append(Vector3(-w, 0, l))
			boundary.append(Vector3(-w, 0, -l))
	
	set_boundary(boundary, BoundaryType.CONSTRUCTION, true)

func _generate_pier_mesh() -> void:
	_pier_mesh = MeshInstance3D.new()
	_pier_mesh.name = "PierMesh"
	add_child(_pier_mesh)
	
	match pier_type:
		PierType.CIRCULAR:
			_generate_circular_pier()
		PierType.RECTANGULAR:
			_generate_rectangular_pier()
		PierType.VAULTED:
			_generate_vaulted_pier()
		PierType.MULTI_COLUMN:
			_generate_multi_column_pier()
	
	_update_pier_color()

func _generate_circular_pier() -> void:
	var cylinder = CylinderMesh.new()
	cylinder.top_radius = pier_diameter / 2.0
	cylinder.bottom_radius = pier_diameter / 2.0
	cylinder.height = pier_height
	cylinder.radial_segments = 24
	_pier_mesh.mesh = cylinder

func _generate_rectangular_pier() -> void:
	var box = BoxMesh.new()
	box.size = Vector3(pier_width, pier_height, pier_length)
	_pier_mesh.mesh = box

func _generate_vaulted_pier() -> void:
	# 简化: 使用椭圆柱
	var cylinder = CylinderMesh.new()
	cylinder.top_radius = pier_width / 2.0
	cylinder.bottom_radius = pier_width / 2.0
	cylinder.height = pier_height
	_pier_mesh.mesh = cylinder

func _generate_multi_column_pier() -> void:
	# 多柱式: 创建多个圆柱
	for i in range(2):
		var column = MeshInstance3D.new()
		var cylinder = CylinderMesh.new()
		cylinder.top_radius = 0.6
		cylinder.bottom_radius = 0.6
		cylinder.height = pier_height
		column.mesh = cylinder
		column.position = Vector3((i - 0.5) * 2, 0, 0)
		_pier_mesh.add_child(column)

func _update_pier_color() -> void:
	if not _pier_mesh:
		return
	
	var mat = StandardMaterial3D.new()
	
	match phase:
		"planning":
			mat.albedo_color = Color(0.8, 0.8, 1.0, 0.5)
		"clearing":
			mat.albedo_color = Color(1.0, 0.8, 0.4, 0.8)
		"structure":
			mat.albedo_color = Color(0.6, 0.4, 0.2, 0.8)
		"finishing":
			mat.albedo_color = Color(0.4, 0.6, 0.4, 1.0)
		"completed":
			mat.albedo_color = Color(0.4, 0.4, 0.4, 1.0)
		_:
			mat.albedo_color = Color.GRAY
	
	if mat.albedo_color.a < 1.0:
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	
	_pier_mesh.material_override = mat

# ============================================================
# 阶段变化回调
# ============================================================
func _on_phase_changed(new_phase: String) -> void:
	super._on_phase_changed(new_phase)
	_update_pier_color()

# ============================================================
# 计算方法
# ============================================================
func calculate_concrete_volume() -> float:
	match pier_type:
		PierType.CIRCULAR:
			concrete_volume = PI * pow(pier_diameter / 2, 2) * pier_height
		PierType.RECTANGULAR:
			concrete_volume = pier_width * pier_length * pier_height
		PierType.VAULTED:
			concrete_volume = PI * pow(pier_width / 2, 2) * pier_height * 0.8
		PierType.MULTI_COLUMN:
			concrete_volume = PI * pow(0.6, 2) * pier_height * 2
	
	concrete_volume = round(concrete_volume * 100) / 100
	return concrete_volume

func calculate_reinforcement() -> Dictionary:
	# 简化钢筋计算
	var hoop_count = int(pier_height / (hoop_spacing / 1000.0)) + 1
	var total_hoop_length = 2 * PI * (pier_diameter - 0.05) * hoop_count
	
	return {
		"main_bar_count": main_bar_count,
		"main_bar_diameter": main_bar_diameter,
		"hoop_count": hoop_count,
		"hoop_diameter": hoop_diameter,
		"total_reinforcement_weight": round(total_hoop_length * 0.89 / 1000 * 100) / 100
	}

# ============================================================
# 数据导出
# ============================================================
func export_full_data() -> Dictionary:
	var data = super.export_full_data()
	var reinforcement = calculate_reinforcement()
	
	data["pier_specific"] = {
		"pier_number": pier_number,
		"pier_type": PierType.keys()[pier_type],
		"pier_height": pier_height,
		"pier_diameter": pier_diameter,
		"pier_width": pier_width,
		"pier_length": pier_length,
		"station_id": station_id,
		"pile_ids": pile_ids,
		"cap_id": cap_id,
		"reinforcement": reinforcement,
		"concrete_grade": concrete_grade,
		"concrete_volume": concrete_volume
	}
	return data

# ============================================================
# 静态方法
# ============================================================
static func get_entity_type() -> String:
	return "pier"

static func get_pier_type_name(ptype: PierType) -> String:
	return PierType.keys()[ptype]
