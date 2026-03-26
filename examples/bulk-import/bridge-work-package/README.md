# 桥梁工作面成套导入样例

这是一套桥梁工作面的批量导入包，用于验证桥梁构件或桥墩区域的完整录入链。

建议导入顺序：

1. `work_areas.csv`
2. `design_quantities.csv`
3. `quantities.csv`
4. `resource_logs.csv`
5. `design_spatial_objects.csv`
6. `terrain_change_sets.csv`

特点：

- 新建桥梁工作面 `wa_004`
- 包含钢筋、模板、混凝土三类目标/实际工程量
- 包含桥梁施工常见人机料投入
- 包含桥墩区域设计空间与结构变更记录

建议 Excel 保存为 `CSV UTF-8`。
