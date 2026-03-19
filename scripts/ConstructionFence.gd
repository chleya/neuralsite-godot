class_name ConstructionFence
extends Node3D

@export var fence_length: float = 10.0
@export var fence_height: float = 1.5
@export var post_spacing: float = 2.0
@export var fence_color: Color = Color(1.0, 0.6, 0.0)

var _posts: Array = []
var _bars: Array = []

func _ready() -> void:
	_generate_fence()

func _generate_fence() -> void:
	var mat = StandardMaterial3D.new()
	mat.albedo_color = fence_color
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	
	var post_mat = StandardMaterial3D.new()
	post_mat.albedo_color = Color(0.5, 0.5, 0.5)
	
	var post_count = int(fence_length / post_spacing) + 1
	
	for i in range(post_count):
		var post = MeshInstance3D.new()
		post.name = "Post_%d" % i
		var post_mesh = BoxMesh.new()
		post_mesh.size = Vector3(0.1, fence_height, 0.1)
		post.mesh = post_mesh
		post.material_override = post_mat
		post.position = Vector3(i * post_spacing, fence_height / 2, 0)
		add_child(post)
		_posts.append(post)
	
	for row in range(3):
		var bar = MeshInstance3D.new()
		bar.name = "Bar_%d" % row
		var bar_mesh = BoxMesh.new()
		var bar_height = fence_height * (0.3 + row * 0.25)
		bar_mesh.size = Vector3(fence_length, 0.05, 0.05)
		bar.mesh = bar_mesh
		bar.material_override = mat
		bar.position = Vector3(fence_length / 2, bar_height, 0)
		add_child(bar)
		_bars.append(bar)

func set_warning_light(enabled: bool) -> void:
	if enabled:
		var light = OmniLight3D.new()
		light.name = "WarningLight"
		light.light_color = Color(1.0, 0.5, 0.0)
		light.light_energy = 2.0
		light.omni_range = 5.0
		light.position = Vector3(fence_length / 2, fence_height + 0.3, 0)
		add_child(light)
		
		var mesh_instance = MeshInstance3D.new()
		mesh_instance.name = "LightMesh"
		var sphere = SphereMesh.new()
		sphere.radius = 0.15
		sphere.height = 0.3
		mesh_instance.mesh = sphere
		var light_mat = StandardMaterial3D.new()
		light_mat.albedo_color = Color(1.0, 0.3, 0.0)
		light_mat.emission_enabled = true
		light_mat.emission = Color(1.0, 0.4, 0.0)
		light_mat.emission_energy_multiplier = 3.0
		mesh_instance.material_override = light_mat
		mesh_instance.position = light.position
		add_child(mesh_instance)
