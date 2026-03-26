# Site Assistant Web

A zero-dependency static web prototype for the Site Assistant MVP.

## Run

Open [index.html](/F:/NeuralSite-Godot/site-assistant-web/index.html) directly, or start a local static server:

```powershell
cd F:\NeuralSite-Godot\site-assistant-web
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Current Capabilities

- dashboard summary cards
- work area list
- task, issue, and report creation
- task and issue status updates
- work-area and keyword filters
- detail side panel
- validation console
- local `localStorage` mode
- API-backed mode via resource endpoints

## Data Source

Configuration lives in [config.js](/F:/NeuralSite-Godot/site-assistant-web/config.js):

```js
window.SITE_ASSISTANT_CONFIG = {
  dataMode: "api",
  apiBaseUrl: "http://localhost:8000/api/v1",
  storageKey: "site-assistant-web-state-v1",
};
```

The default is now `dataMode: "api"`, so the page uses the backend immediately when it is running.

## Files

- [index.html](/F:/NeuralSite-Godot/site-assistant-web/index.html)
- [styles.css](/F:/NeuralSite-Godot/site-assistant-web/styles.css)
- [config.js](/F:/NeuralSite-Godot/site-assistant-web/config.js)
- [api.js](/F:/NeuralSite-Godot/site-assistant-web/api.js)
- [app.js](/F:/NeuralSite-Godot/site-assistant-web/app.js)
- [USAGE.md](/F:/NeuralSite-Godot/site-assistant-web/USAGE.md)
- [API_CONTRACT.md](/F:/NeuralSite-Godot/site-assistant-web/API_CONTRACT.md)
