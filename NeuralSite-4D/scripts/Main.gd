extends Node3D
class_name MainController

# NeuralSite-4D 主控制器
# 负责系统初始化、各模块协调调度

# 场景引用
@onready var camera_pivot: Node3D = $CameraPivot
@onready var camera: Camera3D = $CameraPivot/Camera3D
@onready var timeline_slider: HSlider = $UI/Panel/TimelineSlider
@onready var time_label: Label = $UI/Panel/TimeLabel
@onready var entity_list: ItemList = $UI/EntityList
@onready var status_label: Label = $UI/StatusLabel

# 项目时间范围
var project_start_date: String = "2026-01-01"
var project_end_date: String = "2026-12-31"
var current_progress: float = 0.0  # 0.0 - 1.0

# 相机控制
var camera_rotation_speed: float = 0.5
var is_rotating: bool = false
var camera_distance: float = 50.0

# 实体管理
var entities: Dictionary = {}  # entity_id -> Entity3D
var entity_states: Dictionary = {}  # entity_id -> current state

# 初始化
func _ready() -> void:
	print("[NeuralSite-4D] 初始化系统...")

	# 连接信号
	EventBus.entity_created.connect(_on_entity_created)
	EventBus.state_updated.connect(_on_state_updated)
	EventBus.timeline_changed.connect(_on_timeline_changed)
	EventBus.api_loaded.connect(_on_api_loaded)

	# 初始化相机
	_init_camera()

	# 初始化UI
	_init_ui()

	# 加载数据
	_load_initial_data()

	print("[NeuralSite-4D] 初始化完成")

func _init_camera() -> void:
	"""初始化相机位置"""
	camera_pivot.rotation_degrees.x = -30
	camera.distance = camera_distance
	camera.position.z = camera_distance

func _init_ui() -> void:
	"""初始化UI组件"""
	# 时间轴滑块
	timeline_slider.min_value = 0.0
	timeline_slider.max_value = 1.0
	timeline_slider.value = 0.0
	timeline_slider.value_changed.connect(_on_timeline_slider_changed)

	# 更新初始时间显示
	_update_time_display()

func _load_initial_data() -> void:
	"""加载初始数据"""
	status_label.text = "正在加载数据..."

	# 尝试从API加载数据
	var use_mock = true  # 默认使用模拟数据

	if not use_mock:
		# 从真实API加载
		await APIClient.load_project_data()
	else:
		# 使用模拟数据（本地测试用）
		_create_mock_entities()
		_create_mock_events()

	status_label.text = "就绪"

func _process(delta: float) -> void:
	# 相机旋转
	if is_rotating:
		camera_pivot.rotate_y(camera_rotation_speed * delta)

# ========== 实体管理 ==========

func _create_mock_entities() -> void:
	"""创建模拟实体数据"""
	var mock_entities = [
		{
			"id": "entity_1",
			"name": "K0+000～K1+500路基",
			"entity_type": "roadbed",
			"start_station": "K0+000",
			"end_station": "K1+500",
			"lateral_offset": 0.0,
			"elevation_base": 100.0,
			"width": 26.0,
			"height": 2.5
		},
		{
			"id": "entity_2",
			"name": "K1+500～K3+000路基",
			"entity_type": "roadbed",
			"start_station": "K1+500",
			"end_station": "K3+000",
			"lateral_offset": 0.0,
			"elevation_base": 105.0,
			"width": 26.0,
			"height": 3.0
		},
		{
			"id": "entity_3",
			"name": "K1+200分离式立交桥",
			"entity_type": "bridge",
			"start_station": "K1+150",
			"end_station": "K1+250",
			"lateral_offset": 0.0,
			"elevation_base": 108.0,
			"width": 26.0,
			"height": 8.0
		},
		{
			"id": "entity_4",
			"name": "K0+500圆管涵",
			"entity_type": "culvert",
			"start_station": "K0+480",
			"end_station": "K0+520",
			"lateral_offset": -8.0,
			"elevation_base": 98.0,
			"width": 2.0,
			"height": 2.0
		},
		{
			"id": "entity_5",
			"name": "K2+000盖板涵",
			"entity_type": "culvert",
			"start_station": "K1+980",
			"end_station": "K2+020",
			"lateral_offset": 8.0,
			"elevation_base": 102.0,
			"width": 4.0,
			"height": 3.0
		},
		{
			"id": "entity_6",
			"name": "K0+000～K3+000排水沟",
			"entity_type": "drainage",
			"start_station": "K0+000",
			"end_station": "K3+000",
			"lateral_offset": -15.0,
			"elevation_base": 95.0,
			"width": 2.0,
			"height": 1.5
		},
		{
			"id": "entity_7",
			"name": "K1+800右侧边坡",
			"entity_type": "slope",
			"start_station": "K1+700",
			"end_station": "K1+900",
			"lateral_offset": 15.0,
			"elevation_base": 110.0,
			"width": 20.0,
			"height": 10.0
		}
	]

	for entity_data in mock_entities:
		_create_entity(entity_data)

	# 更新实体列表UI
	_update_entity_list()

	# 触发数据加载完成信号
	EventBus.api_loaded.emit()

