# PileEntity.gd
# 桩基实体 - 继承PrecisionEntity
# 支持: 精确钢筋位置、一桩一数据、施工进度
class_name PileEntity
extends PrecisionEntity

# ============================================================
# 桩基类型
# ============================================================
enum PileType {
	DRIVEN_PILE,    # 预制桩
	CAST_IN_PLACE,  # 灌注桩
	DRILLED,        # 钻孔桩
	STEEL_PILE,     # 钢桩
}

# ============================================================
# 导出属性
# ============================================================
@export_group("桩基属性", "pile_")
@export var pile_type: PileType = PileType.CAST_IN_PLACE
@export var pile_number: int = 1  # 桩编号
@export var pile_diameter: float = 1.5  # 桩径(m)
@export var pile_length: float = 30.0  # 桩长(m)
@export var pile_depth: float = 0  # 埋深(m)

@export_group("位置信息", "position_")
@export var station_id: String = ""  # 关联桩号
@export var offset_x: float = 0  # 横向偏移
@export var offset_y: float = 0  # 竖向偏移
@export var bearing_layer: String = ""  # 持力层

@export_group("钢筋信息", "reinforcement_")
@export var reinforcement_count: int = 12  # 主筋根数
@export var reinforcement_diameter: float = 25.0  # 主筋直径(mm)
@export var hoop_diameter: float = 8.0  # 箍筋直径(mm)
@export var hoop_spacing: float = 200.0  # 箍筋间距(mm)
@export var stirrup_count: int = 0  # 箍筋根数

@export_group("施工记录", "record_")
@export var bored_depth: float = 0  # 成孔深度
@export var concrete_volume: float = 0  # 混凝土用量(m³)
@export var concrete_grade: String = "C30"  # 混凝土等级

# ============================================================
# 内部变量
# ============================================================
var _pile_mesh: MeshInstance3D

func _ready() -> void:
	entity_type = "pile"
	category = EntityCategory.STRUCTURE
	precision_level = PrecisionLevel.NORMAL  # 0.01m
	
	# 自动生成名称
	if entity_name == "":
		entity_name = "%d号桩" % pile_number
	
	super._ready()
	
	# 设置边界
	_setup_pile_boundary()
	_generate_pile_mesh()

func _setup_pile_boundary() -> void:
	# 桩基边界 = 桩周 + 施工边界
	var boundary = PackedVector3Array()
	var radius = pile_diameter / 2.0 + 0.5  # 加0.5m施工空间
	
	# 圆形边界 (简化为多边形)
	for i in range(12):
		var angle = i * TAU / 12
		var x = cos(angle) * radius
		var z = sin(angle) * radius
		boundary.append(Vector3(x, 0, z))
	
	set_boundary(boundary, BoundaryType.CONSTRUCTION, true)

func _generate_pile_mesh() -> void:
	_pile_mesh = MeshInstance3D.new()
	_pile_mesh.name = "PileMesh"
	add_child(_pile_mesh)
	
	# 圆柱体Mesh
	var cylinder = CylinderMesh.new()
	cylinder.top_radius = pile_diameter / 2.0
	cylinder.bottom_radius = pile_diameter / 2.0
	cylinder.height = pile_length
	cylinder.radial_segments = 24
	
	_pile_mesh.mesh = cylinder
	
	# 旋转使圆柱垂直
	_pile_mesh.rotation_degrees.x = 90
	
	# 设置材质颜色
	_update_pile_color()

func _update_pile_color() -> void:
	if not _pile_mesh:
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
	
	_pile_mesh.material_override = mat

# ============================================================
# 阶段变化回调
# ============================================================
func _on_phase_changed(new_phase: String) -> void:
	super._on_phase_changed(new_phase)
	_update_pile_color()

# ============================================================
# 钢筋计算
# ============================================================
func calculate_reinforcement() -> Dictionary:
	# 计算钢筋数量和重量
	var hoop_count = int(pile_length / (hoop_spacing / 1000.0)) + 1
	
	# 主筋总长度
	var main_bar_length = pile_length * reinforcement_count
	
	# 箍筋总长度
	var hoop_perimeter = PI * (pile_diameter - 0.05) * 2
	var hoop_total_length = hoop_perimeter * hoop_count
	
	# 重量计算 (简化)
	var main_bar_weight = main_bar_length * 0.00617 * pow(reinforcement_diameter/10, 2)  # kg/m
	var hoop_weight = hoop_total_length * 0.00617 * pow(hoop_diameter/10, 2)
	
	return {
		"reinforcement_count": reinforcement_count,
		"hoop_count": hoop_count,
		"main_bar_length": main_bar_length,
		"hoop_total_length": hoop_total_length,
		"total_weight": main_bar_weight + hoop_weight,
		"concrete_volume": calculate_concrete()
	}

func calculate_concrete() -> float:
	# 混凝土体积 = 桩身体积
	var pile_volume = PI * pow(pile_diameter/2, 2) * pile_length
	return round(pile_volume * 100) / 100

# ============================================================
# 数据导出
# ============================================================
func export_full_data() -> Dictionary:
	var data = super.export_full_data()
	var reinforcement = calculate_reinforcement()
	
	data["pile_specific"] = {
		"pile_number": pile_number,
		"pile_type": PileType.keys()[pile_type],
		"pile_diameter": pile_diameter,
		"pile_length": pile_length,
		"pile_depth": pile_depth,
		"station_id": station_id,
		"offset_x": offset_x,
		"offset_y": offset_y,
		"bearing_layer": bearing_layer,
		"reinforcement": reinforcement,
		"concrete_grade": concrete_grade,
		"concrete_volume": concrete_volume
	}
	return data

# ============================================================
# 静态方法
# ============================================================
static func get_entity_type() -> String:
	return "pile"

static func get_pile_type_name(ptype: PileType) -> String:
	return PileType.keys()[ptype]
