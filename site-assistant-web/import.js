(function attachBulkImportWorkbench(global) {
  const config = global.SITE_ASSISTANT_CONFIG || {};
  const elements = {
    dataset: document.querySelector("#import-dataset"),
    file: document.querySelector("#import-file"),
    text: document.querySelector("#import-text"),
    templateButton: document.querySelector("#import-template-button"),
    exportButton: document.querySelector("#export-dataset-button"),
    submitButton: document.querySelector("#import-submit-button"),
    refreshButton: document.querySelector("#import-refresh-button"),
    result: document.querySelector("#import-result"),
  };

  if (!elements.dataset || !elements.templateButton || !elements.submitButton) {
    return;
  }

  const supportedDatasets = new Set([
    "work_areas",
    "quantities",
    "design_quantities",
    "resource_logs",
    "daily_reports",
    "design_spatial_objects",
    "terrain_change_sets",
  ]);

  function setResult(message) {
    if (elements.result) {
      elements.result.textContent = message;
    }
  }

  function ensureApiMode() {
    if (config.dataMode !== "api" || !config.apiBaseUrl) {
      throw new Error("批量导入只支持 API 模式。请先启动后端并使用 api 模式。");
    }
  }

  async function fetchText(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const detail = await safeReadText(response);
      throw new Error(detail || `HTTP ${response.status}`);
    }
    return response.text();
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const detail = await safeReadText(response);
      throw new Error(detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async function safeReadText(response) {
    try {
      return await response.text();
    } catch (_error) {
      return "";
    }
  }

  function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function readSelectedFile(file) {
    return file.text();
  }

  async function handleTemplateDownload() {
    try {
      ensureApiMode();
      const dataset = elements.dataset.value;
      if (!supportedDatasets.has(dataset)) {
        throw new Error("不支持的导入对象。");
      }
      setResult(`正在下载模板: ${dataset} ...`);
      const content = await fetchText(`${config.apiBaseUrl}/imports/${dataset}/template`);
      downloadText(`${dataset}_template.csv`, content);
      setResult(`模板已下载: ${dataset}_template.csv`);
    } catch (error) {
      setResult(`模板下载失败: ${error.message}`);
    }
  }

  async function handleExportDownload() {
    try {
      ensureApiMode();
      const dataset = elements.dataset.value;
      if (!supportedDatasets.has(dataset)) {
        throw new Error("不支持的导出对象。");
      }
      setResult(`正在导出 ${dataset} ...`);
      const content = await fetchText(`${config.apiBaseUrl}/exports/${dataset}`);
      downloadText(`${dataset}_export.csv`, content);
      setResult(`已导出: ${dataset}_export.csv`);
    } catch (error) {
      setResult(`导出失败: ${error.message}`);
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    try {
      const content = await readSelectedFile(file);
      elements.text.value = content;
      setResult(`已载入文件: ${file.name}`);
    } catch (error) {
      setResult(`读取文件失败: ${error.message}`);
    }
  }

  async function handleImportSubmit() {
    try {
      ensureApiMode();
      const dataset = elements.dataset.value;
      const text = elements.text.value.trim();
      if (!supportedDatasets.has(dataset)) {
        throw new Error("不支持的导入对象。");
      }
      if (!text) {
        throw new Error("请先选择 CSV 文件或粘贴表格内容。");
      }
      setResult(`正在导入 ${dataset} ...`);
      const result = await fetchJson(`${config.apiBaseUrl}/imports/${dataset}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const errorLines = (result.errors || []).slice(0, 10).map((item) => `Row ${item.row}: ${item.message}`);
      const summary = [
        `导入对象: ${result.dataset}`,
        `新建: ${result.created}`,
        `更新: ${result.updated}`,
        `总处理: ${result.total}`,
        `错误数: ${(result.errors || []).length}`,
      ];
      if (errorLines.length) {
        summary.push("", "错误明细:", ...errorLines);
      }
      setResult(summary.join("\n"));
    } catch (error) {
      setResult(`导入失败: ${error.message}`);
    }
  }

  function handleRefresh() {
    global.location.reload();
  }

  elements.templateButton.addEventListener("click", handleTemplateDownload);
  elements.exportButton.addEventListener("click", handleExportDownload);
  elements.submitButton.addEventListener("click", handleImportSubmit);
  elements.refreshButton.addEventListener("click", handleRefresh);
  elements.file.addEventListener("change", handleFileChange);
})(window);
