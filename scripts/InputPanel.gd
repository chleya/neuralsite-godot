class_name InputPanel
extends PanelContainer

signal road_create_requested(params: Dictionary)
signal bridge_create_requested(params: Dictionary)
signal work_area_create_requested(params: Dictionary)
signal entity_selected(entity_id: String)
signal cancelled()

var title_label: Label
var type_option: OptionButton
var name_input: LineEdit
var start_station_input: LineEdit
var end_station_input: LineEdit
var width_input: SpinBox
var lanes_input: SpinBox
var lateral_input: SpinBox
var elevation_input: SpinBox
var length_label: Label
var phase_option: OptionButton
var progress_slider: HSlider
var progress_label: Label
var preview_button: Button
var cancel_button: Button
var create_button: Button

var _space_service: SpaceService
var _current_type: String = "road"
var _is_preview_mode: bool = false
var _vbox: VBoxContainer

const ENTITY_TYPES = ["road", "bridge", "work_area", "fence", "sign"]
const PHASES = ["planning", "clearing", "earthwork", "pavement", "finishing", "completed"]

func _ready() -> void:
	_setup_ui()
	_reset_inputs()

func _setup_ui() -> void:
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.12, 0.12, 0.15, 0.95)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 12
	style.content_margin_top = 10
	style.content_margin_right = 12
	style.content_margin_bottom = 10
	add_theme_stylebox_override("panel", style)

	_vbox = VBoxContainer.new()
	_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_vbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	add_child(_vbox)

	title_label = Label.new()
	title_label.text = "Entity Properties"
	title_label.add_theme_font_size_override("font_size", 16)
	_vbox.add_child(title_label)

	type_option = OptionButton.new()
	for t in ENTITY_TYPES:
		type_option.add_item(t.capitalize())
	type_option.item_selected.connect(_on_type_selected)
	_vbox.add_child(type_option)

	var grid = GridContainer.new()
	grid.columns = 2
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_vbox.add_child(grid)

	name_input = LineEdit.new()
	name_input.placeholder_text = "Entity Name"
	grid.add_child(_make_label("Name:"))
	grid.add_child(name_input)

	start_station_input = LineEdit.new()
	start_station_input.placeholder_text = "K0+000"
	start_station_input.text_submitted.connect(_on_station_input_changed)
	grid.add_child(_make_label("Start:"))
	grid.add_child(start_station_input)

	end_station_input = LineEdit.new()
	end_station_input.placeholder_text = "K0+500"
	end_station_input.text_submitted.connect(_on_station_input_changed)
	grid.add_child(_make_label("End:"))
	grid.add_child(end_station_input)

	width_input = SpinBox.new()
	width_input.step = 0.1
	width_input.value = 14.0
	width_input.min_value = 3.0
	width_input.max_value = 50.0
	grid.add_child(_make_label("Width:"))
	grid.add_child(width_input)

	lanes_input = SpinBox.new()
	lanes_input.step = 1
	lanes_input.value = 4
	lanes_input.min_value = 1
	lanes_input.max_value = 8
	grid.add_child(_make_label("Lanes:"))
	grid.add_child(lanes_input)

	lateral_input = SpinBox.new()
	lateral_input.step = 0.1
	lateral_input.value = 0.0
	lateral_input.min_value = -20.0
	lateral_input.max_value = 20.0
	grid.add_child(_make_label("Lateral:"))
	grid.add_child(lateral_input)

	elevation_input = SpinBox.new()
	elevation_input.step = 0.1
	elevation_input.value = 0.0
	elevation_input.min_value = -50.0
	elevation_input.max_value = 100.0
	grid.add_child(_make_label("Elevation:"))
	grid.add_child(elevation_input)

	length_label = Label.new()
	length_label.text = "Length: ---"
	_vbox.add_child(length_label)

	var grid2 = GridContainer.new()
	grid2.columns = 2
	grid2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_vbox.add_child(grid2)

	phase_option = OptionButton.new()
	for p in PHASES:
		phase_option.add_item(p.capitalize())
	grid2.add_child(_make_label("Phase:"))
	grid2.add_child(phase_option)

	progress_slider = HSlider.new()
	progress_slider.step = 0.01
	progress_slider.value = 0.0
	progress_slider.min_value = 0.0
	progress_slider.max_value = 1.0
	progress_slider.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	progress_slider.value_changed.connect(_on_progress_changed)

	progress_label = Label.new()
	progress_label.text = "0%"
	progress_label.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN

	grid2.add_child(_make_label("Progress:"))
	var slider_row = HBoxContainer.new()
	slider_row.add_child(progress_slider)
	slider_row.add_child(progress_label)
	grid2.add_child(slider_row)

	var button_row = HBoxContainer.new()
	button_row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_vbox.add_child(button_row)

	preview_button = Button.new()
	preview_button.text = "Preview"
	preview_button.pressed.connect(_on_preview_pressed)
	button_row.add_child(preview_button)

	cancel_button = Button.new()
	cancel_button.text = "Cancel"
	cancel_button.pressed.connect(_on_cancel_pressed)
	button_row.add_child(cancel_button)

	create_button = Button.new()
	create_button.text = "Create"
	create_button.pressed.connect(_on_create_pressed)
	button_row.add_child(create_button)

	_update_input_visibility()

func _make_label(text: String) -> Label:
	var label = Label.new()
	label.text = text
	return label

func _reset_inputs() -> void:
	name_input.text = ""
	start_station_input.text = "K0+000"
	end_station_input.text = "K0+500"
	width_input.value = 14.0
	lanes_input.value = 4
	lateral_input.value = 0.0
	elevation_input.value = 0.0
	phase_option.selected = 0
	progress_slider.value = 0.0
	length_label.text = "Length: ---"
	_is_preview_mode = false
	preview_button.text = "Preview"

