# 数据库迁移规则

## 1. 目标

这份文档用于说明：

- 旧数据如何迁移到新结构
- 升级时哪些字段允许默认补值
- 哪些表不能直接破坏

---

## 2. 通用迁移原则

### 原则 1：不改主键

以下表的主键一旦进入库中，不应在迁移中重写：

- `work_areas.id`
- `tasks.id`
- `issues.id`
- `daily_reports.id`
- `engineering_quantities.id`
- `design_quantities.id`
- `resource_logs.id`
- `design_spatial_objects.id`
- `terrain_raw_objects.id`
- `terrain_change_sets.id`

### 原则 2：优先补字段，不优先删字段

如果结构升级，优先：
- `ALTER TABLE ADD COLUMN`
- 写默认值
- 兼容旧读法

不建议：
- 直接删旧字段
- 修改旧字段含义

### 原则 3：旧数据可读优先

迁移的目标不是“结构漂亮”，而是：
- 旧数据还能继续用
- 旧导入包还能继续转

### 原则 4：历史层只追加

迁移过程中：
- 可以为旧主数据补初始历史记录
- 不应删改已有历史记录

---

## 3. 当前已知迁移策略

## A. `work_areas.work_area_subtype`

新增字段后：
- 旧数据默认 `''`

如果有明确业务映射，可后补值：
- `road -> subgrade / paving`
- `bridge -> bridge_substructure / bridge_superstructure`

但不强制一次补全。

---

## B. `resource_logs` 新字段

新增字段：
- `resource_category`
- `resource_subtype`
- `team_name`
- `specification`
- `source_type`

迁移策略：

### `resource_category`
默认：
- 等于旧 `resource_type`

### `resource_subtype`
默认：
- `''`

### `team_name`
默认：
- `''`

### `specification`
默认：
- `''`

### `source_type`
默认：
- `manual`

---

## C. 历史表补建

如果旧库没有历史表：
- 允许直接建新表
- 对已有主数据可补一条“当前快照式初始记录”

例如：
- 当前 `tasks.status` 写入 `task_status_history`
- 当前 `engineering_quantities` 写入 `quantity_progress_history`

原则：
- 可补初始快照
- 不伪造中间过程

---

## D. 空间层补建

如果旧库没有空间表：
- 允许新建：
  - `spatial_raw_objects`
  - `spatial_bindings`
  - `spatial_display_objects`

迁移策略：
- 先补主空间对象
- 再补绑定关系
- 显示层可先为空

---

## E. 设计层补建

如果旧库没有：
- `design_quantities`
- `design_spatial_objects`

可以通过：
- 真实清单 Excel
- 已整理 CSV
- Agent 转换脚本

逐步导入，不要求一次补齐。

---

## 4. 迁移时禁止做的事

- 把 `design_quantities` 合并进 `engineering_quantities`
- 把空间字段直接塞回 `work_areas`
- 删除 `resource_type` 而不保兼容
- 重写已有主键
- 把历史记录回写为当前状态

---

## 5. 迁移后的最小验证

每次迁移后至少验证：

1. 旧记录还能读取
2. 新增字段有默认值
3. 批量导入仍能用
4. 历史表没有破坏旧主数据
5. 主业务接口能正常返回

---

## 6. 一句话

迁移不是为了让表“更漂亮”，而是为了：

**在不破坏旧数据和主轴结构的前提下，把系统平滑升级到下一层。**
