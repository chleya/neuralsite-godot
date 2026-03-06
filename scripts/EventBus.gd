# EventBus.gd
# Autoload - Event-driven state management
# Core of the parametric event-driven evolution model

signal event_added(event_type: String, data: Dictionary)
signal state_changed(progress: float)
signal timeline_changed(value: float)
signal station_selected(station_id: int)
signal entity_clicked(entity_id: String)

# Event types matching your backend
enum EventType {
	CONSTRUCTION,
	WEATHER,
	BLOCKAGE,
	DESIGN_CHANGE,
	MATERIAL_CHANGE,
	RESOURCE_INPUT
}

# Current simulation state
var current_progress: float = 0.0
var simulation_mode: String = "live"  # "live" or "simulate"
var selected_station: int = 0

# Timeline bounds
var timeline_min: float = 0.0
var timeline_max: float = 100.0
var timeline_value: float = 0.0

func _ready():
	print("[EventBus] Initialized")

# Add event to log (append-only)
func add_event(event_type: EventType, station_range: Array, params: Dictionary):
	var event_data = {
		"type": EventType.keys()[event_type],
		"station_start": station_range[0],
		"station_end": station_range[1],
		"params": params,
		"timestamp": Time.get_unix_time_from_system()
	}
	
	event_added.emit(EventType.keys()[event_type], event_data)
	
	# Calculate progress impact
	var progress_delta = params.get("progress_delta", 0.0)
	current_progress = clampf(current_progress + progress_delta, 0.0, 1.0)
	state_changed.emit(current_progress)
	
	print("[EventBus] Event added: ", EventType.keys()[event_type], " progress: ", current_progress)

# Timeline control
func set_timeline(value: float):
	timeline_value = clampf(value, timeline_min, timeline_max)
	timeline_changed.emit(timeline_value)

# Select station
func select_station(station_id: int):
	selected_station = station_id
	station_selected.emit(station_id)

# Simulation mode toggle
func set_mode(mode: String):
	simulation_mode = mode
	print("[EventBus] Mode changed to: ", mode)

# Get current state for serialization
func get_state() -> Dictionary:
	return {
		"progress": current_progress,
		"mode": simulation_mode,
		"timeline": timeline_value,
		"station": selected_station
	}
