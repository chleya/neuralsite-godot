extends Node3D

@export_group("Backend", "backend_")
@export var use_mock_api: bool = true

@onready var time_slider: HSlider = $CanvasLayer/UI/TimeSlider
@onready var progress_label: Label = $CanvasLayer/UI/ProgressLabel
@onready var mode_button: Button = $CanvasLayer/UI/ModeButton
@onready var day_label: Label = $CanvasLayer/UI/DayLabel
@onready var phase_label: Label = $CanvasLayer/UI/PhaseLabel
@onready var status_label: Label = $CanvasLayer/UI/StatusLabel
@onready var entity_info_label: Label = $CanvasLayer/UI/EntityInfoLabel
@onready var ui_root: Control = $CanvasLayer/UI
@onready var camera: Camera3D = $Camera3D
@onready var road_container: Node3D = $RoadContainer
@onready var entity_container: Node3D = $EntityContainer

var timeline_manager: TimelineManager
var entity_factory: EntityFactory
var backend_service: Node
var api_client: Node
var site_assistant_service: SiteAssistantService
var space_service: SpaceService
var tool_manager: ToolManager
var status_bar: StatusBar
var input_panel: InputPanel
var toolbar: Toolbar
var road_tool: RoadTool

var selected_entity: Node = null
var entities: Array[Node] = []
var assistant_panel: PanelContainer
var assistant_summary_label: Label
var assistant_tasks_label: Label
var assistant_issues_label: Label
var assistant_reports_label: Label
var assistant_hint_label: Label
var assistant_actions_label: Label
var assistant_form_panel: PanelContainer
var form_type_option: OptionButton
var form_title_input: LineEdit
var form_owner_input: LineEdit
var form_notes_input: TextEdit
var form_submit_button: Button
var complete_task_button: Button
var progress_issue_button: Button
var close_issue_button: Button
var validation_panel: PanelContainer
var validation_log_label: Label
var validation_clear_button: Button

var camera_distance: float = 50.0
var camera_angle: float = 0.0
var camera_height: float = 20.0
var is_rotating: bool = false
var is_panning: bool = false
var last_mouse_pos: Vector2 = Vector2.ZERO
var camera_target: Vector3 = Vector3.ZERO
var last_click_time: float = 0.0
var last_click_pos: Vector2 = Vector2.ZERO
var validation_log_lines: PackedStringArray = []

func _ready() -> void:
	_init_core_services()
	_setup_ui()
	_setup_site_assistant()
	_create_demo_entities()
	_refresh_stats()
	status_label.text = "System: Ready"
	print("[Main] Scene assembled with explicit service injection")

func _init_core_services() -> void:
	timeline_manager = TimelineManager.new()
	timeline_manager.name = "TimelineManager"
	add_child(timeline_manager)
	timeline_manager.day_changed.connect(_on_day_changed)
	timeline_manager.phase_changed.connect(_on_phase_changed)
	timeline_manager.milestone_reached.connect(_on_milestone_reached)

	entity_factory = EntityFactory.new(entity_container)
	api_client = _resolve_api_client()

	var backend_script = load("res://scripts/BackendService.gd")
	if backend_script:
		backend_service = backend_script.new()
		backend_service.name = "BackendService"
		add_child(backend_service)
		backend_service.setup(api_client)
		if backend_service.has_signal("entity_sync_completed"):
			backend_service.entity_sync_completed.connect(_on_backend_entity_sync)

	_init_precision_services()

func _init_precision_services() -> void:
	space_service = SpaceService.new()
	space_service.name = "SpaceService"
	add_child(space_service)

	toolbar = Toolbar.new()
	toolbar.name = "Toolbar"
	ui_root.add_child(toolbar)
	toolbar.position = Vector2(20, 60)

	status_bar = StatusBar.new()
	status_bar.name = "StatusBar"
	ui_root.add_child(status_bar)
	status_bar.position = Vector2(20, 500)
	status_bar.size = Vector2(800, 40)
	status_bar.setup(space_service)

	input_panel = InputPanel.new()
	input_panel.name = "InputPanel"
	ui_root.add_child(input_panel)
	input_panel.position = Vector2(820, 20)
	input_panel.size = Vector2(380, 480)
	input_panel.setup(space_service)
	input_panel.visible = false

	tool_manager = ToolManager.new()
	tool_manager.name = "ToolManager"
	add_child(tool_manager)
	tool_manager.setup(space_service, status_bar, input_panel, entity_factory)

	road_tool = RoadTool.new()
	road_tool.name = "RoadTool"
	add_child(road_tool)
	road_tool.setup(space_service, status_bar)
	road_tool.road_completed.connect(_on_road_tool_completed)
	road_tool.road_preview_updated.connect(_on_road_preview_updated)

	tool_manager.tool_action.connect(_on_tool_action)
	toolbar.tool_selected.connect(_on_toolbar_tool_selected)

	space_service.mouse_position_changed.connect(_on_mouse_position_changed)

	status_bar.snap_mode_changed.connect(_on_snap_mode_changed)
	status_bar.grid_size_changed.connect(_on_grid_size_changed)

	print("[Main] Precision services initialized")

