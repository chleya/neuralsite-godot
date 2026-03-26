# 项目交接文档

## 1. 项目定位

这个项目当前已经从早期的 Godot 原型，收敛成一套以 **Web 控制台 + FastAPI + SQLite** 为主的个人工程管理系统。

当前最准确的定位是：

- 个人工程控制台
- 工程数据库管理台
- 可视化观察器的数据底座
- Godot 后续只读展示端的数据来源

核心目标不是做企业协同平台，而是围绕这条主线：

**原始地形 -> 设计目标 -> 施工执行 -> 实际结果 -> 展示分析**

---

## 2. 当前主技术结构

### 前端

目录：
- [site-assistant-web](F:/NeuralSite-Godot/site-assistant-web)

主要文件：
- [index.html](F:/NeuralSite-Godot/site-assistant-web/index.html)
- [app.js](F:/NeuralSite-Godot/site-assistant-web/app.js)
- [api.js](F:/NeuralSite-Godot/site-assistant-web/api.js)
- [import.js](F:/NeuralSite-Godot/site-assistant-web/import.js)
- [spatial.js](F:/NeuralSite-Godot/site-assistant-web/spatial.js)
- [styles.css](F:/NeuralSite-Godot/site-assistant-web/styles.css)

职责：
- 主操作入口
- 数据录入、编辑、筛选、详情查看
- 批量导入/导出
- 历史时间线和趋势展示

### 后端

目录：
- [neuralsite-backend](F:/NeuralSite-Godot/neuralsite-backend)

主要文件：
- [main.py](F:/NeuralSite-Godot/neuralsite-backend/main.py)
- [site_assistant.py](F:/NeuralSite-Godot/neuralsite-backend/app/api/v1/site_assistant.py)
- [site_assistant_service.py](F:/NeuralSite-Godot/neuralsite-backend/app/services/site_assistant_service.py)
- [config.py](F:/NeuralSite-Godot/neuralsite-backend/app/core/config.py)

职责：
- 提供所有 REST API
- 管理 SQLite 表结构和种子数据
- 负责业务聚合、导入导出、历史记录、空间层读写

### 数据库

当前数据库文件：
- [site_assistant.db](F:/NeuralSite-Godot/neuralsite-backend/site_assistant.db)

说明：
- 当前真实数据都落在这个 SQLite 文件里
- 配置项是 `SITE_ASSISTANT_DB_PATH`
- 如果后端工作目录是 [neuralsite-backend](F:/NeuralSite-Godot/neuralsite-backend)，默认就会使用这个文件

### Godot

当前状态：
- 不再是主录入端
- 后续定位为只读展示端
- 不直接写业务数据库

---

## 3. 当前数据库主框架

### A. 主业务层

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

### B. 关联与支撑层

- `report_work_areas`
- `app_meta`
- `operation_logs`

### C. 空间层

- `spatial_raw_objects`
- `spatial_bindings`
- `spatial_display_objects`

### D. 历史层

- `task_status_history`
- `issue_status_history`
- `work_area_progress_history`
- `quantity_progress_history`

---

## 4. 数据库设计原理

项目不是简单“堆表”，而是按职责分层：

### 当前状态表
回答：
- 现在有什么对象
- 现在是什么状态

例如：
- `work_areas`
- `engineering_quantities`
- `resource_logs`

### 历史表
回答：
- 它是怎么变成现在的

例如：
- `task_status_history`
- `quantity_progress_history`

### 空间表
回答：
- 它在哪里
- 怎么和业务对象关联
- 怎么给 Web / Godot 显示

例如：
- `spatial_raw_objects`
- `spatial_bindings`
- `spatial_display_objects`

设计原则是：

- 主业务表保存当前真相
- 历史表只追加，不回改
- 空间层和业务层分开
- Godot 永远只读

---

## 5. 已经完成的能力

### 业务录入

已经支持：
- 工作面录入与编辑
- 任务录入与编辑
- 问题录入与编辑
- 日报录入与编辑
- 实际工程量录入与编辑
- 设计工程量录入与编辑
- 资源投入录入与编辑
- 设计空间录入与编辑
- 原始地形录入与编辑
- 地形变更录入与编辑

### 历史与趋势

已经支持：
- 工作面历史
- 任务历史
- 问题历史
- 工程量历史
- 详情侧栏时间线
- 工作面/工程量趋势图

### 空间层

已经支持：
- 当前空间对象管理
- 业务对象与空间对象绑定
- 工作面空间读取
- 工程量空间读取

### 批量录入

已经支持：
- 下载模板
- Excel 保存 CSV UTF-8 导入
- 直接粘贴表格内容导入
- 当前数据导出为 CSV

### 示例数据与真实数据转换

已经整理了几类示例和转换包：

- [examples/bulk-import](F:/NeuralSite-Godot/examples/bulk-import)
- [examples/351工程量统计表](F:/NeuralSite-Godot/examples/351工程量统计表)
- [examples/rizhi](F:/NeuralSite-Godot/examples/rizhi)

