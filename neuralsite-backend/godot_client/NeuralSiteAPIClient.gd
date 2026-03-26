"""
NeuralSite API客户端 - Godot GDScript版本
用于Godot 4.3客户端连接后端API
"""

extends Node
class_name NeuralSiteAPIClient

# API配置
var base_url: String = "http://localhost:8000/api/v1"
var timeout: float = 10.0

# HTTP客户端
var http_client: HTTPClient
var mutex: Mutex

# 信号定义
signal api_request_completed(response: Dictionary)
signal api_request_failed(error: String)

func _init():
	mutex = Mutex.new()
	http_client = HTTPClient.new()

func _ready():
	# 连接服务器
	var err = http_client.connect_to_host(base_url.replace("http://", "").split(":")[0], 80)
	if err != OK:
		print("[NeuralSiteAPI] 连接失败: ", err)

# ========== 空间计算API ==========

func station_to_coord(station: String, lateral: float = 0.0, elevation: float = 0.0) -> Dictionary:
	"""
	桩号转三维坐标
	参数:
		station: 桩号，如 "K0+000"
		lateral: 横向偏移（米）
		elevation: 高程（米）
	返回:
		包含坐标的字典
	"""
	var url = "%s/space/station-to-coord?station=%s&lateral=%f&elevation=%f" % [base_url, station, lateral, elevation]
	return await _get_request(url)

func coord_to_station(x: float, y: float, z: float = 0.0, lateral: float = 0.0) -> Dictionary:
	"""
	三维坐标转桩号
	"""
	var url = "%s/space/coord-to-station?x=%f&y=%f&z=%f&lateral=%f" % [base_url, x, y, z, lateral]
	return await _get_request(url)

# ========== 实体管理API ==========

func get_entities(entity_type: String = "") -> Array:
	"""
	获取实体列表
	"""
	var url = base_url + "/entities"
	if entity_type != "":
		url += "?entity_type=" + entity_type
	var response = await _get_request(url)
	return response.get("data", [])

func get_entity(entity_id: String) -> Dictionary:
	"""
	获取实体详情
	"""
	var url = "%s/entities/%s" % [base_url, entity_id]
	return await _get_request(url)

func create_entity(entity_data: Dictionary) -> Dictionary:
	"""
	创建实体
	参数:
		entity_data: 实体数据字典
	"""
	return await _post_request(base_url + "/entities", entity_data)

func update_entity(entity_id: String, entity_data: Dictionary) -> Dictionary:
	"""
	更新实体
	"""
	var url = "%s/entities/%s" % [base_url, entity_id]
	return await _put_request(url, entity_data)

func query_entities_at_location(station: String, entity_type: String = "") -> Array:
	"""
	根据位置查询实体
	参数:
		station: 桩号
		entity_type: 实体类型过滤
	"""
	var url = "%s/entities/at-location?station=%s" % [base_url, station]
	if entity_type != "":
		url += "&entity_type=" + entity_type
	var response = await _get_request(url)
	return response.get("entities", [])

# ========== 状态管理API ==========

func get_entity_latest_state(entity_id: String) -> Dictionary:
	"""
	获取实体的最新状态
	"""
	var url = "%s/states/entity/%s/latest" % [base_url, entity_id]
	return await _get_request(url)

func get_entity_history(entity_id: String) -> Array:
	"""
	获取实体的历史状态
	"""
	var url = "%s/states/entity/%s/history" % [base_url, entity_id]
	var response = await _get_request(url)
	return response.get("states", [])

func get_current_states(entity_ids: Array = []) -> Array:
	"""
	获取所有实体的当前状态
	"""
	var url = base_url + "/states/current"
	if entity_ids.size() > 0:
		url += "?entity_ids=" + ",".join(entity_ids)
	var response = await _get_request(url)
	return response.get("states", [])

func create_state(state_data: Dictionary) -> Dictionary:
	"""
	创建状态快照
	"""
	return await _post_request(base_url + "/states", state_data)

# ========== 事件管理API ==========

func get_events(event_type: String = "", start_time: String = "", end_time: String = "") -> Array:
	"""
	获取事件列表
	"""
	var url = base_url + "/events"
	var params = []
	if event_type != "":
		params.append("event_type=" + event_type)
	if start_time != "":
		params.append("start_time=" + start_time)
	if end_time != "":
		params.append("end_time=" + end_time)
	if params.size() > 0:
		url += "?" + "&".join(params)
	var response = await _get_request(url)
	return response.get("data", [])

