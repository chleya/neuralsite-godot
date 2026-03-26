class_name IssueRecord
extends Resource

enum IssueSeverity {
	LOW,
	MEDIUM,
	HIGH,
	CRITICAL,
}

enum IssueStatus {
	OPEN,
	IN_PROGRESS,
	WAITING_REVIEW,
	CLOSED,
}

@export var issue_id: String = ""
@export var title: String = ""
@export var category: String = "general"
@export var work_area_id: String = ""
@export var owner: String = ""
@export var due_day: int = 0
@export var severity: IssueSeverity = IssueSeverity.MEDIUM
@export var status: IssueStatus = IssueStatus.OPEN
@export var description: String = ""

func is_open() -> bool:
	return status != IssueStatus.CLOSED

func is_overdue(current_day: int) -> bool:
	return is_open() and due_day > 0 and current_day > due_day

func get_severity_name() -> String:
	return IssueSeverity.keys()[severity].to_lower()
