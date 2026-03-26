# 字段字典

## 说明

这份文档用于说明：

- 每个关键字段是什么意思
- 能不能填中文
- 是否必填
- 是否必须代码值
- 示例值是什么

注意：
- 本文档不是完整 SQL schema
- 重点覆盖最常被 agent 和导入流程使用的字段

---

## 1. `work_areas`

### `id`
- 含义：工作面唯一标识
- 必填：是
- 可中文：否
- 说明：建议使用稳定短编码，如 `wa_lm300`

### `name`
- 含义：工作面显示名称
- 必填：是
- 可中文：是
- 示例：`300章路面`

### `type`
- 含义：工作面一级主类
- 必填：是
- 可中文：否
- 必须代码值：是
- 示例：`road`

### `work_area_subtype`
- 含义：工作面二级子类
- 必填：否
- 可中文：否
- 必须代码值：建议是
- 示例：`paving`

### `owner`
- 含义：负责人
- 必填：否
- 可中文：是
- 示例：`孙工`

### `planned_progress`
- 含义：计划进度
- 必填：是
- 类型：数字
- 说明：建议用 `0-1`
- 示例：`0.42`

### `actual_progress`
- 含义：实际进度
- 必填：是
- 类型：数字
- 说明：建议用 `0-1`
- 示例：`0.35`

### `status`
- 含义：当前工作面状态
- 必填：是
- 可中文：否
- 必须代码值：是
- 示例：`in_progress`

### `description`
- 含义：工作面说明
- 必填：否
- 可中文：是

---

## 2. `design_quantities`

### `id`
- 含义：设计工程量记录唯一标识
- 必填：是
- 可中文：否

### `work_area_id`
- 含义：所属工作面 ID
- 必填：是
- 可中文：否
- 必须引用已存在的 `work_areas.id`

### `item_name`
- 含义：设计工程量名称
- 必填：是
- 可中文：是
- 示例：`路基填筑`

### `item_code`
- 含义：设计工程量编码
- 必填：否
- 可中文：不建议
- 示例：`RB-FILL`

### `category`
- 含义：工程量类别
- 必填：是
- 可中文：建议统一，不推荐自由混写
- 示例：`earthwork`

### `unit`
- 含义：单位
- 必填：是
- 可中文：可以，但建议统一短单位
- 示例：`m3`

### `target_quantity`
- 含义：设计目标量
- 必填：是
- 类型：数字
- 示例：`1200`

### `design_version`
- 含义：设计版本
- 必填：否
- 可中文：可以，但建议短编码
- 示例：`V1`

### `notes`
- 含义：备注
- 必填：否
- 可中文：是

---

## 3. `engineering_quantities`

### `id`
- 含义：实际工程量记录唯一标识
- 必填：是

### `work_area_id`
- 含义：所属工作面
- 必填：是

### `item_name`
- 含义：工程量名称
- 必填：是
- 可中文：是

### `item_code`
- 含义：工程量编码
- 必填：否
- 示例：`RB-FILL`

### `category`
- 含义：类别
- 必填：是
- 建议与设计量保持一致

### `unit`
- 含义：单位
- 必填：是

### `planned_quantity`
- 含义：计划量
- 必填：是
- 类型：数字

### `actual_quantity`
- 含义：实际完成量
- 必填：是
- 类型：数字

### `status`
- 含义：工程量状态
- 必填：是
- 必须代码值：是

### `notes`
- 含义：备注
- 必填：否

---

## 4. `resource_logs`

### `id`
- 含义：资源记录唯一标识
- 必填：是

### `work_area_id`
- 含义：所属工作面
- 必填：是

### `resource_type`
- 含义：历史兼容字段
- 必填：是
- 必须代码值：是
- 示例：`labor`

### `resource_category`
- 含义：资源大类
- 必填：是
- 必须代码值：是
- 示例：`machine`

### `resource_subtype`
- 含义：资源细分类
- 必填：否
- 建议用代码值
- 示例：`roller`

### `resource_name`
- 含义：资源名称
- 必填：是
- 可中文：是
- 示例：`12t压路机`

### `quantity`
- 含义：数量
- 必填：是
- 类型：数字

