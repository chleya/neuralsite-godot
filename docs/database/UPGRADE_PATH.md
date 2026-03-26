# 数据库升级路线

## 1. 目标

这份文档不是描述“当前数据库”，而是描述：

- 以后往哪里升级
- 哪些方向允许扩展
- 哪些方向不能随意破坏

原则是：

**先稳定当前可用结构，再按层扩展，不推翻主轴。**

---

## 2. 当前稳定底座

当前已经视为稳定底座的部分：

### 主业务主轴
- `work_areas`
- `tasks`
- `issues`
- `daily_reports`
- `engineering_quantities`

### 已接入的扩展主表
- `design_quantities`
- `resource_logs`
- `design_spatial_objects`
- `terrain_raw_objects`
- `terrain_change_sets`

### 空间层
- `spatial_raw_objects`
- `spatial_bindings`
- `spatial_display_objects`

### 历史层
- `task_status_history`
- `issue_status_history`
- `work_area_progress_history`
- `quantity_progress_history`

这些表以后可以扩，但不应被推倒重建。

---

## 3. 升级原则

### 原则 1：优先加表，不优先改坏主表

如果新需求超出当前模型，优先：
- 新增辅助表
- 新增扩展表

而不是：
- 改写主表已有字段语义
- 直接删旧字段

### 原则 2：优先加字段，不轻易改字段含义

例如：
- `work_areas.type` 保持一级主类
- 需要更细分类时新增 `work_area_subtype`

### 原则 3：历史层只增不混

以后所有时间增强都应优先通过：
- 历史表
- 快照表
- 事件表

不要把历史混回当前状态表。

### 原则 4：空间层继续保持分层

继续遵守：
- 原始空间层
- 业务绑定层
- 显示层

不要把空间逻辑压回业务主表。

### 原则 5：Godot 只读

以后可增强 Godot 展示，但不应让 Godot 变成数据库直写端。

---

## 4. 推荐升级方向

## A. 资源层升级

当前：
- `resource_logs` 统一承接人机料

以后可升级为：
- `resource_catalog`
- `resource_logs`
- `resource_allocations`

也可以在未来视情况拆成：
- `labor_logs`
- `machine_logs`
- `material_logs`

但当前阶段不建议直接拆。

---

## B. 设计层升级

当前：
- `design_quantities`
- `design_spatial_objects`

以后可新增：
- `design_versions`
- `design_targets`
- `design_alignments`
- `design_surfaces`

目标：
- 支持更完整的设计版本管理
- 支持同一工作面多个设计版本

---

## C. 地形层升级

当前：
- `terrain_raw_objects`
- `terrain_change_sets`

以后可新增：
- `terrain_display_objects`
- `terrain_result_objects`
- `terrain_snapshots`

目标：
- 把原始地形、结果地形、显示层彻底分开

---

## D. 时间层升级

当前：
- 4 张关键历史表

以后可新增：
- `spatial_state_snapshots`
- `entity_snapshots`
- `timeline_events`

目标：
- 服务时间回看
- 服务 Godot 时间推进
- 服务状态重建

---

## E. 展示层升级

当前：
- `spatial_display_objects`

以后可增强：
- 图层规则
- 显示优先级
- 状态颜色映射
- 时间可见性规则

目标：
- 更稳定地支撑 Godot 和轻可视化页面

---

## 5. 不建议的升级方式

以下属于高风险升级：

- 把 `design_quantities` 改成设计量和实际量混合表
- 把复杂空间字段直接塞进 `work_areas`
- 把历史表并回主表
- 直接删除旧字段，不做兼容
- 不更新文档直接改 schema

---

## 6. 推荐升级顺序

### 近阶段
- 继续增强资源层
- 清理前端文案
- 稳定批量导入规则

### 中阶段
- 增强设计版本层
- 增强地形层
- 增加时间快照层

### 远阶段
- Godot 只读接入
- 时间回看和展示规则增强

---

## 7. 升级前必须做的事

每次升级前，必须先更新：

1. `DATABASE_OVERVIEW.md`
2. `TABLE_CATALOG.md`
3. `ENUMS.md`
4. `FIELD_DICTIONARY.md`（如已存在）
5. `AGENT_OPERATIONS.md`（如已存在）

---

## 8. 一句话

以后升级不是“自由发挥”，而是：

**沿着主轴稳定、扩展层递进、兼容旧数据、同步更新文档的方式升级。**
