# Main.gd
# NeuralSite 4D 道路建设模拟器 - 完整版
# 整合 RoadSegment + TimelineManager + MockAPI + PrecisionEntity + UnifiedTimeline
extends Node3D

# ── API配置 ──
@export_group("API设置", "api_")
@export var use_mock_api: bool = true  # true=模拟数据, false=真实后端
@export var backend_url: String = "http://localhost:8000"

# ── UI 引用 ──
@onready var time_slider: HSlider = $CanvasLayer/UI/TimeSlider
@onready var progress_label: Label = $CanvasLayer/UI/ProgressLabel
@onready var mode_button: Button = $CanvasLayer/UI/ModeButton
@onready var day_label: Label = $CanvasLayer/UI/DayLabel
@onready var phase_label: Label = $CanvasLayer/UI/PhaseLabel
@onready var status_label: Label = $CanvasLayer/UI/StatusLabel
@onready var entity_info_label: Label = $CanvasLayer/UI/EntityInfoLabel
@onready var camera: Camera3D = $Camera3D

# ── 核心组件 ──
var timeline_manager: TimelineManager
var unified_timeline: Node  # UnifiedTimeline
var road_container: Node3D
var entity_container: Node3D  # 精确实体容器
var terrain_generator: Node  # TerrainGenerator
var api_client: Node

# ── 数据通道 ──
var godot_importer: Node
var godot_exporter: Node
var collision_detector: Node
var precision_collision: Node  # PrecisionCollisionSystem

# ── 相机控制 ──
var camera_distance: float = 50.0
var camera_angle: float = 0.0
var camera_height: float = 20.0
var is_rotating: bool = false

# ── 实体管理 ──
var selected_entity: Node = null
var entities: Array[Node] = []

# ── 道路数据 ──
var demo_roads_loaded: bool = false

func _ready() -> void:
	# 初始化TimelineManager
	timeline_manager = TimelineManager.new()
	timeline_manager.name = "TimelineManager"
	add_child(timeline_manager)
	
	# 连接信号
	timeline_manager.day_changed.connect(_on_day_changed)
	timeline_manager.phase_changed.connect(_on_phase_changed)
	timeline_manager.milestone_reached.connect(_on_milestone_reached)
	
	# 创建道路容器
	road_container = Node3D.new()
	road_container.name = "RoadContainer"
	add_child(road_container)
	
	# 创建精确实体容器
	entity_container = Node3D.new()
	entity_container.name = "EntityContainer"
	add_child(entity_container)
	
	# 初始化地形
	_init_terrain()
	
	# 初始化UnifiedTimeline
	_init_unified_timeline()
	
	# 设置UI
	_setup_ui()
	
	# 初始化API客户端
	_init_api_client()
	
	# 初始化数据通道
	_init_data_channels()
	
	# 创建示例道路
	_create_demo_roads()
	
	# 创建测试实体
	_create_test_entities()
	
	print("[Main] NeuralSite 4D INITIALIZED")
	print("[Main] ===== KEYBOARD SHORTCUTS =====")
	print("[Main] SPACE: Rotate camera")
	print("[Main] 1-5: Create test entities")
	print("[Main] T: Toggle timeline play/pause")
	print("[Main] L: Print LOD info")
	print("[Main] E: Export data")
	print("[Main] TAB: Import data")
	print("[Main] C: Collision debug")

func _init_unified_timeline() -> void:
	# 尝试加载UnifiedTimeline
	var timeline_script = load("res://scripts/UnifiedTimeline.gd")
	if timeline_script:
		unified_timeline = timeline_script.new()
		unified_timeline.name = "UnifiedTimeline"
		add_child(unified_timeline)
		unified_timeline.day_changed.connect(_on_unified_day_changed)
		print("[Main] UnifiedTimeline initialized")
	else:
		print("[Main] Warning: UnifiedTimeline not found")

func _init_terrain() -> void:
	var terrain_script = load("res://scripts/TerrainGenerator.gd")
	if terrain_script:
		terrain_generator = terrain_script.new()
		terrain_generator.name = "TerrainGenerator"
		add_child(terrain_generator)
		print("[Main] TerrainGenerator initialized")
	else:
		print("[Main] Warning: TerrainGenerator not found")

func _setup_ui() -> void:
	if time_slider:
		time_slider.min_value = 0
		time_slider.max_value = 365
		time_slider.value = 0
		time_slider.value_changed.connect(_on_slider_changed)
	
	if mode_button:
		mode_button.pressed.connect(_on_mode_toggled)
		mode_button.text = "Mode: LIVE"
	
	# 创建实体信息面板
	_create_entity_info_panel()