### `unit`
- 含义：单位
- 必填：是
- 示例：`person`、`set`、`t`

### `record_day`
- 含义：业务日
- 必填：是
- 类型：整数

### `team_name`
- 含义：班组名称
- 必填：否
- 可中文：是
- 示例：`路面班组A`

### `specification`
- 含义：规格型号
- 必填：否
- 可中文：是
- 示例：`12t`

### `source_type`
- 含义：来源类型
- 必填：是
- 必须代码值：是
- 示例：`manual`

### `supplier`
- 含义：供应方或外协单位
- 必填：否
- 可中文：是

### `notes`
- 含义：备注
- 必填：否
- 可中文：是

---

## 5. `design_spatial_objects`

### `id`
- 含义：设计空间对象 ID
- 必填：是

### `work_area_id`
- 含义：所属工作面
- 必填：是

### `name`
- 含义：设计空间名称
- 必填：是
- 可中文：是

### `design_type`
- 含义：设计空间类型
- 必填：是
- 必须代码值：是
- 示例：`alignment`

### `coord_system`
- 含义：坐标系
- 必填：是
- 必须代码值：是
- 示例：`station`

### `station_start`
- 含义：桩号起点
- 必填：否
- 类型：数字

### `station_end`
- 含义：桩号终点
- 必填：否
- 类型：数字

### `bbox_*`
- 含义：包围盒范围
- 必填：否
- 类型：数字

### `design_ref`
- 含义：设计几何引用
- 必填：否
- 示例：`design://roadbed_alignment_v1`

### `elevation_target`
- 含义：目标高程
- 必填：否
- 类型：数字

### `design_version`
- 含义：设计版本
- 必填：否

---

## 6. `terrain_raw_objects`

### `id`
- 含义：原始地形对象 ID
- 必填：是

### `name`
- 含义：地形对象名称
- 必填：是
- 可中文：是

### `terrain_type`
- 含义：地形对象类型
- 必填：是
- 建议用稳定代码值

### `coord_system`
- 含义：坐标系
- 必填：是
- 必须代码值：是

### `bbox_*`
- 含义：地形覆盖范围
- 必填：否

### `heightmap_ref`
- 含义：高程图引用
- 必填：否

### `mesh_ref`
- 含义：网格引用
- 必填：否

### `texture_ref`
- 含义：纹理引用
- 必填：否

### `source`
- 含义：来源
- 必填：否
- 示例：`manual`、`import`

### `resolution`
- 含义：分辨率说明
- 必填：否

---

## 7. `terrain_change_sets`

### `id`
- 含义：地形变更记录 ID
- 必填：是

### `work_area_id`
- 含义：所属工作面
- 必填：是

### `quantity_id`
- 含义：关联工程量 ID
- 必填：否

### `spatial_raw_object_id`
- 含义：关联空间对象 ID
- 必填：否

### `terrain_raw_object_id`
- 含义：关联原始地形对象 ID
- 必填：否

### `change_type`
- 含义：变更类型
- 必填：是
- 必须代码值：是
- 示例：`fill`

### `result_ref`
- 含义：结果引用
- 必填：否
- 示例：`terrain-result://roadbed_fill_day12`

### `record_day`
- 含义：记录日
- 必填：是
- 类型：整数

### `notes`
- 含义：备注
- 必填：否

---

## 8. 导入规则简表

### 可以直接填中文的
- `name`
- `item_name`
- `owner`
- `resource_name`
- `team_name`
- `supplier`
- `notes`

### 必须代码值的
- `type`
- `work_area_subtype`
- `status`
- `resource_type`
- `resource_category`
- `resource_subtype`
- `source_type`
- `design_type`
- `coord_system`
- `change_type`
- 各类 `*_id`

### 数值字段
- 只能填数字
- 单位不要混进数量字段

---

## 9. 一句话

如果 agent 不确定某字段该填中文还是代码值，优先先查：
- [ENUMS.md](F:/NeuralSite-Godot/docs/database/ENUMS.md)
- [FIELD_DICTIONARY.md](F:/NeuralSite-Godot/docs/database/FIELD_DICTIONARY.md)