func _setup_site_assistant() -> void:
	site_assistant_service = SiteAssistantService.new()
	site_assistant_service.name = "SiteAssistantService"
	add_child(site_assistant_service)
	site_assistant_service.summary_changed.connect(_on_site_summary_changed)
	site_assistant_service.task_added.connect(_on_site_records_changed)
	site_assistant_service.issue_added.connect(_on_site_records_changed)
	site_assistant_service.daily_report_added.connect(_on_site_records_changed)
	site_assistant_service.task_updated.connect(_on_site_records_changed)
	site_assistant_service.issue_updated.connect(_on_site_records_changed)
	site_assistant_service.set_current_day(0)
	site_assistant_service.create_demo_data()
	_build_assistant_panel()
	_build_assistant_form_panel()
	_build_validation_panel()

func _setup_ui() -> void:
	time_slider.min_value = 0
	time_slider.max_value = 365
	time_slider.step = 1
	time_slider.value = 0
	time_slider.value_changed.connect(_on_slider_changed)

	mode_button.text = "Mode: LIVE"
	mode_button.pressed.connect(_on_mode_toggled)

	entity_info_label.text = "No entity selected"
	day_label.text = "Day: 0"
	phase_label.text = "Phases: planning"

func _build_assistant_panel() -> void:
	assistant_panel = PanelContainer.new()
	assistant_panel.name = "AssistantPanel"
	assistant_panel.position = Vector2(20, 300)
	assistant_panel.size = Vector2(420, 260)

	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.08, 0.1, 0.12, 0.9)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 12
	style.content_margin_top = 10
	style.content_margin_right = 12
	style.content_margin_bottom = 10
	assistant_panel.add_theme_stylebox_override("panel", style)

	var container := VBoxContainer.new()
	container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	assistant_panel.add_child(container)

	var title := Label.new()
	title.text = "Site Assistant"
	title.add_theme_font_size_override("font_size", 18)
	container.add_child(title)

	assistant_hint_label = Label.new()
	assistant_hint_label.text = "Q task | W issue | R report | T play/pause | PgUp sync"
	assistant_hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(assistant_hint_label)

	assistant_summary_label = Label.new()
	assistant_summary_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(assistant_summary_label)

	assistant_tasks_label = Label.new()
	assistant_tasks_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(assistant_tasks_label)

	assistant_issues_label = Label.new()
	assistant_issues_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(assistant_issues_label)

	assistant_reports_label = Label.new()
	assistant_reports_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(assistant_reports_label)

	assistant_actions_label = Label.new()
	assistant_actions_label.text = "Actions"
	container.add_child(assistant_actions_label)

	var actions := HBoxContainer.new()
	actions.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	container.add_child(actions)

	complete_task_button = Button.new()
	complete_task_button.text = "Complete Task"
	complete_task_button.pressed.connect(_complete_first_due_task)
	actions.add_child(complete_task_button)

	progress_issue_button = Button.new()
	progress_issue_button.text = "Start Issue"
	progress_issue_button.pressed.connect(_progress_first_issue)
	actions.add_child(progress_issue_button)

	close_issue_button = Button.new()
	close_issue_button.text = "Close Issue"
	close_issue_button.pressed.connect(_close_first_issue)
	actions.add_child(close_issue_button)

	ui_root.add_child(assistant_panel)
	_refresh_assistant_panel()