func _create_entity_info_panel() -> void:
	# 检查是否已有
	if has_node("CanvasLayer/UI/EntityInfoLabel"):
		return
	
	# 创建新标签
	var label = Label.new()
	label.name = "EntityInfoLabel"
	label.text = "No entity selected"
	label.position = Vector2(20, 150)
	label.add_theme_font_size_override("font_size", 14)
	
	var ui = get_node_or_null("CanvasLayer/UI")
	if ui:
		ui.add_child(label)
		entity_info_label = label

func _init_api_client() -> void:
	if use_mock_api:
		api_client = MockAPIClient.new()
		api_client.name = "MockAPIClient"
		add_child(api_client)
		print("[Main] Using MockAPIClient")
	else:
		api_client = load("res://scripts/APIClient.gd").new()
		api_client.name = "APIClient"
		add_child(api_client)
		print("[Main] Using APIClient")

func _init_data_channels() -> void:
	# 数据导入器
	var importer_script = load("res://scripts/GodotImporter.gd")
	if importer_script:
		godot_importer = importer_script.new()
		godot_importer.name = "GodotImporter"
		add_child(godot_importer)
	
	# 数据导出器
	var exporter_script = load("res://scripts/GodotExporter.gd")
	if exporter_script:
		godot_exporter = exporter_script.new()
		godot_exporter.name = "GodotExporter"
		add_child(godot_exporter)
	
	# 碰撞检测器
	var collision_script = load("res://scripts/CollisionDetector.gd")
	if collision_script:
		collision_detector = collision_script.new()
		collision_detector.name = "CollisionDetector"
		add_child(collision_detector)
	
	# 精确碰撞系统
	var precision_collision_script = load("res://scripts/PrecisionCollisionSystem.gd")
	if precision_collision_script:
		precision_collision = precision_collision_script.new()
		precision_collision.name = "PrecisionCollision"
		add_child(precision_collision)
	
	print("[Main] Data channels initialized")

# ── 创建测试实体 ──
func _create_test_entities() -> void:
	var road1 = _create_precision_road("road_001", "K1+000 示范段", Vector3(-50, 0, 0), "earthwork", 0.45)
	var road2 = _create_precision_road("road_002", "K2+000 路段", Vector3(0, 0, 30), "pavement", 0.75)
	var road3 = _create_precision_road("road_003", "K3+000 路段", Vector3(50, 0, -20), "completed", 1.0)
	
	_create_test_vehicle("vehicle_001", "挖掘机1", Vector3(-30, 0, 5), road1)
	_create_test_vehicle("vehicle_002", "卡车1", Vector3(20, 0, 10), road2)
	
	print("[Main] Created test entities")

func _create_precision_road(id: String, name: String, pos: Vector3, phase: String, progress: float) -> void:
	var road_script = load("res://scripts/RoadEntity.gd")
	if not road_script:
		print("[Main] RoadEntity.gd not found")
		return
	
	var road = road_script.new()
	road.name = id
	road.entity_id = id
	road.entity_name = name
	road.position = pos
	road.phase = phase
	road.progress = progress
	road.lanes = 4
	road.width = 14.0
	road.highway_type = "primary"
	
	# 设置中心线
	var points = PackedVector3Array()
	for i in range(6):
		points.append(Vector3(i * 10.0, 0, 0))
	road.centerline_points = points
	
	road.entity_clicked.connect(_on_entity_clicked)
	
	entity_container.add_child(road)
	entities.append(road)
	
	# 注册到UnifiedTimeline
	if unified_timeline and unified_timeline.has_method("register_entity"):
		unified_timeline.register_entity(id, road)
	
	return road

func _create_test_vehicle(id: String, name: String, pos: Vector3, bound_road: Node = null) -> void:
	var vehicle_script = load("res://scripts/VehicleEntity.gd")
	if not vehicle_script:
		print("[Main] VehicleEntity.gd not found")
		return
	
	var vehicle = vehicle_script.new()
	vehicle.name = id
	vehicle.entity_id = id
	vehicle.entity_name = name
	vehicle.position = pos
	vehicle.vehicle_name = name
	
	if bound_road and bound_road.has("centerline_points"):
		vehicle.bind_to_road_path(bound_road.centerline_points)
		vehicle.attach_to_road(bound_road.name)
	
	vehicle.entity_clicked.connect(_on_entity_clicked)
	
	entity_container.add_child(vehicle)
	entities.append(vehicle)

