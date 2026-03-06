# Main.gd
# Main scene controller for NeuralSite 4D visualization
extends Node3D

# UI References
@onready var time_slider: HSlider = $CanvasLayer/UI/TimeSlider
@onready var progress_label: Label = $CanvasLayer/UI/ProgressLabel
@onready var mode_button: Button = $CanvasLayer/UI/ModeButton
@onready var camera: Camera3D = $Camera3D

# Road segments group
var road_segments: Array[Node3D] = []

# Camera control
var camera_distance: float = 50.0
var camera_angle: float = 0.0

func _ready():
	# Connect to EventBus
	EventBus.state_changed.connect(_on_state_changed)
	EventBus.timeline_changed.connect(_on_timeline_changed)
	
	# Setup UI
	if time_slider:
		time_slider.min_value = EventBus.timeline_min
		time_slider.max_value = EventBus.timeline_max
		time_slider.value = 0
		time_slider.value_changed.connect(_on_slider_changed)
	
	if mode_button:
		mode_button.pressed.connect(_on_mode_toggled)
	
	# Create demo road
	_create_demo_road()
	
	print("[Main] NeuralSite 4D initialized")

func _process(delta):
	# Simple camera orbit
	if Input.is_action_pressed("ui_accept"):  # Hold to rotate
		camera_angle += delta * 0.5
		var x = cos(camera_angle) * camera_distance
		var z = sin(camera_angle) * camera_distance
		camera.position = Vector3(x, 20, z)
		camera.look_at(Vector3.ZERO)

func _on_slider_changed(value: float):
	EventBus.set_timeline(value)

func _on_state_changed(progress: float):
	if progress_label:
		progress_label.text = "Progress: %.1f%%" % (progress * 100)
	
	# Update road segments
	for segment in road_segments:
		if segment.has_method("set_progress"):
			segment.set_progress(progress)

func _on_timeline_changed(value: float):
	# In simulate mode, preview without affecting actual state
	var progress = value / 100.0
	for segment in road_segments:
		if segment.has_method("set_progress"):
			segment.set_progress(progress)

func _on_mode_toggled():
	if EventBus.simulation_mode == "live":
		EventBus.set_mode("simulate")
		mode_button.text = "Mode: SIMULATE"
	else:
		EventBus.set_mode("live")
		mode_button.text = "Mode: LIVE"

func _create_demo_road():
	# Create road segments programmatically
	for i in range(5):
		var segment = _create_road_segment(i)
		road_segments.append(segment)
		add_child(segment)
		segment.position = Vector3(i * 10, 0, 0)

func _create_road_segment(index: int) -> Node3D:
	# Create a simple road segment using CSGBox
	var segment = CSGBox3D.new()
	segment.name = "RoadSegment_%d" % index
	segment.size = Vector3(9, 0.5, 5)
	segment.position = Vector3(0, 0.25, 0)
	
	# Create material
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.3, 0.3, 0.3)  # Gray road
	segment.material = mat
	
	# Add to "road_segments" group for batch updates
	segment.add_to_group("road_segments")
	
	return segment
