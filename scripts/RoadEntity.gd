# RoadEntity.gd
# 道路实体 - 继承ConstructionEntity，专门用于道路
class_name RoadEntity
extends ConstructionEntity

# ── 道路特定属性 ──
@export_group("道路属性", "road_")
@export var lanes: int = 2
@export var width: float = 7.0
@export var highway_type: String = "secondary"
@export var surface: String = "asphalt"
@export var maxspeed: float = 60.0
@export var oneway: bool = false
@export var bridge: bool = false
@export var tunnel: bool = false

# ── 道路几何 ──
@export_group("几何数据", "geometry_")
@export var centerline_points: PackedVector3Array = PackedVector3Array()
@export var elevation_profile: Array = []  # [z1, z2, z3, ...]

# ── 建设数据 ──
@export_group("建设数据", "construction_")
@export var start_station: float = 0.0  # 起始桩号
@export var end_station: float = 0.0    # 结束桩号
@export var start_date: String = ""
@export var planned_end_date: String = ""
@export var actual_end_date: String = ""
@export var cost_estimate: float = 0.0
@export var actual_cost: float = 0.0

# ── 阶段颜色映射 ──
const PHASE_COLORS = {
	"planning": Color(0.8, 0.8, 1.0, 0.5),
	"clearing": Color(1.0, 0.8, 0.4, 0.8),
	"earthwork": Color(0.6, 0.4, 0.2, 0.8),
	"pavement": Color(0.3, 0.3, 0.3, 1.0),
	"finishing": Color(0.4, 0.6, 0.4, 1.0),
	"completed": Color(0.2, 0.2, 0.2, 1.0),
	"delayed": Color(0.8, 0.2, 0.2, 0.8)
}

# ── 内部变量 ──
var _mesh_instance: MeshInstance3D
var _path: Path3D
var _curve: Curve3D

func _ready() -> void:
	entity_type = "road"
	super._ready()
	_update_visual()

# ── 设置碰撞形状 ──
func _setup_collision() -> void:
	super._setup_collision()
	_update_collision_shape()

func _update_collision_shape() -> void:
	if centerline_points.size() < 2:
		return
	
	# 创建沿路径的碰撞形状
	var shape = ConcavePolygonShape3D.new()
	var surface_tool = SurfaceTool.new()
	surface_tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	
	var half_width = width / 2.0
	
	for i in range(centerline_points.size() - 1):
		var p0 = centerline_points[i]
		var p1 = centerline_points[i + 1]
		
		var direction = (p1 - p0).normalized()
		var right = direction.cross(Vector3.UP).normalized() * half_width
		
		# 四边形两个三角形
		surface_tool.set_normal(Vector3.UP)
		surface_tool.add_vertex(p0 - right)
		surface_tool.add_vertex(p0 + right)
		surface_tool.add_vertex(p1 + right)
		
		surface_tool.set_normal(Vector3.UP)
		surface_tool.add_vertex(p0 - right)
		surface_tool.add_vertex(p1 + right)
		surface_tool.add_vertex(p1 - right)
	
	shape.surface = surface_tool.commit()
	_collision_shape.shape = shape
	_hover_shape.shape = shape

# ── 视觉更新 ──
func _update_visual() -> void:
	# 查找或创建MeshInstance3D
	_mesh_instance = _find_first_child_of_type(self, MeshInstance3D)
	if not _mesh_instance:
		_mesh_instance = MeshInstance3D.new()
		_mesh_instance.name = "RoadMesh"
		add_child(_mesh_instance)
	
	# 生成道路Mesh
	if centerline_points.size() >= 2:
		_generate_road_mesh()

func _generate_road_mesh() -> void:
	var mesh = ImmediateMesh.new()
	var mat = StandardMaterial3D.new()
	
	# 根据阶段设置颜色
	mat.albedo_color = PHASE_COLORS.get(phase, Color.GRAY)
	if mat.albedo_color.a < 1.0:
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	
	mesh.surface_begin(Mesh.PRIMITIVE_TRIANGLES, mat)
	
	var half_width = width / 2.0
	
	for i in range(centerline_points.size() - 1):
		var p0 = centerline_points[i]
		var p1 = centerline_points[i + 1]
		
		var direction = (p1 - p0).normalized()
		var right = direction.cross(Vector3.UP).normalized() * half_width
		
		# 四个顶点
		var v1 = p0 - right  # 左外
		var v2 = p0 + right  # 右外
		var v3 = p1 + right  # 右内
		var v4 = p1 - right  # 左内
		
		# 两个三角形
		mesh.surface_set_normal(Vector3.UP)
		mesh.surface_add_vertex(v1)
		mesh.surface_add_vertex(v2)
		mesh.surface_add_vertex(v3)
		
		mesh.surface_set_normal(Vector3.UP)
		mesh.surface_add_vertex(v1)
		mesh.surface_add_vertex(v3)
		mesh.surface_add_vertex(v4)
	
	mesh.surface_end()
	_mesh_instance.mesh = mesh

# ── 阶段变化 ──
func _on_phase_changed(new_phase: String) -> void:
	super._on_phase_changed(new_phase)
	_update_visual()

# ── 进度变化 ──
func _on_progress_changed(new_progress: float) -> void:
	super._on_progress_changed(new_progress)
	# 可以根据进度显示不同的施工状态
	match phase:
		"earthwork":
			# 进度0-30%，显示裸土
			pass
		"pavement":
			# 进度30-70%，显示基层
			pass
		"finishing":
			# 进度90%+，显示面层
			pass

# ── 设置中心线 ──
func set_centerline(points: PackedVector3Array) -> void:
	centerline_points = points
	_update_collision_shape()
	_update_visual()
	_update_mesh_data()

# ── 建模数据 ──
func _update_mesh_data() -> void:
	if centerline_points.size() < 2:
		return
	
	# 计算总长度
	var total_length = 0.0
	for i in range(centerline_points.size() - 1):
		total_length += centerline_points[i].distance_to(centerline_points[i + 1])
	
	mesh_data = {
		"vertex_count": centerline_points.size(),
		"total_length": total_length,
		"width": width,
		"lanes": lanes,
		"highway_type": highway_type,
		"surface": surface,
		"points": _points_to_array(centerline_points),
		"elevation_profile": elevation_profile
	}

func _points_to_array(points: PackedVector3Array) -> Array:
	var arr = []
	for p in points:
		arr.append([p.x, p.y, p.z])
	return arr

# ── 数据导出 ──
func export_model_data() -> Dictionary:
	var data = super.export_model_data()
	data["road_specific"] = {
		"lanes": lanes,
		"width": width,
		"highway_type": highway_type,
		"surface": surface,
		"maxspeed": maxspeed,
		"start_station": start_station,
		"end_station": end_station,
		"total_length": mesh_data.get("total_length", 0.0)
	}
	return data

# ── 静态方法 ──
static func get_entity_type() -> String:
	return "road"
