# 道路工作面成套导入样例

这是一套更接近真实项目录入顺序的批量导入包。

建议导入顺序：

1. `work_areas.csv`
2. `design_quantities.csv`
3. `quantities.csv`
4. `resource_logs.csv`
5. `design_spatial_objects.csv`
6. `terrain_change_sets.csv`

适用场景：

- 用一个完整道路工作面验证“目标 -> 投入 -> 实际 -> 空间 -> 地形变化”链条
- 演示 Excel 批量导入
- 检查设计量和实际量、资源投入、地形变更之间的联动

说明：

- 这套样例依赖系统现有种子工作面 `wa_road_001`
- 同时会新建一个新工作面 `wa_003`
- 文件里同时包含“更新已有记录”和“新建新记录”两类数据
- 建议 Excel 保存为 `CSV UTF-8`
