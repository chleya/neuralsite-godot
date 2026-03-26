# APIClient.gd
# HTTP通信客户端 - 与NeuralSite后端API交互
# 支持: 自动重试、超时、错误追踪、正确的后端端点
extends Node

var base_url: String = ProjectConfig.API_CONFIG.base_url
var api_version: String = ProjectConfig.API_CONFIG.api_version

@export_group("连接设置", "http_")
@export var timeout_seconds: float = ProjectConfig.API_CONFIG.timeout_seconds
@export var max_retries: int = ProjectConfig.API_CONFIG.max_retries
@export var retry_delay: float = ProjectConfig.API_CONFIG.retry_delay

signal state_updated(data: Dictionary)
signal entities_loaded(entities: Array)
signal states_loaded(states: Array)
signal tags_loaded(entity_id: String, tags: Array)
signal error_occurred(message: String)
signal connection_status_changed(connected: bool)

var _is_connected: bool = false
var _last_error: String = ""
var _request_count: int = 0
var _failed_request_count: int = 0

func _ready() -> void:
	print("[APIClient] Initialized, backend: ", base_url)
	_test_connection()

func _test_connection() -> void:
	var result = await get_godot_entities()
	if result.size() > 0 or _last_error.is_empty():
		_is_connected = true
		connection_status_changed.emit(true)
	else:
		_is_connected = false
		connection_status_changed.emit(false)

func get_godot_entities() -> Array:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.entities]
	var result = await _http_get_with_retry(url)
	if result is Array:
		entities_loaded.emit(result)
		_is_connected = true
		return result
	elif result is Dictionary and result.has("entities"):
		entities_loaded.emit(result["entities"])
		_is_connected = true
		return result["entities"]
	_is_connected = false
	return []

func get_godot_states() -> Array:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.states]
	var result = await _http_get_with_retry(url)
	if result is Array:
		states_loaded.emit(result)
		_is_connected = true
		return result
	elif result is Dictionary and result.has("states"):
		states_loaded.emit(result["states"])
		_is_connected = true
		return result["states"]
	_is_connected = false
	return []

func get_realtime_state(station: int = 0) -> Dictionary:
	var url = "%s%s%s?station=%d" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.realtime, station]
	var result = await _http_get_with_retry(url)
	if result.size() > 0:
		state_updated.emit(result)
		return result
	return {}

func get_entity_realtime(entity_id: String) -> Dictionary:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.entity_realtime % entity_id]
	return await _http_get_with_retry(url)

func simulate_entity_state(entity_id: String, target_time: String) -> Dictionary:
	var url = "%s%s%s?target_time=%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.simulation % entity_id, target_time]
	return await _http_get_with_retry(url)

func get_entity_state_history(entity_id: String) -> Array:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.state_history % entity_id]
	var result = await _http_get_with_retry(url)
	if result is Array:
		return result
	elif result is Dictionary and result.has("history"):
		return result["history"]
	return []

func get_entity_semantic_tags(entity_id: String) -> Array:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.semantic_tags % entity_id]
	var result = await _http_get_with_retry(url)
	if result is Array:
		tags_loaded.emit(entity_id, result)
		return result
	elif result is Dictionary and result.has("tags"):
		tags_loaded.emit(entity_id, result["tags"])
		return result["tags"]
	return []

func apply_semantic_tag(entity_id: String, tag_data: Dictionary) -> Dictionary:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.semantic_apply]
	var body = {
		"entity_id": entity_id,
		"tag_id": tag_data.get("tag_id", ""),
		"category": tag_data.get("category", "custom"),
		"name": tag_data.get("name", ""),
		"value": tag_data.get("value", ""),
	}
	return await _http_post_with_retry(url, body)

func get_entities_at_location(station: int, range_half: int = 100) -> Array:
	var url = "%s%s%s?station=%d&range_half=%d" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.entities_at_location, station, range_half]
	var result = await _http_get_with_retry(url)
	if result is Array:
		return result
	elif result is Dictionary and result.has("entities"):
		return result["entities"]
	return []

func get_space_nearby(station: int, distance: float = 50.0) -> Array:
	var url = "%s%s%s?station=%d&distance=%.1f" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.space_nearby, station, distance]
	var result = await _http_get_with_retry(url)
	if result is Array:
		return result
	elif result is Dictionary and result.has("stations"):
		return result["stations"]
	return []

