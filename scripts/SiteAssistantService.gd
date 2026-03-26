class_name SiteAssistantService
extends Node

signal summary_changed(summary: Dictionary)
signal task_added(task: TaskRecord)
signal issue_added(issue: IssueRecord)
signal daily_report_added(report: DailyReportRecord)
signal task_updated(task: TaskRecord)
signal issue_updated(issue: IssueRecord)

var current_day: int = 0

var _work_areas: Dictionary = {}
var _tasks: Dictionary = {}
var _issues: Dictionary = {}
var _reports: Dictionary = {}
var _id_counter: int = 1

func set_current_day(day: int) -> void:
	current_day = max(day, 0)
	_emit_summary()

func add_work_area(work_area: WorkAreaRecord) -> void:
	if work_area == null or work_area.work_area_id.is_empty():
		return
	_work_areas[work_area.work_area_id] = work_area
	_emit_summary()

func add_task(task: TaskRecord) -> void:
	if task == null or task.task_id.is_empty():
		return
	_tasks[task.task_id] = task
	task_added.emit(task)
	_emit_summary()

func add_issue(issue: IssueRecord) -> void:
	if issue == null or issue.issue_id.is_empty():
		return
	_issues[issue.issue_id] = issue
	issue_added.emit(issue)
	_emit_summary()

func add_daily_report(report: DailyReportRecord) -> void:
	if report == null or report.report_id.is_empty():
		return
	_reports[report.report_id] = report
	daily_report_added.emit(report)
	_emit_summary()

func create_task(
	title: String,
	work_area_id: String,
	assignee: String,
	due_day: int,
	notes: String = ""
) -> TaskRecord:
	var task := TaskRecord.new()
	task.task_id = _next_id("task")
	task.title = title
	task.work_area_id = work_area_id
	task.assignee = assignee
	task.planned_day = current_day
	task.due_day = due_day
	task.notes = notes
	add_task(task)
	return task

func create_issue(
	title: String,
	work_area_id: String,
	owner: String,
	severity: IssueRecord.IssueSeverity,
	due_day: int,
	description: String = ""
) -> IssueRecord:
	var issue := IssueRecord.new()
	issue.issue_id = _next_id("issue")
	issue.title = title
	issue.work_area_id = work_area_id
	issue.owner = owner
	issue.severity = severity
	issue.due_day = due_day
	issue.description = description
	add_issue(issue)
	return issue

func create_daily_report(
	author: String,
	work_area_ids: PackedStringArray,
	completed_summary: String,
	next_plan: String
) -> DailyReportRecord:
	var report := DailyReportRecord.new()
	report.report_id = _next_id("report")
	report.report_day = current_day
	report.author = author
	report.work_area_ids = work_area_ids
	report.completed_summary = completed_summary
	report.next_plan = next_plan
	report.labor_count = 12
	report.machine_count = 3
	add_daily_report(report)
	return report

func get_work_area(work_area_id: String) -> WorkAreaRecord:
	return _work_areas.get(work_area_id)

func get_task(task_id: String) -> TaskRecord:
	return _tasks.get(task_id)

func get_issue(issue_id: String) -> IssueRecord:
	return _issues.get(issue_id)

func update_task_status(
	task_id: String,
	status: TaskRecord.TaskStatus,
	completion_ratio: float = -1.0
) -> bool:
	var task = get_task(task_id)
	if task == null:
		return false

	task.status = status
	if completion_ratio >= 0.0:
		task.completion_ratio = clamp(completion_ratio, 0.0, 1.0)
	elif status == TaskRecord.TaskStatus.DONE:
		task.completion_ratio = 1.0

	task_updated.emit(task)
	_emit_summary()
	return true

func update_issue_status(issue_id: String, status: IssueRecord.IssueStatus) -> bool:
	var issue = get_issue(issue_id)
	if issue == null:
		return false

	issue.status = status
	issue_updated.emit(issue)
	_emit_summary()
	return true

func get_today_reports() -> Array[DailyReportRecord]:
	var result: Array[DailyReportRecord] = []
	for report in _reports.values():
		if report.report_day == current_day:
			result.append(report)
	result.sort_custom(func(a: DailyReportRecord, b: DailyReportRecord): return a.report_id < b.report_id)
	return result

func get_open_issues() -> Array[IssueRecord]:
	var result: Array[IssueRecord] = []
	for issue in _issues.values():
		if issue.is_open():
			result.append(issue)
	result.sort_custom(func(a: IssueRecord, b: IssueRecord):
		if a.due_day == b.due_day:
			return a.issue_id < b.issue_id
		return a.due_day < b.due_day
	)
	return result

func get_due_tasks() -> Array[TaskRecord]:
	var result: Array[TaskRecord] = []
	for task in _tasks.values():
		if task.status != TaskRecord.TaskStatus.DONE and task.planned_day <= current_day:
			result.append(task)
	result.sort_custom(func(a: TaskRecord, b: TaskRecord):
		if a.due_day == b.due_day:
			return a.task_id < b.task_id
		return a.due_day < b.due_day
	)
	return result

func get_summary_lines() -> PackedStringArray:
	var lines := PackedStringArray()
	var summary = get_summary()
	lines.append("Work Areas: %d" % summary.get("work_area_count", 0))
	lines.append("Avg Progress: %.0f%%" % (summary.get("avg_progress", 0.0) * 100.0))
	lines.append("Due Tasks: %d" % summary.get("due_tasks", 0))
	lines.append("Open Issues: %d" % summary.get("open_issues", 0))
	lines.append("Today Reports: %d" % summary.get("today_reports", 0))
	return lines