func _build_assistant_form_panel() -> void:
	assistant_form_panel = PanelContainer.new()
	assistant_form_panel.name = "AssistantFormPanel"
	assistant_form_panel.position = Vector2(460, 300)
	assistant_form_panel.size = Vector2(300, 260)

	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.12, 0.12, 0.09, 0.92)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 12
	style.content_margin_top = 10
	style.content_margin_right = 12
	style.content_margin_bottom = 10
	assistant_form_panel.add_theme_stylebox_override("panel", style)

	var container := VBoxContainer.new()
	container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	assistant_form_panel.add_child(container)

	var title := Label.new()
	title.text = "Quick Entry"
	title.add_theme_font_size_override("font_size", 18)
	container.add_child(title)

	form_type_option = OptionButton.new()
	form_type_option.add_item("Task")
	form_type_option.add_item("Issue")
	form_type_option.add_item("Daily Report")
	container.add_child(form_type_option)

	form_title_input = LineEdit.new()
	form_title_input.placeholder_text = "Title / Summary"
	container.add_child(form_title_input)

	form_owner_input = LineEdit.new()
	form_owner_input.placeholder_text = "Assignee / Owner / Author"
	container.add_child(form_owner_input)

	form_notes_input = TextEdit.new()
	form_notes_input.custom_minimum_size = Vector2(0, 110)
	form_notes_input.placeholder_text = "Notes / Description / Next plan"
	container.add_child(form_notes_input)

	form_submit_button = Button.new()
	form_submit_button.text = "Create Entry"
	form_submit_button.pressed.connect(_submit_assistant_form)
	container.add_child(form_submit_button)

	ui_root.add_child(assistant_form_panel)

func _build_validation_panel() -> void:
	validation_panel = PanelContainer.new()
	validation_panel.name = "ValidationPanel"
	validation_panel.position = Vector2(780, 300)
	validation_panel.size = Vector2(460, 300)

	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.09, 0.08, 0.12, 0.94)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 12
	style.content_margin_top = 10
	style.content_margin_right = 12
	style.content_margin_bottom = 10
	validation_panel.add_theme_stylebox_override("panel", style)

	var container := VBoxContainer.new()
	container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	validation_panel.add_child(container)

	var title := Label.new()
	title.text = "Validation Console"
	title.add_theme_font_size_override("font_size", 18)
	container.add_child(title)

	var hint := Label.new()
	hint.text = "Use these buttons to verify the assistant loop inside Godot."
	hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	container.add_child(hint)

	var row_one := HBoxContainer.new()
	container.add_child(row_one)

	var add_task_button := Button.new()
	add_task_button.text = "Demo Task"
	add_task_button.pressed.connect(_create_validation_task)
	row_one.add_child(add_task_button)

	var add_issue_button := Button.new()
	add_issue_button.text = "Demo Issue"
	add_issue_button.pressed.connect(_create_validation_issue)
	row_one.add_child(add_issue_button)

	var add_report_button := Button.new()
	add_report_button.text = "Demo Report"
	add_report_button.pressed.connect(_create_validation_report)
	row_one.add_child(add_report_button)

	var row_two := HBoxContainer.new()
	container.add_child(row_two)

	var next_day_button := Button.new()
	next_day_button.text = "Next Day"
	next_day_button.pressed.connect(_advance_validation_day)
	row_two.add_child(next_day_button)

	var sync_button := Button.new()
	sync_button.text = "Sync Backend"
	sync_button.pressed.connect(_sync_backend_data)
	row_two.add_child(sync_button)

	validation_clear_button = Button.new()
	validation_clear_button.text = "Clear Log"
	validation_clear_button.pressed.connect(_clear_validation_log)
	row_two.add_child(validation_clear_button)

	validation_log_label = Label.new()
	validation_log_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	validation_log_label.vertical_alignment = VERTICAL_ALIGNMENT_TOP
	validation_log_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	validation_log_label.text = "No validation activity yet."
	container.add_child(validation_log_label)

	ui_root.add_child(validation_panel)
	_append_validation_log("Validation console ready")

func _create_demo_entities() -> void:
	var road_a = entity_factory.create_road(
		"road_001",
		"K1+000 Demo Segment",
		Vector3(-50, 0, 0),
		"earthwork",
		0.45
	)
	var road_b = entity_factory.create_road(
		"road_002",
		"K2+000 Demo Segment",
		Vector3(0, 0, 30),
		"pavement",
		0.75
	)
	entity_factory.create_vehicle("vehicle_001", "Excavator", Vector3(-30, 0, 5), road_a)
	entity_factory.create_vehicle("vehicle_002", "Truck", Vector3(20, 0, 10), road_b)

	entities = entity_factory.get_all_entities()
	for entity in entities:
		_register_entity(entity)

