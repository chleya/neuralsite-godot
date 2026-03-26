# 日报抽取结果

这批文件由 `extract_daily_reports.py` 从施工日报提取生成。

- 日报数量: 45
- 资源投入记录数: 450
- 来源文件数: 45

输出文件：
- `daily_reports.csv`
- `resource_logs.csv`
- `manifest.json`

说明：
- 当前只抽取适合映射到 `daily_reports` 和 `resource_logs` 的结构化字段。
- `work_area_id` 采用规则映射，默认桥梁工区/马宅大桥归到 `wa_mzdq`，路基工区归到 `wa_lm300`。
- 累计完成情况先保留在 `notes` 中，暂不自动写入工程量。
- `report_day` 采用 `月*100+日` 的简化业务日编码。