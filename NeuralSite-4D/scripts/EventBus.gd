extends Node
class_name EventBus

# 事件总线
# 实现模块间的松耦合通信

# ========== 数据加载信号 ==========
signal api_loaded()
signal api_load_failed(error: String)

# ========== 实体管理信号 ==========
signal entity_created(entity_data: Dictionary)
signal entity_updated(entity_id: String, entity_data: Dictionary)
signal entity_deleted(entity_id: String)
signal entities_cleared()

# ========== 状态管理信号 ==========
signal state_updated(entity_id: String, new_state: Dictionary)
signal states_batch_updated(states: Dictionary)

# ========== 时间轴信号 ==========
signal timeline_changed(progress: float)
signal timeline_reset()

# ========== 事件管理信号 ==========
signal event_created(event_data: Dictionary)
signal events_loaded(events: Array)

# ========== 查询信号 ==========
signal query_completed(query_result: Dictionary)
signal simulation_completed(simulation_result: Dictionary)

# ========== UI信号 ==========
signal entity_selected(entity_id: String)
signal station_selected(station: String)
signal toggle_debug_info()

# ========== 相机控制信号 ==========
signal camera_moved(position: Vector3)
signal camera_rotated(angle: float)
signal camera_zoomed(distance: float)

# ========== 通知信号 ==========
signal notification(message: String, notification_type: String)

# ========== 便捷方法 ==========

func emit_notification(message: String, notification_type: String = "info") -> void:
	"""发送通知"""
	notification.emit(message, notification_type)

func emit_error(message: String) -> void:
	"""发送错误通知"""
	notification.emit(message, "error")

func emit_success(message: String) -> void:
	"""发送成功通知"""
	notification.emit(message, "success")

# ========== 调试方法 ==========

var debug_mode: bool = false

func _process(delta: float) -> void:
	# 调试模式下的日志输出
	if debug_mode:
		pass
