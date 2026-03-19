class_name ConstructionEffects
extends Node3D

enum EffectType { DUST, SPARK, SMOKE, WATER_SPRAY, CONCRETE_POUR }

@export var effect_type: EffectType = EffectType.DUST
@export var particle_count: int = 50
@export var effect_duration: float = 3.0
@export var effect_color: Color = Color(0.6, 0.5, 0.4)

var _particle_instance: GPUParticles3D
var _emitter_position: Vector3 = Vector3.ZERO
var _is_emitting: bool = false

func _ready() -> void:
	_setup_effect()
	print("[ConstructionEffects] Initialized")

func _setup_effect() -> void:
	_particle_instance = GPUParticles3D.new()
	_particle_instance.name = "Particles"
	_particle_instance.amount = particle_count
	_particle_instance.lifetime = effect_duration
	_particle_instance.explosiveness = 0.5
	_particle_instance.randomness = 0.5
	
	var material = ParticleProcessMaterial.new()
	material.direction = Vector3(0, 1, 0)
	material.spread = 45.0
	material.initial_velocity_min = 1.0
	material.initial_velocity_max = 3.0
	material.gravity = Vector3(0, -2.0, 0)
	material.color = effect_color
	
	_particle_instance.process_material = material
	
	var mesh_instance = MeshInstance3D.new()
	var sphere = SphereMesh.new()
	sphere.radius = 0.1
	sphere.height = 0.2
	mesh_instance.mesh = sphere
	_particle_instance.draw_pass_1 = mesh_instance
	
	add_child(_particle_instance)
	_particle_instance.emitting = false

func emit(position: Vector3 = Vector3.ZERO, duration: float = 2.0) -> void:
	_emitter_position = position
	_particle_instance.position = position
	_particle_instance.emitting = true
	_is_emitting = true
	
	await get_tree().create_timer(duration).timeout
	stop()

func stop() -> void:
	_particle_instance.emitting = false
	_is_emitting = false

func set_effect_type(type: EffectType) -> void:
	effect_type = type
	_update_effect_parameters()

func _update_effect_parameters() -> void:
	var material = _particle_instance.process_material as ParticleProcessMaterial
	
	match effect_type:
		EffectType.DUST:
			material.direction = Vector3(0, 1, 0)
			material.gravity = Vector3(0, -1.0, 0)
			material.color = Color(0.6, 0.5, 0.4)
			_particle_instance.amount = 50
		EffectType.SPARK:
			material.direction = Vector3(0, 0.5, 0)
			material.gravity = Vector3(0, -5.0, 0)
			material.color = Color(1.0, 0.8, 0.3)
			_particle_instance.amount = 100
		EffectType.SMOKE:
			material.direction = Vector3(0, 2, 0)
			material.gravity = Vector3(0, 0.5, 0)
			material.color = Color(0.3, 0.3, 0.3)
			_particle_instance.amount = 30
		EffectType.WATER_SPRAY:
			material.direction = Vector3(0, 1, 0)
			material.gravity = Vector3(0, -3.0, 0)
			material.color = Color(0.5, 0.7, 1.0)
			_particle_instance.amount = 60
		EffectType.CONCRETE_POUR:
			material.direction = Vector3(0, 0.5, 0)
			material.gravity = Vector3(0, -2.0, 0)
			material.color = Color(0.5, 0.5, 0.5)
			_particle_instance.amount = 40

func is_emitting() -> bool:
	return _is_emitting
