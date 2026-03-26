class_name ToolManager
extends Node

signal tool_changed(tool_name: String)
signal tool_action(action: String, params: Dictionary)

enum ToolType {
	SELECT,
	ROAD,
	BRIDGE,
	WORK_AREA,
	FENCE,
	SIGN,
	MEASURE
}

var _current_tool: ToolType = ToolType.SELECT
var _tools: Dictionary = {}
var _space_service: SpaceService
var _status_bar: StatusBar
var _input_panel: InputPanel
var _entity_factory: Node
var _selected_entity: Node = null

func _ready() -> void:
	print("[ToolManager] Initialized")

func setup(space_service: SpaceService, status_bar: StatusBar, input_panel: InputPanel, entity_factory: Node) -> void:
	_space_service = space_service
	_status_bar = status_bar
	_input_panel = input_panel
	_entity_factory = entity_factory

	_tool_changed(ToolType.SELECT)

func get_current_tool() -> ToolType:
	return _current_tool

func get_current_tool_name() -> String:
	return ToolType.keys()[_current_tool]

func select_tool(tool: ToolType) -> void:
	if tool == _current_tool:
		return
	_exit_current_tool()
	_current_tool = tool
	_tool_changed(tool)
	tool_changed.emit(get_current_tool_name())

func _tool_changed(tool: ToolType) -> void:
	match tool:
		ToolType.SELECT:
			_setup_select_mode()
		ToolType.ROAD:
			_setup_road_mode()
		ToolType.BRIDGE:
			_setup_bridge_mode()
		ToolType.WORK_AREA:
			_setup_work_area_mode()
		ToolType.FENCE:
			_setup_fence_mode()
		ToolType.SIGN:
			_setup_sign_mode()
		ToolType.MEASURE:
			_setup_measure_mode()

func _exit_current_tool() -> void:
	match _current_tool:
		ToolType.ROAD:
			_exit_road_mode()
		ToolType.MEASURE:
			_exit_measure_mode()

	_status_bar.set_hint("Tool: %s" % get_current_tool_name())

func _setup_select_mode() -> void:
	_status_bar.set_hint("Click to select | Drag to move | Delete to remove")
	_input_panel.visible = false

func _setup_road_mode() -> void:
	_status_bar.set_hint("Click to set start | Click again to set end | Enter to confirm")
	_input_panel.show_panel("road")

func _exit_road_mode() -> void:
	pass

func _setup_bridge_mode() -> void:
	_status_bar.set_hint("Click to place bridge | Set span count and dimensions")
	_input_panel.show_panel("bridge")

func _setup_work_area_mode() -> void:
	_status_bar.set_hint("Click to define work area corners")
	_input_panel.show_panel("work_area")

func _setup_fence_mode() -> void:
	_status_bar.set_hint("Click to place fence start | Click again for end")
	_input_panel.show_panel("fence")

func _setup_sign_mode() -> void:
	_status_bar.set_hint("Click to place sign")
	_input_panel.show_panel("sign")

func _setup_measure_mode() -> void:
	_status_bar.set_hint("Click for point 1 | Click for point 2 | Distance shown in status bar")
	_status_bar.start_measurement(Vector3.ZERO, "---")

func _exit_measure_mode() -> void:
	_status_bar.end_measurement()

func handle_click(position: Vector3, event: InputEvent) -> bool:
	match _current_tool:
		ToolType.SELECT:
			return _handle_select_click(position, event)
		ToolType.ROAD:
			return _handle_road_click(position, event)
		ToolType.BRIDGE:
			return _handle_bridge_click(position, event)
		ToolType.FENCE:
			return _handle_fence_click(position, event)
		ToolType.MEASURE:
			return _handle_measure_click(position, event)
	return false

func _handle_select_click(position: Vector3, event: InputEvent) -> bool:
	var camera = get_viewport().get_camera_3d()
	if not camera:
		return false

	var from = camera.project_ray_origin(event.position if event is InputEventMouse else get_viewport().get_mouse_position())
	var to = from + camera.project_ray_normal(event.position if event is InputEventMouse else get_viewport().get_mouse_position()) * 1000

	var result = get_tree().root.world_3d.direct_space_state.intersect_ray(from, to, [], 0xFFFFFFFF, true, true)

	if result:
		var hit_node = result["collider"]
		while hit_node and not hit_node.has_method("get_entity_id"):
			hit_node = hit_node.get_parent()

		if hit_node and hit_node.has_method("get_entity_id"):
			_select_entity(hit_node)
			return true

	_deselect_entity()
	return false

func _handle_road_click(position: Vector3, event: InputEvent) -> bool:
	tool_action.emit("road_click", {"position": position})
	return true

func _handle_bridge_click(position: Vector3, event: InputEvent) -> bool:
	tool_action.emit("bridge_click", {"position": position})
	return true

func _handle_fence_click(position: Vector3, event: InputEvent) -> bool:
	tool_action.emit("fence_click", {"position": position})
	return true

func _handle_measure_click(position: Vector3, event: InputEvent) -> bool:
	if _space_service:
		var snapped = _space_service.snap_to_grid(position)
		var station = _space_service.coord_to_station3d(snapped)
		_status_bar.start_measurement(snapped, station)
		tool_action.emit("measure_point", {"position": snapped, "station": station})
	return true

func _select_entity(entity: Node) -> void:
	if _selected_entity == entity:
		return
	_deselect_entity()
	_selected_entity = entity
	if entity.has_method("set_selected"):
		entity.set_selected(true)
	tool_action.emit("entity_selected", {"entity_id": entity.get("entity_id")})

func _deselect_entity() -> void:
	if _selected_entity:
		if _selected_entity.has_method("set_selected"):
			_selected_entity.set_selected(false)
		_selected_entity = null

func get_selected_entity() -> Node:
	return _selected_entity

func delete_selected() -> bool:
	if _selected_entity:
		var entity_id = _selected_entity.get("entity_id")
		_selected_entity.queue_free()
		_selected_entity = null
		tool_action.emit("entity_deleted", {"entity_id": entity_id})
		return true
	return false

func handle_key_input(event: InputEvent) -> bool:
	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_ESCAPE:
				if _current_tool != ToolType.SELECT:
					select_tool(ToolType.SELECT)
					return true
			KEY_1, KEY_S:
				select_tool(ToolType.SELECT)
				return true
			KEY_2, KEY_R:
				select_tool(ToolType.ROAD)
				return true
			KEY_3, KEY_B:
				select_tool(ToolType.BRIDGE)
				return true
			KEY_4, KEY_W:
				select_tool(ToolType.WORK_AREA)
				return true
			KEY_5, KEY_F:
				select_tool(ToolType.FENCE)
				return true
			KEY_6, KEY_G:
				select_tool(ToolType.SIGN)
				return true
			KEY_M:
				select_tool(ToolType.MEASURE)
				return true
			KEY_DELETE, KEY_BACKSPACE:
				if delete_selected():
					return true
	return false

func get_tool_shortcut_hint() -> String:
	return """
	1/S: Select    2/R: Road
	3/B: Bridge    4/W: Work Area
	5/F: Fence     6/G: Sign
	M: Measure    ESC: Cancel
	"""
