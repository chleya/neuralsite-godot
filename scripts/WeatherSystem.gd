class_name WeatherSystem
extends Node3D

enum WeatherType { CLEAR, CLOUDY, RAIN, FOG, STORM }

@export var weather_type: WeatherType = WeatherType.CLEAR
@export var weather_transition_duration: float = 5.0

@export_group("Rain Settings", "rain_")
@export var rain_enabled: bool = false
@export var rain_particle_count: int = 500
@export var rain_speed: float = 30.0
@export var rain_opacity: float = 0.6

@export_group("Fog Settings", "fog_")
@export var fog_enabled: bool = false
@export var fog_density: float = 0.01
@export var fog_color: Color = Color(0.7, 0.75, 0.8, 1.0)

@export_group("Storm Settings", "storm_")
@export var storm_wind_strength: float = 10.0
@export var storm_lightning_interval: float = 5.0

signal weather_changed(from_type: int, to_type: int)
signal weather_transition_started()
signal weather_transition_completed()

var _current_weather: WeatherType = WeatherType.CLEAR
var _target_weather: WeatherType = WeatherType.CLEAR
var _transition_progress: float = 1.0
var _is_transitioning: bool = false

var _rain_mesh_instance: MeshInstance3D
var _rain_material: StandardMaterial3D
var _fog_mesh_instance: MeshInstance3D
var _fog_material: StandardMaterial3D
var _storm_light: OmniLight3D

var _lightning_timer: float = 0.0
var _lightning_active: bool = false

func _ready() -> void:
	_setup_weather_effects()
	set_weather(weather_type)
	print("[WeatherSystem] Initialized")

func _setup_weather_effects() -> void:
	_setup_rain()
	_setup_fog()
	_setup_storm_light()

func _setup_rain() -> void:
	_rain_mesh_instance = MeshInstance3D.new()
	_rain_mesh_instance.name = "RainMesh"
	
	varImmediateMesh = ImmediateMesh.new()
	_rain_mesh_instance.mesh = ImmediateMesh
	
	_rain_material = StandardMaterial3D.new()
	_rain_material.albedo_color = Color(0.7, 0.8, 1.0, rain_opacity)
	_rain_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_rain_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	_rain_material.emission_enabled = true
	_rain_material.emission = Color(0.7, 0.8, 1.0)
	_rain_material.emission_energy_multiplier = 0.3
	_rain_mesh_instance.material_override = _rain_material
	
	add_child(_rain_mesh_instance)
	_rain_mesh_instance.visible = false

func _setup_fog() -> void:
	_fog_mesh_instance = MeshInstance3D.new()
	_fog_mesh_instance.name = "FogMesh"
	
	var box = BoxMesh.new()
	box.size = Vector3(500, 5, 500)
	_fog_mesh_instance.mesh = box
	
	_fog_material = StandardMaterial3D.new()
	_fog_material.albedo_color = fog_color
	_fog_material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_fog_material.cull_mode = BaseMaterial3D.CULL_DISABLED
	_fog_material.albedo_color.a = 0.3
	_fog_mesh_instance.material_override = _fog_material
	
	_fog_mesh_instance.position = Vector3(0, 10, 0)
	add_child(_fog_mesh_instance)
	_fog_mesh_instance.visible = false

func _setup_storm_light() -> void:
	_storm_light = OmniLight3D.new()
	_storm_light.name = "StormLight"
	_storm_light.light_color = Color(0.9, 0.95, 1.0)
	_storm_light.light_energy = 0.0
	_storm_light.omni_range = 200.0
	_storm_light.position = Vector3(0, 100, 0)
	add_child(_storm_light)
	_storm_light.visible = false

func _process(delta: float) -> void:
	if _is_transitioning:
		_update_transition(delta)
	
	match _current_weather:
		WeatherType.RAIN:
			_update_rain(delta)
		WeatherType.STORM:
			_update_storm(delta)

