# CollisionDetector.gd
# 碰撞检测系统 - 使用Godot内置物理引擎
# 用于检测车辆/机械与道路的碰撞
extends Node

# ── 配置 ──
@export_group("碰撞检测", "collision_")
@export var detection_enabled: bool = true
@export var check_interval: float = 0.1  # 检测间隔(秒)

# ── 信号 ──
signal collision_detected(node_a: Node, node_b: Node, point: Vector3)
signal vehicle_on_road(vehicle: Node, road_segment: RoadSegment)
signal vehicle_off_road(vehicle: Node)

# ── 状态 ──
var _vehicles: Array[Node] = []
var _roads: Array[RoadSegment] = []
var _timer: float = 0.0
var _collision_debug: bool = false

func _ready() -> void:
	print("[CollisionDetector] Initialized")

func _process(delta: float) -> void:
	if not detection_enabled:
		return
	
	_timer += delta
	if _timer >= check_interval:
		_timer = 0.0
		_check_collisions()

# ── 注册道路 ──
func register_road(road: RoadSegment) -> void:
	if road not in _roads:
		_roads.append(road)
		print("[CollisionDetector] Registered road: ", road.name)

func unregister_road(road: RoadSegment) -> void:
	if road in _roads:
		_roads.erase(road)

# ── 注册车辆 ──
func register_vehicle(vehicle: Node) -> void:
	if vehicle not in _vehicles:
		_vehicles.append(vehicle)
		print("[CollisionDetector] Registered vehicle: ", vehicle.name)

func unregister_vehicle(vehicle: Node) -> void:
	if vehicle in _vehicles:
		_vehicles.erase(vehicle)

# ── 碰撞检测 ──
func _check_collisions() -> void:
	for vehicle in _vehicles:
		if not is_instance_valid(vehicle):
			continue
		
		var vehicle_pos = vehicle.global_position
		var on_road = false
		
		for road in _roads:
			if not is_instance_valid(road):
				continue
			
			# 简单距离检测 (可升级为精确碰撞)
			if _is_point_near_road(vehicle_pos, road):
				on_road = true
				vehicle_on_road.emit(vehicle, road)
				
				if _collision_debug:
					print("[CollisionDetector] Vehicle on road: ", road.name)
				break
		
		if not on_road:
			vehicle_off_road.emit(vehicle)

# ── 距离检测 ──
func _is_point_near_road(point: Vector3, road: RoadSegment) -> bool:
	if not road.road_data or road.road_data.points.size() < 2:
		return false
	
	var points = road.road_data.points
	var half_width = road.road_data.width / 2.0
	
	for i in range(points.size() - 1):
		var p1 = points[i]
		var p2 = points[i + 1]
		
		var dist = _point_to_segment_distance(point, p1, p2)
		if dist < half_width + 2.0:  # 2米缓冲
			return true
	
	return false

# ── 点到线段距离 ──
func _point_to_segment_distance(point: Vector3, a: Vector3, b: Vector3) -> float:
	var ab = b - a
	var ap = point - a
	
	var t = clamp(ap.dot(ab) / ab.dot(ab), 0.0, 1.0)
	var closest = a + ab * t
	
	return point.distance_to(closest)

# ── 调试模式 ──
func set_debug(enabled: bool) -> void:
	_collision_debug = enabled
	print("[CollisionDetector] Debug: ", enabled)

# ── 状态查询 ──
func get_vehicle_count() -> int:
	return _vehicles.size()

func get_road_count() -> int:
	return _roads.size()

func is_vehicle_on_road(vehicle: Node) -> bool:
	for road in _roads:
		if _is_point_near_road(vehicle.global_position, road):
			return true
	return false
