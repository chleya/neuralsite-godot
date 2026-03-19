class_name ProjectConfig
extends Node

const SCENE_CONFIG = {
	"terrain_size": Vector2(400, 400),
	"terrain_resolution": 64,
	"height_scale": 20.0,
	"noise_seed": 42,
}

const ENTITY_COUNTS = {
	"default_road_segments": 3,
	"default_vehicles": 2,
	"default_bridges": 1,
	"default_fences": 1,
	"default_signs": 2,
}

const TIME_CONFIG = {
	"simulation_days": 365,
	"day_duration_minutes": 3.0,
	"default_time_scale": 1.0,
}

const COLORS = {
	"planning": Color(0.8, 0.8, 1.0, 0.5),
	"clearing": Color(1.0, 0.8, 0.4, 0.8),
	"earthwork": Color(0.6, 0.4, 0.2, 0.8),
	"pavement": Color(0.3, 0.3, 0.3, 1.0),
	"finishing": Color(0.4, 0.6, 0.4, 1.0),
	"completed": Color(0.2, 0.2, 0.2, 1.0),
}

const VEHICLE_COLORS = {
	"dump_truck": Color(1, 0.6, 0),
	"excavator": Color(1, 1, 0),
	"bulldozer": Color(0.8, 0.8, 0.2),
	"crane": Color(1, 0.8, 0.2),
	"paver": Color(0.5, 0.5, 0.5),
	"roller": Color(0.3, 0.3, 0.3),
}

const BRIDGE_CONFIG = {
	"default_width": 12.0,
	"default_length": 40.0,
	"default_span_count": 2,
	"pile_height": 15.0,
	"pier_height": 20.0,
	"beam_height": 2.0,
	"deck_height": 0.5,
}

const SAFETY_CONFIG = {
	"fence_length": 20.0,
	"fence_height": 1.5,
	"post_spacing": 2.0,
	"fence_color": Color(1.0, 0.6, 0.0),
}

static func get_phase_color(phase: String) -> Color:
	return COLORS.get(phase, Color.GRAY)

static func get_vehicle_color(vtype: String) -> Color:
	return VEHICLE_COLORS.get(vtype.to_lower(), Color(0.5, 0.5, 1))
