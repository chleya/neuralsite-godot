class_name EntityFactory
extends Node

var _entity_container: Node3D
var _entities: Array[Node] = []

func _init(container: Node3D) -> void:
	_entity_container = container

func create_road(id: String, name: String, pos: Vector3, phase: String, progress: float) -> Node:
	var road_script = load("res://scripts/RoadEntity.gd")
	if not road_script:
		print("[EntityFactory] RoadEntity.gd not found")
		return null
	
	var road = road_script.new()
	road.name = id
	road.entity_id = id
	road.entity_name = name
	road.position = pos
	road.phase = phase
	road.progress = progress
	road.lanes = 4
	road.width = 14.0
	road.highway_type = "primary"
	
	var points = PackedVector3Array()
	for i in range(6):
		points.append(Vector3(i * 10.0, 0, 0))
	road.centerline_points = points
	
	_entity_container.add_child(road)
	_entities.append(road)
	return road

func create_vehicle(id: String, name: String, pos: Vector3, bound_road: Node = null) -> Node:
	var vehicle_script = load("res://scripts/VehicleEntity.gd")
	if not vehicle_script:
		print("[EntityFactory] VehicleEntity.gd not found")
		return null
	
	var vehicle = vehicle_script.new()
	vehicle.name = id
	vehicle.entity_id = id
	vehicle.entity_name = name
	vehicle.position = pos
	vehicle.vehicle_name = name
	
	if bound_road and bound_road.has("centerline_points"):
		vehicle.bind_to_road_path(bound_road.centerline_points)
		vehicle.attach_to_road(bound_road.name)
	
	_entity_container.add_child(vehicle)
	_entities.append(vehicle)
	return vehicle

func create_bridge(id: String, name: String, pos: Vector3, progress: float = 0.0) -> Node:
	var bridge_script = load("res://scripts/BridgeEntity.gd")
	if not bridge_script:
		print("[EntityFactory] BridgeEntity.gd not found")
		return null
	
	var bridge = bridge_script.new()
	bridge.name = id
	bridge.entity_id = id
	bridge.entity_name = name
	bridge.position = pos
	bridge.bridge_type = BridgeEntity.BridgeType.BEAM_BRIDGE
	bridge.bridge_width = ProjectConfig.BRIDGE_CONFIG["default_width"]
	bridge.total_length = ProjectConfig.BRIDGE_CONFIG["default_length"]
	bridge.span_count = ProjectConfig.BRIDGE_CONFIG["default_span_count"]
	bridge.construction_progress = progress
	
	_entity_container.add_child(bridge)
	_entities.append(bridge)
	return bridge

func create_fence(pos: Vector3, length: float = 20.0) -> Node:
	var fence_script = load("res://scripts/ConstructionFence.gd")
	if not fence_script:
		print("[EntityFactory] ConstructionFence.gd not found")
		return null
	
	var fence = fence_script.new()
	fence.name = "Fence_%d" % _entities.size()
	fence.fence_length = length
	fence.fence_color = ProjectConfig.SAFETY_CONFIG["fence_color"]
	fence.position = pos
	fence.set_warning_light(true)
	
	_entity_container.add_child(fence)
	_entities.append(fence)
	return fence

func create_sign(pos: Vector3, sign_type: int) -> Node:
	var sign_script = load("res://scripts/SafetySign.gd")
	if not sign_script:
		print("[EntityFactory] SafetySign.gd not found")
		return null
	
	var sign = sign_script.new()
	sign.name = "Sign_%d" % _entities.size()
	sign.sign_type = sign_type
	sign.position = pos
	
	_entity_container.add_child(sign)
	_entities.append(sign)
	return sign

func get_all_entities() -> Array[Node]:
	return _entities

func get_entities_by_type(entity_type: String) -> Array[Node]:
	var result: Array[Node] = []
	for e in _entities:
		if e.get("entity_type") == entity_type:
			result.append(e)
	return result
