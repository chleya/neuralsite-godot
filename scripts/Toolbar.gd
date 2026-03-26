class_name Toolbar
extends Control

signal tool_selected(tool: String)

var container: HBoxContainer
var _tool_buttons: Dictionary = {}
var _current_tool: String = "select"
var _tool_manager: Node

var BUTTON_DEFS = [
	{"key": "select", "label": "S", "hint": "Select (1)"},
	{"key": "road", "label": "R", "hint": "Road (2)"},
	{"key": "bridge", "label": "B", "hint": "Bridge (3)"},
	{"key": "work_area", "label": "W", "hint": "Work Area (4)"},
	{"key": "fence", "label": "F", "hint": "Fence (5)"},
	{"key": "sign", "label": "G", "hint": "Sign (6)"},
	{"key": "measure", "label": "M", "hint": "Measure (M)"},
]

func _ready() -> void:
	_setup_ui()

func _setup_ui() -> void:
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.1, 0.15, 0.95)
	style.corner_radius_top_left = 6
	style.corner_radius_top_right = 6
	style.corner_radius_bottom_left = 6
	style.corner_radius_bottom_right = 6
	style.content_margin_left = 8
	style.content_margin_right = 8
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	add_theme_stylebox_override("panel", style)

	container = HBoxContainer.new()
	container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	container.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	add_child(container)

	for def in BUTTON_DEFS:
		var btn = Button.new()
		btn.text = def["label"]
		btn.tooltip_text = def["hint"]
		btn.custom_minimum_size = Vector2(36, 32)
		btn.pressed.connect(_on_tool_button_pressed.bind(def["key"]))
		container.add_child(btn)
		_tool_buttons[def["key"]] = btn

	var sep = VSeparator.new()
	container.add_child(sep)

	var snap_btn = Button.new()
	snap_btn.text = "Snap"
	snap_btn.tooltip_text = "Toggle Snap (N)"
	snap_btn.pressed.connect(_on_snap_pressed)
	container.add_child(snap_btn)
	_tool_buttons["snap"] = snap_btn

	var grid_btn = Button.new()
	grid_btn.text = "Grid"
	grid_btn.tooltip_text = "Cycle Grid Size (G)"
	grid_btn.pressed.connect(_on_grid_pressed)
	container.add_child(grid_btn)
	_tool_buttons["grid"] = grid_btn

	_update_button_states()

func setup(tool_manager: Node) -> void:
	_tool_manager = tool_manager
	_update_button_states()

func _on_tool_button_pressed(tool: String) -> void:
	_current_tool = tool
	_update_button_states()
	tool_selected.emit(tool)

func _on_snap_pressed() -> void:
	tool_selected.emit("toggle_snap")

func _on_grid_pressed() -> void:
	tool_selected.emit("cycle_grid")

func _update_button_states() -> void:
	for tool_name: String in _tool_buttons:
		if tool_name == "snap" or tool_name == "grid":
			continue
		var btn: Button = _tool_buttons[tool_name]
		if tool_name == _current_tool:
			var active_style = StyleBoxFlat.new()
			active_style.bg_color = Color(0.3, 0.5, 0.8, 1.0)
			active_style.corner_radius_top_left = 4
			active_style.corner_radius_top_right = 4
			active_style.corner_radius_bottom_left = 4
			active_style.corner_radius_bottom_right = 4
			btn.add_theme_stylebox_override("normal", active_style)
		else:
			btn.remove_theme_stylebox_override("normal")

func set_tool(tool: String) -> void:
	_current_tool = tool
	_update_button_states()

func get_tool() -> String:
	return _current_tool