func _register_entity(entity: Node) -> void:
	if entity == null:
		return

	if entity.has_signal("entity_clicked"):
		entity.entity_clicked.connect(_on_entity_clicked)

func _process(delta: float) -> void:
	if is_rotating:
		camera_angle += delta * 0.5
		_update_camera_position()

func _update_camera_position() -> void:
	camera.position = Vector3(
		cos(camera_angle) * camera_distance,
		camera_height,
		sin(camera_angle) * camera_distance
	)
	camera.look_at(camera_target)

func _camera_focus_on_entity(entity: Node3D) -> void:
	if not entity:
		return
	var entity_pos = entity.global_position
	camera_target = entity_pos
	
	var bounds = _get_entity_bounds(entity)
	var max_dim = max(bounds.x, max(bounds.y, bounds.z))
	camera_distance = max(10, max_dim * 3.0)
	camera_height = max(5, max_dim * 1.5)
	_update_camera_position()
	_status_bar.show_temporary_hint("Focused on: %s" % entity.name, 2.0)

func _get_entity_bounds(entity: Node3D) -> Vector3:
	var mesh_instance = entity.get_node_or_null("MeshInstance3D") as MeshInstance3D
	if mesh_instance and mesh_instance.mesh:
		var aabb = mesh_instance.mesh.get_aabb()
		return aabb.size
	return Vector3(5, 5, 5)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_page_up"):
		_sync_backend_data()

	if event is InputEventKey and event.pressed:
		if tool_manager and tool_manager.handle_key_input(event):
			return

		match event.keycode:
			KEY_T:
				_toggle_timeline()
			KEY_TAB:
				_import_data()
			KEY_E:
				_export_data()
			KEY_Q:
				_show_form_for_type(0)
			KEY_W:
				_show_form_for_type(1)
			KEY_R:
				_show_form_for_type(2)
			KEY_SPACE:
				is_rotating = true
				_status_bar.show_temporary_hint("SPACE+Drag: Rotate | Middle-Drag: Pan | Scroll: Zoom", 5.0)

	if event is InputEventMouseMotion:
		var mouse_pos = event.position
		var from = camera.project_ray_origin(mouse_pos)
		var to = from + camera.project_ray_normal(mouse_pos) * 1000
		var space_state = get_world_3d().direct_space_state
		var result = space_state.intersect_ray(from, to, [], 0xFFFFFFFF, true, true)
		if result:
			var hit_pos = result["position"]
			space_service.update_mouse_position(hit_pos)
		
		if is_panning and event.button_mask & MOUSE_BUTTON_MASK_MIDDLE:
			var delta = event.position - last_mouse_pos
			var pan_speed = camera_distance * 0.002
			var right = camera.global_transform.basis.x
			var forward = -camera.global_transform.basis.z
			camera_target += right * delta.x * pan_speed
			camera_target += forward * delta.y * pan_speed
			camera_target.y = max(0, camera_target.y)
			_update_camera_position()
		
		last_mouse_pos = event.position

	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			is_panning = event.pressed
			if is_panning:
				last_mouse_pos = event.position
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP and event.pressed:
			camera_distance = max(5, camera_distance * 0.9)
			_update_camera_position()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN and event.pressed:
			camera_distance = min(500, camera_distance * 1.1)
			_update_camera_position()
		elif event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
			var mouse_pos = event.position
			var current_time = Time.get_ticks_msec() / 1000.0
			var time_diff = current_time - last_click_time
			var pos_diff = (mouse_pos - last_click_pos).length()
			
			var is_double_click = time_diff < 0.3 and pos_diff < 5.0
			last_click_time = current_time
			last_click_pos = mouse_pos
			
			var from = camera.project_ray_origin(mouse_pos)
			var to = from + camera.project_ray_normal(mouse_pos) * 1000
			var space_state = get_world_3d().direct_space_state
			var result = space_state.intersect_ray(from, to, [], 0xFFFFFFFF, true, true)
			if result:
				var hit_pos = result["position"]
				var hit_collider = result["collider"]
				
				if is_double_click and hit_collider:
					_camera_focus_on_entity(hit_collider)
				elif tool_manager:
					tool_manager.handle_click(hit_pos, event)

