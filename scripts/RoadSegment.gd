# RoadSegment.gd
# 道路片段节点 - 继承Path3D，用于渲染和管理道路片段
# 使用: 在场景中添加RoadSegment节点，分配RoadData资源
@tool
class_name RoadSegment
extends Path3D

# ── 数据引用 ──
@export_group("数据", "data_")
@export var road_data: RoadData :
	set(new_data):
		if road_data and road_data.is_connected("data_changed", _on_data_changed):
			road_data.disconnect("data_changed", _on_data_changed)
		road_data = new_data
		if road_data:
			road_data.connect("data_changed", _on_data_changed)
			_rebuild_everything()

# ── 渲染设置 ──
@export_group("渲染设置", "render_")
@export var generate_mesh: bool = true
@export var generate_collision: bool = true
@export var material_override: Material
@export var show_debug_info: bool = false

# ── 附件系统 ──
@export_group("附件", "attachments_")
@export var attachments: Array[NodePath] = []

# ── 信号 ──
signal phase_changed(new_phase: String)
signal progress_changed(new_progress: float)
signal data_updated
signal attachment_added(node: Node)

# ── 子节点引用 ──
var _mesh_instance: MeshInstance3D
var _static_body: StaticBody3D
var _collision_shape: CollisionShape3D

func _ready() -> void:
	_create_child_nodes()
	
	if not road_data:
		road_data = RoadData.new()
		road_data.id = name
	
	if road_data.points.size() > 0:
		_rebuild_everything()
	
	print("[RoadSegment] Ready: ", name)

func _create_child_nodes() -> void:
	# MeshInstance3D
	if not has_node("MeshInstance3D"):
		_mesh_instance = MeshInstance3D.new()
		_mesh_instance.name = "MeshInstance3D"
		add_child(_mesh_instance)
	else:
		_mesh_instance = get_node("MeshInstance3D")
	
	# StaticBody3D + CollisionShape3D
	if not has_node("StaticBody3D"):
		_static_body = StaticBody3D.new()
		_static_body.name = "StaticBody3D"
		 CollisionShape3D.new()
		_collision_shape =_collision_shape.name = "CollisionShape3D"
		_static_body.add_child(_collision_shape)
		add_child(_static_body)
	else:
		_static_body = get_node("StaticBody3D")
		_collision_shape = _static_body.get_node("CollisionShape3D")

# ── 数据变化回调 ──
func _on_data_changed() -> void:
	_rebuild_everything()
	data_updated.emit()

# ── 核心重建 ──
func _rebuild_everything() -> void:
	if not road_data:
		return
	
	# 更新曲线
	_update_curve()
	
	# 生成网格和碰撞
	if generate_mesh:
		_generate_mesh()
	if generate_collision:
		_generate_collision()
	
	# 发送信号
	phase_changed.emit(road_data.phase)
	progress_changed.emit(road_data.current_progress)
	
	if show_debug_info:
		road_data.print_all_properties()

func _update_curve() -> void:
	curve = Curve3D.new()
	for i in range(road_data.points.size()):
		curve.add_point(road_data.points[i])
		if i > 0 and i < road_data.points.size() - 1:
			# 设置切线使曲线平滑
			var prev = road_data.points[i-1]
			var curr = road_data.points[i]
			var next = road_data.points[i+1]
			var tangent = (next - prev).normalized() * 5.0
			curve.set_point_in(i, -tangent)
			curve.set_point_out(i, tangent)

# ── 网格生成 ──
func _generate_mesh() -> void:
	if road_data.points.size() < 2:
		return
	
	var mesh = ImmediateMesh.new()
	var mat = StandardMaterial3D.new()
	
	if material_override:
		mat = material_override
	else:
		mat.albedo_color = road_data.get_phase_color()
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA if mat.albedo_color.a < 1.0 else BaseMaterial3D.TRANSPARENCY_DISABLED
	
	mesh.surface_begin(Mesh.PRIMITIVE_TRIANGLES, mat)
	
	var half_width = road_data.width / 2.0
	var baked_points = curve.get_baked_points()
	
	# 生成道路面（四边形带）
	for i in range(baked_points.size() - 1):
		var p0 = baked_points[i]
		var p1 = baked_points[i+1]
		
		# 计算右向量（垂直于道路方向）
		var direction = (p1 - p0).normalized()
		var right = direction.cross(Vector3.UP).normalized() * half_width
		
		# 四个角点
		var outer_left = p0 - right
		var outer_right = p0 + right
		var inner_left = p1 - right
		var inner_right = p1 + right
		
		# 两个三角形组成一个四边形
		# Triangle 1
		mesh.surface_set_normal(Vector3.UP)
		mesh.surface_add_vertex(outer_left)
		mesh.surface_add_vertex(outer_right)
		mesh.surface_add_vertex(inner_right)
		
		# Triangle 2
		mesh.surface_set_normal(Vector3.UP)
		mesh.surface_add_vertex(outer_left)
		mesh.surface_add_vertex(inner_right)
		mesh.surface_add_vertex(inner_left)
	
	mesh.surface_end()
	_mesh_instance.mesh = mesh
	_mesh_instance.material_override = mat