# ── 实体交互 ──
func _on_entity_clicked(entity: Node) -> void:
	selected_entity = entity
	_update_entity_info_display()
	print("[Main] Selected: ", entity.entity_name)

func _update_entity_info_display() -> void:
	if entity_info_label and selected_entity:
		var info = "Selected: %s\n" % selected_entity.entity_name
		info += "Type: %s\n" % selected_entity.entity_type
		info += "Phase: %s\n" % selected_entity.phase
		info += "Progress: %.1f%%" % (selected_entity.progress * 100)
		entity_info_label.text = info
	elif entity_info_label:
		entity_info_label.text = "No entity selected"

func _process(delta: float) -> void:
	# 相机旋转控制
	if Input.is_action_pressed("ui_accept"):
		is_rotating = true
	
	if is_rotating:
		camera_angle += delta * 0.5
		var x = cos(camera_angle) * camera_distance
		var z = sin(camera_angle) * camera_distance
		camera.position = Vector3(x, camera_height, z)
		
		if not Input.is_action_pressed("ui_accept"):
			is_rotating = false
	
	# 更新选中实体信息
	if selected_entity:
		_update_entity_info_display()

# ── 快捷键处理 ──
func _unhandled_input(event: InputEvent) -> void:
	# F1 - 打印摘要
	if event.is_action_pressed("ui_focus_next"):
		_print_summary()
	
	# F2 - 调试信息
	if event.is_action_pressed("ui_focus_prev"):
		_toggle_debug()
	
	# 数字键 1-5 - 创建实体
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_1: _create_entity_dialog("road")
			KEY_2: _create_entity_dialog("bridge")
			KEY_3: _create_entity_dialog("vehicle")
			KEY_4: _create_entity_dialog("pile")
			KEY_5: _create_entity_dialog("pier")
		
		# T - 时间轴播放
		KEY_T: _toggle_timeline()
		
		# L - LOD信息
		KEY_L: _print_lod_info()
		
		# E - 导出
		KEY_E: _export_data()
		
		# TAB - 导入
		KEY_TAB: _import_data()
		
		# C - 碰撞调试
		KEY_C: _toggle_collision_debug()

# ── 实体创建对话框(简化版) ──
func _create_entity_dialog(type: String) -> void:
	match type:
		"road":
			_create_precision_road(
				"road_%d" % Time.get_ticks_msec(),
				"新建道路",
				Vector3(randf_range(-50, 50), 0, randf_range(-50, 50)),
				"planning", 0.0
			)
		"vehicle":
			_create_test_vehicle(
				"vehicle_%d" % Time.get_ticks_msec(),
				"新建车辆",
				Vector3(randf_range(-30, 30), 0, randf_range(-30, 30))
			)
		"pile":
			_create_pile_entity(
				"pile_%d" % Time.get_ticks_msec(),
				"新建桩基",
				Vector3(randf_range(-20, 20), 0, randf_range(-20, 20))
			)
		"pier":
			_create_pier_entity(
				"pier_%d" % Time.get_ticks_msec(),
				"新建墩柱",
				Vector3(randf_range(-20, 20), 0, randf_range(-20, 20))
			)
		"bridge":
			_create_bridge_entity(
				"bridge_%d" % Time.get_ticks_msec(),
				"新建桥梁",
				Vector3(randf_range(-50, 50), 0, randf_range(-30, 30))
			)

# ── 桥梁实体创建 ──
func _create_bridge_entity(id: String, name: String, pos: Vector3) -> void:
	var bridge_script = load("res://scripts/BridgeEntity.gd")
	if not bridge_script:
		print("[Main] BridgeEntity.gd not found")
		return
	
	var bridge = bridge_script.new()
	bridge.name = id
	bridge.entity_id = id
	bridge.entity_name = name
	bridge.position = pos
	bridge.bridge_type = 0  # BEAM_BRIDGE
	bridge.bridge_width = 12.0
	bridge.total_length = 30.0
	bridge.span_count = 1
	
	bridge.entity_clicked.connect(_on_entity_clicked)
	
	entity_container.add_child(bridge)
	entities.append(bridge)
	print("[Main] Created bridge: ", name)