func _update_transition(delta: float) -> void:
	_transition_progress += delta / weather_transition_duration
	
	if _transition_progress >= 1.0:
		_transition_progress = 1.0
		_is_transitioning = false
		_current_weather = _target_weather
		weather_transition_completed.emit()
	else:
		var t = ease(_transition_progress, 0.5)
		_apply_weather_transition(t)

func _apply_weather_transition(t: float) -> void:
	match _target_weather:
		WeatherType.CLEAR:
			pass
		WeatherType.CLOUDY:
			pass
		WeatherType.RAIN:
			if _rain_mesh_instance:
				_rain_mesh_instance.visible = t > 0.1
		WeatherType.FOG:
			if _fog_mesh_instance:
				_fog_mesh_instance.visible = t > 0.1
		WeatherType.STORM:
			if _rain_mesh_instance:
				_rain_mesh_instance.visible = t > 0.1
			if _fog_mesh_instance:
				_fog_mesh_instance.visible = t > 0.1

func _update_rain(delta: float) -> void:
	if not _rain_mesh_instance or not _rain_mesh_instance.visible:
		return
	
	var imesh = _rain_mesh_instance.mesh as ImmediateMesh
	if imesh:
		imesh.surface_begin(Mesh.PRIMITIVE_LINES)
		imesh.surface_set_color(Color(0.7, 0.8, 1.0, rain_opacity))
		
		for i in range(rain_particle_count / 10):
			var x = randf_range(-100, 100)
			var y = randf_range(0, 50)
			var z = randf_range(-100, 100)
			imesh.surface_add_vertex(Vector3(x, y, z))
			imesh.surface_add_vertex(Vector3(x, y - 2, z))
		
		imesh.surface_end()

func _update_storm(delta: float) -> void:
	_update_rain(delta)
	
	_lightning_timer -= delta
	if _lightning_timer <= 0 and not _lightning_active:
		_trigger_lightning()
		_lightning_timer = randf_range(2.0, storm_lightning_interval)

func _trigger_lightning() -> void:
	_lightning_active = true
	_storm_light.light_energy = 5.0
	_storm_light.visible = true
	
	await get_tree().create_timer(0.1).timeout
	
	_storm_light.light_energy = 0.0
	_storm_light.visible = false
	
	_lightning_active = false

func set_weather(type: int) -> bool:
	if type == _current_weather and not _is_transitioning:
		return false
	
	if type == _current_weather and _is_transitioning:
		_target_weather = type as WeatherType
		return true
	
	weather_transition_started.emit()
	
	if _transition_progress >= 1.0 or not _is_transitioning:
		_target_weather = type as WeatherType
		_transition_progress = 0.0
		_is_transitioning = true
		weather_changed.emit(_current_weather, _target_weather)
	else:
		_target_weather = type as WeatherType
	
	_apply_weather_effects(false)
	return true

func _apply_weather_effects(fully_on: bool) -> void:
	_rain_mesh_instance.visible = false
	_fog_mesh_instance.visible = false
	_storm_light.visible = false
	
	var opacity = 1.0 if fully_on else _transition_progress
	
	match _target_weather:
		WeatherType.CLEAR:
			pass
		WeatherType.CLOUDY:
			pass
		WeatherType.RAIN:
			if _rain_mesh_instance:
				_rain_mesh_instance.visible = opacity > 0.1
		WeatherType.FOG:
			if _fog_mesh_instance:
				_fog_mesh_instance.visible = opacity > 0.1
		WeatherType.STORM:
			if _rain_mesh_instance:
				_rain_mesh_instance.visible = opacity > 0.1
			if _fog_mesh_instance:
				_fog_mesh_instance.visible = opacity > 0.1

func get_weather_name(type: int) -> String:
	return WeatherType.keys()[type]

func get_current_weather() -> int:
	return _current_weather

func is_transitioning() -> bool:
	return _is_transitioning

func get_transition_progress() -> float:
	return _transition_progress
