# 枚举与代码值手册

## 1. 工作面分类

## `work_areas.type`
允许值：
- `road`
- `bridge`
- `drainage`
- `traffic_safety`
- `greening`
- `temporary`
- `general`

说明：
- 一级主类

## `work_areas.work_area_subtype`
推荐值：

### 道路类
- `subgrade`
- `paving`
- `retaining_wall`
- `culvert`
- `slope_protection`

### 桥梁类
- `bridge_substructure`
- `bridge_superstructure`
- `precast_yard`
- `approach_road`
- `auxiliary_bridge`

### 排水类
- `ditch`
- `pipe`
- `channel`

### 交通安全类
- `guardrail`
- `signage`
- `marking`

### 临建/通用
- `yard`
- `temporary_road`
- `general`

---

## 2. 任务状态

## `tasks.status`
允许值：
- `planned`
- `in_progress`
- `blocked`
- `done`

---

## 3. 问题状态与等级

## `issues.status`
允许值：
- `open`
- `in_progress`
- `waiting_review`
- `closed`

## `issues.severity`
允许值：
- `low`
- `medium`
- `high`
- `critical`

---

## 4. 工程量状态

## `engineering_quantities.status`
当前推荐值：
- `not_started`
- `in_progress`
- `delayed`
- `done`

说明：
- 如果旧数据里出现其他状态，先兼容读取，不要直接删改

---

## 5. 资源层

## `resource_logs.resource_type`
历史兼容字段，允许值：
- `labor`
- `machine`
- `material`

## `resource_logs.resource_category`
当前应优先使用，允许值：
- `labor`
- `machine`
- `material`

## `resource_logs.source_type`
允许值：
- `manual`
- `daily_report`
- `imported`

## `resource_logs.resource_subtype`
推荐值：

### 人工
- `rebar_worker`
- `formwork_worker`
- `concrete_worker`
- `earthwork_worker`
- `driver`
- `surveyor`
- `general_worker`

### 机械
- `excavator`
- `roller`
- `paver`
- `pump_truck`
- `crane`
- `loader`
- `drill_rig`
- `mixer_truck`

### 材料
- `rebar`
- `cement`
- `asphalt_mix`
- `aggregate`
- `sand`
- `gravel`
- `concrete`
- `pipe`

---

## 6. 设计空间

## `design_spatial_objects.design_type`
允许值：
- `alignment`
- `surface`
- `zone`
- `reference`

## `design_spatial_objects.coord_system`
允许值：
- `local`
- `station`
- `world`

---

## 7. 原始空间层

## `spatial_raw_objects.raw_type`
允许值：
- `point`
- `line`
- `range`
- `bbox`
- `reference`

## `spatial_raw_objects.coord_system`
允许值：
- `local`
- `station`
- `world`

## `spatial_bindings.target_type`
允许值：
- `work_area`
- `quantity`

## `spatial_bindings.binding_role`
允许值：
- `primary`
- `coverage`
- `display`

## `spatial_display_objects.display_type`
允许值：
- `label`
- `area`
- `line`
- `marker`
- `model_ref`

---

## 8. 地形层

## `terrain_change_sets.change_type`
允许值：
- `cut`
- `fill`
- `leveling`
- `paving`
- `structure`

---

## 9. 导入时的基本规则

### 可写中文的字段
这些字段通常可以直接中文：
- `name`
- `item_name`
- `owner`
- `resource_name`
- `team_name`
- `supplier`
- `notes`

### 必须使用代码值的字段
这些字段不要直接写中文：
- `type`
- `work_area_subtype`
- `resource_type`
- `resource_category`
- `resource_subtype`
- `source_type`
- `design_type`
- `coord_system`
- `change_type`
- 各类 `*_id`

---

## 10. 开发建议

如果新增新的枚举值：

1. 先更新本文件
2. 再更新数据库写入逻辑
3. 再更新导入模板
4. 再更新前端展示映射

不要只改其中一处。
