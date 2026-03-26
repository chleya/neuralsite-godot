class_name TaskRecord
extends Resource

enum TaskStatus {
	PLANNED,
	IN_PROGRESS,
	BLOCKED,
	DONE,
}

@export var task_id: String = ""
@export var title: String = ""
@export var work_area_id: String = ""
@export var assignee: String = ""
@export var planned_day: int = 0
@export var due_day: int = 0
@export var completion_ratio: float = 0.0
@export var status: TaskStatus = TaskStatus.PLANNED
@export var notes: String = ""

func is_overdue(current_day: int) -> bool:
	return status != TaskStatus.DONE and due_day > 0 and current_day > due_day

func get_status_name() -> String:
	return TaskStatus.keys()[status].to_lower()