func _toggle_timeline() -> void:
	if timeline_manager.is_playing:
		timeline_manager.pause()
		mode_button.text = "Mode: LIVE"
		status_label.text = "Timeline paused"
	else:
		timeline_manager.play()
		mode_button.text = "Mode: PLAYING"
		status_label.text = "Timeline playing"

func _export_data() -> void:
	status_label.text = "Export removed from runtime bootstrap"

func _import_data() -> void:
	status_label.text = "Import removed from runtime bootstrap"

func _sync_backend_data() -> void:
	if backend_service == null or not backend_service.has_method("fetch_all_entities"):
		status_label.text = "Backend unavailable"
		return

	status_label.text = "Syncing backend..."
	_append_validation_log("Backend sync requested")
	var synced_entities = await backend_service.fetch_all_entities()
	
	_clear_demo_entities()
	
	for entity_data in synced_entities:
		_create_entity_from_backend(entity_data)
	
	entities = entity_factory.get_all_entities()
	_refresh_stats()
	_update_entity_list()
	
	status_label.text = "Backend sync completed: %d entities" % synced_entities.size()
	_append_validation_log("Backend sync completed with %d entities" % synced_entities.size())

func _clear_demo_entities() -> void:
	for entity in entities:
		if is_instance_valid(entity):
			entity.queue_free()
	entities.clear()

func _create_entity_from_backend(data: Dictionary) -> void:
	var entity_type = data.get("entity_type", "roadbed")
	var entity_id = data.get("id", str(data.hash()))
	var name = data.get("name", "Unknown")
	var start_station = data.get("start_station", "K0+000")
	var end_station = data.get("end_station", "K0+100")
	var lateral = data.get("lateral_offset", 0.0)
	var progress = data.get("progress", 0.0)
	var phase = data.get("construction_phase", "planning")
	
	var pos = Vector3.ZERO
	if space_service:
		pos = space_service.station_to_coord3d(start_station, lateral)
	
	match entity_type:
		"roadbed", "road", "pavement":
			var road = entity_factory.create_road(entity_id, name, pos, phase, progress)
			if road and data.has("width"):
				road.set("width", data.get("width", 14.0))
			if road and space_service:
				var length = space_service.calculate_distance(start_station, end_station)
				var start_coord = space_service.station_to_coord3d(start_station, lateral)
				var end_coord = space_service.station_to_coord3d(end_station, lateral)
				var points = PackedVector3Array()
				var steps = max(2, int(length / 10))
				for i in range(steps + 1):
					var t = float(i) / steps
					var px = lerp(start_coord.x, end_coord.x, t)
					var py = lerp(start_coord.y, end_coord.y, t)
					var pz = lerp(start_coord.z, end_coord.z, t)
					points.append(Vector3(px, py, pz))
				road.set("centerline_points", points)
		"bridge":
			var bridge = entity_factory.create_bridge(entity_id, name, pos, progress)
			if bridge and data.has("width"):
				bridge.set("bridge_width", data.get("width", 12.0))
		_:
			print("[Main] Unknown entity type: ", entity_type)

func _resolve_api_client() -> Node:
	var autoload_name = "MockAPIClient" if use_mock_api else "APIClient"
	var autoload_client = get_node_or_null("/root/%s" % autoload_name)
	if autoload_client != null:
		return autoload_client

	var script_path = "res://scripts/%s.gd" % autoload_name
	var client_script = load(script_path)
	if client_script == null:
		push_warning("Failed to load %s" % script_path)
		return null

	var client = client_script.new()
	client.name = autoload_name
	add_child(client)
	return client

func _on_backend_entity_sync(synced_entities: Array) -> void:
	print("[Main] Backend entity sync completed: %d entities" % synced_entities.size())

func _on_entity_clicked(entity: Node) -> void:
	selected_entity = entity
	_update_entity_info_display()

func _update_entity_info_display() -> void:
	if selected_entity == null:
		entity_info_label.text = "No entity selected"
		return

	var entity_name = selected_entity.get("entity_name")
	var entity_type = selected_entity.get("entity_type")
	var entity_phase = selected_entity.get("phase")
	var entity_progress = selected_entity.get("progress")
	var lines := [
		"Selected: %s" % (entity_name if entity_name != null else selected_entity.name),
		"Type: %s" % (entity_type if entity_type != null else "unknown"),
		"Phase: %s" % (entity_phase if entity_phase != null else "planning"),
		"Progress: %.1f%%" % ((entity_progress if entity_progress != null else 0.0) * 100.0),
	]
	entity_info_label.text = "\n".join(lines)

