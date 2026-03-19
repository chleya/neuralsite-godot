class_name SafetySign
extends Node3D

enum SignType { WARNING, DANGER, NO_ENTRY, SPEED_LIMIT, DIRECTION }

@export var sign_type: SignType = SignType.WARNING
@export var sign_text: String = "施工中"

var _mesh_instance: MeshInstance3D

func _ready() -> void:
	_generate_sign()

func _generate_sign() -> void:
	_mesh_instance = MeshInstance3D.new()
	_mesh_instance.name = "SignMesh"
	add_child(_mesh_instance)
	
	var mesh = BoxMesh.new()
	mesh.size = Vector3(1.5, 1.0, 0.1)
	_mesh_instance.mesh = mesh
	
	var mat = StandardMaterial3D.new()
	
	match sign_type:
		SignType.WARNING:
			mat.albedo_color = Color(1.0, 0.8, 0.0)
			sign_text = "注意安全"
		SignType.DANGER:
			mat.albedo_color = Color(1.0, 0.1, 0.0)
			sign_text = "危险区域"
		SignType.NO_ENTRY:
			mat.albedo_color = Color(1.0, 0.0, 0.0)
			sign_text = "禁止进入"
		SignType.SPEED_LIMIT:
			mat.albedo_color = Color(1.0, 1.0, 1.0)
			sign_text = "限速30"
		SignType.DIRECTION:
			mat.albedo_color = Color(0.2, 0.6, 1.0)
			sign_text = "前方施工"
	
	_mesh_instance.material_override = mat
	
	var label = Label3D.new()
	label.name = "Label3D"
	label.text = sign_text
	label.font_size = 48
	label.position = Vector3(0, 0.8, 0)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	add_child(label)
