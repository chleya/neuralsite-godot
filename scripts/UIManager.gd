class_name UIManager
extends CanvasLayer

signal weather_changed(weather_type: int)
signal entity_selected(entity_id: String, entity_type: String)
signal help_toggled()

@export var show_help: bool = true
@export var show_weather_panel: bool = true

var _weather_panel: Control
var _help_panel: Control
var _entity_info_panel: Control
var _status_panel: Control

func _ready() -> void:
	_setup_weather_panel()
	_setup_entity_info_panel()
	_setup_help_panel()
	_setup_status_panel()
	print("[UIManager] Initialized")

func _setup_weather_panel() -> void:
	_weather_panel = _create_panel(Vector2(10, 10), Vector2(180, 150))
	_weather_panel.name = "WeatherPanel"
	
	var title = Label.new()
	title.text = "Weather"
	title.position = Vector2(10, 10)
	title.add_theme_font_size_override("font_size", 16)
	_weather_panel.add_child(title)
	
	var weather_types = ["Clear", "Cloudy", "Rain", "Fog", "Storm"]
	for i in range(weather_types.size()):
		var btn = Button.new()
		btn.text = weather_types[i]
		btn.position = Vector2(10, 40 + i * 28)
		btn.size = Vector2(160, 24)
		btn.pressed.connect(_on_weather_button.bind(i))
		_weather_panel.add_child(btn)
	
	add_child(_weather_panel)

func _setup_entity_info_panel() -> void:
	_entity_info_panel = _create_panel(Vector2(10, 170), Vector2(220, 200))
	_entity_info_panel.name = "EntityInfoPanel"
	
	var title = Label.new()
	title.name = "Title"
	title.text = "Entity Info"
	title.position = Vector2(10, 10)
	title.add_theme_font_size_override("font_size", 16)
	_entity_info_panel.add_child(title)
	
	var info = Label.new()
	info.name = "Info"
	info.text = "Click an entity"
	info.position = Vector2(10, 40)
	info.size = Vector2(200, 150)
	_entity_info_panel.add_child(info)
	
	add_child(_entity_info_panel)

func _setup_help_panel() -> void:
	_help_panel = _create_panel(Vector2(10, 380), Vector2(280, 180))
	_help_panel.name = "HelpPanel"
	
	var title = Label.new()
	title.text = "Controls"
	title.position = Vector2(10, 10)
	title.add_theme_font_size_override("font_size", 16)
	_help_panel.add_child(title)
	
	var help_text = [
		"SPACE: Rotate camera",
		"WASD: Move camera",
		"Mouse wheel: Zoom",
		"T: Toggle timeline",
		"R: Reset timeline",
		"E: Export data",
		"1-5: Create entities",
		"ESC: Deselect"
	]
	
	for i in range(help_text.size()):
		var label = Label.new()
		label.text = help_text[i]
		label.position = Vector2(10, 40 + i * 18)
		_help_panel.add_child(label)
	
	add_child(_help_panel)

func _setup_status_panel() -> void:
	_status_panel = _create_panel(Vector2(0, 0), Vector2(200, 60), true)
	_status_panel.name = "StatusPanel"
	_status_panel.anchor_right = 1.0
	
	var connection_label = Label.new()
	connection_label.name = "ConnectionLabel"
	connection_label.text = "Status: Connected"
	connection_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	connection_label.position = Vector2(0, 10)
	_status_panel.add_child(connection_label)
	
	var stats_label = Label.new()
	stats_label.name = "StatsLabel"
	stats_label.text = "Entities: 0 | FPS: 60"
	stats_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stats_label.position = Vector2(0, 35)
	_status_panel.add_child(stats_label)
	
	add_child(_status_panel)

func _create_panel(pos: Vector2, size: Vector2, anchor_right: bool = false) -> PanelContainer:
	var panel = PanelContainer.new()
	panel.position = pos
	panel.size = size
	
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.1, 0.1, 0.85)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 10
	style.content_margin_top = 10
	style.content_margin_right = 10
	style.content_margin_bottom = 10
	panel.add_theme_stylebox_override("panel", style)
	
	return panel

func _on_weather_button(index: int) -> void:
	weather_changed.emit(index)
	print("[UIManager] Weather changed to: %s" % WeatherSystem.WeatherType.keys()[index])

func update_entity_info(entity_id: String, entity_type: String, info: Dictionary) -> void:
	var info_label = _entity_info_panel.get_node_or_null("Info")
	if info_label:
		var text = "ID: %s\n" % entity_id
		text += "Type: %s\n" % entity_type
		for key in info:
			text += "%s: %s\n" % [key, str(info[key])]
		info_label.text = text
	
	entity_selected.emit(entity_id, entity_type)

func clear_entity_info() -> void:
	var info_label = _entity_info_panel.get_node_or_null("Info")
	if info_label:
		info_label.text = "Click an entity"

func update_status(text: String) -> void:
	var label = _status_panel.get_node_or_null("ConnectionLabel")
	if label:
		label.text = text

func update_stats(entities_count: int, fps: float) -> void:
	var label = _status_panel.get_node_or_null("StatsLabel")
	if label:
		label.text = "Entities: %d | FPS: %.0f" % [entities_count, fps]

func toggle_help() -> void:
	show_help = not show_help
	if _help_panel:
		_help_panel.visible = show_help
	help_toggled.emit()

func toggle_weather_panel() -> void:
	show_weather_panel = not show_weather_panel
	if _weather_panel:
		_weather_panel.visible = show_weather_panel