func _refresh_stats() -> void:
	progress_label.text = "Progress: 0%% | Entities: %d" % entities.size()

	if site_assistant_service:
		_on_site_summary_changed(site_assistant_service.get_summary())
		_refresh_assistant_panel()

func _on_slider_changed(value: float) -> void:
	timeline_manager.set_day(int(value))

func _on_mode_toggled() -> void:
	_toggle_timeline()

func _on_day_changed(day: int) -> void:
	day_label.text = "Day: %d" % day
	if site_assistant_service:
		site_assistant_service.set_current_day(day)
	_update_entities_on_timeline(day)

func _update_entities_on_timeline(day: int) -> void:
	var total_days := 365.0
	var timeline_progress := clamp(day / total_days, 0.0, 1.0)

	for entity in entities:
		if entity is VehicleEntity and entity.has_method("update_position_on_timeline"):
			entity.update_position_on_timeline(timeline_progress)

	var phases: Dictionary = {}
	for entity in entities:
		var phase_value = entity.get("phase")
		var phase_name := str(phase_value if phase_value != null else "planning")
		phases[phase_name] = phases.get(phase_name, 0) + 1

	phase_label.text = "Phases: %s" % ", ".join(phases.keys())
	progress_label.text = "Progress: %.1f%% | Entities: %d" % [timeline_progress * 100.0, entities.size()]

func _on_phase_changed(segment_id: String, old_phase: String, new_phase: String) -> void:
	print("[Main] Phase changed: %s %s -> %s" % [segment_id, old_phase, new_phase])

func _on_milestone_reached(segment_id: String, milestone: String) -> void:
	print("[Main] Milestone reached: %s %s" % [segment_id, milestone])

func _on_site_summary_changed(summary: Dictionary) -> void:
	var avg_progress = summary.get("avg_progress", 0.0) * 100.0
	var due_tasks = summary.get("due_tasks", 0)
	var open_issues = summary.get("open_issues", 0)
	var today_reports = summary.get("today_reports", 0)

	status_label.text = "Assistant: %.0f%% | Tasks %d | Issues %d | Reports %d" % [
		avg_progress,
		due_tasks,
		open_issues,
		today_reports,
	]
	_refresh_assistant_panel()

func _on_site_records_changed(_record) -> void:
	_refresh_assistant_panel()

func _refresh_assistant_panel() -> void:
	if site_assistant_service == null or assistant_panel == null:
		return

	assistant_summary_label.text = "Summary\n%s" % "\n".join(site_assistant_service.get_summary_lines())
	assistant_tasks_label.text = "Tasks\n%s" % "\n".join(site_assistant_service.get_task_lines())
	assistant_issues_label.text = "Issues\n%s" % "\n".join(site_assistant_service.get_issue_lines())
	assistant_reports_label.text = "Reports\n%s" % "\n".join(site_assistant_service.get_report_lines())

	var due_tasks = site_assistant_service.get_due_tasks()
	var open_issues = site_assistant_service.get_open_issues()
	if complete_task_button:
		complete_task_button.disabled = due_tasks.is_empty()
	if progress_issue_button:
		progress_issue_button.disabled = open_issues.is_empty()
	if close_issue_button:
		close_issue_button.disabled = open_issues.is_empty()

	if assistant_actions_label:
		var next_task = due_tasks[0].title if not due_tasks.is_empty() else "none"
		var next_issue = open_issues[0].title if not open_issues.is_empty() else "none"
		assistant_actions_label.text = "Actions\nNext task: %s\nNext issue: %s" % [next_task, next_issue]

func _submit_assistant_form() -> void:
	if site_assistant_service == null:
		return

	var selected_type = form_type_option.selected
	var title = form_title_input.text.strip_edges()
	var owner = form_owner_input.text.strip_edges()
	var notes = form_notes_input.text.strip_edges()

	if title.is_empty():
		status_label.text = "Entry title is required"
		return

	match selected_type:
		0:
			site_assistant_service.create_task(
				title,
				"wa_road_001",
				owner if not owner.is_empty() else "Field Team",
				timeline_manager.current_day + 2,
				notes
			)
		1:
			site_assistant_service.create_issue(
				title,
				"wa_road_001",
				owner if not owner.is_empty() else "Safety Officer",
				IssueRecord.IssueSeverity.MEDIUM,
				timeline_manager.current_day + 1,
				notes
			)
		2:
			site_assistant_service.create_daily_report(
				owner if not owner.is_empty() else "Daily Reporter",
				PackedStringArray(["wa_road_001"]),
				title,
				notes if not notes.is_empty() else "Continue next work package"
			)

	status_label.text = "Entry created"
	_append_validation_log("Created %s: %s" % [form_type_option.get_item_text(selected_type), title])
	_clear_form_inputs()

