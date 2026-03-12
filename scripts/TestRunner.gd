# TestRunner.gd
# 快速测试脚本 - 用于验证系统功能
extends Node

var tests_passed = 0
var tests_failed = 0

func _ready() -> void:
	print("=== NeuralSite Godot Test Suite ===")
	
	# 运行测试
	test_road_data()
	test_road_segment()
	test_timeline_manager()
	test_mock_api()
	
	print("\n=== Test Results ===")
	print("Passed: %d" % tests_passed)
	print("Failed: %d" % tests_failed)
	
	if tests_failed == 0:
		print("🎉 All tests passed!")
	else:
		print("❌ %d tests failed" % tests_failed)

func test_road_data() -> void:
	print("\n--- Test: RoadData ---")
	var rd = RoadData.new()
	rd.id = "test_road"
	rd.name = "测试道路"
	rd.lanes = 4
	rd.width = 14.0
	rd.phase = "earthwork"
	rd.current_progress = 0.5
	
	# 测试点
	var points = PackedVector3Array()
	points.append(Vector3(0, 0, 0))
	points.append(Vector3(100, 0, 0))
	points.append(Vector3(200, 0, 0))
	rd.points = points
	
	# 验证
	var length = rd.get_length()
	var color = rd.get_phase_color()
	var phase_config = rd.get_phase_config()
	
	if length > 0 and color != null and phase_config.has("color"):
		print("✓ RoadData: OK (length=%.1f)" % length)
		tests_passed += 1
	else:
		print("✗ RoadData: FAILED")
		tests_failed += 1

func test_road_segment() -> void:
	print("\n--- Test: RoadSegment ---")
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
	
	# 验证曲线生成
	if rs.curve and rs.curve.point_count == 3:
		print("✓ RoadSegment: OK (points=%d)" % rs.curve.point_count)
		tests_passed += 1
	else:
		print("✗ RoadSegment: FAILED")
		tests_failed += 1

func test_timeline_manager() -> void:
	print("\n--- Test: TimelineManager ---")
	var tm = TimelineManager.new()
	tm.name = "TestTimeline"
	add_child(tm)
	
	# 测试时间控制
	tm.set_day(50)
	tm.set_time_scale(2.0)
	
	if tm.current_day == 50 and tm.time_scale == 2.0:
		print("✓ TimelineManager: OK (day=%d, scale=%.1f)" % [tm.current_day, tm.time_scale])
		tests_passed += 1
	else:
		print("✗ TimelineManager: FAILED")
		tests_failed += 1
	
	tm.queue_free()

func test_mock_api() -> void:
	print("\n--- Test: MockAPIClient ---")
	
	# MockAPIClient is autoloaded, check if it exists
	if has_node("/root/MockAPIClient"):
		var api = get_node("/root/MockAPIClient")
		var stations = api._mock_stations
		
		if stations.size() > 0:
			print("✓ MockAPIClient: OK (stations=%d)" % stations.size())
			tests_passed += 1
		else:
			print("✗ MockAPIClient: No stations")
			tests_failed += 1
	else:
		# 直接测试
		var api = MockAPIClient.new()
		await get_tree().create_timer(0.1).timeout
		
		if api._mock_stations.size() > 0:
			print("✓ MockAPIClient: OK (direct)")
			tests_passed += 1
		else:
			print("✗ MockAPIClient: FAILED")
			tests_failed += 1
