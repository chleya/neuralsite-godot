# Agent-A: 桥梁实体创建任务

## 任务目标
创建桥梁相关实体类：BridgeEntity, PileEntity, PierEntity, BeamEntity, CapEntity

## 输入文件
- `F:/NeuralSite-Godot/scripts/PrecisionEntity.gd` - 基类参考
- `F:/NeuralSite-Godot/scripts/RoadEntity.gd` - 道路实体参考

## 输出文件
`F:/NeuralSite-Godot/scripts/`

## 任务1: BridgeEntity.gd
```gdscript
class_name BridgeEntity
extends PrecisionEntity

# 桥梁类型
enum BridgeType: BEAM_BRIDGE, ARCH_BRIDGE, CABLE_BRIDGE, SUSPENSION_BRIDGE

@export var bridge_type: BridgeType = BridgeType.BEAM_BRIDGE
@export var span_count: int = 1  # 跨数
@export var total_length: float = 0  # 总长
@export var bridge_width: float = 0  # 桥宽
```

## 任务2: PileEntity.gd (桩基)
```gdscript
class_name PileEntity
extends PrecisionEntity

@export var pile_diameter: float = 1.5  # 桩径
@export var pile_length: float = 30  # 桩长
@export var pile_number: int = 1  # 桩编号
@export var reinforcement_count: int = 12  # 钢筋根数
```

## 任务3: PierEntity.gd (墩柱)
```gdscript  
class_name PierEntity
extends PrecisionEntity

@export var pier_height: float = 0
@export var pier_diameter: float = 1.5
@export var pile_count: int = 4  # 桩数
```

## 任务4: CapEntity.gd (承台)
```gdscript
class_name CapEntity
extends PrecisionEntity

@export var cap_length: float = 0
@export var cap_width: float = 0
@export var cap_height: float = 2.5
```

## 验收标准
1. 每个实体可独立创建
2. 精度自动设置为0.01m
3. 支持边界系统
4. 支持时间轴
5. 可导出完整数据
