class_name DayNightCycle
extends Node3D

@export var day_duration_minutes: float = 3.0
@export var sun_intensity: float = 1.0
@export var moon_intensity: float = 0.1

var _sun_light: DirectionalLight3D
var _ambient_light: WorldEnvironment
var _current_time: float = 0.5
var _is_playing: bool = true

var _sunrise_color := Color(1.0, 0.7, 0.4)
var _day_color := Color(1.0, 0.95, 0.85)
var _sunset_color := Color(1.0, 0.5, 0.3)
var _night_color := Color(0.2, 0.25, 0.4)

func _ready() -> void:
	_setup_lighting()
	print("[DayNightCycle] Initialized")

func _setup_lighting() -> void:
	_sun_light = DirectionalLight3D.new()
	_sun_light.name = "SunLight"
	_sun_light.rotation_degrees = Vector3(-45, 30, 0)
	_sun_light.light_color = _day_color
	_sun_light.light_energy = sun_intensity
	_sun_light.shadow_enabled = true
	add_child(_sun_light)

func _process(delta: float) -> void:
	if _is_playing:
		var day_progress = 1.0 / (day_duration_minutes * 60.0)
		_current_time += delta * day_progress
		if _current_time >= 1.0:
			_current_time = 0.0
		_update_lighting()

func _update_lighting() -> void:
	var t = _current_time
	
	var sun_angle = lerp(-90.0, 270.0, t)
	_sun_light.rotation_degrees.x = sun_angle
	
	var light_color: Color
	var light_energy: float
	
	if t < 0.25:
		var sunrise_t = t / 0.25
		light_color = _sunrise_color.lerp(_day_color, sunrise_t)
		light_energy = lerp(0.2, sun_intensity, sunrise_t)
	elif t < 0.5:
		light_color = _day_color
		light_energy = sun_intensity
	elif t < 0.75:
		var sunset_t = (t - 0.5) / 0.25
		light_color = _day_color.lerp(_sunset_color, sunset_t)
		light_energy = lerp(sun_intensity, 0.3, sunset_t)
	else:
		var night_t = (t - 0.75) / 0.25
		light_color = _night_color
		light_energy = lerp(0.3, moon_intensity, night_t)
	
	_sun_light.light_color = light_color
	_sun_light.light_energy = light_energy
	
	if has_node("/root/Main/WorldEnvironment"):
		var env = get_node("/root/Main/WorldEnvironment")
		if env and env.environment:
			var sky_t = abs(t - 0.5) * 2
			var sky_color = _night_color.lerp(Color(0.4, 0.6, 0.9), 1.0 - sky_t)
			env.environment.background_default_color = sky_color

func set_time(t: float) -> void:
	_current_time = clamp(t, 0.0, 1.0)
	_update_lighting()

func get_time() -> float:
	return _current_time

func is_daytime() -> bool:
	return _current_time < 0.75 and _current_time > 0.25

func pause() -> void:
	_is_playing = false

func play() -> void:
	_is_playing = true

func toggle() -> void:
	_is_playing = not _is_playing