func _show_form_for_type(index: int) -> void:
	if assistant_form_panel == null:
		return

	form_type_option.select(index)
	match index:
		0:
			form_title_input.placeholder_text = "Task title"
			form_owner_input.placeholder_text = "Assignee"
			form_notes_input.placeholder_text = "Task notes"
		1:
			form_title_input.placeholder_text = "Issue title"
			form_owner_input.placeholder_text = "Owner"
			form_notes_input.placeholder_text = "Issue description"
		2:
			form_title_input.placeholder_text = "Completed summary"
			form_owner_input.placeholder_text = "Report author"
			form_notes_input.placeholder_text = "Next plan"

	form_title_input.grab_focus()

func _clear_form_inputs() -> void:
	if form_title_input:
		form_title_input.text = ""
	if form_owner_input:
		form_owner_input.text = ""
	if form_notes_input:
		form_notes_input.text = ""

func _complete_first_due_task() -> void:
	if site_assistant_service == null:
		return

	var due_tasks = site_assistant_service.get_due_tasks()
	if due_tasks.is_empty():
		status_label.text = "No due task to complete"
		return

	var task = due_tasks[0]
	site_assistant_service.update_task_status(task.task_id, TaskRecord.TaskStatus.DONE, 1.0)
	status_label.text = "Completed task: %s" % task.title
	_append_validation_log("Completed task %s" % task.task_id)

func _progress_first_issue() -> void:
	if site_assistant_service == null:
		return

	var open_issues = site_assistant_service.get_open_issues()
	if open_issues.is_empty():
		status_label.text = "No issue to progress"
		return

	var issue = open_issues[0]
	var next_status = IssueRecord.IssueStatus.IN_PROGRESS
	if issue.status == IssueRecord.IssueStatus.IN_PROGRESS:
		next_status = IssueRecord.IssueStatus.WAITING_REVIEW
	site_assistant_service.update_issue_status(issue.issue_id, next_status)
	status_label.text = "Updated issue: %s" % issue.title
	_append_validation_log("Updated issue %s to %s" % [issue.issue_id, IssueRecord.IssueStatus.keys()[next_status].to_lower()])

func _close_first_issue() -> void:
	if site_assistant_service == null:
		return

	var open_issues = site_assistant_service.get_open_issues()
	if open_issues.is_empty():
		status_label.text = "No issue to close"
		return

	var issue = open_issues[0]
	site_assistant_service.update_issue_status(issue.issue_id, IssueRecord.IssueStatus.CLOSED)
	status_label.text = "Closed issue: %s" % issue.title
	_append_validation_log("Closed issue %s" % issue.issue_id)

func _create_validation_task() -> void:
	if site_assistant_service == null:
		return

	var task = site_assistant_service.create_task(
		"Validation task Day %d" % timeline_manager.current_day,
		"wa_road_001",
		"QA Team",
		timeline_manager.current_day + 1,
		"Created from validation console"
	)
	status_label.text = "Validation task created"
	_append_validation_log("Created task %s" % task.task_id)

func _create_validation_issue() -> void:
	if site_assistant_service == null:
		return

	var issue = site_assistant_service.create_issue(
		"Validation issue Day %d" % timeline_manager.current_day,
		"wa_road_001",
		"Site Lead",
		IssueRecord.IssueSeverity.HIGH,
		timeline_manager.current_day + 1,
		"Created from validation console"
	)
	status_label.text = "Validation issue created"
	_append_validation_log("Created issue %s" % issue.issue_id)

func _create_validation_report() -> void:
	if site_assistant_service == null:
		return

	var report = site_assistant_service.create_daily_report(
		"Validation User",
		PackedStringArray(["wa_road_001"]),
		"Validation summary on day %d" % timeline_manager.current_day,
		"Continue validation flow tomorrow"
	)
	status_label.text = "Validation report created"
	_append_validation_log("Created report %s" % report.report_id)

