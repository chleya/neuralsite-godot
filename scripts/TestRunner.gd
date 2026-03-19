# TestRunner.gd
# 测试套件 - 验证系统核心功能
extends Node

var tests_passed = 0
var tests_failed = 0
var _test_results: Array = []

signal test_completed(passed: int, failed: int)
signal test_failed(test_name: String, message: String)

func _ready() -> void:
	print("\n=== NeuralSite Godot Test Suite ===")
	print("Time: ", Time.get_datetime_string_from_system())
	
	var results = run_all_tests()
	
	print("\n=== Test Results ===")
	print("Passed: %d" % tests_passed)
	print("Failed: %d" % tests_failed)
	
	if tests_failed == 0:
		print("All tests passed!")
	else:
		print("%d tests failed" % tests_failed)
	
	test_completed.emit(tests_passed, tests_failed)

func run_all_tests() -> Dictionary:
	var results = {
		"road_data": test_road_data(),
		"road_segment": test_road_segment(),
		"timeline_manager": test_timeline_manager(),
		"mock_api": test_mock_api(),
		"entity_factory": test_entity_factory(),
		"godot_exporter": test_godot_exporter(),
		"project_config": test_project_config(),
		"road_entity": test_road_entity(),
		"vehicle_entity": test_vehicle_entity(),
	}
	return results

func _record_result(name: String, passed: bool, details: String = "") -> void:
	var result = {"name": name, "passed": passed, "details": details}
	_test_results.append(result)
	
	if passed:
		tests_passed += 1
		print("✓ %s" % name)
		if not details.is_empty():
			print("  %s" % details)
	else:
		tests_failed += 1
		print("✗ %s" % name)
		if not details.is_empty():
			print("  %s" % details)
		test_failed.emit(name, details)

func test_road_data() -> bool:
	print("\n--- RoadData ---")
	var rd = RoadData.new()
	rd.id = "test_road"
	rd.name = "Test Road"
	rd.lanes = 4
	rd.width = 14.0
	rd.phase = "earthwork"
	rd.current_progress = 0.5
	
	var points = PackedVector3Array()
	points.append(Vector3(0, 0, 0))
	points.append(Vector3(100, 0, 0))
	points.append(Vector3(200, 0, 0))
	rd.points = points
	
	var length = rd.get_length()
	var color = rd.get_phase_color()
	var phase_config = rd.get_phase_config()
	
	var passed = length > 0 and color != null and phase_config.has("color")
	_record_result("RoadData creation", passed, "length=%.1f" % length)
	return passed

func test_road_segment() -> bool:
	print("\n--- RoadSegment ---")
	var rs = RoadSegment.new()
	rs.name = "TestSegment"
	
	var rd = RoadData.new()
	rd.id = "seg_001"
	rd.phase = "pavement"
	
	var points = PackedVector3Array()
	points.append(Vector3(0, 0, 0))
	points.append(Vector3(50, 0, 10))
	points.append(Vector3(100, 0, 0))
	rd.points = points
	rd.width = 10.0
	
	rs.road_data = rd
	
	var passed = rs.curve and rs.curve.point_count == 3
	_record_result("RoadSegment creation", passed, "points=%d" % rs.curve.point_count if rs.curve else "no curve")
	return passed

func test_road_entity() -> bool:
	print("\n--- RoadEntity ---")
	var re = RoadEntity.new()
	re.name = "TestRoadEntity"
	re.entity_id = "re_001"
	re.entity_name = "Test Road Entity"
	re.lanes = 4
	re.width = 14.0
	re.phase = "pavement"
	re.progress = 0.75
	
	var points = PackedVector3Array()
	for i in range(5):
		points.append(Vector3(i * 20.0, 0, 0))
	re.centerline_points = points
	
	var passed = re.entity_type == "road" and re.lanes == 4
	_record_result("RoadEntity creation", passed, "type=%s" % re.entity_type)
	return passed

func test_timeline_manager() -> bool:
	print("\n--- TimelineManager ---")
	var tm = TimelineManager.new()
	tm.name = "TestTimeline"
	add_child(tm)
	
	tm.set_day(50)
	tm.set_time_scale(2.0)
	
	var passed = tm.current_day == 50 and tm.time_scale == 2.0
	_record_result("TimelineManager", passed, "day=%d, scale=%.1f" % [tm.current_day, tm.time_scale])
	
	tm.queue_free()
	return passed

func test_mock_api() -> bool:
	print("\n--- MockAPIClient ---")
	var api = MockAPIClient.new()
	add_child(api)
	await get_tree().create_timer(0.1).timeout
	
	var passed = api._mock_stations.size() > 0
	_record_result("MockAPIClient", passed, "stations=%d" % api._mock_stations.size())
	
	api.queue_free()
	return passed

