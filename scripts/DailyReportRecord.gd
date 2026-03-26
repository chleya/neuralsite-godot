class_name DailyReportRecord
extends Resource

@export var report_id: String = ""
@export var report_day: int = 0
@export var author: String = ""
@export var weather: String = "clear"
@export var work_area_ids: PackedStringArray = PackedStringArray()
@export var completed_summary: String = ""
@export var next_plan: String = ""
@export var labor_count: int = 0
@export var machine_count: int = 0
@export var material_notes: String = ""
@export var issue_ids: PackedStringArray = PackedStringArray()

func get_resource_summary() -> String:
	return "labor=%d machine=%d" % [labor_count, machine_count]
