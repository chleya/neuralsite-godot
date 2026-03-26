extends Node
class_name APIClient

# NeuralSite API客户端
# 负责与后端服务通信

# API配置
var backend_url: String = "http://localhost:8000/api/v1"
var use_mock_api: bool = true  # 是否使用模拟数据
var timeout: float = 10.0

# HTTP客户端
var http_client: HTTPClient
var mutex: Mutex

# 状态
var is_connected: bool = false
var last_error: String = ""

# 数据缓存
var project_data: Dictionary = {}
var entities_cache: Array = []
var states_cache: Dictionary = {}
var events_cache: Array = []

func _init():
	mutex = Mutex.new()
	http_client = HTTPClient.new()

	print("[APIClient] API客户端初始化完成")

func _ready() -> void:
	# 连接服务器
	if not use_mock_api:
		_connect_to_server()

# ========== 连接管理 ==========

func _connect_to_server() -> void:
	"""连接到后端服务器"""
	var host = backend_url.replace("http://", "").split(":")[0]
	var port = 80

	var err = http_client.connect_to_host(host, port)
	if err != OK:
		last_error = "连接失败: " + str(err)
		EventBus.emit_error(last_error)
		is_connected = false
	else:
		is_connected = true
		print("[APIClient] 已连接到: ", backend_url)

# ========== 项目数据加载 ==========

func load_project_data() -> void:
	"""加载项目数据"""
	if use_mock_api:
		# 使用模拟数据
		EventBus.api_loaded.emit()
		return

	# 加载实体
	await load_entities()

	# 加载事件
	await load_events()

	EventBus.api_loaded.emit()

func load_entities() -> bool:
	"""加载实体列表"""
	if use_mock_api:
		return true

	var result = await get_request("/entities")
	if result.has("data"):
		entities_cache = result["data"]
		EventBus.entities_loaded.emit(entities_cache)
		return true
	else:
		last_error = "加载实体失败"
		EventBus.emit_error(last_error)
		return false

func load_events() -> bool:
	"""加载事件列表"""
	if use_mock_api:
		return true

	var result = await get_request("/events")
	if result.has("data"):
		events_cache = result["data"]
		EventBus.events_loaded.emit(events_cache)
		return true
	else:
		last_error = "加载事件失败"
		EventBus.emit_error(last_error)
		return false

# ========== 实时查询API ==========

func query_realtime(station: String, lateral: float = 0.0, elevation: float = 0.0) -> Dictionary:
	"""
	实时查询：指定位置当前状态
	这是核心查询功能："这个位置现在是什么状态？"
	"""
	if use_mock_api:
		return _mock_query_realtime(station, lateral)

	return await get_request("/query/realtime?station=%s&lateral=%f" % [station, lateral])

func _mock_query_realtime(station: String, lateral: float) -> Dictionary:
	"""模拟实时查询"""
	# 从场景中获取实体进行查询
	var main = get_tree().root.get_node("Main")
	if main and main.has_method("query_at_station"):
		return main.query_at_station(station, lateral)

	return {
		"station": station,
		"entities": [],
		"timestamp": Time.get_datetime_string_from_system()
	}

# ========== 版本模拟API ==========

func simulate_project(target_time: String, start_station: String = "", end_station: String = "") -> Dictionary:
	"""
	版本模拟：预测项目在目标时间点的状态
	回答："这个施工步骤完成后会是什么样子？"
	"""
	if use_mock_api:
		return _mock_simulate_project(target_time)

	var url = "/simulation/project?target_time=%s" % target_time
	if start_station:
		url += "&start_station=%s" % start_station
	if end_station:
		url += "&end_station=%s" % end_station

	return await get_request(url)

func _mock_simulate_project(target_time: String) -> Dictionary:
	"""模拟版本查询"""
	var main = get_tree().root.get_node("Main")
	if main and main.has_method("simulate_at_time"):
		return main.simulate_at_time(target_time)

	return {
		"target_time": target_time,
		"entities": []
	}

# ========== 实体管理API ==========

func create_entity(entity_data: Dictionary) -> Dictionary:
	"""创建实体"""
	if use_mock_api:
		EventBus.entity_created.emit(entity_data)
		return entity_data

	return await post_request("/entities", entity_data)

func update_entity(entity_id: String, entity_data: Dictionary) -> Dictionary:
	"""更新实体"""
	if use_mock_api:
		EventBus.entity_updated.emit(entity_id, entity_data)
		return entity_data

	return await put_request("/entities/%s" % entity_id, entity_data)

func delete_entity(entity_id: String) -> bool:
	"""删除实体"""
	if use_mock_api:
		EventBus.entity_deleted.emit(entity_id)
		return true

	var result = await delete_request("/entities/%s" % entity_id)
	return result.has("success")

func get_entity(entity_id: String) -> Dictionary:
	"""获取实体详情"""
	if use_mock_api:
		return {}

	return await get_request("/entities/%s" % entity_id)

