# WebSocketClient.gd
# WebSocket客户端 - 与后端实时同步
# 支持: 自动重连、心跳、消息队列
extends Node

@export_group("WebSocket设置", "ws_")
@export var server_url: String = "ws://localhost:8000/api/v3/ws"
@export var auto_connect: bool = true
@export var reconnect_delay: float = 3.0
@export var heartbeat_interval: float = 5.0
@export var max_reconnect_attempts: int = 10

signal connected()
signal disconnected()
signal message_received(data: Dictionary)
signal entity_updated(entity_id: String, data: Dictionary)
signal sync_error(error: String)
signal connection_status_changed(connected: bool)

var _websocket: WebSocketPeer
var _is_connected: bool = false
var _reconnect_timer: float = 0.0
var _heartbeat_timer: float = 0.0
var _pending_messages: Array = []
var _reconnect_attempts: int = 0
var _last_pong_time: float = 0.0
var _connection_quality: String = "excellent"

var _stats: Dictionary = {
	"messages_sent": 0,
	"messages_received": 0,
	"reconnects": 0,
	"last_error": ""
}

func _ready() -> void:
	_websocket = WebSocketPeer.new()
	if auto_connect:
		_connect_to_server()
	print("[WebSocketClient] Initialized")

func _process(delta: float) -> void:
	if not _is_connected:
		_reconnect_timer -= delta
		if _reconnect_timer <= 0:
			if _reconnect_attempts < max_reconnect_attempts:
				_connect_to_server()
				_reconnect_attempts += 1
			else:
				_connection_quality = "disconnected"
				connection_status_changed.emit(false)
		reconnect_delay = min(reconnect_delay * 1.5, 30.0)
	else:
		reconnect_delay = 3.0
		_heartbeat_timer -= delta
		if _heartbeat_timer <= 0:
			_send_heartbeat()
			_heartbeat_timer = heartbeat_interval
		
		if Time.get_unix_time_from_system() - _last_pong_time > heartbeat_interval * 3:
			_connection_quality = "poor"
		
		_poll_messages()

func _connect_to_server() -> void:
	print("[WebSocketClient] Connecting to %s (attempt %d)" % [server_url, _reconnect_attempts + 1])
	var err = _websocket.connect_to_url(server_url)
	if err != OK:
		print("[WebSocketClient] Connection failed: ", err)
		_stats["last_error"] = "Connection failed: %s" % str(err)
		_reconnect_timer = reconnect_delay
	else:
		_reconnect_timer = 0.5

func _poll_messages() -> void:
	_websocket.poll()
	var state = _websocket.get_ready_state()
	
	match state:
		WebSocketPeer.STATE_OPEN:
			if not _is_connected:
				_is_connected = true
				_reconnect_attempts = 0
				_connection_quality = "excellent"
				connected.emit()
				connection_status_changed.emit(true)
				print("[WebSocketClient] Connected!")
				_flush_pending_messages()
		
		WebSocketPeer.STATE_CLOSING:
			pass
		
		WebSocketPeer.STATE_CLOSED:
			if _is_connected:
				_is_connected = false
				_connection_quality = "disconnected"
				disconnected.emit()
				connection_status_changed.emit(false)
				var close_code = _websocket.get_close_code()
				var close_reason = _websocket.get_close_reason()
				print("[WebSocketClient] Closed: %d - %s" % [close_code, close_reason])
				_stats["last_error"] = "Closed: %d - %s" % [close_code, close_reason]
				_reconnect_timer = reconnect_delay
	
	while _websocket.get_available_packet_count() > 0:
		var data = _websocket.get_packet()
		if data.size() > 0:
			_handle_message(data.get_string_from_utf8())

