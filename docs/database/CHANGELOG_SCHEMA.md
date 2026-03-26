# 数据库结构变更记录

## 说明

这份文档用于记录数据库结构层面的重要变化。

记录原则：
- 记录“为什么变”
- 记录“变了什么”
- 记录“对旧数据有什么影响”
- 记录“是否需要迁移”

---

## 2026-03-24

### 当前阶段基线确认

确认当前数据库已经进入“施工改造链”模型。

### 主要结构

#### 主业务层
- `work_areas`
- `tasks`
- `issues`
- `daily_reports`
- `engineering_quantities`
- `design_quantities`
- `resource_logs`
- `design_spatial_objects`
- `terrain_raw_objects`
- `terrain_change_sets`

#### 空间层
- `spatial_raw_objects`
- `spatial_bindings`
- `spatial_display_objects`

#### 历史层
- `task_status_history`
- `issue_status_history`
- `work_area_progress_history`
- `quantity_progress_history`

### 重要升级点

#### 工作面分类增强
- `work_areas` 增加：
  - `work_area_subtype`

原因：
- 一级分类不够支撑分析和资源统计

兼容策略：
- 旧数据默认空值
- 不破坏 `type`

#### 资源层增强
- `resource_logs` 增加：
  - `resource_category`
  - `resource_subtype`
  - `team_name`
  - `specification`
  - `source_type`

原因：
- 原先只够摘要，不够做结构化人机料管理

兼容策略：
- 保留旧字段 `resource_type`
- 旧数据可映射到新字段

#### 历史层接入
新增：
- `task_status_history`
- `issue_status_history`
- `work_area_progress_history`
- `quantity_progress_history`

原因：
- 让系统从“当前状态库”升级成“可回看库”

#### 设计目标层接入
新增：
- `design_quantities`
- `design_spatial_objects`

原因：
- 没有目标层，就无法做设计 vs 实际对比

#### 地形基础层接入
新增：
- `terrain_raw_objects`
- `terrain_change_sets`

原因：
- 把施工改造链和原始地形接起来

---

## 后续记录规则

以后每次结构变更至少记录：

- 日期
- 变更对象
- 变更原因
- 是否向后兼容
- 是否需要迁移

如果涉及枚举值变化，还应同步更新：
- `ENUMS.md`
