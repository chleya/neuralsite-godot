# 多工作面联动导入样例

这是一套多工作面联动导入包，用于验证一个批次里同时导入道路和桥梁两个新增工作面。

建议导入顺序：

1. `work_areas.csv`
2. `design_quantities.csv`
3. `quantities.csv`
4. `resource_logs.csv`
5. `design_spatial_objects.csv`
6. `terrain_change_sets.csv`

特点：

- 同时新建 `wa_005` 和 `wa_006`
- 道路和桥梁两类数据混合导入
- 适合做压力稍高一点的联动验证

建议 Excel 保存为 `CSV UTF-8`。
