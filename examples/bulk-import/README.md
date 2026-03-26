# 批量导入示例

这组文件用于演示当前批量导入工作台的最小可用流程。

建议顺序：

1. 先启动后端 `uvicorn main:app --reload --port 8000`
2. 打开网页前端
3. 在“批量导入工作台”里选择对应导入对象
4. 下载模板对照字段，或直接使用这里的 CSV
5. 导入后点击“导入后刷新”

当前示例覆盖：

- `work_areas.csv`
- `quantities.csv`
- `design_quantities.csv`
- `resource_logs.csv`
- `design_spatial_objects.csv`
- `terrain_change_sets.csv`

说明：

- 带 `id` 且命中现有记录时，导入会走更新
- 不带 `id` 或 `id` 为空时，导入会走新建
- 这批样例默认依赖系统演示种子数据，例如：
  - `wa_road_001`
  - `wa_bridge_001`
  - `qty_001`
  - `tro_001`
  - `sro_003`

建议 Excel 保存为 `CSV UTF-8`，避免乱码。
