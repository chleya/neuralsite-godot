# SceneTemplateManager.gd
# 场景模板管理器 - 通过数据文件实例化任意Godot节点
# 核心思路：预定义模板 + JSON数据 = 动态场景
extends Node

# ── 模板预定义 ──
# 模板定义格式 (在代码中或JSON文件中)
var scene_templates = {
	"road_segment": {
		"script": "res://scripts/RoadSegment.gd",
		"data_script": "res://scripts/RoadData.gd",
		"properties": {
			"id": {"type": "string", "required": true},
			"name": {"type": "string", "default": ""},
			"points": {"type": "vector3_array", "required": true},
			"width": {"type": "float", "default": 7.0},
			"lanes": {"type": "int", "default": 2},
			"phase": {"type": "string", "default": "planning"},
			"progress": {"type": "float", "default": 0.0}
		}
	},
	"vehicle": {
		"scene": "res://scenes/Vehicle.tscn",
		"properties": {
			"position": {"type": "vector3", "default": Vector3.ZERO},
			"rotation": {"type": "vector3", "default": Vector3.ZERO},
			"speed": {"type": "float", "default": 0.0}
		}
	},
	"building": {
		"scene": "res://scenes/Building.tscn",
		"properties": {
			"building_type": {"type": "string", "required": true},
			"height": {"type": "float", "default": 10.0},
			"width": {"type": "float", "default": 10.0},
			"depth": {"type": "float", "default": 10.0}
		}
	},
	"bridge_pier": {
		"scene": "res://scenes/BridgePier.tscn",
		"properties": {
			"pier_id": {"type": "string", "required": true},
			"height": {"type": "float", "default": 20.0},
			"diameter": {"type": "float", "default": 2.0}
		}
	},
	"tunnel_portal": {
		"scene": "res://scenes/TunnelPortal.tscn",
		"properties": {
			"portal_id": {"type": "string", "required": true},
			"direction": {"type": "vector3", "default": Vector3.FORWARD}
		}
	}
}

# ── 模板注册 ──
func register_template(template_id: String, template: Dictionary) -> void:
	scene_templates[template_id] = template
	print("[SceneTemplateManager] Registered template: ", template_id)

# ── 从数据实例化节点 ──
func instantiate_from_data(template_id: String, data: Dictionary) -> Node:
	if not scene_templates.has(template_id):
		push_error("[SceneTemplateManager] Template not found: " + template_id)
		return null
	
	var template = scene_templates[template_id]
	var node: Node
	
	# 方法1: 使用脚本创建
	if template.has("script"):
		node = _create_from_script(template, data)
	# 方法2: 加载场景文件
	elif template.has("scene"):
		node = _create_from_scene(template, data)
	else:
		push_error("[SceneTemplateManager] Invalid template: " + template_id)
		return null
	
	# 应用属性
	_apply_properties(node, template, data)
	
	return node

# ── 批量实例化 ──
func instantiate_collection(data_list: Array) -> Array:
	var nodes = []
	for data in data_list:
		var template_id = data.get("template_id", "")
		if template_id == "":
			template_id = data.get("type", "")
		
		var node = instantiate_from_data(template_id, data)
		if node:
			nodes.append(node)
	return nodes

# ── 内部方法 ──
func _create_from_script(template: Dictionary, data: Dictionary) -> Node:
	var script_path = template["script"]
	var script = load(script_path)
	
	# 如果有独立数据脚本，先创建数据
	var node
	if template.has("data_script"):
		var data_script = load(template["data_script"])
		var data_obj = data_script.new()
		node = Node.new()
		node.set_script(script)
		node.set("road_data", data_obj)
	else:
		node = Node.new()
		node.set_script(script)
	
	return node

func _create_from_scene(template: Dictionary, data: Dictionary) -> Node:
	var scene_path = template["scene"]
	var scene = load(scene_path)
	return scene.instantiate()

func _apply_properties(node: Node, template: Dictionary, data: Dictionary) -> void:
	var props = template.get("properties", {})
	
	for prop_name in props:
		var prop_config = props[prop_name]
		
		if data.has(prop_name):
			var value = data[prop_name]
			# 类型转换
			value = _convert_value(value, prop_config["type"])
			node.set(prop_name, value)
		elif prop_config.has("default"):
			# 使用默认值
			node.set(prop_name, prop_config["default"])

func _convert_value(value, type_name: String):
	match type_name:
		"string": return str(value)
		"int": return int(value)
		"float": return float(value)
		"bool": return bool(value)
		"vector3": 
			if value is Array:
				return Vector3(value[0], value[1], value[2])
			return Vector3.ZERO
		"vector3_array":
			if value is Array:
				var arr = PackedVector3Array()
				for v in value:
					if v is Array:
						arr.append(Vector3(v[0], v[1], v[2]))
				return arr
			return PackedVector3Array()
		_: return value

# ── 导出整个场景到JSON ──
func export_scene_to_json(root_node: Node) -> Dictionary:
	var result = {
		"type": "SceneExport",
		"nodes": [],
		"exported_at": Time.get_datetime_string_from_system()
	}
	
	_recursive_export(root_node, result["nodes"])
	
	return result

func _recursive_export(node: Node, nodes_array: Array) -> void:
	var node_data = {
		"name": node.name,
		"type": node.get_class(),
		"position": [node.position.x, node.position.y, node.position.z],
		"rotation": [node.rotation.x, node.rotation.y, node.rotation.z],
		"scale": [node.scale.x, node.scale.y, node.scale.z],
		"properties": {},
		"children": []
	}
	
	# 导出自定义属性 (road_data等)
	if node.has("road_data"):
		var rd = node.get("road_data")
		node_data["properties"]["road_data"] = {
			"id": rd.id if rd.has("id") else "",
			"name": rd.name if rd.has("name") else "",
			"phase": rd.phase if rd.has("phase") else "",
			"progress": rd.current_progress if rd.has("current_progress") else 0.0
		}
	
	nodes_array.append(node_data)
	
	# 递归导出子节点
	for child in node.get_children():
		_recursive_export(child, node_data["children"])
