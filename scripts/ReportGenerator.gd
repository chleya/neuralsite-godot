class_name ReportGenerator
extends Node

enum ReportFormat { JSON, CSV, HTML, MARKDOWN }

@export var default_format: ReportFormat = ReportFormat.HTML
@export var include_charts: bool = true
@export var company_name: String = "NeuralSite Construction"

signal report_generated(report_path: String, format: int)
signal report_failed(error: String)

var _report_stats: Dictionary = {
	"reports_generated": 0,
	"last_report_time": "",
	"total_entities_reported": 0
}

func _ready() -> void:
	print("[ReportGenerator] Initialized")

func generate_project_report(
	entities: Array,
	project_name: String = "Construction Project",
	date_range: Dictionary = {}
) -> String:
	var report_data = _collect_report_data(entities, project_name, date_range)
	var html = _generate_html_report(report_data)
	
	var file_name = "project_report_%s.html" % Time.get_datetime_string_from_system().replace(":", "-").replace("T", "_")
	var file_path = "res://data/reports/" + file_name
	
	var dir = DirAccess.open("res://data/")
	if not dir:
		DirAccess.make_dir_recursive_absolute("res://data/reports/")
	
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	if file:
		file.store_string(html)
		file.close()
		_report_stats["reports_generated"] += 1
		_report_stats["last_report_time"] = Time.get_datetime_string_from_system()
		_report_stats["total_entities_reported"] += entities.size()
		report_generated.emit(file_path, ReportFormat.HTML)
		print("[ReportGenerator] Report generated: %s" % file_path)
		return file_path
	else:
		report_failed.emit("Failed to write file: %s" % file_path)
		return ""

func _collect_report_data(entities: Array, project_name: String, date_range: Dictionary) -> Dictionary:
	var data = {
		"project_name": project_name,
		"generated_at": Time.get_datetime_string_from_system(),
		"date_range": date_range,
		"summary": {
			"total_entities": entities.size(),
			"roads": 0,
			"bridges": 0,
			"vehicles": 0,
			"completed": 0,
			"in_progress": 0,
			"delayed": 0
		},
		"entities": [],
		"phase_distribution": {},
		"progress_by_type": {}
	}
	
	var phase_counts = {}
	var type_progress = {}
	
	for entity in entities:
		var entity_data = {
			"id": entity.get("entity_id", "unknown"),
			"name": entity.get("entity_name", "Unnamed"),
			"type": entity.get("entity_type", "unknown"),
			"phase": entity.get("phase", "unknown"),
			"progress": entity.get("progress", 0.0),
			"position": str(entity.position) if entity.has("position") else "N/A"
		}
		
		data["entities"].append(entity_data)
		
		match entity.get("entity_type", ""):
			"road":
				data["summary"]["roads"] += 1
			"bridge":
				data["summary"]["bridges"] += 1
			"vehicle":
				data["summary"]["vehicles"] += 1
		
		var phase = entity.get("phase", "unknown")
		phase_counts[phase] = phase_counts.get(phase, 0) + 1
		
		if entity.get("progress", 0.0) >= 1.0:
			data["summary"]["completed"] += 1
		elif entity.get("progress", 0.0) > 0:
			data["summary"]["in_progress"] += 1
		
		if not type_progress.has(entity.get("entity_type", "")):
			type_progress[entity.get("entity_type", "")] = []
		type_progress[entity.get("entity_type", "")].append(entity.get("progress", 0.0))
	
	data["phase_distribution"] = phase_counts
	
	for etype in type_progress:
		var progs = type_progress[etype]
		var avg = 0.0
		for p in progs:
			avg += p
		avg /= max(progs.size(), 1)
		data["progress_by_type"][etype] = avg
	
	return data