func test_entity_factory() -> bool:
	print("\n--- EntityFactory ---")
	var container = Node3D.new()
	add_child(container)
	var factory = EntityFactory.new(container)
	
	var road = factory.create_road("road_test", "Test Road", Vector3(0, 0, 0), "planning", 0.0)
	var vehicle = factory.create_vehicle("veh_test", "Test Vehicle", Vector3(10, 0, 0))
	var bridge = factory.create_bridge("bridge_test", "Test Bridge", Vector3(20, 0, 0), 0.5)
	
	var all_created = road != null and vehicle != null and bridge != null
	var entities_count = factory.get_all_entities().size()
	
	_record_result("EntityFactory", all_created and entities_count >= 3, "entities=%d" % entities_count)
	
	var roads = factory.get_entities_by_type("road")
	_record_result("EntityFactory.get_entities_by_type", roads.size() >= 1, "roads=%d" % roads.size())
	
	container.queue_free()
	return all_created and entities_count >= 3

func test_godot_exporter() -> bool:
	print("\n--- GodotExporter ---")
	var exporter = GodotExporter.new()
	add_child(exporter)
	
	exporter.record_modification("road_001", "phase", "planning", "earthwork")
	exporter.record_modification("road_001", "progress", 0.0, 0.5)
	
	var mod_count = exporter.get_modification_count()
	var has_mods = mod_count >= 2
	
	exporter.record_modification("road_002", "phase", "clearing", "pavement")
	mod_count = exporter.get_modification_count()
	has_mods = has_mods and mod_count >= 3
	
	_record_result("GodotExporter modifications", has_mods, "count=%d" % mod_count)
	
	exporter.clear_modifications()
	var cleared = exporter.get_modification_count() == 0
	_record_result("GodotExporter clear", cleared)
	
	var stats = exporter.get_export_stats()
	_record_result("GodotExporter stats", stats.size() > 0, "keys=%s" % str(stats.keys()))
	
	exporter.queue_free()
	return has_mods and cleared

func test_project_config() -> bool:
	print("\n--- ProjectConfig ---")
	
	var phase_color = ProjectConfig.get_phase_color("earthwork")
	var valid_color = phase_color != Color.GRAY
	
	var vehicle_color = ProjectConfig.get_vehicle_color("excavator")
	var valid_vehicle_color = vehicle_color != Color(0.5, 0.5, 1)
	
	var passed = valid_color and valid_vehicle_color
	_record_result("ProjectConfig phase color", valid_color, "earthwork color=%s" % str(phase_color))
	_record_result("ProjectConfig vehicle color", valid_vehicle_color, "excavator color=%s" % str(vehicle_color))
	
	var time_config = ProjectConfig.TIME_CONFIG
	_record_result("ProjectConfig TIME_CONFIG", time_config.has("simulation_days"), "days=%d" % time_config.get("simulation_days", 0))
	
	return passed

func test_vehicle_entity() -> bool:
	print("\n--- VehicleEntity ---")
	var vehicle = VehicleEntity.new()
	vehicle.name = "TestVehicle"
	vehicle.entity_id = "veh_001"
	vehicle.entity_name = "Test Excavator"
	vehicle.vehicle_type = VehicleEntity.VehicleType.EXCAVATOR
	
	var path_points = PackedVector3Array()
	path_points.append(Vector3(0, 0, 0))
	path_points.append(Vector3(100, 0, 0))
	path_points.append(Vector3(200, 0, 0))
	vehicle.bind_to_road_path(path_points)
	
	var initial_pos = vehicle.position
	vehicle.update_position_on_timeline(0.0)
	var at_start = vehicle.position.distance_to(initial_pos) < 1.0
	
	vehicle.update_position_on_timeline(0.5)
	var at_middle = vehicle.position.x > 50 and vehicle.position.x < 150
	
	vehicle.update_position_on_timeline(1.0)
	var at_end = vehicle.position.x > 150
	
	var passed = vehicle.entity_type == "vehicle" and at_start and at_middle and at_end
	_record_result("VehicleEntity path following", passed, "start=%s, middle=%s, end=%s" % [at_start, at_middle, at_end])
	
	vehicle.queue_free()
	return passed

func get_test_results() -> Array:
	return _test_results.duplicate()

func get_summary() -> Dictionary:
	return {
		"total": tests_passed + tests_failed,
		"passed": tests_passed,
		"failed": tests_failed,
		"success_rate": float(tests_passed) / max(tests_passed + tests_failed, 1)
	}
