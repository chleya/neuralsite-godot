# 数据库总览

## 1. 目标

这个数据库不是普通“管理后台表集合”，而是围绕一条施工改造链设计的：

**原始地形 -> 设计目标 -> 施工执行 -> 实际结果 -> 展示分析**

数据库的作用是：

- 保存当前业务状态
- 保存关键历史变化
- 保存空间关系
- 支撑 Web 管理端
- 支撑 Agent 数据处理
- 为后续 Godot 只读展示提供数据底座

---

## 2. 核心原则

### 当前状态和历史分开
- 当前状态表负责回答“现在是什么”
- 历史表负责回答“怎么变成现在的”

### 业务层和空间层分开
- 业务对象不直接携带复杂空间结构
- 空间信息通过独立表维护

### Web 主写，Godot 只读
- 当前业务修改主要来自 Web 或 Agent
- Godot 后续只负责展示，不直接写数据库

### Agent 优先操作数据库，不优先操作前端
- 前端是辅助入口
- 数据库是主系统

---

## 3. 当前数据库分层

## A. 主业务层

这些表描述核心业务对象：

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

## B. 关联与支撑层

- `report_work_areas`
- `app_meta`
- `operation_logs`

## C. 空间层

- `spatial_raw_objects`
- `spatial_bindings`
- `spatial_display_objects`

## D. 历史层

- `task_status_history`
- `issue_status_history`
- `work_area_progress_history`
- `quantity_progress_history`

---

## 4. 主业务主线

### 工作面是主轴

`work_areas` 是当前数据库的主轴。

它连接：

- 任务
- 问题
- 日报
- 设计工程量
- 实际工程量
- 资源投入
- 设计空间
- 当前空间
- 地形变更

因此后续开发不要绕开 `work_areas` 随意建立新的业务中心。

---

## 5. 关键业务含义

### 原始地形
表示施工前或当前底层环境对象。

相关表：
- `terrain_raw_objects`

### 设计目标
表示图纸或设计要求的目标量和目标空间。

相关表：
- `design_quantities`
- `design_spatial_objects`

### 施工执行
表示工作面、任务、问题、日报、人机料投入。

相关表：
- `work_areas`
- `tasks`
- `issues`
- `daily_reports`
- `resource_logs`

### 实际结果
表示工程量完成、地形变化以及过程历史。

相关表：
- `engineering_quantities`
- `terrain_change_sets`
- 各类 history 表

### 空间表达
表示业务对象在哪里，以及怎么给展示层使用。

相关表：
- `spatial_raw_objects`
- `spatial_bindings`
- `spatial_display_objects`

---

## 6. 当前最重要的约束

### 不要把空间字段塞回业务主表
不要把复杂空间结构直接塞进：
- `work_areas`
- `engineering_quantities`
- `design_quantities`

### 不要把历史混回当前状态表
历史应追加到 history 表，不应覆盖当前状态表作为“历史记录”。

### 不要把设计量当实际量
- `design_quantities` 是目标
- `engineering_quantities` 是实际

### 不要让 Godot 直接写数据库
Godot 后续只读。

---

## 7. 当前数据落盘位置

SQLite 文件默认位置：

- [site_assistant.db](F:/NeuralSite-Godot/neuralsite-backend/site_assistant.db)

配置项：
- `SITE_ASSISTANT_DB_PATH`

---

## 8. 推荐阅读顺序

如果是新的 agent 接手，建议按这个顺序看：

1. [HANDOFF.md](F:/NeuralSite-Godot/HANDOFF.md)
2. [DATABASE_OVERVIEW.md](F:/NeuralSite-Godot/docs/database/DATABASE_OVERVIEW.md)
3. [TABLE_CATALOG.md](F:/NeuralSite-Godot/docs/database/TABLE_CATALOG.md)
4. [ENUMS.md](F:/NeuralSite-Godot/docs/database/ENUMS.md)

---

## 9. 一句话总结

这个数据库的核心不是“做页面”，而是：

**管理原始地形被施工活动逐步改造成设计目标的全过程数据。**