func _handle_message(json_string: String) -> void:
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	
	if parse_result != OK:
		sync_error.emit("JSON parse failed: " + json_string)
		return
	
	var data = json.get_data()
	if typeof(data) != TYPE_DICTIONARY:
		return
	
	_stats["messages_received"] += 1
	message_received.emit(data)
	
	var msg_type = data.get("type", "")
	match msg_type:
		"entity_updated":
			entity_updated.emit(data.get("entity_id", ""), data.get("data", {}))
			_apply_entity_update(data.get("entity_id", ""), data.get("data", {}))
		
		"sync":
			_apply_sync_data(data.get("data", {}))
		
		"subscribed":
			print("[WebSocketClient] Subscribed: ", data.get("entity_id"))
		
		"pong":
			_last_pong_time = Time.get_unix_time_from_system()
			_connection_quality = "excellent"
		
		"error":
			sync_error.emit(data.get("message", "Unknown error"))
			_stats["last_error"] = data.get("message", "Unknown error")

func _apply_entity_update(entity_id: String, data: Dictionary) -> void:
	var entity = _find_entity_by_id(entity_id)
	if entity:
		for key in data:
			if key in entity:
				entity.set(key, data[key])
		print("[WebSocketClient] Updated: %s" % entity_id)

func _apply_sync_data(data: Dictionary) -> void:
	print("[WebSocketClient] Sync: %s" % str(data.keys()))

func _find_entity_by_id(entity_id: String) -> Node:
	var root = get_tree().root
	var main = root.get_node_or_null("Main")
	if not main:
		return null
	
	var container = main.get_node_or_null("EntityContainer")
	if container:
		for child in container.get_children():
			if child.has("entity_id") and child.get("entity_id") == entity_id:
				return child
	
	var road_container = main.get_node_or_null("RoadContainer")
	if road_container:
		for child in road_container.get_children():
			if child.has("entity_id") and child.get("entity_id") == entity_id:
				return child
	
	return null

func send_message(data: Dictionary) -> void:
	if not _is_connected:
		_pending_messages.append(data)
		return
	
	var json_string = JSON.stringify(data)
	var err = _websocket.send_text(json_string)
	if err == OK:
		_stats["messages_sent"] += 1
	else:
		_pending_messages.append(data)

func _flush_pending_messages() -> void:
	var messages = _pending_messages.duplicate()
	_pending_messages.clear()
	for msg in messages:
		send_message(msg)

func subscribe_entity(entity_id: String) -> void:
	send_message({
		"type": "subscribe",
		"entity_id": entity_id
	})

func subscribe_all() -> void:
	send_message({
		"type": "subscribe_all"
	})

func send_entity_update(entity_id: String, entity_type: String, data: Dictionary) -> void:
	send_message({
		"type": "update",
		"entity_id": entity_id,
		"entity_type": entity_type,
		"data": data
	})

func send_progress_update(entity_id: String, old_progress: float, new_progress: float) -> void:
	send_message({
		"type": "progress_update",
		"entity_id": entity_id,
		"old_progress": old_progress,
		"new_progress": new_progress,
		"timestamp": Time.get_unix_time_from_system()
	})

func send_phase_change(entity_id: String, old_phase: String, new_phase: String) -> void:
	send_message({
		"type": "phase_change",
		"entity_id": entity_id,
		"old_phase": old_phase,
		"new_phase": new_phase,
		"timestamp": Time.get_unix_time_from_system()
	})

func send_entity_click(entity_id: String, entity_type: String, position: Vector3) -> void:
	send_message({
		"type": "entity_click",
		"entity_id": entity_id,
		"entity_type": entity_type,
		"position": [position.x, position.y, position.z],
		"timestamp": Time.get_unix_time_from_system()
	})

func _send_heartbeat() -> void:
	send_message({
		"type": "ping",
		"timestamp": Time.get_unix_time_from_system()
	})

func force_reconnect() -> void:
	if _websocket:
		_websocket.close()
	_is_connected = false
	_reconnect_attempts = 0
	_connect_to_server()

func is_connected() -> bool:
	return _is_connected

func get_pending_count() -> int:
	return _pending_messages.size()

func get_connection_quality() -> String:
	return _connection_quality

func get_stats() -> Dictionary:
	return _stats.duplicate()

func reset_stats() -> void:
	_stats = {
		"messages_sent": 0,
		"messages_received": 0,
		"reconnects": _stats["reconnects"],
		"last_error": ""
	}
