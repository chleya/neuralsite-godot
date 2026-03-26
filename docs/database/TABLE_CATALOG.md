# 表目录

## 1. 主业务表

## `work_areas`
作用：
- 工作面主表
- 当前系统主轴

关键字段：
- `id`
- `name`
- `type`
- `work_area_subtype`
- `planned_progress`
- `actual_progress`
- `status`

主要关联：
- `tasks.work_area_id`
- `issues.work_area_id`
- `engineering_quantities.work_area_id`
- `design_quantities.work_area_id`
- `design_spatial_objects.work_area_id`
- `resource_logs.work_area_id`
- `terrain_change_sets.work_area_id`

---

## `tasks`
作用：
- 施工任务

关键字段：
- `id`
- `work_area_id`
- `title`
- `status`
- `completion_ratio`

历史表：
- `task_status_history`

---

## `issues`
作用：
- 问题和整改闭环

关键字段：
- `id`
- `work_area_id`
- `title`
- `severity`
- `status`

历史表：
- `issue_status_history`

---

## `daily_reports`
作用：
- 每日记录

关键字段：
- `id`
- `report_day`
- `author`
- `completed_summary`
- `next_plan`
- `labor_count`
- `machine_count`

关联表：
- `report_work_areas`

---

## `engineering_quantities`
作用：
- 实际工程量主表

关键字段：
- `id`
- `work_area_id`
- `item_name`
- `item_code`
- `planned_quantity`
- `actual_quantity`
- `status`

历史表：
- `quantity_progress_history`

---

## `design_quantities`
作用：
- 设计目标工程量

关键字段：
- `id`
- `work_area_id`
- `item_name`
- `item_code`
- `target_quantity`
- `design_version`

注意：
- 不能当实际工程量使用

---

## `resource_logs`
作用：
- 人机料投入明细

关键字段：
- `id`
- `work_area_id`
- `resource_type`
- `resource_category`
- `resource_subtype`
- `resource_name`
- `quantity`
- `unit`
- `record_day`
- `team_name`
- `specification`
- `source_type`

说明：
- `daily_reports` 中的 `labor_count` / `machine_count` 是摘要
- 资源明细以 `resource_logs` 为准

---

## `design_spatial_objects`
作用：
- 设计目标空间对象

关键字段：
- `id`
- `work_area_id`
- `name`
- `design_type`
- `coord_system`
- `design_ref`
- `elevation_target`

---

## `terrain_raw_objects`
作用：
- 原始地形对象

关键字段：
- `id`
- `name`
- `terrain_type`
- `coord_system`
- `bbox_*`
- `heightmap_ref`
- `mesh_ref`
- `texture_ref`

---

## `terrain_change_sets`
作用：
- 地形变更结果

关键字段：
- `id`
- `work_area_id`
- `quantity_id`
- `spatial_raw_object_id`
- `terrain_raw_object_id`
- `change_type`
- `result_ref`
- `record_day`

---

## 2. 空间层

## `spatial_raw_objects`
作用：
- 原始空间对象

关键字段：
- `id`
- `name`
- `raw_type`
- `coord_system`
- `station_start`
- `station_end`
- `bbox_*`
- `geometry_ref`

---

## `spatial_bindings`
作用：
- 业务对象与空间对象绑定

关键字段：
- `id`
- `target_type`
- `target_id`
- `spatial_raw_object_id`
- `binding_role`
- `semantic_role`

说明：
- `target_type` 当前主要是 `work_area` 或 `quantity`

---

## `spatial_display_objects`
作用：
- 空间显示配置

关键字段：
- `id`
- `spatial_raw_object_id`
- `display_name`
- `display_type`
- `display_ref`
- `color_hint`
- `label_text`
- `visible`

---

## 3. 历史表

## `task_status_history`
作用：
- 记录任务状态和完成度变化

---

## `issue_status_history`
作用：
- 记录问题状态和严重级别变化

---

## `work_area_progress_history`
作用：
- 记录工作面进度变化

---

## `quantity_progress_history`
作用：
- 记录工程量计划/实际变化

---

## 4. 关联与支撑表

## `report_work_areas`
作用：
- 日报与工作面多对多关联

---

## `app_meta`
作用：
- 系统级元信息

当前主要用途：
- `current_day`

---

## `operation_logs`
作用：
- 操作日志
- 调试、验证、审计

注意：
- 不能替代历史表

---

## 5. 当前最重要的开发约束

- 不要删除或重命名现有主表主键字段
- 不要把历史字段塞回当前状态表
- 不要让设计表和实际表混义
- 不要让空间层反客为主成为业务主轴

---

## 6. 最关键的几张表

如果只看最关键的入口，优先理解：

1. `work_areas`
2. `engineering_quantities`
3. `design_quantities`
4. `resource_logs`
5. `terrain_change_sets`
6. `spatial_raw_objects`
7. `quantity_progress_history`