func get_events(station: int = 0, event_type: String = "") -> Array:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.events]
	var params = []
	if station > 0:
		params.append("station=%d" % station)
	if not event_type.is_empty():
		params.append("event_type=%s" % event_type)
	if params.size() > 0:
		url += "?" + "".join(params)
	var result = await _http_get_with_retry(url)
	if result is Array:
		return result
	elif result is Dictionary and result.has("events"):
		return result["events"]
	return []

func sync_entity_state(entity_id: String, state_data: Dictionary) -> Dictionary:
	var url = "%s%s/entities/%s/state" % [base_url, api_version, entity_id]
	return await _http_post_with_retry(url, state_data)

func get_entity_state(entity_id: String) -> Dictionary:
	var url = "%s%s/entities/%s/state" % [base_url, api_version, entity_id]
	return await _http_get_with_retry(url)

func get_project_statistics() -> Dictionary:
	var url = "%s%s%s" % [base_url, api_version, ProjectConfig.GODOT_ENDPOINTS.statistics]
	return await _http_get_with_retry(url)

func _http_get_with_retry(url: String) -> Dictionary:
	var attempt = 0
	var last_err = ""
	
	while attempt < max_retries:
		attempt += 1
		_request_count += 1
		
		var result = await _http_get(url)
		if result.size() > 0 or (result is Dictionary and result.has("error") == false):
			return result
		
		last_err = _last_error
		
		if attempt < max_retries:
			await get_tree().create_timer(retry_delay).timeout
	
	_failed_request_count += 1
	_last_error = "Failed after %d attempts: %s" % [max_retries, last_err]
	error_occurred.emit(_last_error)
	return {}

func _http_post_with_retry(url: String, body: Dictionary) -> Dictionary:
	var attempt = 0
	var last_err = ""
	
	while attempt < max_retries:
		attempt += 1
		_request_count += 1
		
		var result = await _http_post(url, body)
		if result.size() > 0 or (result is Dictionary and result.has("error") == false):
			return result
		
		last_err = _last_error if not _last_error.is_empty() else "Unknown error"
		
		if attempt < max_retries:
			await get_tree().create_timer(retry_delay).timeout
	
	_failed_request_count += 1
	_last_error = "Failed after %d attempts: %s" % [max_retries, last_err]
	error_occurred.emit(_last_error)
	return {}

func _http_get(url: String) -> Dictionary:
	var http = HTTPRequest.new()
	add_child(http)
	http.timeout = timeout_seconds
	
	var err = http.request(url, [], HTTPClient.METHOD_GET)
	if err != OK:
		_last_error = "Request failed: %s" % str(err)
		http.queue_free()
		return {}
	
	var response = await http.request_completed
	var response_code = response[1]
	http.queue_free()
	
	if response_code >= 200 and response_code < 300:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		_is_connected = true
		return json.get_data()
	elif response_code >= 400 and response_code < 500:
		_last_error = "Client error: %d" % response_code
	elif response_code >= 500:
		_last_error = "Server error: %d" % response_code
	else:
		_last_error = "Unexpected response: %d" % response_code
	
	return {}

func _http_post(url: String, body: Dictionary) -> Dictionary:
	var http = HTTPRequest.new()
	add_child(http)
	http.timeout = timeout_seconds
	
	var body_json = JSON.stringify(body)
	var headers = ["Content-Type: application/json"]
	
	var err = http.request(url, headers, HTTPClient.METHOD_POST, body_json)
	if err != OK:
		_last_error = "Request failed: %s" % str(err)
		http.queue_free()
		return {}
	
	var response = await http.request_completed
	var response_code = response[1]
	http.queue_free()
	
	if response_code >= 200 and response_code < 300:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		_is_connected = true
		return json.get_data()
	elif response_code >= 400 and response_code < 500:
		_last_error = "Client error: %d" % response_code
	elif response_code >= 500:
		_last_error = "Server error: %d" % response_code
	else:
		_last_error = "Unexpected response: %d" % response_code
	
	return {}

func is_connected() -> bool:
	return _is_connected

func get_last_error() -> String:
	return _last_error

func get_stats() -> Dictionary:
	return {
		"total_requests": _request_count,
		"failed_requests": _failed_request_count,
		"success_rate": 1.0 - (float(_failed_request_count) / max(_request_count, 1))
	}

func reset_stats() -> void:
	_request_count = 0
	_failed_request_count = 0
