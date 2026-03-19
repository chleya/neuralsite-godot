# CollisionDetector.gd
# 碰撞检测系统 - 精确碰撞检测与响应
# 支持: AABB粗检测 + 精确碰撞、碰撞历史、报警
extends Node

@export_group("碰撞检测", "collision_")
@export var detection_enabled: bool = true
@export var check_interval: float = 0.05
@export var enable_aabb_culling: bool = true
@export var collision_tolerance: float = 0.5

@export_group("报警设置", "alert_")
@export var enable_alerts: bool = true
@export var alert_distance: float = 5.0

signal collision_detected(node_a: Node, node_b: Node, point: Vector3)
signal vehicle_on_road(vehicle: Node, road_segment: RoadSegment)
signal vehicle_off_road(vehicle: Node)
signal safety_violation(vehicle: Node, road: Node, distance: float)
signal alert_triggered(alert_type: String, message: String)

var _vehicles: Array[Node] = []
var _roads: Array[RoadSegment] = []
var _timer: float = 0.0
var _collision_debug: bool = false
var _collision_history: Array[Dictionary] = []
var _active_violations: Array[Dictionary] = []

var _spatial_hash_cell_size: float = 10.0
var _spatial_hash: Dictionary = {}

func _ready() -> void:
	print("[CollisionDetector] Initialized with precision collision")

func _process(delta: float) -> void:
	if not detection_enabled:
		return
	
	_timer += delta
	if _timer >= check_interval:
		_timer = 0.0
		_check_collisions()

func register_road(road: RoadSegment) -> void:
	if road not in _roads:
		_roads.append(road)
		_update_spatial_hash()
		print("[CollisionDetector] Registered road: %s" % road.name)

func unregister_road(road: RoadSegment) -> void:
	if road in _roads:
		_roads.erase(road)
		_update_spatial_hash()

func register_vehicle(vehicle: Node) -> void:
	if vehicle not in _vehicles:
		_vehicles.append(vehicle)
		print("[CollisionDetector] Registered vehicle: %s" % vehicle.name)

func unregister_vehicle(vehicle: Node) -> void:
	if vehicle in _vehicles:
		_vehicles.erase(vehicle)

func _check_collisions() -> void:
	for vehicle in _vehicles:
		if not is_instance_valid(vehicle):
			continue
		
		var vehicle_pos = vehicle.global_position
		var nearby_roads = _get_nearby_roads(vehicle_pos)
		var on_road = false
		
		for road in nearby_roads:
			if not is_instance_valid(road):
				continue
			
			var collision = _check_vehicle_road_collision(vehicle, road)
			if collision.has("collided") and collision["collided"]:
				on_road = true
				vehicle_on_road.emit(vehicle, road)
				
				if _collision_debug:
					print("[CollisionDetector] %s on road %s" % [vehicle.name, road.name])
				break
		
		if not on_road:
			vehicle_off_road.emit(vehicle)

func _check_vehicle_vehicle_collision(v1: Node, v2: Node) -> Dictionary:
	var pos1 = v1.global_position
	var pos2 = v2.global_position
	var distance = pos1.distance_to(pos2)
	var min_distance = 5.0
	
	var collision = {"collided": false, "distance": distance, "point": Vector3.ZERO}
	
	if distance < min_distance:
		collision["collided"] = true
		collision["point"] = pos1.lerp(pos2, 0.5)
		collision_detected.emit(v1, v2, collision["point"])
		_record_collision(v1.name, v2.name, collision["point"])
		
		if enable_alerts:
			_trigger_alert("collision", "Vehicles %s and %s too close (%.1fm)" % [v1.name, v2.name, distance])
	
	return collision

