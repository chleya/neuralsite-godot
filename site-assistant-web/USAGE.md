# Site Assistant Web Usage

## What It Does

This frontend is the main operating surface for the Site Assistant MVP. It manages:

- work areas
- tasks
- issues
- daily reports
- dashboard summary
- validation logs

## How To Open It

Open [index.html](/F:/NeuralSite-Godot/site-assistant-web/index.html) directly, or run:

```powershell
cd F:\NeuralSite-Godot\site-assistant-web
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Validation Flow

1. Open the page and confirm summary cards, lists, and the detail panel render.
2. Create a task, issue, and report from Quick Entry.
3. Use task and issue status buttons to update specific records.
4. Filter tasks and issues by status and work area.
5. Search for a task, issue, or report by keyword.
6. Click any card to inspect it in the detail panel.
7. Use `Next Day` to advance time and verify overdue behavior.
8. Switch `config.js` to `api` mode and repeat the same checks against the backend.

## API Mode

Use this config:

```js
window.SITE_ASSISTANT_CONFIG = {
  dataMode: "api",
  apiBaseUrl: "http://localhost:8000/api/v1",
  storageKey: "site-assistant-web-state-v1",
};
```

Resource endpoints:

- `GET /dashboard/summary`
- `GET /work-areas`
- `GET /work-areas/{id}`
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/{id}`
- `GET /issues`
- `POST /issues`
- `PATCH /issues/{id}`
- `GET /reports`
- `POST /reports`
- `GET /logs`
- `POST /system/demo-task`
- `POST /system/demo-issue`
- `POST /system/demo-report`
- `POST /system/advance-day`
- `POST /system/reset-demo`