func create_event(event_data: Dictionary) -> Dictionary:
	"""
	创建事件记录
	"""
	return await _post_request(base_url + "/events", event_data)

# ========== 核心查询API ==========

func query_realtime(station: String, lateral: float = 0.0, elevation: float = 0.0) -> Dictionary:
	"""
	实时查询：指定位置当前状态
	这是最常用的功能："这个位置现在是什么状态？"
	"""
	var url = "%s/query/realtime?station=%s&lateral=%f" % [base_url, station, lateral]
	if elevation != 0.0:
		url += "&elevation=" + str(elevation)
	return await _get_request(url)

func simulate_entity(entity_id: String, target_time: String) -> Dictionary:
	"""
	版本模拟：预测实体在目标时间点的状态
	参数:
		entity_id: 实体ID
		target_time: 目标时间（ISO格式）
	"""
	var url = "%s/simulation/entity/%s?target_time=%s" % [base_url, entity_id, target_time]
	return await _get_request(url)

func simulate_project(target_time: String, start_station: String = "", end_station: String = "") -> Dictionary:
	"""
	版本模拟：项目在目标时间点的整体状态
	用于生成四维可视化数据
	参数:
		target_time: 目标时间（ISO格式）
		start_station: 起始桩号（可选）
		end_station: 终止桩号（可选）
	"""
	var url = "%s/simulation/project?target_time=%s" % [base_url, target_time]
	if start_station != "":
		url += "&start_station=" + start_station
	if end_station != "":
		url += "&end_station=" + end_station
	return await _get_request(url)

# ========== 内部方法 ==========

func _get_request(url: String) -> Dictionary:
	"""GET请求"""
	mutex.lock()

	var headers = ["Content-Type: application/json"]
	var err = http_client.request(HTTPClient.METHOD_GET, url, headers)

	if err != OK:
		mutex.unlock()
		api_request_failed.emit("请求失败: " + str(err))
		return {}

	# 等待响应
	while http_client.get_status() == HTTPClient.STATUS_REQUESTING:
		http_client.poll()
		await get_tree().create_timer(0.1).timeout

	var response_body = http_client.read_response_body_as_string()
	var response = JSON.parse_string(response_body)

	mutex.unlock()

	if response:
		api_request_completed.emit(response)
		return response
	else:
		api_request_failed.emit("解析响应失败")
		return {}

func _post_request(url: String, data: Dictionary) -> Dictionary:
	"""POST请求"""
	mutex.lock()

	var headers = ["Content-Type: application/json"]
	var body = JSON.stringify(data)
	var err = http_client.request(HTTPClient.METHOD_POST, url, headers, body)

	if err != OK:
		mutex.unlock()
		api_request_failed.emit("请求失败: " + str(err))
		return {}

	# 等待响应
	while http_client.get_status() == HTTPClient.STATUS_REQUESTING:
		http_client.poll()
		await get_tree().create_timer(0.1).timeout

	var response_body = http_client.read_response_body_as_string()
	var response = JSON.parse_string(response_body)

	mutex.unlock()

	if response:
		api_request_completed.emit(response)
		return response
	else:
		api_request_failed.emit("解析响应失败")
		return {}

func _put_request(url: String, data: Dictionary) -> Dictionary:
	"""PUT请求"""
	mutex.lock()

	var headers = ["Content-Type: application/json"]
	var body = JSON.stringify(data)
	var err = http_client.request(HTTPClient.METHOD_PUT, url, headers, body)

	if err != OK:
		mutex.unlock()
		api_request_failed.emit("请求失败: " + str(err))
		return {}

	# 等待响应
	while http_client.get_status() == HTTPClient.STATUS_REQUESTING:
		http_client.poll()
		await get_tree().create_timer(0.1).timeout

	var response_body = http_client.read_response_body_as_string()
	var response = JSON.parse_string(response_body)

	mutex.unlock()

	if response:
		api_request_completed.emit(response)
		return response
	else:
		api_request_failed.emit("解析响应失败")
		return {}