func _check_vehicle_road_collision(vehicle: Node, road: RoadSegment) -> Dictionary:
	if not road.road_data or road.road_data.points.size() < 2:
		return {"collided": false}
	
	var vehicle_pos = vehicle.global_position
	var points = road.road_data.points
	var half_width = road.road_data.width / 2.0
	
	var result = {
		"collided": false,
		"distance": INF,
		"closest_point": Vector3.ZERO,
		"segment_index": -1
	}
	
	for i in range(points.size() - 1):
		var p1 = points[i]
		var p2 = points[i + 1]
		
		var closest = _closest_point_on_segment(vehicle_pos, p1, p2)
		var dist = vehicle_pos.distance_to(closest)
		
		if dist < result["distance"]:
			result["distance"] = dist
			result["closest_point"] = closest
			result["segment_index"] = i
		
		if dist < half_width + collision_tolerance:
			result["collided"] = true
			collision_detected.emit(vehicle, road, closest)
			_record_collision(vehicle.name, road.name, closest)
	
	if enable_alerts and not result["collided"] and result["distance"] < alert_distance:
		safety_violation.emit(vehicle, road, result["distance"])
		if _collision_debug:
			print("[CollisionDetector] Safety warning: %s near %s (%.1fm)" % [vehicle.name, road.name, result["distance"]])
	
	return result

func _closest_point_on_segment(point: Vector3, a: Vector3, b: Vector3) -> Vector3:
	var ab = b - a
	var ap = point - a
	var t = clamp(ap.dot(ab) / ab.dot(ab), 0.0, 1.0)
	return a + ab * t

func _record_collision(name_a: String, name_b: String, point: Vector3) -> void:
	var record = {
		"entity_a": name_a,
		"entity_b": name_b,
		"position": point,
		"time": Time.get_unix_time_from_system()
	}
	_collision_history.append(record)
	
	if _collision_history.size() > 100:
		_collision_history.pop_front()

func _trigger_alert(alert_type: String, message: String) -> void:
	if not enable_alerts:
		return
	
	alert_triggered.emit(alert_type, message)
	print("[CollisionDetector] ALERT [%s]: %s" % [alert_type, message])

func _get_nearby_roads(pos: Vector3) -> Array:
	if not enable_aabb_culling:
		return _roads
	
	var cell_key = _get_cell_key(pos)
	var nearby: Array[Node] = []
	
	for road in _roads:
		var road_cells = _get_road_cells(road)
		for cell in road_cells:
			if cell == cell_key or _are_cells_adjacent(cell, cell_key):
				nearby.append(road)
				break
	
	return nearby

func _get_cell_key(pos: Vector3) -> Vector3i:
	return Vector3i(
		int(pos.x / _spatial_hash_cell_size),
		int(pos.y / _spatial_hash_cell_size),
		int(pos.z / _spatial_hash_cell_size)
	)

func _get_road_cells(road: RoadSegment) -> Array[Vector3i]:
	var cells: Array[Vector3i] = []
	
	if not road.road_data or road.road_data.points.size() == 0:
		return cells
	
	for point in road.road_data.points:
		cells.append(_get_cell_key(point))
	
	return cells

func _are_cells_adjacent(a: Vector3i, b: Vector3i) -> bool:
	var diff = (a - b).abs()
	return diff.x <= 1 and diff.y <= 1 and diff.z <= 1

func _update_spatial_hash() -> void:
	_spatial_hash.clear()
	
	for road in _roads:
		var cells = _get_road_cells(road)
		for cell in cells:
			if not _spatial_hash.has(cell):
				_spatial_hash[cell] = []
			_spatial_hash[cell].append(road)

func set_debug(enabled: bool) -> void:
	_collision_debug = enabled
	print("[CollisionDetector] Debug: %s" % enabled)

func get_vehicle_count() -> int:
	return _vehicles.size()

func get_road_count() -> int:
	return _roads.size()

func get_collision_history() -> Array:
	return _collision_history.duplicate()

func get_active_violations() -> Array:
	return _active_violations.duplicate()

func clear_collision_history() -> void:
	_collision_history.clear()
	print("[CollisionDetector] Collision history cleared")

func is_vehicle_on_road(vehicle: Node) -> bool:
	for road in _roads:
		var result = _check_vehicle_road_collision(vehicle, road)
		if result["collided"]:
			return true
	return false

func get_collision_stats() -> Dictionary:
	var now = Time.get_unix_time_from_system()
	var recent_collisions = 0
	if _collision_history.size() > 0:
		var oldest_time = _collision_history[0]["time"]
		recent_collisions = _collision_history.size()
	
	return {
		"total_collisions": _collision_history.size(),
		"active_violations": _active_violations.size(),
		"registered_vehicles": _vehicles.size(),
		"registered_roads": _roads.size()
	}
