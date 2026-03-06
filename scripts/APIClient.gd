# APIClient.gd
# Autoload script - handles HTTP communication with NeuralSite backend
extends Node

# Connect to your existing FastAPI backend
var base_url: String = "http://localhost:8000"
var api_version: String = "/api/v1"

signal state_updated(data: Dictionary)
signal station_loaded(stations: Array)
signal error_occurred(message: String)

func _ready():
	print("[APIClient] Initialized, backend: ", base_url)

# Get spacetime state for a station
func get_spacetime_state(station: int) -> Dictionary:
	var url = "%s%s/spacetime/query?station=%d" % [base_url, api_version, station]
	var result = await _http_get(url)
	if result.size() > 0:
		state_updated.emit(result)
		return result
	return {}

# Get all stations from project
func get_stations() -> Array:
	var url = "%s%s/spatial/stations" % [base_url, api_version]
	var result = await _http_get(url)
	if result is Array:
		station_loaded.emit(result)
		return result
	return []

# Add event to the log
func add_event(event_type: String, station_start: int, station_end: int, params: Dictionary) -> Dictionary:
	var url = "%s%s/spacetime/events" % [base_url, api_version]
	var body = {
		"event_type": event_type,
		"station_start": station_start,
		"station_end": station_end,
		"params": params
	}
	var result = await _http_post(url, body)
	return result

# Get evolution state
func get_evolution_state() -> Dictionary:
	var url = "%s%s/spacetime/evolution" % [base_url, api_version]
	var result = await _http_get(url)
	return result

# Upload photo for analysis
func upload_photo(image_path: String) -> Dictionary:
	var url = "%s%s/photos/upload" % [base_url, api_version]
	# Note: In Godot 4, use FileAccess to read binary
	var result = {}
	# Simplified - would need FileAccess and multipart form
	return result

# Internal HTTP helpers
func _http_get(url: String) -> Dictionary:
	var http = HTTPRequest.new()
	add_child(http)
	
	var request_result = await http.request(url, [], HTTPClient.METHOD_GET)
	if request_result != OK:
		error_occurred.emit("HTTP GET failed: " + url)
		return {}
	
	var response = await http.request_completed
	http.queue_free()
	
	if response[1] == 200:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		return json.get_data()
	return {}

func _http_post(url: String, body: Dictionary) -> Dictionary:
	var http = HTTPRequest.new()
	add_child(http)
	
	var body_json = JSON.stringify(body)
	var headers = ["Content-Type: application/json"]
	
	var request_result = await http.request(url, headers, HTTPClient.METHOD_POST, body_json)
	if request_result != OK:
		error_occurred.emit("HTTP POST failed")
		return {}
	
	var response = await http.request_completed
	http.queue_free()
	
	if response[1] == 200:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		return json.get_data()
	return {}
