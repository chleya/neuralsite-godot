(function attachSpatialManager(global) {
  const config = global.SITE_ASSISTANT_CONFIG || {};
  const baseUrl = (config.apiBaseUrl || "").replace(/\/$/, "");

  const elements = {
    form: document.querySelector("#spatial-raw-form"),
    name: document.querySelector("#spatial-name"),
    rawType: document.querySelector("#spatial-raw-type"),
    coordSystem: document.querySelector("#spatial-coord-system"),
    targetType: document.querySelector("#spatial-target-type"),
    targetId: document.querySelector("#spatial-target-id"),
    bindingRole: document.querySelector("#spatial-binding-role"),
    semanticRole: document.querySelector("#spatial-semantic-role"),
    stationStart: document.querySelector("#spatial-station-start"),
    stationEnd: document.querySelector("#spatial-station-end"),
    centerX: document.querySelector("#spatial-center-x"),
    centerY: document.querySelector("#spatial-center-y"),
    centerZ: document.querySelector("#spatial-center-z"),
    geometryRef: document.querySelector("#spatial-geometry-ref"),
    notes: document.querySelector("#spatial-notes"),
    loadSelectedButton: document.querySelector("#spatial-load-selected"),
    refreshButton: document.querySelector("#spatial-refresh-button"),
    typeFilter: document.querySelector("#spatial-type-filter"),
    targetFilter: document.querySelector("#spatial-target-filter"),
    search: document.querySelector("#spatial-search"),
    list: document.querySelector("#spatial-list"),
  };

  let state = {
    rawObjects: [],
    bindings: [],
    selectedId: null,
    typeFilter: "all",
    targetFilter: "all",
    search: "",
  };

  if (!elements.form || !elements.list) {
    return;
  }

  if (config.dataMode !== "api" || !baseUrl) {
    elements.list.innerHTML = '<p class="empty-state">空间对象管理仅在 API 模式下可用。</p>';
    elements.form.querySelectorAll("input, select, textarea, button").forEach((node) => {
      node.disabled = true;
    });
    return;
  }

  elements.form.addEventListener("submit", handleSubmit);
  elements.loadSelectedButton.addEventListener("click", loadSelectedIntoForm);
  elements.refreshButton.addEventListener("click", loadSpatialObjects);
  elements.typeFilter.addEventListener("change", () => {
    state.typeFilter = elements.typeFilter.value;
    renderSpatialList();
  });
  elements.targetFilter.addEventListener("change", () => {
    state.targetFilter = elements.targetFilter.value;
    renderSpatialList();
  });
  elements.search.addEventListener("input", () => {
    state.search = elements.search.value.trim().toLowerCase();
    renderSpatialList();
  });
  elements.list.addEventListener("click", handleSpatialListClick);
  loadSpatialObjects().catch((error) => {
    console.error(error);
    elements.list.innerHTML = `<p class="empty-state">空间对象加载失败: ${error.message}</p>`;
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const name = elements.name.value.trim();
    const targetId = elements.targetId.value.trim();
    if (!name || !targetId) {
      elements.list.innerHTML = '<p class="empty-state">空间名称和目标对象 ID 不能为空。</p>';
      return;
    }

    const rawPayload = {
      name,
      raw_type: elements.rawType.value,
      coord_system: elements.coordSystem.value,
      center_x: parseOptionalNumber(elements.centerX.value),
      center_y: parseOptionalNumber(elements.centerY.value),
      center_z: parseOptionalNumber(elements.centerZ.value),
      station_start: parseOptionalNumber(elements.stationStart.value),
      station_end: parseOptionalNumber(elements.stationEnd.value),
      geometry_ref: elements.geometryRef.value.trim(),
      notes: elements.notes.value.trim(),
    };

    try {
      let rawObject = null;
      if (state.selectedId) {
        rawObject = await fetchJson(`${baseUrl}/spatial/raw-objects/${state.selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rawPayload),
        });
        const binding = state.bindings.find((item) => item.spatial_raw_object_id === state.selectedId);
        if (binding) {
          await fetchJson(`${baseUrl}/spatial/bindings/${binding.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target_type: elements.targetType.value,
              target_id: targetId,
              spatial_raw_object_id: state.selectedId,
              binding_role: elements.bindingRole.value,
              semantic_role: elements.semanticRole.value.trim(),
            }),
          });
        }
      } else {
        rawObject = await fetchJson(`${baseUrl}/spatial/raw-objects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rawPayload),
        });

        await fetchJson(`${baseUrl}/spatial/bindings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_type: elements.targetType.value,
            target_id: targetId,
            spatial_raw_object_id: rawObject.id,
            binding_role: elements.bindingRole.value,
            semantic_role: elements.semanticRole.value.trim(),
          }),
        });
      }

      elements.form.reset();
      elements.rawType.value = "range";
      elements.coordSystem.value = "station";
      elements.targetType.value = "work_area";
      elements.bindingRole.value = "primary";
      state.selectedId = rawObject.id;
      await loadSpatialObjects();
    } catch (error) {
      console.error(error);
      elements.list.innerHTML = `<p class="empty-state">空间对象保存失败: ${error.message}</p>`;
    }
  }

  async function loadSpatialObjects() {
    const [rawObjects, bindings] = await Promise.all([
      fetchJson(`${baseUrl}/spatial/raw-objects`),
      fetchJson(`${baseUrl}/spatial/bindings`),
    ]);
    state.rawObjects = rawObjects;
    state.bindings = bindings;
    renderSpatialList();
  }

  function renderSpatialList() {
    if (!state.rawObjects.length) {
      elements.list.innerHTML = '<p class="empty-state">当前没有空间对象。</p>';
      return;
    }

    const bindingMap = new Map();
    state.bindings.forEach((binding) => {
      const list = bindingMap.get(binding.spatial_raw_object_id) || [];
      list.push(binding);
      bindingMap.set(binding.spatial_raw_object_id, list);
    });

    const visibleItems = state.rawObjects.filter((item) => {
      const linkedBindings = bindingMap.get(item.id) || [];
      const typeMatch = state.typeFilter === "all" || item.raw_type === state.typeFilter;
      const targetMatch = state.targetFilter === "all" || linkedBindings.some((binding) => binding.target_type === state.targetFilter);
      const searchText = [
        item.id,
        item.name,
        item.raw_type,
        item.coord_system,
        ...linkedBindings.map((binding) => `${binding.target_type} ${binding.target_id} ${binding.semantic_role || ""}`),
      ].join(" ").toLowerCase();
      return typeMatch && targetMatch && (!state.search || searchText.includes(state.search));
    });

    if (!visibleItems.length) {
      elements.list.innerHTML = '<p class="empty-state">当前筛选条件下没有空间对象。</p>';
      return;
    }

    elements.list.innerHTML = visibleItems.map((item) => {
      const linkedBindings = bindingMap.get(item.id) || [];
      const locationText = item.station_start != null && item.station_end != null
        ? `桩号 ${item.station_start}-${item.station_end}`
        : item.center_x != null && item.center_y != null
          ? `中心点 ${item.center_x}, ${item.center_y}, ${item.center_z ?? 0}`
          : item.geometry_ref || "无几何引用";
      const bindingText = linkedBindings.length
        ? linkedBindings.map((binding) => `${binding.target_type}:${binding.target_id} / ${binding.binding_role}`).join("<br>")
        : "未绑定业务对象";

      return `
        <article class="item-card is-clickable ${state.selectedId === item.id ? "is-selected" : ""}" data-spatial-card="${item.id}">
          <header>
            <div>
              <h3>${item.name}</h3>
              <small>${item.raw_type} / ${item.coord_system} / ${item.id}</small>
            </div>
            <span class="badge ok">空间</span>
          </header>
          <p>${locationText}</p>
          <p>${bindingText}</p>
        </article>
      `;
    }).join("");
  }

  function handleSpatialListClick(event) {
    const card = event.target.closest("[data-spatial-card]");
    if (!card) {
      return;
    }
    state.selectedId = card.dataset.spatialCard;
    renderSpatialList();
  }

  function loadSelectedIntoForm() {
    if (!state.selectedId) {
      elements.list.innerHTML = '<p class="empty-state">请先在空间对象列表里选择一条记录。</p>';
      return;
    }
    const rawObject = state.rawObjects.find((item) => item.id === state.selectedId);
    if (!rawObject) {
      return;
    }
    const binding = state.bindings.find((item) => item.spatial_raw_object_id === state.selectedId);

    elements.name.value = rawObject.name || "";
    elements.rawType.value = rawObject.raw_type || "range";
    elements.coordSystem.value = rawObject.coord_system || "station";
    elements.stationStart.value = rawObject.station_start ?? "";
    elements.stationEnd.value = rawObject.station_end ?? "";
    elements.centerX.value = rawObject.center_x ?? "";
    elements.centerY.value = rawObject.center_y ?? "";
    elements.centerZ.value = rawObject.center_z ?? "";
    elements.geometryRef.value = rawObject.geometry_ref || "";
    elements.notes.value = rawObject.notes || "";
    elements.targetType.value = binding?.target_type || "work_area";
    elements.targetId.value = binding?.target_id || "";
    elements.bindingRole.value = binding?.binding_role || "primary";
    elements.semanticRole.value = binding?.semantic_role || "";
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  function parseOptionalNumber(value) {
    if (value === "" || value == null) {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
})(window);