func _create_entity(entity_data: Dictionary) -> void:
	"""创建实体并添加到场景"""
	var entity_id = entity_data["id"]

	# 创建3D实体节点
	var entity_node = Entity3D.new()
	entity_node.name = entity_id
	entity_node.entity_data = entity_data

	# 设置位置（根据桩号计算）
	var start_coord = SpaceService.station_to_coord3d(entity_data["start_station"])
	var end_coord = SpaceService.station_to_coord3d(entity_data["end_station"])

	entity_node.position = Vector3(start_coord.x, start_coord.z, start_coord.y)
	entity_node.elevation_base = entity_data.get("elevation_base", 0.0)

	# 添加到场景
	add_child(entity_node)
	entities[entity_id] = entity_node

	# 设置初始状态
	entity_states[entity_id] = {
		"state_type": "planning",
		"progress": 0.0,
		"quality_status": "pending"
	}

	# 更新实体3D显示
	entity_node.update_visual(entity_states[entity_id])

	print("[NeuralSite] 创建实体: ", entity_data["name"])

func _create_mock_events() -> void:
	"""创建模拟事件"""
	# 这里可以添加事件数据的初始化
	pass

func _update_entity_list() -> void:
	"""更新实体列表UI"""
	entity_list.clear()
	for entity_id in entities:
		var entity = entities[entity_id]
		var state = entity_states.get(entity_id, {})
		var state_type = state.get("state_type", "planning")
		var progress = state.get("progress", 0.0)

		entity_list.add_item("%s [%s: %.0f%%]" % [entity.entity_data["name"], state_type, progress])

# ========== 时间轴控制 ==========

func _update_time_display() -> void:
	"""更新时间显示"""
	var days_total = 365  # 假设一年工期
	var current_day = int(current_progress * days_total)

	# 简单计算当前日期
	var year = 2026
	var month = 1 + int(current_day / 30)
	var day = 1 + (current_day % 30)

	time_label.text = "时间: %04d-%02d-%02d (进度: %.1f%%)" % [year, month, day, current_progress * 100]

func _on_timeline_slider_changed(value: float) -> void:
	"""时间轴滑块值改变"""
	current_progress = value
	_update_time_display()
	EventBus.timeline_changed.emit(value)

# ========== 状态更新 ==========

func update_entity_states(progress: float) -> void:
	"""根据进度更新所有实体状态"""
	for entity_id in entities:
		var entity = entities[entity_id]
		var entity_data = entity.entity_data

		# 根据进度计算状态
		var new_state = _calculate_entity_state(entity_data, progress)
		entity_states[entity_id] = new_state

		# 更新3D显示
		entity.update_visual(new_state)

	# 更新UI列表
	_update_entity_list()

func _calculate_entity_state(entity_data: Dictionary, progress: float) -> Dictionary:
	"""根据进度计算实体状态"""
	var entity_type = entity_data.get("entity_type", "roadbed")
	var state = {
		"state_type": "planning",
		"progress": 0.0,
		"quality_status": "pending"
	}

	# 简单状态映射（实际应根据实际施工计划计算）
	if progress < 0.1:
		state.state_type = "planning"
		state.progress = progress * 1000
	elif progress < 0.25:
		state.state_type = "clearing"
		state.progress = (progress - 0.1) * 667
	elif progress < 0.6:
		state.state_type = "earthwork"
		state.progress = (progress - 0.25) * 286
	elif progress < 0.85:
		state.state_type = "pavement"
		state.progress = (progress - 0.6) * 400
	elif progress < 0.95:
		state.state_type = "finishing"
		state.progress = (progress - 0.85) * 1000
	else:
		state.state_type = "completed"
		state.progress = (progress - 0.95) * 1000
		state.quality_status = "qualified"

	return state

