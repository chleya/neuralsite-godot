class_name StatusBar
extends Control

signal snap_mode_changed(mode: String)
signal grid_size_changed(size: float)

var container: HBoxContainer
var coord_label: Label
var station_label: Label
var snap_label: Label
var distance_label: Label
var hint_label: Label

var _space_service: SpaceService
var _start_point: Vector3
var _start_station: String
var _is_measuring: bool = false

func _ready() -> void:
	_setup_ui()
	_reset_display()

func _setup_ui() -> void:
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.08, 0.08, 0.1, 0.9)
	style.corner_radius_top_left = 4
	style.corner_radius_top_right = 4
	style.corner_radius_bottom_left = 4
	style.corner_radius_bottom_right = 4
	style.content_margin_left = 12
	style.content_margin_right = 12
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	add_theme_stylebox_override("panel", style)

	container = HBoxContainer.new()
	container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	container.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	add_child(container)

	coord_label = Label.new()
	coord_label.text = "X:--- Y:--- Z:---"
	coord_label.add_theme_font_size_override("font_size", 12)
	coord_label.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	container.add_child(coord_label)

	var sep1 = Label.new()
	sep1.text = " | "
	container.add_child(sep1)

	station_label = Label.new()
	station_label.text = "---"
	station_label.add_theme_font_size_override("font_size", 12)
	station_label.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	container.add_child(station_label)

	var sep2 = Label.new()
	sep2.text = " | "
	container.add_child(sep2)

	snap_label = Label.new()
	snap_label.text = "Snap: OFF"
	snap_label.add_theme_font_size_override("font_size", 12)
	snap_label.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	container.add_child(snap_label)

	var sep3 = Label.new()
	sep3.text = " | "
	container.add_child(sep3)

	distance_label = Label.new()
	distance_label.text = ""
	distance_label.add_theme_font_size_override("font_size", 12)
	distance_label.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	container.add_child(distance_label)

	var spacer = Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	container.add_child(spacer)

	hint_label = Label.new()
	hint_label.text = "SPACE+Drag: Rotate | WASD: Move | Scroll: Zoom"
	hint_label.add_theme_font_size_override("font_size", 11)
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	hint_label.size_flags_horizontal = Control.SIZE_SHRINK_END
	container.add_child(hint_label)

func _reset_display() -> void:
	coord_label.text = "X:--- Y:--- Z:---"
	station_label.text = "---"
	snap_label.text = "Snap: OFF"
	distance_label.text = ""
	hint_label.text = "SPACE+Drag: Rotate | WASD: Move | Scroll: Zoom"

func setup(space_service: SpaceService) -> void:
	_space_service = space_service
	_space_service.mouse_position_changed.connect(_on_mouse_position_changed)
	_space_service.connect("snap_mode_changed", _on_snap_mode_changed)

func _on_mouse_position_changed(coord: Vector3, station: String) -> void:
	coord_label.text = _space_service.format_coord(coord)
	station_label.text = station

	if _is_measuring and _space_service:
		var dist = coord.distance_to(_start_point)
		distance_label.text = "Dist: %s" % _space_service.format_length(dist)

func _on_snap_mode_changed(mode: String) -> void:
	if _space_service:
		snap_label.text = _space_service.get_snap_status()

func set_snap_mode(mode: String) -> void:
	if _space_service:
		_space_service.set_snap_mode(mode)
		snap_label.text = _space_service.get_snap_status()
		snap_mode_changed.emit(mode)

func set_grid_size(size: float) -> void:
	if _space_service:
		_space_service.set_grid_size(size)
		snap_label.text = _space_service.get_snap_status()
		grid_size_changed.emit(size)

func toggle_snap() -> void:
	if _space_service:
		_space_service.set_snap_enabled(not _space_service.is_snap_enabled())
		snap_label.text = _space_service.get_snap_status()

func cycle_snap_mode() -> void:
	if _space_service:
		var modes = ["grid", "station", "object", "off"]
		var current = _space_service.get_snap_mode()
		if not _space_service.is_snap_enabled():
			_space_service.set_snap_enabled(true)
			_space_service.set_snap_mode("grid")
		else:
			var idx = modes.find(current)
			if idx < 0:
				idx = 0
			else:
				idx = (idx + 1) % modes.size()
				if modes[idx] == "off":
					_space_service.set_snap_enabled(false)
			_space_service.set_snap_mode(modes[idx])
		snap_label.text = _space_service.get_snap_status()
		snap_mode_changed.emit(_space_service.get_snap_mode())

func start_measurement(point: Vector3, station: String) -> void:
	_start_point = point
	_start_station = station
	_is_measuring = true
	distance_label.text = "Dist: 0.0 m"

func end_measurement() -> Dictionary:
	_is_measuring = false
	var result = {
		"start": _start_station,
		"start_point": _start_point,
		"end_station": station_label.text,
		"end_point": _space_service.get_mouse_position()["coord"] if _space_service else _start_point
	}
	distance_label.text = ""
	return result

func get_current_station() -> String:
	return station_label.text

func get_current_coord() -> Vector3:
	return _space_service.get_mouse_position()["coord"] if _space_service else Vector3.ZERO

func set_hint(text: String) -> void:
	hint_label.text = text

func show_temporary_hint(text: String, duration: float = 3.0) -> void:
	hint_label.text = text
	await get_tree().create_timer(duration).timeout
	hint_label.text = "SPACE+Drag: Rotate | WASD: Move | Scroll: Zoom"

func show_distance(from: Vector3, to: Vector3) -> void:
	if _space_service:
		var dist = from.distance_to(to)
		distance_label.text = "Dist: %s" % _space_service.format_length(dist)

func get_snap_enabled() -> bool:
	return _space_service.is_snap_enabled() if _space_service else false

func get_snap_mode() -> String:
	return _space_service.get_snap_mode() if _space_service else "off"

func get_grid_size() -> float:
	return _space_service.get_grid_size() if _space_service else 1.0
