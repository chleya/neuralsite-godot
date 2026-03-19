class_name ProgressPredictor
extends Node

enum PredictionModel { LINEAR, WEIGHTED_AVERAGE, CRITICAL_PATH }

@export var prediction_model: PredictionModel = PredictionModel.LINEAR
@export var history_window_size: int = 10
@export var confidence_threshold: float = 0.8

signal prediction_updated(entity_id: String, prediction: Dictionary)
signal delay_alert(entity_id: String, predicted_delay_days: float)
signal milestone_at_risk(entity_id: String, milestone: String, risk_level: float)

var _progress_history: Dictionary = {}
var _predictions: Dictionary = {}
var _milestones: Dictionary = {}

func _ready() -> void:
	print("[ProgressPredictor] Initialized with model: %s" % PredictionModel.keys()[prediction_model])

func record_progress(entity_id: String, day: int, progress: float) -> void:
	if not _progress_history.has(entity_id):
		_progress_history[entity_id] = []
	
	var record = {
		"day": day,
		"progress": progress,
		"timestamp": Time.get_unix_time_from_system()
	}
	
	_progress_history[entity_id].append(record)
	
	if _progress_history[entity_id].size() > history_window_size:
		_progress_history[entity_id].pop_front()
	
	_update_prediction(entity_id)

func set_milestone(entity_id: String, milestone_name: String, target_day: int, target_progress: float) -> void:
	if not _milestones.has(entity_id):
		_milestones[entity_id] = []
	
	_milestones[entity_id].append({
		"name": milestone_name,
		"target_day": target_day,
		"target_progress": target_progress,
		"at_risk": false,
		"risk_level": 0.0
	})
	
	print("[ProgressPredictor] Milestone set for %s: %s (Day %d, %.0f%%)" % [entity_id, milestone_name, target_day, target_progress * 100])

func _update_prediction(entity_id: String) -> void:
	if not _progress_history.has(entity_id):
		return
	
	var history = _progress_history[entity_id]
	if history.size() < 2:
		return
	
	var prediction = _calculate_prediction(entity_id, history)
	_predictions[entity_id] = prediction
	
	prediction_updated.emit(entity_id, prediction)
	_check_milestones(entity_id, prediction)
	_check_delay(entity_id, prediction)

func _calculate_prediction(entity_id: String, history: Array) -> Dictionary:
	var prediction = {
		"entity_id": entity_id,
		"current_day": history[-1]["day"],
		"current_progress": history[-1]["progress"],
		"predicted_completion_day": -1,
		"predicted_completion_progress": 1.0,
		"velocity": 0.0,
		"confidence": 0.0,
		"is_delayed": false,
		"delay_days": 0.0
	}
	
	match prediction_model:
		PredictionModel.LINEAR:
			prediction = _linear_prediction(history, prediction)
		PredictionModel.WEIGHTED_AVERAGE:
			prediction = _weighted_prediction(history, prediction)
		PredictionModel.CRITICAL_PATH:
			prediction = _critical_path_prediction(history, prediction)
	
	return prediction

func _linear_prediction(history: Array, prediction: Dictionary) -> Dictionary:
	var first = history[0]
	var last = history[-1]
	
	var days_diff = max(last["day"] - first["day"], 1)
	var progress_diff = last["progress"] - first["progress"]
	
	if progress_diff <= 0:
		prediction["velocity"] = 0.0
		prediction["confidence"] = 0.3
		return prediction
	
	var velocity = progress_diff / days_diff
	
	if velocity > 0:
		var remaining_progress = 1.0 - last["progress"]
		var days_to_complete = remaining_progress / velocity
		prediction["predicted_completion_day"] = int(last["day"] + days_to_complete)
	
	prediction["velocity"] = velocity
	prediction["confidence"] = min(float(history.size()) / float(history_window_size), 1.0)
	
	return prediction

