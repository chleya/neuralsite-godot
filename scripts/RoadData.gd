# RoadData.gd
# 道路数据资源类 - 存储道路的几何、属性和建设进度数据
# 使用: 在Godot编辑器中创建RoadData资源或代码中new()
@tool
class_name RoadData
extends Resource

# ── 几何数据 ──
@export_group("几何数据", "geo_")
@export var id: String = "road_new"
@export var points: PackedVector3Array = PackedVector3Array()
@export var width: float = 7.0
@export var shoulder_width: float = 1.5

# ── 道路属性 ──
@export_group("道路属性", "road_")
@export var highway_type: String = "secondary"
@export var name: String = ""
@export var ref: String = ""
@export var lanes: int = 2
@export var surface: String = "asphalt"
@export var maxspeed: float = 60.0
@export var oneway: bool = false
@export var bridge: bool = false
@export var tunnel: bool = false

# ── 建设模拟数据 ──
@export_group("建设进度", "const_")
@export var construction_status: String = "planned"  # planned, under_construction, completed
@export var phase: String = "planning"  # planning, clearing, earthwork, pavement, finishing, completed
@export var current_progress: float = 0.0  # 0.0 ~ 1.0
@export var start_day: int = 0
@export var planned_days: int = 180
@export var actual_end_day: int = -1
@export var cost_estimate: float = 0.0
@export var actual_cost: float = 0.0

# ── 核心自定义属性 ──
@export_group("自定义属性 - 核心", "custom_")
@export var ai_risk_level: float = 0.0 :
	set(v): ai_risk_level = clamp(v, 0.0, 1.0)

@export var night_construction_allowed: bool = false
@export var environmental_impact_score: int = 85  # 0~100
@export var priority_level: int = 3  # 1=最高, 5=最低
@export var responsible_company: String = ""
@export var required_permits: Array[String] = []

# ── 扩展/未知字段 ──
@export_group("自定义属性 - 扩展", "extra_")
@export var extra_properties: Dictionary = {}

# ── 阶段配置 ──
@export_group("阶段行为配置", "phase_")
@export var phase_behaviors: Dictionary = {
	"planning": {"color": Color(0.8, 0.8, 1.0, 0.5), "collision_enabled": false},
	"clearing": {"color": Color(1.0, 0.8, 0.4, 0.8), "collision_enabled": true},
	"earthwork": {"color": Color(0.6, 0.4, 0.2, 0.8), "collision_enabled": true},
	"pavement": {"color": Color(0.3, 0.3, 0.3, 1.0), "collision_enabled": true},
	"finishing": {"color": Color(0.4, 0.6, 0.4, 1.0), "collision_enabled": true},
	"completed": {"color": Color(0.2, 0.2, 0.2, 1.0), "collision_enabled": true}
}

# ── 信号 ──
signal data_changed
signal phase_changed(new_phase: String)
signal progress_changed(new_progress: float)

func _init() -> void:
	print("[RoadData] Initialized with id: ", id)

# ── 计算方法 ──
func get_length() -> float:
	if points.size() < 2:
		return 0.0
	var curve = Curve3D.new()
	for p in points:
		curve.add_point(p)
	return curve.get_baked_length()

func get_phase_config() -> Dictionary:
	return phase_behaviors.get(phase, {"color": Color.WHITE, "collision_enabled": true})

func get_phase_color() -> Color:
	return get_phase_config().get("color", Color.WHITE)

# ── 统一访问接口 ──
func get_custom(key: String, default = null):
	match key:
		"ai_risk_level": return ai_risk_level
		"night_construction_allowed": return night_construction_allowed
		"environmental_impact_score": return environmental_impact_score
		"priority_level": return priority_level
		"responsible_company": return responsible_company
		"required_permits": return required_permits
		_: return extra_properties.get(key, default)

func set_custom(key: String, value) -> void:
	match key:
		"ai_risk_level": ai_risk_level = clamp(float(value), 0.0, 1.0)
		"night_construction_allowed": night_construction_allowed = bool(value)
		"environmental_impact_score": environmental_impact_score = int(value)
		"priority_level": priority_level = int(value)
		"responsible_company": responsible_company = str(value)
		"required_permits": 
			if value is Array: required_permits = value
		_: extra_properties[key] = value
	data_changed.emit()

# ── 进度更新 ──
func set_progress(new_progress: float) -> void:
	current_progress = clamp(new_progress, 0.0, 1.0)
	actual_cost = cost_estimate * current_progress
	progress_changed.emit(current_progress)
	data_changed.emit()

func set_phase(new_phase: String) -> void:
	if phase != new_phase:
		phase = new_phase
		phase_changed.emit(phase)
		data_changed.emit()

# ── 调试输出 ──
func print_all_properties() -> void:
	print("=== RoadData: ", id, " ===")
	print("  几何: ", points.size(), " 点, 宽度: ", width, "m")
	print("  道路: ", highway_type, " | ", lanes, " 车道 | ", surface)
	print("  建设: ", phase, " | 进度: ", current_progress * 100, "%")
	print("  自定义: ai_risk=", ai_risk_level, " | env_score=", environmental_impact_score)
	if extra_properties.size() > 0:
		print("  扩展: ", extra_properties)
