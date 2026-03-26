# 第 700 章 绿化及环境保护工程 填报包

- 工作面 ID: `wa_lhhb700`
- 工作面类型: `general`
- 工程量条目数: 25
- 资源投入骨架条目数: 3

填写建议：
- `quantities.csv` 只填写 `actual_quantity`，其他字段尽量不改。
- `resource_logs.csv` 填写 `quantity`、`record_day`、`supplier`，必要时补充 `notes`。
- `id` 列保持留空，系统会自动创建。
- `work_area_id` 不要改写。

导入顺序：
1. 先确认该工作面已存在于系统。
2. 导入 `quantities.csv`。
3. 导入 `resource_logs.csv`。