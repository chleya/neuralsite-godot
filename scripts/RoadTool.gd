class_name RoadTool
extends Node

signal road_preview_updated(params: Dictionary)
signal road_completed(params: Dictionary)

enum RoadState {
	IDLE,
	PLACING_START,
	PLACING_END,
	PREVIEW
}

var _state: RoadState = RoadState.IDLE
var _start_position: Vector3
var _start_station: String
var _end_position: Vector3
var _end_station: String
var _params: Dictionary = {}

var _space_service: SpaceService
var _status_bar: StatusBar
var _preview_node: Node3D = null

var _default_width: float = 14.0
var _default_lanes: int = 4
var _default_lateral: float = 0.0
var _default_elevation: float = 0.0

func _ready() -> void:
	print("[RoadTool] Initialized")

func setup(space_service: SpaceService, status_bar: StatusBar) -> void:
	_space_service = space_service
	_status_bar = status_bar

func reset() -> void:
	_state = RoadState.IDLE
	_start_position = Vector3.ZERO
	_start_station = ""
	_end_position = Vector3.ZERO
	_end_station = ""
	_params.clear()
	_clear_preview()
	_status_bar.set_hint("Click to set road start point")

func set_default_params(width: float, lanes: int, lateral: float, elevation: float) -> void:
	_default_width = width
	_default_lanes = lanes
	_default_lateral = lateral
	_default_elevation = elevation

func handle_click(position: Vector3) -> bool:
	match _state:
		RoadState.IDLE:
			_start_position = _apply_snap(position)
			_start_station = _space_service.coord_to_station3d(_start_position) if _space_service else "K0+000"
			_state = RoadState.PLACING_END
			_status_bar.set_hint("Start: %s | Click to set end point" % _start_station)
			_status_bar.start_measurement(_start_position, _start_station)
			return true

		RoadState.PLACING_END:
			_end_position = _apply_snap(position)
			_end_station = _space_service.coord_to_station3d(_end_position) if _space_service else "K0+500"
			_state = RoadState.PREVIEW
			_update_preview()
			_status_bar.set_hint("End: %s | Length: %s | Enter to confirm, ESC to cancel" % [
				_end_station,
				_space_service.format_length(_calculate_length()) if _space_service else "---"
			])
			return true

		RoadState.PREVIEW:
			_confirm_road()
			return true

	return false

func _apply_snap(position: Vector3) -> Vector3:
	if _space_service and _space_service.is_snap_enabled():
		return _space_service.snap_to_grid(position)
	return position

func _calculate_length() -> float:
	if _space_service:
		return _space_service.calculate_distance(_start_station, _end_station)
	return _start_position.distance_to(_end_position)

func _update_preview() -> void:
	_clear_preview()

	if not _space_service:
		return

	_params = {
		"start_station": _start_station,
		"end_station": _end_station,
		"start_position": _start_position,
		"end_position": _end_position,
		"length": _calculate_length(),
		"width": _default_width,
		"lanes": _default_lanes,
		"lateral_offset": _default_lateral,
		"elevation": _default_elevation,
		"phase": "planning",
		"progress": 0.0
	}

	_create_preview_visual()
	road_preview_updated.emit(_params)

func _create_preview_visual() -> void:
	var parent = get_tree().current_scene
	if not parent:
		return

	_preview_node = Node3D.new()
	_preview_node.name = "RoadPreview"
	parent.add_child(_preview_node)

	var start_mesh = _create_cube_mesh(_start_position, 1.0, Color.YELLOW)
	var end_mesh = _create_cube_mesh(_end_position, 1.0, Color.YELLOW)
	_preview_node.add_child(start_mesh)
	_preview_node.add_child(end_mesh)

	var line = Line3D.new()
	line.name = "RoadLine"
	var points = PackedVector3Array([_start_position, _end_position])
	line.set_points(points)
	line.set_width(2.0)
	line.set_color(Color(_default_width / 20.0, 0.6, 0.2, 0.8))
	_preview_node.add_child(line)

	var mid_point = (_start_position + _end_position) / 2
	var label = _create_distance_label(mid_point, _params["length"])
	_preview_node.add_child(label)

func _create_cube_mesh(pos: Vector3, size: float, color: Color) -> Node3D:
	var mesh_instance = MeshInstance3D.new()
	var box = BoxMesh.new()
	box.size = Vector3(size, size, size)
	mesh_instance.mesh = box
	mesh_instance.position = pos

	var material = StandardMaterial3D.new()
	material.albedo_color = color
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mesh_instance.material_override = material

	return mesh_instance

func _create_distance_label(pos: Vector3, length: float) -> Node3D:
	var label = Node3D.new()
	label.name = "DistanceLabel"
	label.position = pos + Vector3(0, 2, 0)

	var csgi = CSGShape3D.new()
	var box = BoxShape3D.new()
	box.size = Vector3(4, 0.5, 1)
	csgi.shape = box

	var material = StandardMaterial3D.new()
	material.albedo_color = Color(0.2, 0.2, 0.2, 0.9)
	csgi.material = material

	label.add_child(csgi)
	return label

func _clear_preview() -> void:
	if _preview_node:
		_preview_node.queue_free()
		_preview_node = null

func _confirm_road() -> void:
	road_completed.emit(_params.duplicate(true))
	_clear_preview()
	reset()

func cancel() -> void:
	_clear_preview()
	_status_bar.end_measurement()
	reset()

func update_from_input_panel(input_params: Dictionary) -> void:
	_default_width = input_params.get("width", _default_width)
	_default_lanes = input_params.get("lanes", _default_lanes)
	_default_lateral = input_params.get("lateral_offset", _default_lateral)
	_default_elevation = input_params.get("elevation", _default_elevation)

	if input_params.has("start_station") and input_params.has("end_station"):
		_start_station = input_params["start_station"]
		_end_station = input_params["end_station"]

		if _space_service:
			_start_position = _space_service.station_to_coord3d(_start_station, _default_lateral, _default_elevation)
			_end_position = _space_service.station_to_coord3d(_end_station, _default_lateral, _default_elevation)

		if _state == RoadState.IDLE:
			_state = RoadState.PREVIEW
			_update_preview()
			_status_bar.set_hint("Station range set from input panel")

func handle_key_enter() -> bool:
	if _state == RoadState.PREVIEW:
		_confirm_road()
		return true
	return false

func handle_key_escape() -> bool:
	if _state != RoadState.IDLE:
		cancel()
		return true
	return false

func get_state() -> RoadState:
	return _state

func get_params() -> Dictionary:
	return _params.duplicate(true)

func get_station_range() -> Dictionary:
	return {
		"start": _start_station,
		"end": _end_station
	}

func is_valid() -> bool:
	if _state != RoadState.PREVIEW:
		return false
	if not _space_service:
		return true
	return _space_service.parse_station(_start_station) < _space_service.parse_station(_end_station)
