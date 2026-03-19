# APIClient.gd
# HTTP通信客户端 - 与NeuralSite后端API交互
# 支持: 自动重试、超时、错误追踪
extends Node

var base_url: String = "http://localhost:8000"
var api_version: String = "/api/v1"

@export_group("连接设置", "http_")
@export var timeout_seconds: float = 10.0
@export var max_retries: int = 3
@export var retry_delay: float = 1.0

signal state_updated(data: Dictionary)
signal station_loaded(stations: Array)
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
	var result = await get_spacetime_state(0)
	if result.size() > 0 or _last_error.is_empty():
		_is_connected = true
		connection_status_changed.emit(true)
	else:
		_is_connected = false
		connection_status_changed.emit(false)

func get_spacetime_state(station: int) -> Dictionary:
	var url = "%s%s/spacetime/query?station=%d" % [base_url, api_version, station]
	var result = await _http_get_with_retry(url)
	if result.size() > 0:
		state_updated.emit(result)
		return result
	return {}

func get_stations() -> Array:
	var url = "%s%s/spatial/stations" % [base_url, api_version]
	var result = await _http_get_with_retry(url)
	if result is Array:
		station_loaded.emit(result)
		_is_connected = true
		return result
	elif result.size() > 0:
		_is_connected = true
		return []
	_is_connected = false
	return []

func add_event(event_type: String, station_start: int, station_end: int, params: Dictionary) -> Dictionary:
	var url = "%s%s/spacetime/events" % [base_url, api_version]
	var body = {
		"event_type": event_type,
		"station_start": station_start,
		"station_end": station_end,
		"params": params
	}
	return await _http_post_with_retry(url, body)

func get_evolution_state() -> Dictionary:
	var url = "%s%s/spacetime/evolution" % [base_url, api_version]
	return await _http_get_with_retry(url)

func sync_entity_state(entity_id: String, state_data: Dictionary) -> Dictionary:
	var url = "%s%s/entities/%s/state" % [base_url, api_version, entity_id]
	return await _http_post_with_retry(url, state_data)

func get_entity_state(entity_id: String) -> Dictionary:
	var url = "%s%s/entities/%s/state" % [base_url, api_version, entity_id]
	return await _http_get_with_retry(url)

func upload_photo(image_path: String) -> Dictionary:
	var url = "%s%s/photos/upload" % [base_url, api_version]
	var result = {}
	return result

func _http_get_with_retry(url: String) -> Dictionary:
	var attempt = 0
	var last_err = ""
	
	while attempt < max_retries:
		attempt += 1
		_request_count += 1
		
		var result = await _http_get(url)
		if result.size() > 0:
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
		if result.size() > 0 or "error" not in result:
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
