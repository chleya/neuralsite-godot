class_name ExcavatorAttachment
extends Node3D

@export var is_working: bool = false
@export var arm_length: float = 5.0
@export var bucket_size: float = 1.0

var _arm_mesh: MeshInstance3D
var _bucket_mesh: MeshInstance3D
var _hydraulic_pistons: Array = []

var _arm_rotation: Vector3 = Vector3.ZERO
var _bucket_angle: float = 0.0
var _dig_phase: float = 0.0

func _ready() -> void:
	_setup_excavator_mesh()
	print("[ExcavatorAttachment] Initialized")

func _setup_excavator_mesh() -> void:
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.9, 0.9, 0.2)
	
	_arm_mesh = MeshInstance3D.new()
	_arm_mesh.name = "ArmMesh"
	var arm_box = BoxMesh.new()
	arm_box.size = Vector3(0.3, arm_length, 0.3)
	_arm_mesh.mesh = arm_box
	_arm_mesh.position = Vector3(0, arm_length / 2, 0.5)
	_arm_mesh.material_override = mat
	add_child(_arm_mesh)
	
	_bucket_mesh = MeshInstance3D.new()
	_bucket_mesh.name = "BucketMesh"
	var bucket_box = BoxMesh.new()
	bucket_box.size = Vector3(bucket_size, bucket_size * 0.8, bucket_size)
	_bucket_mesh.mesh = bucket_box
	_bucket_mesh.position = Vector3(0, arm_length, 0.5)
	_bucket_mesh.material_override = mat
	add_child(_bucket_mesh)

func start_digging() -> void:
	is_working = true
	_dig_phase = 0.0
	print("[ExcavatorAttachment] Started digging")

func stop_digging() -> void:
	is_working = false
	print("[ExcavatorAttachment] Stopped digging")

func _process(delta: float) -> void:
	if not is_working:
		return
	
	_dig_phase += delta
	_animate_dig_cycle()

func _animate_dig_cycle() -> void:
	var cycle = sin(_dig_phase * 2.0) * 0.5 + 0.5
	
	_arm_rotation.x = lerp(-0.8, 0.5, cycle)
	_bucket_angle = lerp(-0.6, 0.3, cycle)
	
	if _arm_mesh:
		_arm_mesh.rotation.x = _arm_rotation.x
	
	if _bucket_mesh:
		_bucket_mesh.rotation.x = _bucket_angle
		_bucket_mesh.position.y = arm_length + sin(_arm_rotation.x) * 2.0

func get_bucket_position() -> Vector3:
	if _bucket_mesh:
		return _bucket_mesh.global_position
	return global_position