func get_task_lines(limit: int = 5) -> PackedStringArray:
	var lines := PackedStringArray()
	var count := 0
	for task in get_due_tasks():
		var overdue_tag = " !overdue" if task.is_overdue(current_day) else ""
		lines.append("[%s] %s -> %s%s" % [task.get_status_name(), task.title, task.assignee, overdue_tag])
		count += 1
		if count >= limit:
			break
	if lines.is_empty():
		lines.append("No due tasks")
	return lines

func get_issue_lines(limit: int = 5) -> PackedStringArray:
	var lines := PackedStringArray()
	var count := 0
	for issue in get_open_issues():
		var overdue_tag = " !overdue" if issue.is_overdue(current_day) else ""
		lines.append("[%s] %s%s" % [issue.get_severity_name(), issue.title, overdue_tag])
		count += 1
		if count >= limit:
			break
	if lines.is_empty():
		lines.append("No open issues")
	return lines

func get_report_lines(limit: int = 3) -> PackedStringArray:
	var lines := PackedStringArray()
	var count := 0
	for report in get_today_reports():
		lines.append("%s: %s" % [report.author, report.completed_summary])
		count += 1
		if count >= limit:
			break
	if lines.is_empty():
		lines.append("No daily reports")
	return lines

func get_summary() -> Dictionary:
	var delayed_work_areas := 0
	var avg_progress := 0.0
	var open_issues := 0
	var overdue_issues := 0
	var due_tasks := 0
	var overdue_tasks := 0

	for work_area in _work_areas.values():
		avg_progress += work_area.actual_progress
		if work_area.is_delayed():
			delayed_work_areas += 1

	for issue in _issues.values():
		if issue.is_open():
			open_issues += 1
			if issue.is_overdue(current_day):
				overdue_issues += 1

	for task in _tasks.values():
		if task.status != TaskRecord.TaskStatus.DONE and task.planned_day <= current_day:
			due_tasks += 1
		if task.is_overdue(current_day):
			overdue_tasks += 1

	if _work_areas.size() > 0:
		avg_progress /= float(_work_areas.size())

	return {
		"current_day": current_day,
		"work_area_count": _work_areas.size(),
		"avg_progress": avg_progress,
		"delayed_work_areas": delayed_work_areas,
		"due_tasks": due_tasks,
		"overdue_tasks": overdue_tasks,
		"open_issues": open_issues,
		"overdue_issues": overdue_issues,
		"today_reports": get_today_reports().size(),
	}

func create_demo_data() -> void:
	var road_area := WorkAreaRecord.new()
	road_area.work_area_id = "wa_road_001"
	road_area.display_name = "K1+000-K1+500 Roadbed"
	road_area.area_type = "road"
	road_area.station_start = 1000.0
	road_area.station_end = 1500.0
	road_area.planned_progress = 0.55
	road_area.actual_progress = 0.48
	road_area.responsible_person = "Zhang Gong"
	road_area.status = "in_progress"
	add_work_area(road_area)

	var bridge_area := WorkAreaRecord.new()
	bridge_area.work_area_id = "wa_bridge_001"
	bridge_area.display_name = "Pier P3-P4"
	bridge_area.area_type = "bridge"
	bridge_area.station_start = 5000.0
	bridge_area.station_end = 5100.0
	bridge_area.planned_progress = 0.35
	bridge_area.actual_progress = 0.35
	bridge_area.responsible_person = "Li Gong"
	bridge_area.status = "in_progress"
	add_work_area(bridge_area)

	var task := TaskRecord.new()
	task.task_id = "task_001"
	task.title = "Complete compaction test section"
	task.work_area_id = road_area.work_area_id
	task.assignee = "Chen Team"
	task.planned_day = 0
	task.due_day = 2
	task.completion_ratio = 0.6
	task.status = TaskRecord.TaskStatus.IN_PROGRESS
	add_task(task)

	var issue := IssueRecord.new()
	issue.issue_id = "issue_001"
	issue.title = "Drainage ditch backlog"
	issue.category = "progress"
	issue.work_area_id = road_area.work_area_id
	issue.owner = "Wang Supervisor"
	issue.due_day = 1
	issue.severity = IssueRecord.IssueSeverity.HIGH
	issue.status = IssueRecord.IssueStatus.OPEN
	issue.description = "Temporary drainage not fully opened before rain."
	add_issue(issue)

	var report := DailyReportRecord.new()
	report.report_id = "report_001"
	report.report_day = current_day
	report.author = "Chen Team"
	report.weather = "cloudy"
	report.work_area_ids = PackedStringArray([road_area.work_area_id, bridge_area.work_area_id])
	report.completed_summary = "Roadbed fill and pier reinforcement binding continued."
	report.next_plan = "Start compaction acceptance and formwork inspection."
	report.labor_count = 18
	report.machine_count = 4
	report.material_notes = "Cement and steel in stock, gravel replenishment tomorrow."
	report.issue_ids = PackedStringArray([issue.issue_id])
	add_daily_report(report)

func _emit_summary() -> void:
	summary_changed.emit(get_summary())

func _next_id(prefix: String) -> String:
	var next_value = _id_counter
	_id_counter += 1
	return "%s_%03d" % [prefix, next_value]
