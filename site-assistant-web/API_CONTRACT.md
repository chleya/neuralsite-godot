# Site Assistant API Contract

这份约定不是现有后端的真实实现，而是网页前端当前预留的目标接口。

主资源接口基础路径：

```text
/api/v1
```

兼容模式基础路径：

```json
/api/v1/site-assistant
```

第一版建议优先使用资源接口；兼容模式主要给旧前端和演示版保留。

## 1. 总览摘要

```http
GET /api/v1/dashboard/summary
```

## 2. 工作面接口

```http
GET /api/v1/work-areas
GET /api/v1/work-areas/{id}
```

## 3. 任务接口

```http
GET /api/v1/tasks
GET /api/v1/tasks/{id}
POST /api/v1/tasks
PATCH /api/v1/tasks/{id}
```

常用查询参数：

```text
status
work_area_id
assignee
overdue
```

## 4. 问题接口

```http
GET /api/v1/issues
GET /api/v1/issues/{id}
POST /api/v1/issues
PATCH /api/v1/issues/{id}
```

常用查询参数：

```text
status
severity
work_area_id
overdue
```

## 5. 日报接口

```http
GET /api/v1/reports
GET /api/v1/reports/{id}
POST /api/v1/reports
```

常用查询参数：

```text
report_day
work_area_id
author
```

## 6. 日志接口

```http
GET /api/v1/logs
```

常用查询参数：

```text
target_type
target_id
limit
```

## 7. 兼容模式接口

```http
GET /api/v1/site-assistant/state
POST /api/v1/site-assistant/entries
POST /api/v1/site-assistant/actions/complete-first-task
POST /api/v1/site-assistant/actions/progress-first-issue
POST /api/v1/site-assistant/actions/close-first-issue
POST /api/v1/site-assistant/actions/advance-day
POST /api/v1/site-assistant/actions/demo-task
POST /api/v1/site-assistant/actions/demo-issue
POST /api/v1/site-assistant/actions/demo-report
POST /api/v1/site-assistant/actions/reset-demo
PATCH /api/v1/site-assistant/tasks/{task_id}
PATCH /api/v1/site-assistant/issues/{issue_id}
```

## 8. 兼容模式创建记录

```http
POST /api/v1/site-assistant/entries
Content-Type: application/json
```

请求体：

```json
{
  "type": "task",
  "title": "完成压实试验段",
  "owner": "Chen Team",
  "workAreaId": "wa_road_001",
  "notes": "下午补测含水率"
}
```

## 9. 资源接口的建议落地顺序

1. `GET /dashboard/summary`
2. `GET /work-areas`
3. `GET /tasks` / `PATCH /tasks/{id}` / `POST /tasks`
4. `GET /issues` / `PATCH /issues/{id}` / `POST /issues`
5. `GET /reports` / `POST /reports`
6. `GET /logs`

## 建议的后端落地方式

如果你准备直接改现有 `neuralsite-backend`，建议新增一个独立路由文件，例如：

```text
neuralsite-backend/app/api/v1/site_assistant.py
```

并保持以下原则：

- 先用内存或 JSON 文件实现，别一开始就绑数据库
- 保证返回结构和前端当前状态结构一致
- 等交互稳定后，再把状态对象拆成正式模型和持久化层