func _advance_validation_day() -> void:
	if timeline_manager == null:
		return

	var next_day = timeline_manager.current_day + 1
	if time_slider:
		time_slider.value = next_day
	else:
		timeline_manager.set_day(next_day)
	status_label.text = "Advanced to day %d" % next_day
	_append_validation_log("Advanced simulation to day %d" % next_day)

func _append_validation_log(message: String) -> void:
	var timestamp = "D%03d" % (timeline_manager.current_day if timeline_manager != null else 0)
	validation_log_lines.append("[%s] %s" % [timestamp, message])
	while validation_log_lines.size() > 10:
		validation_log_lines.remove_at(0)

	if validation_log_label:
		validation_log_label.text = "\n".join(validation_log_lines)

func _clear_validation_log() -> void:
	validation_log_lines.clear()
	if validation_log_label:
		validation_log_label.text = "Validation log cleared."

func _on_toolbar_tool_selected(tool: String) -> void:
	if not tool_manager:
		return
	match tool:
		"select":
			tool_manager.select_tool(ToolManager.ToolType.SELECT)
		"road":
			tool_manager.select_tool(ToolManager.ToolType.ROAD)
		"bridge":
			tool_manager.select_tool(ToolManager.ToolType.BRIDGE)
		"work_area":
			tool_manager.select_tool(ToolManager.ToolType.WORK_AREA)
		"fence":
			tool_manager.select_tool(ToolManager.ToolType.FENCE)
		"sign":
			tool_manager.select_tool(ToolManager.ToolType.SIGN)
		"measure":
			tool_manager.select_tool(ToolManager.ToolType.MEASURE)

func _on_tool_action(action: String, params: Dictionary) -> void:
	match action:
		"road_click":
			if road_tool:
				road_tool.handle_click(params["position"])
		"road_created":
			_create_road_entity(params)
		"entity_selected":
			_select_entity_by_id(params.get("entity_id", ""))
		"entity_deleted":
			_delete_entity_by_id(params.get("entity_id", ""))

func _on_road_tool_completed(params: Dictionary) -> void:
	_create_road_entity(params)
	status_label.text = "Road created: %s to %s" % [params.get("start_station", ""), params.get("end_station", "")]

func _on_road_preview_updated(params: Dictionary) -> void:
	pass

func _on_mouse_position_changed(coord: Vector3, station: String) -> void:
	pass

func _on_snap_mode_changed(mode: String) -> void:
	status_bar.show_temporary_hint("Snap mode: %s" % mode, 2.0)

func _on_grid_size_changed(size: float) -> void:
	status_bar.show_temporary_hint("Grid size: %.1f" % size, 2.0)

func _create_road_entity(params: Dictionary) -> void:
	if not entity_factory:
		return

	var start_station = params.get("start_station", "K0+000")
	var end_station = params.get("end_station", "K0+500")
	var width = params.get("width", 14.0)
	var lateral = params.get("lateral_offset", 0.0)
	var elevation = params.get("elevation", 0.0)
	var phase = params.get("phase", "planning")
	var progress = params.get("progress", 0.0)

	var length = space_service.calculate_distance(start_station, end_station) if space_service else 500.0
	var pos = space_service.station_to_coord3d(start_station, lateral, elevation) if space_service else Vector3.ZERO

	var road = entity_factory.create_road(
		"road_%d" % Time.get_unix_time_from_system(),
		params.get("name", "%s to %s" % [start_station, end_station]),
		pos,
		phase,
		progress
	)
	if road:
		road.set("width", width)
		road.set("lanes", params.get("lanes", 4))
		if road.has_method("set_station_range"):
			road.set_station_range(start_station, end_station)
		entities.append(road)
		_refresh_stats()

func _select_entity_by_id(entity_id: String) -> void:
	for entity in entities:
		if entity.get("entity_id") == entity_id:
			selected_entity = entity
			_update_entity_info_display()
			return

func _delete_entity_by_id(entity_id: String) -> void:
	for i in entities.size():
		if entities[i].get("entity_id") == entity_id:
			entities[i].queue_free()
			entities.remove_at(i)
			if selected_entity and selected_entity.get("entity_id") == entity_id:
				selected_entity = null
				entity_info_label.text = "No entity selected"
			_refresh_stats()
			return
