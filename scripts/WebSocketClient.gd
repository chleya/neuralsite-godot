# WebSocketClient.gd
# Godot WebSocket客户端 - 与后端实时同步
# 使用: 自动连接后端，接收/发送事件
extends Node

# ── 配置 ──
@export_group("WebSocket设置", "ws_")
@export var server_url: String = "ws://localhost:8000/api/v3/ws"
@export var auto_connect: bool = true
@export var reconnect_delay: float = 3.0
@export var heartbeat_interval: float = 5.0

# ── 信号 ──
signal connected()
signal disconnected()
signal message_received(data: Dictionary)
signal entity_updated(entity_id: String, data: Dictionary)
signal sync_error(error: String)

# ── 内部变量 ──
var _websocket: WebSocketPeer
var _is_connected: bool = false
var _reconnect_timer: float = 0.0
var _heartbeat_timer: float = 0.0
var _pending_messages: Array = []

func _ready() -> void:
	_websocket = WebSocketPeer.new()
	
	if auto_connect:
		_connect_to_server()
	
	print("[WebSocketClient] Initialized")

func _process(delta: float) -> void:
	if not _is_connected:
		_reconnect_timer -= delta
		if _reconnect_timer <= 0:
			_connect_to_server()
			_reconnect_timer = reconnect_delay
	else:
		# 心跳
		_heartbeat_timer -= delta
		if _heartbeat_timer <= 0:
			_send_heartbeat()
			_heartbeat_timer = heartbeat_interval
		
		# 处理消息
		_poll_messages()

func _connect_to_server() -> void:
	print("[WebSocketClient] Connecting to ", server_url)
	var err = _websocket.connect_to_url(server_url)
	if err != OK:
		print("[WebSocketClient] Connection failed: ", err)
		_reconnect_timer = reconnect_delay
	else:
		print("[WebSocketClient] Connection initiated")

func _poll_messages() -> void:
	_websocket.poll()
	var state = _websocket.get_ready_state()
	
	if state == WebSocketPeer.STATE_OPEN:
		if not _is_connected:
			_is_connected = true
			connected.emit()
			print("[WebSocketClient] Connected!")
			
			# 发送待发送的消息
			_flush_pending_messages()
	
	elif state == WebSocketPeer.STATE_CLOSED:
		if _is_connected:
			_is_connected = false
			disconnected.emit()
			print("[WebSocketClient] Disconnected: ", _websocket.get_close_code(), " ", _websocket.get_close_reason())
			_reconnect_timer = reconnect_delay
	
	# 读取消息
	while _websocket.get_available_packet_count() > 0:
		var packet = _websocket.get_packet()
		var data = _websocket.get_string()
		_handle_message(data)

func _handle_message(json_string: String) -> void:
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	
	if parse_result != OK:
		sync_error.emit("JSON parse failed")
		return
	
	var data = json.get_data()
	if typeof(data) != TYPE_DICTIONARY:
		return
	
	message_received.emit(data)
	
	# 处理不同消息类型
	var msg_type = data.get("type", "")
	match msg_type:
		"entity_updated":
			var entity_id = data.get("entity_id", "")
			var entity_data = data.get("data", {})
			entity_updated.emit(entity_id, entity_data)
			_apply_entity_update(entity_id, entity_data)
		
		"sync":
			_apply_sync_data(data.get("data", {}))
		
		"subscribed":
			print("[WebSocketClient] Subscribed to: ", data.get("entity_id"))
		
		"pong":
			# 心跳响应
			pass

func _apply_entity_update(entity_id: String, data: Dictionary) -> void:
	# 查找实体并更新
	var entity = _find_entity_by_id(entity_id)
	if entity:
		# 更新属性
		for key in data:
			if entity.has(key):
				entity.set(key, data[key])
		print("[WebSocketClient] Updated entity: ", entity_id)

func _apply_sync_data(data: Dictionary) -> void:
	# 处理完整同步数据
	print("[WebSocketClient] Received sync data: ", data.keys())

func _find_entity_by_id(entity_id: String) -> Node:
	# 从场景中查找实体
	var root = get_tree().root
	var main = root.get_node("Main")
	if not main:
		return null
	
	# 查找EntityContainer
	var container = main.get_node_or_null("EntityContainer")
	if container:
		for child in container.get_children():
			if child.has("entity_id") and child.entity_id == entity_id:
				return child
	
	# 查找RoadContainer
	var road_container = main.get_node_or_null("RoadContainer")
	if road_container:
		for child in road_container.get_children():
			if child.has("entity_id") and child.entity_id == entity_id:
				return child
	
	return null

# ── 发送消息 ──
func send_message(data: Dictionary) -> void:
	if not _is_connected:
		_pending_messages.append(data)
		return
	
	var json_string = JSON.stringify(data)
	_websocket.send_text(json_string)

func _flush_pending_messages() -> void:
	for msg in _pending_messages:
		send_message(msg)
	_pending_messages.clear()

# ── 订阅实体 ──
func subscribe_entity(entity_id: String) -> void:
	send_message({
		"type": "subscribe",
		"entity_id": entity_id
	})

# ── 发送更新 ──
func send_entity_update(entity_id: String, entity_type: String, data: Dictionary) -> void:
	send_message({
		"type": "update",
		"entity_id": entity_id,
		"entity_type": entity_type,
		"data": data
	})

# ── 发送进度更新 ──
func send_progress_update(entity_id: String, old_progress: float, new_progress: float) -> void:
	send_message({
		"type": "progress_update",
		"entity_id": entity_id,
		"old_progress": old_progress,
		"new_progress": new_progress
	})

# ── 发送阶段变更 ──
func send_phase_change(entity_id: String, old_phase: String, new_phase: String) -> void:
	send_message({
		"type": "phase_change",
		"entity_id": entity_id,
		"old_phase": old_phase,
		"new_phase": new_phase
	})

# ── 心跳 ──
func _send_heartbeat() -> void:
	send_message({
		"type": "ping",
		"timestamp": Time.get_unix_time_from_system()
	})

# ── 状态查询 ──
func is_connected() -> bool:
	return _is_connected

func get_pending_count() -> int:
	return _pending_messages.size()