# ── 碰撞生成 ──
func _generate_collision() -> void:
	if road_data.points.size() < 2:
		return
	
	# 使用ConcavePolygonShape3D进行精确碰撞
	var shape = ConcavePolygonShape3D.new()
	var baked_points = curve.get_baked_points()
	var half_width = road_data.width / 2.0
	
	var surface_tool = SurfaceTool.new()
	surface_tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	
	for i in range(baked_points.size() - 1):
		var p0 = baked_points[i]
		var p1 = baked_points[i+1]
		var direction = (p1 - p0).normalized()
		var right = direction.cross(Vector3.UP).normalized() * half_width
		
		var outer_left = p0 - right
		var outer_right = p0 + right
		var inner_left = p1 - right
		var inner_right = p1 + right
		
		# Triangle 1
		surface_tool.add_vertex(outer_left)
		surface_tool.add_vertex(outer_right)
		surface_tool.add_vertex(inner_right)
		
		# Triangle 2
		surface_tool.add_vertex(outer_left)
		surface_tool.add_vertex(inner_right)
		surface_tool.add_vertex(inner_left)
	
	shape.surface = surface_tool.commit()
	_collision_shape.shape = shape

# ── 公开方法 ──
func set_progress(new_progress: float) -> void:
	if road_data:
		road_data.set_progress(new_progress)

func set_phase(new_phase: String) -> void:
	if road_data:
		road_data.set_phase(new_phase)

func advance_progress(delta: float) -> void:
	if road_data:
		road_data.set_progress(road_data.current_progress + delta)

# ── 附件系统 ──
func add_attachment(node: Node) -> void:
	add_child(node)
	attachments.append(get_path_to(node))
	attachment_added.emit(node)

# ── GeoJSON 导入/导出 ──
func load_from_geojson(file_path: String) -> bool:
	if not FileAccess.file_exists(file_path):
		push_error("[RoadSegment] File not found: " + file_path)
		return false
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	var json_text = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var parse_result = json.parse(json_text)
	if parse_result != OK:
		push_error("[RoadSegment] JSON parse failed")
		return false
	
	var data = json.data
	var features = []
	
	if data.has("features"):
		features = data["features"]
	elif data.has("type") and data["type"] == "Feature":
		features = [data]
	elif data.has("type") and data["type"] == "LineString":
		features = [{"geometry": data, "properties": {}}]
	
	for feature in features:
		var geom = feature.get("geometry", {})
		var props = feature.get("properties", {})
		
		if geom.get("type") == "LineString":
			var coords = geom.get("coordinates", [])
			road_data.points = _coords_to_points(coords)
			
			# 解析属性
			road_data.id = props.get("id", props.get("id", "road_imported"))
			road_data.name = props.get("name", "")
			road_data.highway_type = props.get("highway", "secondary")
			road_data.lanes = int(props.get("lanes", 2))
			road_data.surface = props.get("surface", "asphalt")
			road_data.phase = props.get("phase", props.get("project_phase", "planning"))
			road_data.current_progress = float(props.get("progress", 0.0))
	
	_rebuild_everything()
	print("[RoadSegment] Loaded from: ", file_path)
	return true

func _coords_to_points(coords: Array) -> PackedVector3Array:
	var result = PackedVector3Array()
	for coord in coords:
		if coord.size() >= 2:
			# 简化的坐标转换 (经纬度 -> 米)
			var x = coord[0] * 111000.0
			var z = coord[1] * 111000.0
			var y = coord[2] if coord.size() > 2 else 0.0
			result.append(Vector3(x, y, z))
	return result

func save_to_geojson(file_path: String) -> bool:
	var features = []
	
	# 转换点为坐标
	var coords = []
	for p in road_data.points:
		coords.append([p.x / 111000.0, p.z / 111000.0, p.y])
	
	var feature = {
		"type": "Feature",
		"geometry": {
			"type": "LineString",
			"coordinates": coords
		},
		"properties": {
			"id": road_data.id,
			"name": road_data.name,
			"highway": road_data.highway_type,
			"lanes": road_data.lanes,
			"surface": road_data.surface,
			"phase": road_data.phase,
			"progress": road_data.current_progress,
			"construction_status": road_data.construction_status,
			"width": road_data.width,
			"ai_risk_level": road_data.ai_risk_level,
			"environmental_impact_score": road_data.environmental_impact_score
		}
	}
	
	# 合并extra_properties
	for key in road_data.extra_properties:
		feature["properties"][key] = road_data.extra_properties[key]
	
	features.append(feature)
	
	var geojson = {
		"type": "FeatureCollection",
		"features": features
	}
	
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(geojson, "\t"))
		file.close()
		print("[RoadSegment] Saved to: ", file_path)
		return true
	
	push_error("[RoadSegment] Failed to save: " + file_path)
	return false

# ── 调试 ──
func _process(_delta: float) -> void:
	if Engine.is_editor_hint() and show_debug_info:
		queue_redraw()