func _weighted_prediction(history: Array, prediction: Dictionary) -> Dictionary:
	var weighted_velocity: float = 0.0
	var total_weight: float = 0.0
	
	for i in range(history.size() - 1):
		var weight = float(i + 1) / float(history.size())
		var vel = (history[i + 1]["progress"] - history[i]["progress"]) / max(history[i + 1]["day"] - history[i]["day"], 1)
		weighted_velocity += vel * weight
		total_weight += weight
	
	if total_weight > 0:
		weighted_velocity /= total_weight
	
	var last = history[-1]
	prediction["velocity"] = weighted_velocity
	
	if weighted_velocity > 0:
		var remaining = 1.0 - last["progress"]
		var days = remaining / weighted_velocity
		prediction["predicted_completion_day"] = int(last["day"] + days)
	
	prediction["confidence"] = 0.7
	
	return prediction

func _critical_path_prediction(history: Array, prediction: Dictionary) -> Dictionary:
	prediction = _weighted_prediction(history, prediction)
	prediction["confidence"] = 0.85
	return prediction

func _check_milestones(entity_id: String, prediction: Dictionary) -> void:
	if not _milestones.has(entity_id):
		return
	
	var current_day = prediction["current_day"]
	var current_progress = prediction["current_progress"]
	
	for milestone in _milestones[entity_id]:
		var target_day = milestone["target_day"]
		var target_progress = milestone["target_progress"]
		
		var expected_progress_at_day = _get_expected_progress_at_day(entity_id, current_day, target_day, target_progress)
		var risk = 0.0
		
		if current_progress < expected_progress_at_day * 0.8:
			risk = 1.0 - (current_progress / expected_progress_at_day)
		elif current_progress < expected_progress_at_day:
			risk = 0.5
		
		if risk > 0.3:
			milestone["at_risk"] = true
			milestone["risk_level"] = risk
			milestone_at_risk.emit(entity_id, milestone["name"], risk)
			print("[ProgressPredictor] Milestone at risk: %s - %s (risk: %.0f%%)" % [entity_id, milestone["name"], risk * 100])

func _check_delay(entity_id: String, prediction: Dictionary) -> void:
	if prediction["predicted_completion_day"] < 0:
		return
	
	var current_day = prediction["current_day"]
	var predicted_day = prediction["predicted_completion_day"]
	var original_end_day = _get_original_end_day(entity_id)
	
	if original_end_day > 0 and predicted_day > original_end_day:
		prediction["is_delayed"] = true
		prediction["delay_days"] = predicted_day - original_end_day
		delay_alert.emit(entity_id, prediction["delay_days"])
		print("[ProgressPredictor] Delay detected for %s: %.0f days" % [entity_id, prediction["delay_days"]])

func _get_expected_progress_at_day(entity_id: String, current_day: int, target_day: int, target_progress: float) -> float:
	var remaining = target_progress - _predictions.get(entity_id, {}).get("current_progress", 0.0)
	var days_remaining = target_day - current_day
	if days_remaining <= 0:
		return target_progress
	
	return target_progress - (remaining * 0.5)

func _get_original_end_day(entity_id: String) -> int:
	if _milestones.has(entity_id):
		for m in _milestones[entity_id]:
			if m["name"] == "completion":
				return m["target_day"]
	return -1

func get_prediction(entity_id: String) -> Dictionary:
	return _predictions.get(entity_id, {})

func get_all_predictions() -> Dictionary:
	return _predictions.duplicate()

func get_milestones(entity_id: String) -> Array:
	return _milestones.get(entity_id, []).duplicate()

func get_prediction_summary() -> String:
	var summary = "=== Progress Prediction Summary ===\n"
	summary += "Entities tracked: %d\n" % _predictions.size()
	
	var delayed = 0
	var on_track = 0
	
	for entity_id in _predictions:
		var p = _predictions[entity_id]
		if p.get("is_delayed", false):
			delayed += 1
		else:
			on_track += 1
	
	summary += "On track: %d\n" % on_track
	summary += "Delayed: %d\n" % delayed
	
	return summary

func clear_history(entity_id: String = "") -> void:
	if entity_id.is_empty():
		_progress_history.clear()
		_predictions.clear()
	else:
		_progress_history.erase(entity_id)
		_predictions.erase(entity_id)
		_milestones.erase(entity_id)
	
	print("[ProgressPredictor] History cleared for: %s" % (entity_id if not entity_id.is_empty() else "all"))
