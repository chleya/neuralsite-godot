extends Node

signal camera_moved
signal entity_clicked(entity: Node)
signal key_pressed(key: String)

@export var camera_speed: float = 20.0
@export var camera_rotate_speed: float = 2.0
@export var zoom_speed: float = 5.0
@export var min_zoom: float = 10.0
@export var max_zoom: float = 100.0

var _camera: Camera3D
var _is_rotating: bool = false
var _last_mouse_position: Vector2 = Vector2.ZERO
var _current_zoom: float = 50.0

func _ready() -> void:
	print("[InputHandler] Initialized")

func setup_camera(camera: Camera3D) -> void:
	_camera = camera
	_current_zoom = _camera.size if _camera else 50.0

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		_handle_key_event(event)
	
	if event is InputEventMouseButton:
		_handle_mouse_button(event)
	
	if event is InputEventMouseMotion:
		_handle_mouse_motion(event)

func _handle_key_event(event: InputEventKey) -> void:
	match event.keycode:
		KEY_SPACE:
			_toggle_camera_rotation()
		KEY_W:
			_move_camera(Vector3.FORWARD)
		KEY_S:
			_move_camera(Vector3.BACK)
		KEY_A:
			_move_camera(Vector3.LEFT)
		KEY_D:
			_move_camera(Vector3.RIGHT)
		KEY_R:
			_reset_timeline()
		KEY_T:
			_toggle_timeline()
		KEY_E:
			_export_data()
		KEY_ESCAPE:
			_deselect_entity()
		KEY_F1:
			_toggle_help()
		KEY_1, KEY_2, KEY_3, KEY_4, KEY_5:
			_create_entity(int(event.keycode) - KEY_1 + 1)
	
	key_pressed.emit(event.as_text())

func _handle_mouse_button(event: InputEventMouseButton) -> void:
	match event.button_index:
		MOUSE_BUTTON_WHEEL_UP:
			_zoom_camera(-zoom_speed)
		MOUSE_BUTTON_WHEEL_DOWN:
			_zoom_camera(zoom_speed)
		MOUSE_BUTTON_RIGHT:
			_is_rotating = event.pressed
			if _is_rotating:
				_last_mouse_position = event.position

func _handle_mouse_motion(event: InputEventMouseMotion) -> void:
	if _is_rotating and _camera:
		var delta = event.position - _last_mouse_position
		_last_mouse_position = event.position
		
		var rotate_y = -delta.x * camera_rotate_speed * 0.01
		var rotate_x = -delta.y * camera_rotate_speed * 0.01
		
		_camera.rotation.y += rotate_y
		_camera.rotation.x = clamp(_camera.rotation.x + rotate_x, -PI/3, PI/3)
		camera_moved.emit()

func _toggle_camera_rotation() -> void:
	_is_rotating = not _is_rotating
	print("[InputHandler] Camera rotation: %s" % _is_rotating)

func _move_camera(direction: Vector3) -> void:
	if not _camera:
		return
	
	var offset = direction * camera_speed * get_process_delta_time()
	_camera.position += offset.rotated(Vector3.UP, _camera.rotation.y)
	camera_moved.emit()

func _zoom_camera(delta: float) -> void:
	if not _camera:
		return
	
	_current_zoom = clamp(_current_zoom + delta, min_zoom, max_zoom)
	_camera.size = _current_zoom

func _reset_timeline() -> void:
	var main = get_tree().root.get_node_or_null("Main")
	if main and main.has("timeline_manager"):
		var tm = main.get("timeline_manager")
		if tm and tm.has_method("reset"):
			tm.reset()
			print("[InputHandler] Timeline reset")

func _toggle_timeline() -> void:
	var main = get_tree().root.get_node_or_null("Main")
	if main and main.has("timeline_manager"):
		var tm = main.get("timeline_manager")
		if tm and tm.has_method("toggle"):
			tm.toggle()
			print("[InputHandler] Timeline toggled")

func _export_data() -> void:
	var main = get_tree().root.get_node_or_null("Main")
	if main and main.has("godot_exporter"):
		var exporter = main.get("godot_exporter")
		if exporter and exporter.has_method("export_modifications"):
			exporter.export_modifications()
			print("[InputHandler] Data exported")

func _deselect_entity() -> void:
	var main = get_tree().root.get_node_or_null("Main")
	if main and main.has("selected_entity"):
		main.set("selected_entity", null)
		print("[InputHandler] Entity deselected")

func _toggle_help() -> void:
	var main = get_tree().root.get_node_or_null("Main")
	if main and main.has("ui_manager"):
		var ui = main.get("ui_manager")
		if ui and ui.has_method("toggle_help"):
			ui.toggle_help()
			print("[InputHandler] Help toggled")

func _create_entity(index: int) -> void:
	print("[InputHandler] Create entity: %d" % index)

func is_camera_rotating() -> bool:
	return _is_rotating
