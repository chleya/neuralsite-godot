class_name WorkAreaRecord
extends Resource

@export var work_area_id: String = ""
@export var display_name: String = ""
@export var area_type: String = "road"
@export var station_start: float = 0.0
@export var station_end: float = 0.0
@export var planned_progress: float = 0.0
@export var actual_progress: float = 0.0
@export var responsible_person: String = ""
@export var status: String = "not_started"

func get_progress_delta() -> float:
	return actual_progress - planned_progress

func is_delayed(threshold: float = 0.05) -> bool:
	return get_progress_delta() < -absf(threshold)