# ── 桩基实体创建 ──
func _create_pile_entity(id: String, name: String, pos: Vector3) -> void:
	var pile_script = load("res://scripts/PileEntity.gd")
	if not pile_script:
		print("[Main] PileEntity.gd not found")
		return
	
	var pile = pile_script.new()
	pile.name = id
	pile.entity_id = id
	pile.entity_name = name
	pile.position = pos
	pile.pile_type = 1  # CAST_IN_PLACE
	pile.pile_diameter = 1.5
	pile.pile_length = 30.0
	pile.pile_number = entities.size() + 1
	
	pile.entity_clicked.connect(_on_entity_clicked)
	
	entity_container.add_child(pile)
	entities.append(pile)
	print("[Main] Created pile: ", name)

# ── 墩柱实体创建 ──
func _create_pier_entity(id: String, name: String, pos: Vector3) -> void:
	var pier_script = load("res://scripts/PierEntity.gd")
	if not pier_script:
		print("[Main] PierEntity.gd not found")
		return
	
	var pier = pier_script.new()
	pier.name = id
	pier.entity_id = id
	pier.entity_name = name
	pier.position = pos
	pier.pier_type = 0  # CIRCULAR
	pier.pier_diameter = 1.5
	pier.pier_height = 15.0
	pier.pier_number = entities.size() + 1
	
	pier.entity_clicked.connect(_on_entity_clicked)
	
	entity_container.add_child(pier)
	entities.append(pier)
	print("[Main] Created pier: ", name, " type=", pier.pier_type)

# ── 时间轴控制 ──
func _toggle_timeline() -> void:
	if unified_timeline and unified_timeline.has_method("play"):
		if unified_timeline.mode == 1:  # PLAY
			unified_timeline.pause()
			print("[Main] Timeline paused")
		else:
			unified_timeline.play()
			print("[Main] Timeline playing")

# ── LOD信息 ──
func _print_lod_info() -> void:
	print("=== LOD Info ===")
	print("Entities: ", entities.size())
	for entity in entities:
		if entity.has("current_lod"):
			print("  ", entity.name, ": LOD ", entity.current_lod)
		elif entity.has("precision_level"):
			print("  ", entity.name, ": Precision ", entity.precision_level)

# ── 数据导入导出 ──
func _export_data() -> void:
	if godot_exporter:
		var roads = timeline_manager.road_segments if timeline_manager else []
		godot_exporter.export_all_roads(roads)
		print("[Main] Data exported")

func _import_data() -> void:
	if godot_importer:
		godot_importer.import_roads()
		print("[Main] Import started")

# ── 碰撞调试 ──
func _toggle_collision_debug() -> void:
	if collision_detector:
		collision_detector.set_debug(true)
		print("[Main] Collision debug enabled")

# ── 调试摘要 ──
func _print_summary() -> void:
	print("=== NeuralSite Summary ===")
	print("Entities: ", entities.size())
	print("Selected: ", selected_entity.name if selected_entity else "None")
	
	if unified_timeline and unified_timeline.has_method("get_summary"):
		var summary = unified_timeline.get_summary()
		print("Timeline: ", summary)

func _toggle_debug() -> void:
	for entity in entities:
		if entity.has("show_debug_info"):
			entity.show_debug_info = not entity.show_debug_info
	print("[Main] Debug toggled")

# ── 时间轴回调 ──
func _on_unified_day_changed(day: int) -> void:
	if day_label:
		day_label.text = "Day: %d" % day

# ── 原有功能保留 ──
func _on_slider_changed(value: float) -> void:
	var day = int(value)
	if timeline_manager:
		timeline_manager.set_day(day)

func _on_mode_toggled() -> void:
	if timeline_manager:
		if timeline_manager.is_playing:
			timeline_manager.pause()
			if mode_button:
				mode_button.text = "Mode: LIVE"
		else:
			timeline_manager.play()
			if mode_button:
				mode_button.text = "Mode: PLAYING"

func _on_day_changed(day: int) -> void:
	if day_label:
		day_label.text = "Day: %d" % day
	_update_vehicles_on_timeline(day)

func _update_vehicles_on_timeline(day: int) -> void:
	var total_days = 365
	for entity in entities:
		if entity is VehicleEntity and entity.has_method("update_position_on_timeline"):
			var vehicle_progress = clamp(float(day) / float(total_days), 0.0, 1.0)
			entity.update_position_on_timeline(vehicle_progress)

func _on_phase_changed(segment_id: String, old_phase: String, new_phase: String) -> void:
	print("[Main] Phase changed: ", segment_id, " ", old_phase, "->", new_phase)

func _on_milestone_reached(segment_id: String, milestone: String) -> void:
	print("[Main] Milestone: ", segment_id, " ", milestone)

func _create_demo_roads() -> void:
	# 原有demo代码保留
	pass