包括：
- 最小样例包
- 道路工作面包
- 桥梁工作面包
- 多工作面联动包
- 351 清单转换包
- 日报转换包
- 按工作面拆分的填报包

---

## 6. 当前真实数据来源

### 设计工程量来源

目录：
- [examples/351工程量统计表](F:/NeuralSite-Godot/examples/351工程量统计表)

说明：
- 这里是较真实的工程量统计清单
- 已经做过抽取转换
- 可转成 `design_quantities`

重要输出包：
- [converted-import-package](F:/NeuralSite-Godot/examples/351工程量统计表/converted-import-package)
- [renamed-import-package-shortcodes](F:/NeuralSite-Godot/examples/351工程量统计表/renamed-import-package-shortcodes)
- [actuals-starter-package](F:/NeuralSite-Godot/examples/351工程量统计表/actuals-starter-package)
- [work-area-fill-packages](F:/NeuralSite-Godot/examples/351工程量统计表/work-area-fill-packages)

### 日报来源

目录：
- [examples/rizhi](F:/NeuralSite-Godot/examples/rizhi)

已转换输出：
- [converted-import-package](F:/NeuralSite-Godot/examples/rizhi/converted-import-package)

当前这批日报已经能导入：
- `daily_reports`
- `resource_logs`

---

## 7. 当前关键业务理解

这个项目的真正业务逻辑不是“管理几个表”，而是：

**工程利用工作面上的人、机、料，作用于原始地形，依照设计图的工程量和设计空间目标，逐步形成实际结果和地形变化。**

因此未来的完整链条是：

- 原始地形
- 设计工程量
- 设计空间目标
- 工作面执行
- 人机料投入
- 实际工程量
- 地形变更结果
- 时间历史
- 可视化展示

当前结构已经能承接这条链，不需要推倒重来。

---

## 8. 当前还没完全完成的部分

### 1. 前端中文文案

当前情况：
- 最常用录入区已经部分清理成中文
- 但 [index.html](F:/NeuralSite-Godot/site-assistant-web/index.html) 里仍残留一些历史乱码区域

建议：
- 后续继续按模块整段重写
- 不要再零碎替换

### 2. 资源层还可继续增强

目前已经加入新字段：
- `resource_category`
- `resource_subtype`
- `team_name`
- `specification`
- `source_type`

但前端列表和筛选还可以继续增强，例如：
- 按资源大类分组
- 按资源子类统计

### 3. Godot 只读接入还没开始

当前数据库和 API 已经准备好了基础条件，但真正的 Godot 读取层还没做。

### 4. 更完整的地形层

当前已实现：
- `terrain_raw_objects`
- `terrain_change_sets`

后续还可以加：
- `terrain_display_objects`
- 更明确的设计空间与地形对照

---

## 9. 当前最应该遵守的约束

后续继续开发时，必须守住：

1. 不把空间字段硬塞回 `work_areas`、`engineering_quantities`
2. 不把历史数据混回当前状态表
3. Godot 不直接写数据库
4. 继续以 `work_areas` 为业务主轴
5. 当前状态、历史、空间、显示继续分层

---

## 10. 推荐启动方式

### 启动后端

```powershell
cd F:\NeuralSite-Godot\neuralsite-backend
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

### 打开前端

直接打开：
- [index.html](F:/NeuralSite-Godot/site-assistant-web/index.html)

如果浏览器限制本地文件请求，可起静态服务：

```powershell
cd F:\NeuralSite-Godot\site-assistant-web
python -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

---

## 11. 下一步最推荐做什么

如果换一个窗口继续做，我建议优先级是：

### 第一优先级
- 继续清理 [index.html](F:/NeuralSite-Godot/site-assistant-web/index.html) 的中文文案
- 重点清理列表区、筛选区、详情区的残留乱码

### 第二优先级
- 做资源层前端增强
  - 按 `resource_category`
  - 按 `resource_subtype`
  - 按工作面汇总

### 第三优先级
- 开始准备 Godot 只读接入
  - 优先读取工作面
  - 设计空间
  - 当前空间
  - 地形变更

不建议现在做：
- 多用户权限
- 多项目体系
- WebSocket 协同
- 大而全报表中心

---

## 12. 一句话总结

当前项目已经不是原型玩具，而是一套：

**以工作面为主轴、以 SQLite 为数据底座、以 Web 为主操作入口、以空间与历史层为扩展、以后可供 Godot 只读展示的施工改造链管理系统。**

如果换一个窗口继续做，优先从：
- [HANDOFF.md](F:/NeuralSite-Godot/HANDOFF.md)
- [site_assistant_service.py](F:/NeuralSite-Godot/neuralsite-backend/app/services/site_assistant_service.py)
- [site_assistant.py](F:/NeuralSite-Godot/neuralsite-backend/app/api/v1/site_assistant.py)
- [app.js](F:/NeuralSite-Godot/site-assistant-web/app.js)
- [index.html](F:/NeuralSite-Godot/site-assistant-web/index.html)

这五个入口开始看，最容易接上当前进度。