# ========== 状态管理API ==========

func create_state(entity_id: String, state_data: Dictionary) -> Dictionary:
	"""创建状态快照"""
	if use_mock_api:
		EventBus.state_updated.emit(entity_id, state_data)
		return state_data

	return await post_request("/states", {
		"entity_id": entity_id
	}.merge(state_data))

func get_entity_latest_state(entity_id: String) -> Dictionary:
	"""获取实体最新状态"""
	if use_mock_api:
		return {}

	return await get_request("/states/entity/%s/latest" % entity_id)

func get_entity_history(entity_id: String) -> Array:
	"""获取实体历史状态"""
	if use_mock_api:
		return []

	var result = await get_request("/states/entity/%s/history" % entity_id)
	return result.get("states", [])

# ========== 事件管理API ==========

func create_event(event_data: Dictionary) -> Dictionary:
	"""创建事件"""
	if use_mock_api:
		EventBus.event_created.emit(event_data)
		return event_data

	return await post_request("/events", event_data)

func get_events(event_type: String = "", start_time: String = "", end_time: String = "") -> Array:
	"""获取事件列表"""
	if use_mock_api:
		return events_cache

	var url = "/events?"
	if event_type:
		url += "event_type=%s&" % event_type
	if start_time:
		url += "start_time=%s&" % start_time
	if end_time:
		url += "end_time=%s" % end_time

	var result = await get_request(url)
	return result.get("data", [])

# ========== HTTP请求方法 ==========

func get_request(path: String) -> Dictionary:
	"""GET请求"""
	mutex.lock()

	var url = backend_url + path
	var headers = ["Content-Type: application/json"]

	var err = http_client.request(HTTPClient.METHOD_GET, url, headers)
	if err != OK:
		mutex.unlock()
		last_error = "请求失败: " + str(err)
		return {"error": last_error}

	# 等待响应
	while http_client.get_status() == HTTPClient.STATUS_REQUESTING:
		http_client.poll()
		await get_tree().create_timer(0.1).timeout

	var response_body = http_client.read_response_body_as_string()
	var response = JSON.parse_string(response_body)

	mutex.unlock()

	if response:
		return response
	else:
		return {"error": "解析响应失败"}

func post_request(path: String, data: Dictionary) -> Dictionary:
	"""POST请求"""
	mutex.lock()

	var url = backend_url + path
	var headers = ["Content-Type: application/json"]
	var body = JSON.stringify(data)

	var err = http_client.request(HTTPClient.METHOD_POST, url, headers, body)
	if err != OK:
		mutex.unlock()
		last_error = "请求失败: " + str(err)
		return {"error": last_error}

	# 等待响应
	while http_client.get_status() == HTTPClient.STATUS_REQUESTING:
		http_client.poll()
		await get_tree().create_timer(0.1).timeout

	var response_body = http_client.read_response_body_as_string()
	var response = JSON.parse_string(response_body)

	mutex.unlock()

	if response:
		return response
	else:
		return {"error": "解析响应失败"}

func put_request(path: String, data: Dictionary) -> Dictionary:
	"""PUT请求"""
	mutex.lock()

	var url = backend_url + path
	var headers = ["Content-Type: application/json"]
	var body = JSON.stringify(data)

	var err = http_client.request(HTTPClient.METHOD_PUT, url, headers, body)
	if err != OK:
		mutex.unlock()
		last_error = "请求失败: " + str(err)
		return {"error": last_error}

	# 等待响应
	while http_client.get_status() == HTTPClient.STATUS_REQUESTING:
		http_client.poll()
		await get_tree().create_timer(0.1).timeout

	var response_body = http_client.read_response_body_as_string()
	var response = JSON.parse_string(response_body)

	mutex.unlock()

	if response:
		return response
	else:
		return {"error": "解析响应失败"}

func delete_request(path: String) -> Dictionary:
	"""DELETE请求"""
	mutex.lock()

	var url = backend_url + path
	var headers = ["Content-Type: application/json"]

	var err = http_client.request(HTTPClient.METHOD_DELETE, url, headers)
	if err != OK:
		mutex.unlock()
		last_error = "请求失败: " + str(err)
		return {"error": last_error}

	# 等待响应
	while http_client.get_status() == HTTPClient.STATUS_REQUESTING:
		http_client.poll()
		await get_tree().create_timer(0.1).timeout

	var response_body = http_client.read_response_body_as_string()
	var response = JSON.parse_string(response_body)

	mutex.unlock()

	if response:
		return response
	else:
		return {"error": "解析响应失败"}

# ========== 配置方法 ==========

func set_backend_url(url: String) -> void:
	"""设置后端URL"""
	backend_url = url
	_connect_to_server()

func set_mock_api(enabled: bool) -> void:
	"""设置是否使用模拟API"""
	use_mock_api = enabled
