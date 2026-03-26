# 351 清单抽取结果

这批文件由 `extract_design_quantities.py` 从真实 Excel 清单自动抽取生成。

- 工作面数量: 12
- 设计工程量条目数: 725
- 成功抽取文件数: 12
- 跳过文件数: 2

输出文件：
- `work_areas.csv`
- `design_quantities.csv`
- `manifest.json`

说明：
- 当前只抽取适合映射到 `design_quantities` 的目标量数据
- 默认优先取 `核算数量`，其次 `图纸数量`，再其次 `清单数量/数量`
- `400章桥梁汇总.xlsm` 默认跳过，避免与分桥清单重复统计
- `notes` 字段会保留来源文件、工作表和原始行号