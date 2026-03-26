# Agent 操作手册

## 1. 目标

这份文档用于告诉 agent：

- 常见任务怎么做
- 优先改哪些表
- 不能碰哪些表
- 做完怎么验证

默认原则：
- 优先操作数据库和导入包
- 不优先操作前端页面
- 每次改动后都要做最小验证

---

## 2. 常见任务

## A. 导入设计工程量

### 输入
- Excel / CSV 清单
- 或 [examples/351工程量统计表](F:/NeuralSite-Godot/examples/351工程量统计表) 下的转换包

### 主要表
- `work_areas`
- `design_quantities`

### 不应直接改
- `engineering_quantities`

### 步骤
1. 确认 `work_area_id` 映射
2. 导入 `work_areas`
3. 导入 `design_quantities`
4. 校验 `design_quantities.work_area_id` 是否都存在

### 验证
- 设计量条数是否正确
- 工作面引用是否有缺失

---

## B. 导入实际工程量

### 输入
- Excel / CSV
- 或工作面分包填报结果

### 主要表
- `engineering_quantities`

### 同步要求
- 更新关键量后，应写 `quantity_progress_history`

### 步骤
1. 确认 `work_area_id`
2. 确认 `item_code` / `item_name`
3. 更新或导入 `engineering_quantities`
4. 追加 `quantity_progress_history`

### 验证
- 当前量是否正确
- 历史表是否追加成功

---

## C. 导入人机料投入

### 输入
- Excel / CSV
- 或日报抽取结果

### 主要表
- `resource_logs`

### 关键字段
- `resource_category`
- `resource_subtype`
- `team_name`
- `specification`
- `source_type`

### 步骤
1. 确认 `work_area_id`
2. 填资源大类和子类
3. 导入 `resource_logs`

### 验证
- 是否能按 `work_area_id` 查出
- `resource_category` 是否正确

---

## D. 导入日报

### 输入
- Word / Excel / CSV
- 或 [examples/rizhi](F:/NeuralSite-Godot/examples/rizhi) 转换包

### 主要表
- `daily_reports`
- `report_work_areas`
- 可选 `resource_logs`

### 步骤
1. 导入 `daily_reports`
2. 处理 `work_area_ids`
3. 导入 `report_work_areas`
4. 如果有结构化人机料，同时导入 `resource_logs`

### 验证
- 日报条数是否正确
- 是否能反查到工作面

---

## E. 新增或更新空间对象

### 主要表
- `spatial_raw_objects`
- `spatial_bindings`
- `spatial_display_objects`

### 原则
- 业务对象和空间对象分开
- 先建原始空间对象，再绑定

### 步骤
1. 创建 `spatial_raw_objects`
2. 创建 `spatial_bindings`
3. 如需显示配置，再建 `spatial_display_objects`

### 验证
- 能按工作面查到空间
- 能按工程量查到空间

---

## F. 录入地形变更

### 主要表
- `terrain_change_sets`

### 可关联
- `work_area_id`
- `quantity_id`
- `spatial_raw_object_id`
- `terrain_raw_object_id`

### 步骤
1. 确认所属工作面
2. 确认变更类型
3. 可选补工程量 / 空间 / 地形引用
4. 导入或更新 `terrain_change_sets`

### 验证
- 是否能按工作面查到地形变更

---

## G. 更新工作面进度

### 主要表
- `work_areas`
- `work_area_progress_history`

### 原则
- 更新当前进度后，必须写历史

### 验证
- 当前进度更新
- 历史新增一条

---

## H. 对比设计量和实际量

### 主要表
- `design_quantities`
- `engineering_quantities`

### 逻辑
- 一般按 `work_area_id + item_code`
- 没有 `item_code` 时再按 `item_name`

### 输出
- 目标量
- 实际量
- 差值

---

## 3. 不能乱做的事

### 不要做
- 把 `design_quantities` 当实际量直接修改
- 把历史记录写回主表当“日志”
- 把空间字段塞进 `work_areas`
- 重写已有主键
- 让 Godot 直写数据库

---

## 4. 每次操作后的最小验证

每次做数据变更后，至少验证：

1. 目标表记录数是否符合预期
2. 关联 ID 是否存在
3. 历史表是否同步
4. 导入后能否正常查询

如果是大批量导入，再多做：

5. 抽样检查 3~5 条记录

---

## 5. 建议优先读取的文档

执行任务前建议先读：

1. [HANDOFF.md](F:/NeuralSite-Godot/HANDOFF.md)
2. [DATABASE_OVERVIEW.md](F:/NeuralSite-Godot/docs/database/DATABASE_OVERVIEW.md)
3. [TABLE_CATALOG.md](F:/NeuralSite-Godot/docs/database/TABLE_CATALOG.md)
4. [FIELD_DICTIONARY.md](F:/NeuralSite-Godot/docs/database/FIELD_DICTIONARY.md)
5. [ENUMS.md](F:/NeuralSite-Godot/docs/database/ENUMS.md)

---

## 6. 一句话

对 agent 来说，最重要的不是“会点页面”，而是：

**按数据库主线正确改表、正确保历史、正确做校验。**