func _generate_html_report(data: Dictionary) -> String:
	var html = """
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>%s - Progress Report</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
		.container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
		h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
		h2 { color: #555; margin-top: 30px; border-left: 4px solid #4CAF50; padding-left: 10px; }
		.summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
		.stat-box { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
		.stat-box.green { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); }
		.stat-box.orange { background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); }
		.stat-box.blue { background: linear-gradient(135deg, #4facfe 0%%, #00f2fe 100%%); }
		.stat-value { font-size: 32px; font-weight: bold; }
		.stat-label { font-size: 14px; opacity: 0.9; }
		table { width: 100%%; border-collapse: collapse; margin: 20px 0; }
		th { background: #4CAF50; color: white; padding: 12px; text-align: left; }
		td { padding: 10px; border-bottom: 1px solid #ddd; }
		tr:hover { background: #f5f5f5; }
		.progress-bar { background: #e0e0e0; border-radius: 10px; overflow: hidden; height: 20px; }
		.progress-fill { background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 100%%; }
		.phase-tag { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
		.phase-planning { background: #E3F2FD; color: #1565C0; }
		.phase-earthwork { background: #EFEBE9; color: #4E342E; }
		.phase-pavement { background: #E8E8E8; color: #424242; }
		.phase-completed { background: #E8F5E9; color: #2E7D32; }
		.footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
	</style>
</head>
<body>
	<div class="container">
		<h1>%s</h1>
		<p>Generated: %s</p>
		
		<h2>Summary</h2>
		<div class="summary">
			<div class="stat-box">
				<div class="stat-value">%d</div>
				<div class="stat-label">Total Entities</div>
			</div>
			<div class="stat-box green">
				<div class="stat-value">%d</div>
				<div class="stat-label">Completed</div>
			</div>
			<div class="stat-box orange">
				<div class="stat-value">%d</div>
				<div class="stat-label">In Progress</div>
			</div>
			<div class="stat-box blue">
				<div class="stat-value">%d</div>
				<div class="stat-label">Roads</div>
			</div>
		</div>
		
		<h2>Phase Distribution</h2>
		<table>
			<tr><th>Phase</th><th>Count</th><th>Percentage</th></tr>
""" % [
		data["project_name"],
		data["project_name"],
		data["generated_at"],
		data["summary"]["total_entities"],
		data["summary"]["completed"],
		data["summary"]["in_progress"],
		data["summary"]["roads"]
	]
	
	var total = max(data["summary"]["total_entities"], 1)
	for phase in data["phase_distribution"]:
		var count = data["phase_distribution"][phase]
		var pct = (float(count) / float(total)) * 100
		html += "<tr><td><span class='phase-tag phase-%s'>%s</span></td><td>%d</td><td>%.1f%%</td></tr>\n" % [phase, phase.capitalize(), count, pct]
	
	html += """
		</table>
		
		<h2>Entity Details</h2>
		<table>
			<tr>
				<th>Name</th>
				<th>Type</th>
				<th>Phase</th>
				<th>Progress</th>
			</tr>
"""
	
	for entity in data["entities"]:
		var progress_pct = entity["progress"] * 100
		html += """
			<tr>
				<td>%s</td>
				<td>%s</td>
				<td><span class='phase-tag phase-%s'>%s</span></td>
				<td>
					<div class="progress-bar">
						<div class="progress-fill" style="width: %.0f%%"></div>
					</div>
					%.0f%%
				</td>
			</tr>
""" % [
			entity["name"],
			entity["type"],
			entity["phase"],
			entity["phase"],
			progress_pct,
			progress_pct
		]
	
	html += """
		</table>
		
		<div class="footer">
			<p>Generated by NeuralSite-Godot 4D Construction Simulator</p>
			<p>%s</p>
		</div>
	</div>
</body>
</html>
"""
	
	return html

func generate_json_report(entities: Array, project_name: String = "Project") -> Dictionary:
	var data = _collect_report_data(entities, project_name, {})
	return data

func generate_csv_report(entities: Array) -> String:
	var csv = "ID,Name,Type,Phase,Progress,Position\n"
	
	for entity in entities:
		csv += "%s,%s,%s,%s,%.2f,%s\n" % [
			entity.get("entity_id", "unknown"),
			entity.get("entity_name", "Unnamed"),
			entity.get("entity_type", "unknown"),
			entity.get("phase", "unknown"),
			entity.get("progress", 0.0),
			str(entity.position) if entity.has("position") else "N/A"
		]
	
	return csv

func get_report_stats() -> Dictionary:
	return _report_stats.duplicate()

func reset_stats() -> void:
	_report_stats = {
		"reports_generated": 0,
		"last_report_time": "",
		"total_entities_reported": 0
	}