# ========== 信号处理 ==========

func _on_entity_created(entity_data: Dictionary) -> void:
	"""处理实体创建信号"""
	_create_entity(entity_data)

func _on_state_updated(entity_id: String, new_state: Dictionary) -> void:
	"""处理状态更新信号"""
	if entity_id in entity_states:
		entity_states[entity_id] = new_state
		if entity_id in entities:
			entities[entity_id].update_visual(new_state)
		_update_entity_list()

func _on_timeline_changed(progress: float) -> void:
	"""处理时间轴变化信号"""
	update_entity_states(progress)

func _on_api_loaded() -> void:
	"""处理API数据加载完成"""
	status_label.text = "数据加载完成 (%d 个实体)" % entities.size()

# ========== 输入处理 ==========

func _unhandled_input(event: InputEvent) -> void:
	# 空格键 - 旋转相机
	if event.is_action_pressed("rotate_camera"):
		is_rotating = true
	elif event.is_action_released("rotate_camera"):
		is_rotating = false

	# R键 - 重置时间轴
	if event.is_action_pressed("reset_timeline"):
		current_progress = 0.0
		timeline_slider.value = 0.0
		_update_time_display()
		EventBus.timeline_changed.emit(0.0)

	# F1键 - 打印统计
	if event.is_action_pressed("print_stats"):
		_print_statistics()

	# F2键 - 切换调试信息
	if event.is_action_pressed("toggle_debug"):
		EventBus.toggle_debug_info.emit()

func _print_statistics() -> void:
	"""打印统计信息"""
	print("========== 项目统计 ==========")
	print("实体数量: %d" % entities.size())
	print("当前进度: %.1f%%" % (current_progress * 100))
	print("================================")

# ========== 查询功能 ==========

func query_at_station(station: String, lateral: float = 0.0) -> Dictionary:
	"""
	实时查询：指定位置当前状态
	这是核心查询功能："这个位置现在是什么状态？"
	"""
	var result = {
		"station": station,
		"lateral_offset": lateral,
		"entities": [],
		"timestamp": Time.get_datetime_string_from_system()
	}

	# 查找该位置的实体
	for entity_id in entities:
		var entity = entities[entity_id]
		var entity_data = entity.entity_data

		# 检查桩号范围
		if _is_station_in_range(station, entity_data.get("start_station", ""), entity_data.get("end_station", "")):
			var state = entity_states.get(entity_id, {})
			result.entities.append({
				"entity_id": entity_id,
				"name": entity_data["name"],
				"entity_type": entity_data["entity_type"],
				"state": state
			})

	return result

func _is_station_in_range(station: String, start: String, end: String) -> bool:
	"""判断桩号是否在范围内"""
	var station_mm = SpaceService.parse_station(station)
	var start_mm = SpaceService.parse_station(start)
	var end_mm = SpaceService.parse_station(end)
	return start_mm <= station_mm and station_mm <= end_mm

# ========== 模拟功能 ==========

func simulate_at_time(target_date: String) -> Dictionary:
	"""
	版本模拟：预测在目标时间点的状态
	回答："这个施工步骤完成后会是什么样子？"
	"""
	# 简单计算进度（实际应根据施工计划计算）
	var target_progress = _calculate_progress_from_date(target_date)

	# 更新所有实体状态
	update_entity_states(target_progress)

	# 返回模拟结果
	var result = {
		"target_date": target_date,
		"progress": target_progress,
		"entities": []
	}

	for entity_id in entities:
		var entity_data = entities[entity_id].entity_data
		var state = entity_states.get(entity_id, {})
		result.entities.append({
			"entity_id": entity_id,
			"name": entity_data["name"],
			"state": state
		})

	return result

func _calculate_progress_from_date(date_str: String) -> float:
	"""根据日期计算进度（简化版）"""
	# 实际应根据项目计划计算
	var year = date_str.substr(0, 4).to_int()
	var month = date_str.substr(5, 2).to_int()
	var day = date_str.substr(8, 2).to_int()

	var target_date = Time.get_unix_time_from_datetime_string(date_str)
	var start_date = Time.get_unix_time_from_datetime_string(project_start_date)
	var end_date = Time.get_unix_time_from_datetime_string(project_end_date)

	var total_seconds = end_date - start_date
	var elapsed_seconds = target_date - start_date

	return clampf(elapsed_seconds / total_seconds, 0.0, 1.0)
