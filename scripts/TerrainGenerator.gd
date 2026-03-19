class_name TerrainGenerator
extends Node3D

@export var terrain_size: Vector2 = Vector2(400, 400)
@export var terrain_resolution: int = 64
@export var height_scale: float = 20.0
@export var noise_seed: int = 42

var _mesh_instance: MeshInstance3D
var _collision_shape: StaticBody3D
var _terrain_material: StandardMaterial3D

func _ready() -> void:
	_generate_terrain()
	print("[TerrainGenerator] Initialized with size ", terrain_size)

func _generate_terrain() -> void:
	var surface_tool = SurfaceTool.new()
	surface_tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	
	var cell_size = terrain_size / terrain_resolution
	
	for z in range(terrain_resolution):
		for x in range(terrain_resolution):
			var height00 = _get_height(x, z)
			var height10 = _get_height(x + 1, z)
			var height01 = _get_height(x, z + 1)
			var height11 = _get_height(x + 1, z + 1)
			
			var pos00 = Vector3(x * cell_size.x, height00, z * cell_size.y)
			var pos10 = Vector3((x + 1) * cell_size.x, height10, z * cell_size.y)
			var pos01 = Vector3(x * cell_size.x, height01, (z + 1) * cell_size.y)
			var pos11 = Vector3((x + 1) * cell_size.x, height11, (z + 1) * cell_size.y)
			
			var color00 = _get_terrain_color(height00)
			var color10 = _get_terrain_color(height10)
			var color01 = _get_terrain_color(height01)
			var color11 = _get_terrain_color(height11)
			
			_add_triangle(surface_tool, pos00, pos10, pos01, color00, color10, color01)
			_add_triangle(surface_tool, pos10, pos11, pos01, color10, color11, color01)
	
	var array_mesh = surface_tool.commit()
	
	_mesh_instance = MeshInstance3D.new()
	_mesh_instance.mesh = array_mesh
	_mesh_instance.name = "TerrainMesh"
	
	_terrain_material = StandardMaterial3D.new()
	_terrain_material.vertex_color_use_as_albedo = true
	_terrain_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	_mesh_instance.material_override = _terrain_material
	
	add_child(_mesh_instance)
	
	_create_collision()

func _add_triangle(surface_tool: SurfaceTool, v1: Vector3, v2: Vector3, v3: Vector3, c1: Color, c2: Color, c3: Color) -> void:
	var normal = (v2 - v1).cross(v3 - v1).normalized()
	
	surface_tool.set_normal(normal)
	surface_tool.set_color(c1)
	surface_tool.add_vertex(v1)
	
	surface_tool.set_normal(normal)
	surface_tool.set_color(c2)
	surface_tool.add_vertex(v2)
	
	surface_tool.set_normal(normal)
	surface_tool.set_color(c3)
	surface_tool.add_vertex(v3)

func _get_height(x: int, z: int) -> float:
	var noise = FastNoiseLite.new()
	noise.seed = noise_seed
	noise.frequency = 0.01
	noise.fractal_octaves = 4
	noise.fractal_lacunarity = 2.0
	noise.fractal_gain = 0.5
	
	var nx = float(x) / terrain_resolution
	var nz = float(z) / terrain_resolution
	
	var h = noise.get_noise_2d(nx * 100, nz * 100)
	return h * height_scale * 0.3 + height_scale * 0.1

func _get_terrain_color(height: float) -> Color:
	var normalized = (height / (height_scale * 0.5)).clamp(0.0, 1.0)
	
	if normalized < 0.3:
		return Color(0.35, 0.25, 0.15, 1.0)
	elif normalized < 0.5:
		return Color(0.4, 0.5, 0.3, 1.0)
	elif normalized < 0.7:
		return Color(0.3, 0.45, 0.2, 1.0)
	else:
		return Color(0.5, 0.5, 0.45, 1.0)

func _create_collision() -> void:
	_collision_shape = StaticBody3D.new()
	_collision_shape.name = "TerrainCollision"
	
	var shape = ConcavePolygonShape3D.new()
	var triangles = []
	
	var mesh = _mesh_instance.mesh
	if mesh is ArrayMesh:
		var arrays = mesh.surface_get_arrays(0)
		if arrays.size() > Mesh.ARRAY_VERTEX:
			var vertices = arrays[Mesh.ARRAY_VERTEX]
			for i in range(0, vertices.size(), 3):
				triangles.append(vertices[i])
				triangles.append(vertices[i + 1])
				triangles.append(vertices[i + 2])
	
	shape.faces = PackedVector3Array(triangles)
	
	var collision = CollisionShape3D.new()
	collision.name = "CollisionShape3D"
	collision.shape = shape
	
	_collision_shape.add_child(collision)
	add_child(_collision_shape)

func get_height_at(world_x: float, world_z: float) -> float:
	return _get_height(
		int((world_x / terrain_size.x) * terrain_resolution),
		int((world_z / terrain_size.y) * terrain_resolution)
	)
