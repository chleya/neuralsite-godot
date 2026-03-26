extends Node

var _api_client: Node = null
var _entity_cache: Dictionary = {}
var _state_cache: Dictionary = {}
var _tag_cache: Dictionary = {}
var _history_cache: Dictionary = {}

signal entity_sync_completed(entities: Array)
signal state_sync_completed(states: Array)
signal time_travel_data_ready(entity_id: String, history: Array)
signal tag_update_received(entity_id: String, tags: Array)
signal sync_error(message: String)

func setup(api_client: Node) -> void:
	_api_client = api_client

func has_api_client() -> bool:
	return _api_client != null

func fetch_all_entities() -> Array:
	if _api_client == null:
		return await _direct_fetch_entities()

	var entities = await _api_client.get_godot_entities()
	_entity_cache.clear()
	for entity in entities:
		var entity_id = entity.get("id", entity.get("entity_id", str(entity.hash())))
		_entity_cache[entity_id] = entity

	entity_sync_completed.emit(entities)
	return entities

func fetch_all_states() -> Array:
	if _api_client == null:
		return await _direct_fetch_states()

	var states = await _api_client.get_godot_states()
	_state_cache.clear()
	for state in states:
		var entity_id = state.get("entity_id", "unknown")
		_state_cache[entity_id] = state

	state_sync_completed.emit(states)
	return states

func fetch_entity(entity_id: String) -> Dictionary:
	if _entity_cache.has(entity_id):
		return _entity_cache[entity_id]

	if _api_client == null:
		return {}

	var data = await _api_client.get_entity_realtime(entity_id)
	if not data.is_empty():
		_entity_cache[entity_id] = data
	return data

func fetch_entity_state(entity_id: String) -> Dictionary:
	if _state_cache.has(entity_id):
		return _state_cache[entity_id]

	if _api_client == null:
		return {}

	var data = await _api_client.get_entity_state(entity_id)
	if not data.is_empty():
		_state_cache[entity_id] = data
	return data

func fetch_entity_history(entity_id: String) -> Array:
	if _history_cache.has(entity_id):
		return _history_cache[entity_id]

	if _api_client == null:
		return []

	var history = await _api_client.get_entity_state_history(entity_id)
	_history_cache[entity_id] = history
	time_travel_data_ready.emit(entity_id, history)
	return history

func fetch_semantic_tags(entity_id: String) -> Array:
	if _tag_cache.has(entity_id):
		return _tag_cache[entity_id]

	if _api_client == null:
		return []

	var tags = await _api_client.get_entity_semantic_tags(entity_id)
	_tag_cache[entity_id] = tags
	tag_update_received.emit(entity_id, tags)
	return tags

func apply_tag(entity_id: String, tag_data: Dictionary) -> Dictionary:
	if _api_client == null:
		return {"error": "No API client"}

	var result = await _api_client.apply_semantic_tag(entity_id, tag_data)
	if result.get("success", false):
		await refresh_entity_tags(entity_id)
	return result

func refresh_entity_tags(entity_id: String) -> Array:
	_tag_cache.erase(entity_id)
	return await fetch_semantic_tags(entity_id)

func fetch_realtime_data(station: int = 0) -> Dictionary:
	if _api_client == null:
		return {}
	return await _api_client.get_realtime_state(station)

func fetch_project_stats() -> Dictionary:
	if _api_client == null:
		return {}
	return await _api_client.get_project_statistics()

func time_travel_query(entity_id: String, timestamp: String) -> Dictionary:
	var history = await fetch_entity_history(entity_id)

	for entry in history:
		if entry.get("timestamp", "") == timestamp:
			return entry

	for entry in history:
		if entry.get("timestamp", "") <= timestamp:
			return entry

	return {}

func get_cached_entity(entity_id: String) -> Dictionary:
	return _entity_cache.get(entity_id, {})

func get_cached_state(entity_id: String) -> Dictionary:
	return _state_cache.get(entity_id, {})

func get_cached_history(entity_id: String) -> Array:
	return _history_cache.get(entity_id, [])

func get_cached_tags(entity_id: String) -> Array:
	return _tag_cache.get(entity_id, [])

func get_cached_entity_count() -> int:
	return _entity_cache.size()

func get_cached_state_count() -> int:
	return _state_cache.size()

func get_cached_tag_count() -> int:
	return _tag_cache.size()

func clear_cache() -> void:
	_entity_cache.clear()
	_state_cache.clear()
	_tag_cache.clear()
	_history_cache.clear()

func get_cache_summary() -> Dictionary:
	return {
		"entities": _entity_cache.size(),
		"states": _state_cache.size(),
		"tags": _tag_cache.size(),
		"history_entries": _history_cache.size(),
	}

func _direct_fetch_entities() -> Array:
	var http = HTTPRequest.new()
	add_child(http)

	var url = "%s%s/data/godot/entities" % [ProjectConfig.API_CONFIG.base_url, ProjectConfig.API_CONFIG.api_version]
	var err = http.request(url)
	if err != OK:
		http.queue_free()
		sync_error.emit("Failed to fetch entities")
		return []

	var response = await http.request_completed
	http.queue_free()

	if response[1] >= 200 and response[1] < 300:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		var data = json.get_data()
		if data is Array:
			return data
		if data is Dictionary and data.has("entities"):
			return data["entities"]

	return []

func _direct_fetch_states() -> Array:
	var http = HTTPRequest.new()
	add_child(http)

	var url = "%s%s/data/godot/states" % [ProjectConfig.API_CONFIG.base_url, ProjectConfig.API_CONFIG.api_version]
	var err = http.request(url)
	if err != OK:
		http.queue_free()
		sync_error.emit("Failed to fetch states")
		return []

	var response = await http.request_completed
	http.queue_free()

	if response[1] >= 200 and response[1] < 300:
		var json = JSON.new()
		json.parse(response[3].get_string_from_utf8())
		var data = json.get_data()
		if data is Array:
			return data
		if data is Dictionary and data.has("states"):
			return data["states"]

	return []