func _on_type_selected(index: int) -> void:
	_current_type = ENTITY_TYPES[index]
	_update_input_visibility()
	_reset_inputs()

func _update_input_visibility() -> void:
	match _current_type:
		"road":
			name_input.placeholder_text = "Road Name"
			lanes_input.visible = true
			width_input.visible = true
		"bridge":
			name_input.placeholder_text = "Bridge Name"
			lanes_input.visible = false
			width_input.visible = true
		"work_area":
			name_input.placeholder_text = "Work Area Name"
			lanes_input.visible = false
			width_input.visible = true
		"fence", "sign":
			name_input.placeholder_text = _current_type.capitalize() + " Name"
			lanes_input.visible = false
			width_input.visible = false

func _on_station_input_changed(text: String) -> void:
	_update_length_display()

func _update_length_display() -> void:
	if not _space_service:
		return

	var start_text = start_station_input.text.strip_edges()
	var end_text = end_station_input.text.strip_edges()

	if start_text.is_empty() or end_text.is_empty():
		length_label.text = "Length: ---"
		return

	var length = _space_service.calculate_distance(start_text, end_text)
	length_label.text = "Length: %s" % _space_service.format_length(length)

func _on_progress_changed(value: float) -> void:
	progress_label.text = "%.0f%%" % (value * 100)

func _on_preview_pressed() -> void:
	_is_preview_mode = not _is_preview_mode
	preview_button.text = "Exit Preview" if _is_preview_mode else "Preview"

	var params = _collect_params()
	params["preview"] = _is_preview_mode
	params["action"] = "preview" if _is_preview_mode else "exit_preview"
	_emit_create_requested(params)

func _on_cancel_pressed() -> void:
	_hide()
	cancelled.emit()

func _on_create_pressed() -> void:
	var params = _collect_params()
	params["action"] = "create"
	_emit_create_requested(params)
	_hide()

func _collect_params() -> Dictionary:
	var start_station = start_station_input.text.strip_edges()
	var end_station = end_station_input.text.strip_edges()

	var params = {
		"type": _current_type,
		"name": name_input.text.strip_edges() if not name_input.text.strip_edges().is_empty() else _generate_name(),
		"start_station": start_station,
		"end_station": end_station,
		"width": width_input.value,
		"lanes": lanes_input.value,
		"lateral_offset": lateral_input.value,
		"elevation": elevation_input.value,
		"phase": PHASES[phase_option.selected],
		"progress": progress_slider.value,
	}

	if _space_service:
		params["length"] = _space_service.calculate_distance(start_station, end_station)
		params["start_coord"] = _space_service.station_to_coord3d(start_station, lateral_input.value, elevation_input.value)
		params["end_coord"] = _space_service.station_to_coord3d(end_station, lateral_input.value, elevation_input.value)

	return params

func _generate_name() -> String:
	var start = start_station_input.text.strip_edges()
	var end = end_station_input.text.strip_edges()
	return "%s to %s %s" % [start, end, _current_type.capitalize()]

func _emit_create_requested(params: Dictionary) -> void:
	match _current_type:
		"road", "fence", "sign":
			road_create_requested.emit(params)
		"bridge":
			bridge_create_requested.emit(params)
		"work_area":
			work_area_create_requested.emit(params)

func setup(space_service: SpaceService) -> void:
	_space_service = space_service

func show_panel(preset_type: String = "road") -> void:
	var index = ENTITY_TYPES.find(preset_type)
	if index >= 0:
		type_option.selected = index
		_current_type = preset_type
		_update_input_visibility()

	_reset_inputs()
	_show()

func _show() -> void:
	visible = true
	name_input.grab_focus()

func _hide() -> void:
	visible = false

func is_visible() -> bool:
	return visible

func set_values(params: Dictionary) -> void:
	if params.has("name"):
		name_input.text = params["name"]
	if params.has("start_station"):
		start_station_input.text = params["start_station"]
	if params.has("end_station"):
		end_station_input.text = params["end_station"]
	if params.has("width"):
		width_input.value = params["width"]
	if params.has("lanes"):
		lanes_input.value = params["lanes"]
	if params.has("lateral_offset"):
		lateral_input.value = params["lateral_offset"]
	if params.has("elevation"):
		elevation_input.value = params["elevation"]
	if params.has("phase"):
		var idx = PHASES.find(params["phase"])
		if idx >= 0:
			phase_option.selected = idx
	if params.has("progress"):
		progress_slider.value = params["progress"]

	_update_length_display()

func get_current_type() -> String:
	return _current_type

func set_station_range(start: String, end: String) -> void:
	start_station_input.text = start
	end_station_input.text = end
	_update_length_display()

func get_station_range() -> Dictionary:
	return {
		"start": start_station_input.text.strip_edges(),
		"end": end_station_input.text.strip_edges()
	}

func validate_inputs() -> Dictionary:
	var errors = []
	var warnings = []

	var start = start_station_input.text.strip_edges()
	var end = end_station_input.text.strip_edges()

	if start.is_empty():
		errors.append("Start station is required")
	elif _space_service and _space_service.parse_station(start) <= 0:
		errors.append("Invalid start station format")

	if end.is_empty():
		errors.append("End station is required")
	elif _space_service and _space_service.parse_station(end) <= 0:
		errors.append("Invalid end station format")

	if _space_service and not start.is_empty() and not end.is_empty():
		if _space_service.parse_station(start) >= _space_service.parse_station(end):
			errors.append("End station must be greater than start station")

	if name_input.text.strip_edges().is_empty():
		warnings.append("Name is empty, will be auto-generated")

	return {
		"valid": errors.is_empty(),
		"errors": errors,
		"warnings": warnings
	}
