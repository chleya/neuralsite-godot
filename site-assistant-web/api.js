(function attachSiteAssistantApi(global) {
  const config = global.SITE_ASSISTANT_CONFIG || {};
  const storageKey = config.storageKey || "site-assistant-web-state-v1";

  const TaskStatus = {
    PLANNED: "planned",
    IN_PROGRESS: "in_progress",
    BLOCKED: "blocked",
    DONE: "done",
  };

  const IssueStatus = {
    OPEN: "open",
    IN_PROGRESS: "in_progress",
    WAITING_REVIEW: "waiting_review",
    CLOSED: "closed",
  };

  const IssueSeverity = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
  };

  function buildDemoState() {
    return {
      currentDay: 0,
      sequence: 3,
      logs: [],
      workAreas: [
        {
          id: "wa_road_001",
          name: "K1+000-K1+500 Roadbed",
          type: "road",
          workAreaSubtype: "subgrade",
          plannedProgress: 0.55,
          actualProgress: 0.48,
          owner: "Zhang Gong",
        },
        {
          id: "wa_bridge_001",
          name: "Pier P3-P4",
          type: "bridge",
          workAreaSubtype: "bridge_substructure",
          plannedProgress: 0.35,
          actualProgress: 0.35,
          owner: "Li Gong",
        },
      ],
      tasks: [
        {
          id: "task_001",
          title: "Complete compaction test section",
          workAreaId: "wa_road_001",
          assignee: "Chen Team",
          plannedDay: 0,
          dueDay: 2,
          status: TaskStatus.IN_PROGRESS,
          completionRatio: 0.6,
          notes: "Compaction acceptance pending",
        },
      ],
      issues: [
        {
          id: "issue_001",
          title: "Drainage ditch backlog",
          workAreaId: "wa_road_001",
          owner: "Wang Supervisor",
          dueDay: 1,
          severity: IssueSeverity.HIGH,
          status: IssueStatus.OPEN,
          description: "Temporary drainage not fully opened before rain.",
        },
      ],
      reports: [
        {
          id: "report_001",
          reportDay: 0,
          author: "Chen Team",
          workAreaIds: ["wa_road_001", "wa_bridge_001"],
          completedSummary: "Roadbed fill and pier reinforcement binding continued.",
          nextPlan: "Start compaction acceptance and formwork inspection.",
        },
      ],
      quantities: [
        {
          id: "qty_001",
          workAreaId: "wa_road_001",
          itemName: "Roadbed Fill",
          itemCode: "RB-FILL",
          category: "earthwork",
          unit: "m3",
          plannedQuantity: 1200,
          actualQuantity: 650,
          status: "in_progress",
          notes: "Main embankment fill quantity",
        },
      ],
      designQuantities: [
        {
          id: "dq_001",
          workAreaId: "wa_road_001",
          itemName: "Roadbed Fill",
          itemCode: "RB-FILL",
          category: "earthwork",
          unit: "m3",
          targetQuantity: 1200,
          designVersion: "V1",
          notes: "Roadbed design target quantity",
        },
        {
          id: "dq_002",
          workAreaId: "wa_bridge_001",
          itemName: "Pier Rebar",
          itemCode: "PIER-RB",
          category: "bridge",
          unit: "t",
          targetQuantity: 85,
          designVersion: "V1",
          notes: "Pier reinforcement design target quantity",
        },
      ],
      designSpatialObjects: [
        {
          id: "dso_001",
          workAreaId: "wa_road_001",
          name: "Roadbed Design Alignment",
          designType: "alignment",
          coordSystem: "station",
          stationStart: 1000,
          stationEnd: 1500,
          bboxMinX: null,
          bboxMinY: null,
          bboxMinZ: null,
          bboxMaxX: null,
          bboxMaxY: null,
          bboxMaxZ: null,
          designRef: "design://roadbed_alignment_v1",
          elevationTarget: null,
          designVersion: "V1",
          notes: "Design alignment for roadbed work area",
        },
        {
          id: "dso_002",
          workAreaId: "wa_bridge_001",
          name: "Pier Design Zone",
          designType: "zone",
          coordSystem: "local",
          stationStart: null,
          stationEnd: null,
          bboxMinX: 115,
          bboxMinY: 30,
          bboxMinZ: 0,
          bboxMaxX: 135,
          bboxMaxY: 46,
          bboxMaxZ: 24,
          designRef: "design://pier_zone_v1",
          elevationTarget: 18.5,
          designVersion: "V1",
          notes: "Design space for pier construction zone",
        },
      ],
      terrainRawObjects: [
        {
          id: "tro_001",
          name: "Original Site Terrain",
          terrainType: "site",
          coordSystem: "local",
          bboxMinX: 0,
          bboxMinY: 0,
          bboxMinZ: 0,
          bboxMaxX: 240,
          bboxMaxY: 160,
          bboxMaxZ: 32,
          heightmapRef: "terrain://site_heightmap_v1",
          meshRef: "terrain://site_mesh_v1",
          textureRef: "terrain://site_texture_v1",
          source: "import",
          resolution: "1m",
          notes: "Original terrain base",
        },
        {
          id: "tro_002",
          name: "Bridge Yard Terrain",
          terrainType: "yard",
          coordSystem: "local",
          bboxMinX: 100,
          bboxMinY: 20,
          bboxMinZ: 0,
          bboxMaxX: 180,
          bboxMaxY: 80,
          bboxMaxZ: 18,
          heightmapRef: "terrain://yard_heightmap_v1",
          meshRef: "",
          textureRef: "",
          source: "manual",
          resolution: "0.5m",
          notes: "Bridge yard terrain base",
        },
      ],
      terrainChangeSets: [
        {
          id: "tcs_001",
          workAreaId: "wa_road_001",
          quantityId: "qty_001",
          spatialRawObjectId: "sro_003",
          terrainRawObjectId: "tro_001",
          changeType: "fill",
          resultRef: "terrain-result://roadbed_fill_day0",
          recordDay: 0,
          recordedAt: "2026-03-24T09:40:00Z",
          notes: "Initial fill result zone",
        },
        {
          id: "tcs_002",
          workAreaId: "wa_bridge_001",
          quantityId: "qty_002",
          spatialRawObjectId: "sro_004",
          terrainRawObjectId: "tro_002",
          changeType: "structure",
          resultRef: "terrain-result://pier_rebar_day0",
          recordDay: 0,
          recordedAt: "2026-03-24T09:41:00Z",
          notes: "Initial bridge yard structure change",
        },
      ],
      resourceLogs: [
        {
          id: "rl_001",
          workAreaId: "wa_road_001",
          resourceType: "labor",
          resourceName: "Roadbed Crew",
          quantity: 18,
          unit: "人",
          recordDay: 0,
          supplier: "Chen Team",
          notes: "Seed labor input",
        },
        {
          id: "rl_002",
          workAreaId: "wa_road_001",
          resourceType: "machine",
          resourceName: "Compactor",
          quantity: 2,
          unit: "台",
          recordDay: 0,
          supplier: "",
          notes: "Seed machine input",
        },
        {
          id: "rl_003",
          workAreaId: "wa_bridge_001",
          resourceType: "material",
          resourceName: "Rebar",
          quantity: 12,
          unit: "t",
          recordDay: 0,
          supplier: "Steel Supplier",
          notes: "Seed material input",
        },
      ],
      spatialDetails: {
        workAreas: {
          wa_road_001: {
            work_area: { id: "wa_road_001", name: "K1+000-K1+500 Roadbed" },
            spatial: [
              {
                binding: {
                  id: "sb_001",
                  target_type: "work_area",
                  target_id: "wa_road_001",
                  spatial_raw_object_id: "sro_001",
                  binding_role: "primary",
                  semantic_role: "main_alignment",
                },
                raw_object: {
                  id: "sro_001",
                  name: "Roadbed Main Range",
                  raw_type: "range",
                  coord_system: "station",
                  station_start: 1000,
                  station_end: 1500,
                  geometry_ref: "",
                },
                display_objects: [
                  {
                    id: "sdo_001",
                    display_name: "Roadbed Range Display",
                    display_type: "line",
                    display_ref: "godot://roadbed_range_line",
                    label_text: "K1+000-K1+500",
                    color_hint: "#b55233",
                    visible: 1,
                  },
                ],
              },
            ],
          },
        },
        quantities: {
          qty_001: {
            quantity: { id: "qty_001", item_name: "Roadbed Fill" },
            spatial: [
              {
                binding: {
                  id: "sb_003",
                  target_type: "quantity",
                  target_id: "qty_001",
                  spatial_raw_object_id: "sro_003",
                  binding_role: "coverage",
                  semantic_role: "fill_zone",
                },
                raw_object: {
                  id: "sro_003",
                  name: "Roadbed Fill Coverage",
                  raw_type: "range",
                  coord_system: "station",
                  station_start: 1080,
                  station_end: 1420,
                  geometry_ref: "",
                },
                display_objects: [
                  {
                    id: "sdo_003",
                    display_name: "Roadbed Fill Display",
                    display_type: "line",
                    display_ref: "godot://roadbed_fill_range",
                    label_text: "Roadbed Fill",
                    color_hint: "#b67421",
                    visible: 1,
                  },
                ],
              },
            ],
          },
        },
      },
      historyDetails: {
        workAreas: {
          wa_road_001: [
            {
              id: "wph_001",
              planned_progress: 0.55,
              actual_progress: 0.48,
              status: "in_progress",
              recorded_at: "2026-03-24T09:00:00Z",
              source: "report",
              note: "Seed work area progress",
            },
          ],
        },
        tasks: {
          task_001: [
            {
              id: "tsh_001",
              old_status: null,
              new_status: "planned",
              old_completion_ratio: null,
              new_completion_ratio: 0,
              changed_at: "2026-03-24T09:00:00Z",
              operator: "system",
              note: "Task created",
            },
            {
              id: "tsh_002",
              old_status: "planned",
              new_status: "in_progress",
              old_completion_ratio: 0,
              new_completion_ratio: 0.6,
              changed_at: "2026-03-24T12:00:00Z",
              operator: "system",
              note: "Compaction test section started",
            },
          ],
        },
        issues: {
          issue_001: [
            {
              id: "ish_001",
              old_status: null,
              new_status: "open",
              old_severity: null,
              new_severity: "high",
              changed_at: "2026-03-24T09:30:00Z",
              operator: "system",
              note: "Issue created",
            },
          ],
        },
        quantities: {
          qty_001: [
            {
              id: "qph_001",
              planned_quantity: 1200,
              actual_quantity: 650,
              variance_quantity: -550,
              status: "in_progress",
              recorded_at: "2026-03-24T18:00:00Z",
              source: "report",
              note: "Seed quantity progress",
            },
          ],
        },
      },
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadLocalState() {
    try {
      const saved = global.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.workAreas && parsed.tasks && parsed.issues && parsed.reports) {
          if (!parsed.quantities) {
            parsed.quantities = [];
          }
          if (!parsed.designQuantities) {
            parsed.designQuantities = [];
          }
          if (!parsed.designSpatialObjects) {
            parsed.designSpatialObjects = [];
          }
          if (!parsed.terrainRawObjects) {
            parsed.terrainRawObjects = [];
          }
          if (!parsed.terrainChangeSets) {
            parsed.terrainChangeSets = [];
          }
          if (!parsed.resourceLogs) {
            parsed.resourceLogs = [];
          }
          if (!parsed.spatialDetails) {
            parsed.spatialDetails = { workAreas: {}, quantities: {} };
          }
          if (!parsed.historyDetails) {
            parsed.historyDetails = { workAreas: {}, tasks: {}, issues: {}, quantities: {} };
          }
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Failed to load local state", error);
    }
    return buildDemoState();
  }

  function saveLocalState(state) {
    global.localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function nextId(state, prefix) {
    state.sequence += 1;
    return `${prefix}_${String(state.sequence).padStart(3, "0")}`;
  }

  function getDueTasks(state) {
    return state.tasks
      .filter((task) => task.status !== TaskStatus.DONE && task.plannedDay <= state.currentDay)
      .sort(sortByDueDayThenId);
  }

  function getOpenIssues(state) {
    return state.issues
      .filter((issue) => issue.status !== IssueStatus.CLOSED)
      .sort(sortByDueDayThenId);
  }

  function sortByDueDayThenId(a, b) {
    if (a.dueDay === b.dueDay) {
      return a.id.localeCompare(b.id);
    }
    return a.dueDay - b.dueDay;
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  function mapWorkArea(item) {
    return {
      id: item.id,
      name: item.name,
      type: item.type,
      workAreaSubtype: item.work_area_subtype || item.workAreaSubtype || "",
      owner: item.owner || "",
      plannedProgress: item.planned_progress ?? 0,
      actualProgress: item.actual_progress ?? 0,
      status: item.status || "not_started",
      stationStart: item.station_start ?? 0,
      stationEnd: item.station_end ?? 0,
      description: item.description || "",
      createdAt: item.created_at || "",
      updatedAt: item.updated_at || "",
    };
  }

  function mapTask(item) {
    return {
      id: item.id,
      title: item.title,
      workAreaId: item.work_area_id,
      assignee: item.assignee || "",
      plannedDay: item.planned_day ?? 0,
      dueDay: item.due_day ?? 0,
      status: item.status,
      completionRatio: item.completion_ratio ?? 0,
      notes: item.notes || "",
      createdAt: item.created_at || "",
      updatedAt: item.updated_at || "",
    };
  }

  function mapIssue(item) {
    return {
      id: item.id,
      title: item.title,
      workAreaId: item.work_area_id,
      owner: item.owner || "",
      dueDay: item.due_day ?? 0,
      severity: item.severity,
      status: item.status,
      description: item.description || "",
      createdAt: item.created_at || "",
      updatedAt: item.updated_at || "",
      closedAt: item.closed_at || null,
    };
  }

  function mapReport(item) {
    return {
      id: item.id,
      reportDay: item.report_day ?? 0,
      author: item.author || "",
      workAreaIds: item.work_area_ids || [],
      completedSummary: item.completed_summary || "",
      nextPlan: item.next_plan || "",
      weather: item.weather || "",
      laborCount: item.labor_count ?? 0,
      machineCount: item.machine_count ?? 0,
      notes: item.notes || "",
      createdAt: item.created_at || "",
    };
  }

  function mapQuantity(item) {
    return {
      id: item.id,
      workAreaId: item.work_area_id,
      itemName: item.item_name,
      itemCode: item.item_code || "",
      category: item.category || "general",
      unit: item.unit || "",
      plannedQuantity: item.planned_quantity ?? 0,
      actualQuantity: item.actual_quantity ?? 0,
      status: item.status || "not_started",
      notes: item.notes || "",
      createdAt: item.created_at || "",
      updatedAt: item.updated_at || "",
    };
  }

  function mapDesignQuantity(item) {
    return {
      id: item.id,
      workAreaId: item.work_area_id,
      itemName: item.item_name,
      itemCode: item.item_code || "",
      category: item.category || "general",
      unit: item.unit || "",
      targetQuantity: item.target_quantity ?? 0,
      designVersion: item.design_version || "",
      notes: item.notes || "",
      createdAt: item.created_at || "",
      updatedAt: item.updated_at || "",
    };
  }

  function mapDesignSpatialObject(item) {
    return {
      id: item.id,
      workAreaId: item.work_area_id,
      name: item.name,
      designType: item.design_type,
      coordSystem: item.coord_system,
      stationStart: item.station_start,
      stationEnd: item.station_end,
      bboxMinX: item.bbox_min_x,
      bboxMinY: item.bbox_min_y,
      bboxMinZ: item.bbox_min_z,
      bboxMaxX: item.bbox_max_x,
      bboxMaxY: item.bbox_max_y,
      bboxMaxZ: item.bbox_max_z,
      designRef: item.design_ref || "",
      elevationTarget: item.elevation_target,
      designVersion: item.design_version || "",
      notes: item.notes || "",
      createdAt: item.created_at || "",
      updatedAt: item.updated_at || "",
    };
  }

  function mapTerrainRawObject(item) {
    const terrain = item.terrain || item;
    return {
      id: terrain.id,
      name: terrain.name,
      terrainType: terrain.terrain_type,
      coordSystem: terrain.coord_system,
      bboxMinX: terrain.bbox_min_x,
      bboxMinY: terrain.bbox_min_y,
      bboxMinZ: terrain.bbox_min_z,
      bboxMaxX: terrain.bbox_max_x,
      bboxMaxY: terrain.bbox_max_y,
      bboxMaxZ: terrain.bbox_max_z,
      heightmapRef: terrain.heightmap_ref || "",
      meshRef: terrain.mesh_ref || "",
      textureRef: terrain.texture_ref || "",
      source: terrain.source || "",
      resolution: terrain.resolution || "",
      notes: terrain.notes || "",
      createdAt: terrain.created_at || "",
      updatedAt: terrain.updated_at || "",
      displayObjects: item.display_objects || [],
    };
  }

  function mapTerrainChangeSet(item) {
    return {
      id: item.id,
      workAreaId: item.workAreaId ?? item.work_area_id ?? "",
      quantityId: item.quantityId ?? item.quantity_id ?? "",
      spatialRawObjectId: item.spatialRawObjectId ?? item.spatial_raw_object_id ?? "",
      terrainRawObjectId: item.terrainRawObjectId ?? item.terrain_raw_object_id ?? "",
      changeType: item.changeType ?? item.change_type ?? "fill",
      resultRef: item.resultRef ?? item.result_ref ?? "",
      recordDay: item.recordDay ?? item.record_day ?? 0,
      recordedAt: item.recordedAt ?? item.recorded_at ?? "",
      notes: item.notes ?? "",
    };
  }

  function mapResourceLog(item) {
    return {
      id: item.id,
      workAreaId: item.work_area_id ?? item.workAreaId,
      resourceType: item.resource_type ?? item.resourceType,
      resourceCategory: item.resource_category ?? item.resourceCategory ?? item.resource_type ?? item.resourceType ?? "",
      resourceSubtype: item.resource_subtype ?? item.resourceSubtype ?? "",
      resourceName: item.resource_name ?? item.resourceName,
      quantity: item.quantity ?? 0,
      unit: item.unit || "",
      recordDay: item.record_day ?? item.recordDay ?? 0,
      teamName: item.team_name ?? item.teamName ?? "",
      specification: item.specification || "",
      sourceType: item.source_type ?? item.sourceType ?? "manual",
      supplier: item.supplier || "",
      notes: item.notes || "",
      createdAt: item.created_at || item.createdAt || "",
    };
  }

  class LocalAdapter {
    constructor() {
      this.mode = "local";
      this.state = loadLocalState();
    }

    async loadState() {
      this.state = loadLocalState();
      return clone(this.state);
    }

    async getWorkAreaSpatial(workAreaId) {
      return clone(this.state.spatialDetails?.workAreas?.[workAreaId] || { work_area: null, spatial: [] });
    }

    async getQuantitySpatial(quantityId) {
      return clone(this.state.spatialDetails?.quantities?.[quantityId] || { quantity: null, spatial: [] });
    }

    async getWorkAreaHistory(workAreaId) {
      return clone(this.state.historyDetails?.workAreas?.[workAreaId] || []);
    }

    async getTaskHistory(taskId) {
      return clone(this.state.historyDetails?.tasks?.[taskId] || []);
    }

    async getIssueHistory(issueId) {
      return clone(this.state.historyDetails?.issues?.[issueId] || []);
    }

    async getQuantityHistory(quantityId) {
      return clone(this.state.historyDetails?.quantities?.[quantityId] || []);
    }

    async createEntry(payload) {
      if (payload.type === "task") {
        this.state.tasks.push({
          id: nextId(this.state, "task"),
          title: payload.title,
          workAreaId: payload.workAreaId,
          assignee: payload.owner || "Field Team",
          plannedDay: this.state.currentDay,
          dueDay: this.state.currentDay + 2,
          status: TaskStatus.PLANNED,
          completionRatio: 0,
          notes: payload.notes,
        });
      } else if (payload.type === "issue") {
        this.state.issues.push({
          id: nextId(this.state, "issue"),
          title: payload.title,
          workAreaId: payload.workAreaId,
          owner: payload.owner || "Safety Officer",
          dueDay: this.state.currentDay + 1,
          severity: IssueSeverity.MEDIUM,
          status: IssueStatus.OPEN,
          description: payload.notes,
        });
      } else {
        this.state.reports.push({
          id: nextId(this.state, "report"),
          reportDay: this.state.currentDay,
          author: payload.owner || "Daily Reporter",
          workAreaIds: [payload.workAreaId],
          completedSummary: payload.title,
          nextPlan: payload.notes || "Continue next work package",
        });
      }
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createWorkArea(payload) {
      this.state.workAreas.push({
        id: nextId(this.state, "wa"),
        name: payload.name,
        type: payload.type,
        workAreaSubtype: payload.workAreaSubtype || "",
        owner: payload.owner || "",
        plannedProgress: payload.plannedProgress ?? 0,
        actualProgress: payload.actualProgress ?? 0,
        status: deriveWorkAreaStatus(payload.plannedProgress ?? 0, payload.actualProgress ?? 0),
        description: payload.description || "",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createQuantity(payload) {
      this.state.quantities.push({
        id: nextId(this.state, "qty"),
        workAreaId: payload.workAreaId,
        itemName: payload.itemName,
        itemCode: payload.itemCode || "",
        category: payload.category || "general",
        unit: payload.unit || "m3",
        plannedQuantity: payload.plannedQuantity ?? 0,
        actualQuantity: payload.actualQuantity ?? 0,
        status: deriveQuantityStatus(payload.plannedQuantity ?? 0, payload.actualQuantity ?? 0),
        notes: payload.notes || "",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createDesignQuantity(payload) {
      this.state.designQuantities.push({
        id: nextId(this.state, "dq"),
        workAreaId: payload.workAreaId,
        itemName: payload.itemName,
        itemCode: payload.itemCode || "",
        category: payload.category || "general",
        unit: payload.unit || "m3",
        targetQuantity: payload.targetQuantity ?? 0,
        designVersion: payload.designVersion || "",
        notes: payload.notes || "",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createResourceLog(payload) {
      this.state.resourceLogs.push({
        id: nextId(this.state, "rl"),
        workAreaId: payload.workAreaId,
        resourceType: payload.resourceType,
        resourceCategory: payload.resourceCategory || payload.resourceType,
        resourceSubtype: payload.resourceSubtype || "",
        resourceName: payload.resourceName,
        quantity: payload.quantity ?? 0,
        unit: payload.unit || "",
        recordDay: payload.recordDay ?? this.state.currentDay,
        teamName: payload.teamName || "",
        specification: payload.specification || "",
        sourceType: payload.sourceType || "manual",
        supplier: payload.supplier || "",
        notes: payload.notes || "",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createDesignSpatialObject(payload) {
      this.state.designSpatialObjects.push({
        id: nextId(this.state, "dso"),
        workAreaId: payload.workAreaId,
        name: payload.name,
        designType: payload.designType,
        coordSystem: payload.coordSystem,
        stationStart: payload.stationStart ?? null,
        stationEnd: payload.stationEnd ?? null,
        bboxMinX: payload.bboxMinX ?? null,
        bboxMinY: payload.bboxMinY ?? null,
        bboxMinZ: payload.bboxMinZ ?? null,
        bboxMaxX: payload.bboxMaxX ?? null,
        bboxMaxY: payload.bboxMaxY ?? null,
        bboxMaxZ: payload.bboxMaxZ ?? null,
        designRef: payload.designRef || "",
        elevationTarget: payload.elevationTarget ?? null,
        designVersion: payload.designVersion || "",
        notes: payload.notes || "",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createTerrainRawObject(payload) {
      this.state.terrainRawObjects.push({
        id: nextId(this.state, "tro"),
        name: payload.name,
        terrainType: payload.terrainType,
        coordSystem: payload.coordSystem,
        bboxMinX: payload.bboxMinX ?? null,
        bboxMinY: payload.bboxMinY ?? null,
        bboxMinZ: payload.bboxMinZ ?? null,
        bboxMaxX: payload.bboxMaxX ?? null,
        bboxMaxY: payload.bboxMaxY ?? null,
        bboxMaxZ: payload.bboxMaxZ ?? null,
        heightmapRef: payload.heightmapRef || "",
        meshRef: payload.meshRef || "",
        textureRef: payload.textureRef || "",
        source: payload.source || "",
        resolution: payload.resolution || "",
        notes: payload.notes || "",
        displayObjects: [],
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createTerrainChangeSet(payload) {
      this.state.terrainChangeSets.push({
        id: nextId(this.state, "tcs"),
        workAreaId: payload.workAreaId,
        quantityId: payload.quantityId || "",
        spatialRawObjectId: payload.spatialRawObjectId || "",
        terrainRawObjectId: payload.terrainRawObjectId || "",
        changeType: payload.changeType || "fill",
        resultRef: payload.resultRef || "",
        recordDay: payload.recordDay ?? this.state.currentDay,
        recordedAt: new Date().toISOString(),
        notes: payload.notes || "",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateQuantity(quantityId, payload) {
      const quantity = this.state.quantities.find((item) => item.id === quantityId);
      if (!quantity) {
        throw new Error("Quantity not found");
      }
      if (typeof payload.workAreaId === "string") {
        quantity.workAreaId = payload.workAreaId;
      }
      if (typeof payload.itemName === "string") {
        quantity.itemName = payload.itemName;
      }
      if (typeof payload.itemCode === "string") {
        quantity.itemCode = payload.itemCode;
      }
      if (typeof payload.category === "string") {
        quantity.category = payload.category;
      }
      if (typeof payload.unit === "string") {
        quantity.unit = payload.unit;
      }
      if (typeof payload.plannedQuantity === "number") {
        quantity.plannedQuantity = payload.plannedQuantity;
      }
      if (typeof payload.actualQuantity === "number") {
        quantity.actualQuantity = payload.actualQuantity;
      }
      if (typeof payload.notes === "string") {
        quantity.notes = payload.notes;
      }
      quantity.status = deriveQuantityStatus(quantity.plannedQuantity, quantity.actualQuantity);
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateDesignQuantity(designQuantityId, payload) {
      const quantity = this.state.designQuantities.find((item) => item.id === designQuantityId);
      if (!quantity) {
        throw new Error("Design quantity not found");
      }
      if (typeof payload.workAreaId === "string") {
        quantity.workAreaId = payload.workAreaId;
      }
      if (typeof payload.itemName === "string") {
        quantity.itemName = payload.itemName;
      }
      if (typeof payload.itemCode === "string") {
        quantity.itemCode = payload.itemCode;
      }
      if (typeof payload.category === "string") {
        quantity.category = payload.category;
      }
      if (typeof payload.unit === "string") {
        quantity.unit = payload.unit;
      }
      if (typeof payload.targetQuantity === "number") {
        quantity.targetQuantity = payload.targetQuantity;
      }
      if (typeof payload.designVersion === "string") {
        quantity.designVersion = payload.designVersion;
      }
      if (typeof payload.notes === "string") {
        quantity.notes = payload.notes;
      }
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateResourceLog(resourceLogId, payload) {
      const resourceLog = this.state.resourceLogs.find((item) => item.id === resourceLogId);
      if (!resourceLog) {
        throw new Error("Resource log not found");
      }
      if (typeof payload.workAreaId === "string") {
        resourceLog.workAreaId = payload.workAreaId;
      }
      if (typeof payload.resourceType === "string") {
        resourceLog.resourceType = payload.resourceType;
      }
      if (typeof payload.resourceCategory === "string") {
        resourceLog.resourceCategory = payload.resourceCategory;
      }
      if (typeof payload.resourceSubtype === "string") {
        resourceLog.resourceSubtype = payload.resourceSubtype;
      }
      if (typeof payload.resourceName === "string") {
        resourceLog.resourceName = payload.resourceName;
      }
      if (typeof payload.quantity === "number") {
        resourceLog.quantity = payload.quantity;
      }
      if (typeof payload.unit === "string") {
        resourceLog.unit = payload.unit;
      }
      if (typeof payload.recordDay === "number") {
        resourceLog.recordDay = payload.recordDay;
      }
      if (typeof payload.teamName === "string") {
        resourceLog.teamName = payload.teamName;
      }
      if (typeof payload.specification === "string") {
        resourceLog.specification = payload.specification;
      }
      if (typeof payload.sourceType === "string") {
        resourceLog.sourceType = payload.sourceType;
      }
      if (typeof payload.supplier === "string") {
        resourceLog.supplier = payload.supplier;
      }
      if (typeof payload.notes === "string") {
        resourceLog.notes = payload.notes;
      }
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateDesignSpatialObject(designSpatialObjectId, payload) {
      const designSpatialObject = this.state.designSpatialObjects.find((item) => item.id === designSpatialObjectId);
      if (!designSpatialObject) {
        throw new Error("Design spatial object not found");
      }
      if (typeof payload.workAreaId === "string") designSpatialObject.workAreaId = payload.workAreaId;
      if (typeof payload.name === "string") designSpatialObject.name = payload.name;
      if (typeof payload.designType === "string") designSpatialObject.designType = payload.designType;
      if (typeof payload.coordSystem === "string") designSpatialObject.coordSystem = payload.coordSystem;
      if (payload.stationStart !== undefined) designSpatialObject.stationStart = payload.stationStart;
      if (payload.stationEnd !== undefined) designSpatialObject.stationEnd = payload.stationEnd;
      if (payload.bboxMinX !== undefined) designSpatialObject.bboxMinX = payload.bboxMinX;
      if (payload.bboxMinY !== undefined) designSpatialObject.bboxMinY = payload.bboxMinY;
      if (payload.bboxMinZ !== undefined) designSpatialObject.bboxMinZ = payload.bboxMinZ;
      if (payload.bboxMaxX !== undefined) designSpatialObject.bboxMaxX = payload.bboxMaxX;
      if (payload.bboxMaxY !== undefined) designSpatialObject.bboxMaxY = payload.bboxMaxY;
      if (payload.bboxMaxZ !== undefined) designSpatialObject.bboxMaxZ = payload.bboxMaxZ;
      if (typeof payload.designRef === "string") designSpatialObject.designRef = payload.designRef;
      if (payload.elevationTarget !== undefined) designSpatialObject.elevationTarget = payload.elevationTarget;
      if (typeof payload.designVersion === "string") designSpatialObject.designVersion = payload.designVersion;
      if (typeof payload.notes === "string") designSpatialObject.notes = payload.notes;
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateTerrainRawObject(terrainRawObjectId, payload) {
      const terrain = this.state.terrainRawObjects.find((item) => item.id === terrainRawObjectId);
      if (!terrain) {
        throw new Error("Terrain raw object not found");
      }
      if (typeof payload.name === "string") terrain.name = payload.name;
      if (typeof payload.terrainType === "string") terrain.terrainType = payload.terrainType;
      if (typeof payload.coordSystem === "string") terrain.coordSystem = payload.coordSystem;
      if (payload.bboxMinX !== undefined) terrain.bboxMinX = payload.bboxMinX;
      if (payload.bboxMinY !== undefined) terrain.bboxMinY = payload.bboxMinY;
      if (payload.bboxMinZ !== undefined) terrain.bboxMinZ = payload.bboxMinZ;
      if (payload.bboxMaxX !== undefined) terrain.bboxMaxX = payload.bboxMaxX;
      if (payload.bboxMaxY !== undefined) terrain.bboxMaxY = payload.bboxMaxY;
      if (payload.bboxMaxZ !== undefined) terrain.bboxMaxZ = payload.bboxMaxZ;
      if (typeof payload.heightmapRef === "string") terrain.heightmapRef = payload.heightmapRef;
      if (typeof payload.meshRef === "string") terrain.meshRef = payload.meshRef;
      if (typeof payload.textureRef === "string") terrain.textureRef = payload.textureRef;
      if (typeof payload.source === "string") terrain.source = payload.source;
      if (typeof payload.resolution === "string") terrain.resolution = payload.resolution;
      if (typeof payload.notes === "string") terrain.notes = payload.notes;
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateTerrainChangeSet(terrainChangeSetId, payload) {
      const terrainChangeSet = this.state.terrainChangeSets.find((item) => item.id === terrainChangeSetId);
      if (!terrainChangeSet) {
        throw new Error("Terrain change set not found");
      }
      if (typeof payload.workAreaId === "string") terrainChangeSet.workAreaId = payload.workAreaId;
      if (typeof payload.quantityId === "string") terrainChangeSet.quantityId = payload.quantityId;
      if (typeof payload.spatialRawObjectId === "string") terrainChangeSet.spatialRawObjectId = payload.spatialRawObjectId;
      if (typeof payload.terrainRawObjectId === "string") terrainChangeSet.terrainRawObjectId = payload.terrainRawObjectId;
      if (typeof payload.changeType === "string") terrainChangeSet.changeType = payload.changeType;
      if (typeof payload.resultRef === "string") terrainChangeSet.resultRef = payload.resultRef;
      if (typeof payload.recordDay === "number") terrainChangeSet.recordDay = payload.recordDay;
      if (typeof payload.notes === "string") terrainChangeSet.notes = payload.notes;
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateWorkArea(workAreaId, payload) {
      const workArea = this.state.workAreas.find((item) => item.id === workAreaId);
      if (!workArea) {
        throw new Error("Work area not found");
      }
      if (typeof payload.owner === "string") {
        workArea.owner = payload.owner;
      }
      if (typeof payload.plannedProgress === "number") {
        workArea.plannedProgress = payload.plannedProgress;
      }
      if (typeof payload.actualProgress === "number") {
        workArea.actualProgress = payload.actualProgress;
      }
      if (typeof payload.description === "string") {
        workArea.description = payload.description;
      }
      workArea.status = deriveWorkAreaStatus(workArea.plannedProgress, workArea.actualProgress);
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateTask(taskId, payload) {
      const task = this.state.tasks.find((item) => item.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }
      if (typeof payload.title === "string") {
        task.title = payload.title;
      }
      if (typeof payload.workAreaId === "string") {
        task.workAreaId = payload.workAreaId;
      }
      if (typeof payload.assignee === "string") {
        task.assignee = payload.assignee;
      }
      if (typeof payload.dueDay === "number") {
        task.dueDay = payload.dueDay;
      }
      if (typeof payload.notes === "string") {
        task.notes = payload.notes;
      }
      if (typeof payload.status === "string") {
        task.status = payload.status;
      }
      if (typeof payload.completionRatio === "number") {
        task.completionRatio = payload.completionRatio;
      } else if (payload.status === TaskStatus.DONE) {
        task.completionRatio = 1;
      }
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateIssue(issueId, payload) {
      const issue = this.state.issues.find((item) => item.id === issueId);
      if (!issue) {
        throw new Error("Issue not found");
      }
      if (typeof payload.title === "string") {
        issue.title = payload.title;
      }
      if (typeof payload.workAreaId === "string") {
        issue.workAreaId = payload.workAreaId;
      }
      if (typeof payload.owner === "string") {
        issue.owner = payload.owner;
      }
      if (typeof payload.dueDay === "number") {
        issue.dueDay = payload.dueDay;
      }
      if (typeof payload.severity === "string") {
        issue.severity = payload.severity;
      }
      if (typeof payload.description === "string") {
        issue.description = payload.description;
      }
      if (typeof payload.status === "string") {
        issue.status = payload.status;
      }
      saveLocalState(this.state);
      return clone(this.state);
    }

    async updateReport(reportId, payload) {
      const report = this.state.reports.find((item) => item.id === reportId);
      if (!report) {
        throw new Error("Report not found");
      }
      if (typeof payload.author === "string") {
        report.author = payload.author;
      }
      if (Array.isArray(payload.workAreaIds)) {
        report.workAreaIds = payload.workAreaIds;
      }
      if (typeof payload.completedSummary === "string") {
        report.completedSummary = payload.completedSummary;
      }
      if (typeof payload.nextPlan === "string") {
        report.nextPlan = payload.nextPlan;
      }
      saveLocalState(this.state);
      return clone(this.state);
    }

    async advanceDay() {
      this.state.currentDay += 1;
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createDemoTask() {
      this.state.tasks.push({
        id: nextId(this.state, "task"),
        title: `Validation task Day ${this.state.currentDay}`,
        workAreaId: "wa_road_001",
        assignee: "QA Team",
        plannedDay: this.state.currentDay,
        dueDay: this.state.currentDay + 1,
        status: TaskStatus.PLANNED,
        completionRatio: 0,
        notes: "Created from validation console",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createDemoIssue() {
      this.state.issues.push({
        id: nextId(this.state, "issue"),
        title: `Validation issue Day ${this.state.currentDay}`,
        workAreaId: "wa_road_001",
        owner: "Site Lead",
        dueDay: this.state.currentDay + 1,
        severity: IssueSeverity.HIGH,
        status: IssueStatus.OPEN,
        description: "Created from validation console",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async createDemoReport() {
      this.state.reports.push({
        id: nextId(this.state, "report"),
        reportDay: this.state.currentDay,
        author: "Validation User",
        workAreaIds: ["wa_road_001"],
        completedSummary: `Validation summary on day ${this.state.currentDay}`,
        nextPlan: "Continue validation flow tomorrow",
      });
      saveLocalState(this.state);
      return clone(this.state);
    }

    async resetState() {
      this.state = buildDemoState();
      saveLocalState(this.state);
      return clone(this.state);
    }
  }

  class RemoteAdapter {
    constructor(baseUrl) {
      this.mode = "api";
      this.baseUrl = baseUrl.replace(/\/$/, "");
      this.state = buildDemoState();
    }

    async loadState() {
      this.state = await this._loadResourceState();
      return clone(this.state);
    }

    async createEntry(payload) {
      if (payload.type === "task") {
        await fetchJson(`${this.baseUrl}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.title,
            work_area_id: payload.workAreaId,
            assignee: payload.owner,
            notes: payload.notes,
          }),
        });
      } else if (payload.type === "issue") {
        await fetchJson(`${this.baseUrl}/issues`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.title,
            work_area_id: payload.workAreaId,
            owner: payload.owner,
            description: payload.notes,
          }),
        });
      } else {
        await fetchJson(`${this.baseUrl}/reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: payload.owner || "Daily Reporter",
            work_area_ids: [payload.workAreaId],
            completed_summary: payload.title,
            next_plan: payload.notes || "Continue next work package",
          }),
        });
      }
      return this.loadState();
    }

    async createWorkArea(payload) {
      await fetchJson(`${this.baseUrl}/work-areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          type: payload.type,
          work_area_subtype: payload.workAreaSubtype,
          owner: payload.owner,
          planned_progress: payload.plannedProgress,
          actual_progress: payload.actualProgress,
          description: payload.description,
        }),
      });
      return this.loadState();
    }

    async createQuantity(payload) {
      await fetchJson(`${this.baseUrl}/quantities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          item_name: payload.itemName,
          item_code: payload.itemCode,
          category: payload.category,
          unit: payload.unit,
          planned_quantity: payload.plannedQuantity,
          actual_quantity: payload.actualQuantity,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async createDesignQuantity(payload) {
      await fetchJson(`${this.baseUrl}/design-quantities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          item_name: payload.itemName,
          item_code: payload.itemCode,
          category: payload.category,
          unit: payload.unit,
          target_quantity: payload.targetQuantity,
          design_version: payload.designVersion,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async createResourceLog(payload) {
      await fetchJson(`${this.baseUrl}/resource-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          resource_type: payload.resourceType,
          resource_category: payload.resourceCategory,
          resource_subtype: payload.resourceSubtype,
          resource_name: payload.resourceName,
          quantity: payload.quantity,
          unit: payload.unit,
          record_day: payload.recordDay,
          team_name: payload.teamName,
          specification: payload.specification,
          source_type: payload.sourceType,
          supplier: payload.supplier,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async createDesignSpatialObject(payload) {
      await fetchJson(`${this.baseUrl}/design-spatial-objects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          name: payload.name,
          design_type: payload.designType,
          coord_system: payload.coordSystem,
          station_start: payload.stationStart,
          station_end: payload.stationEnd,
          bbox_min_x: payload.bboxMinX,
          bbox_min_y: payload.bboxMinY,
          bbox_min_z: payload.bboxMinZ,
          bbox_max_x: payload.bboxMaxX,
          bbox_max_y: payload.bboxMaxY,
          bbox_max_z: payload.bboxMaxZ,
          design_ref: payload.designRef,
          elevation_target: payload.elevationTarget,
          design_version: payload.designVersion,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async createTerrainRawObject(payload) {
      await fetchJson(`${this.baseUrl}/terrain/raw-objects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          terrain_type: payload.terrainType,
          coord_system: payload.coordSystem,
          bbox_min_x: payload.bboxMinX,
          bbox_min_y: payload.bboxMinY,
          bbox_min_z: payload.bboxMinZ,
          bbox_max_x: payload.bboxMaxX,
          bbox_max_y: payload.bboxMaxY,
          bbox_max_z: payload.bboxMaxZ,
          heightmap_ref: payload.heightmapRef,
          mesh_ref: payload.meshRef,
          texture_ref: payload.textureRef,
          source: payload.source,
          resolution: payload.resolution,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async createTerrainChangeSet(payload) {
      await fetchJson(`${this.baseUrl}/terrain-change-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          quantity_id: payload.quantityId,
          spatial_raw_object_id: payload.spatialRawObjectId,
          terrain_raw_object_id: payload.terrainRawObjectId,
          change_type: payload.changeType,
          result_ref: payload.resultRef,
          record_day: payload.recordDay,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async updateQuantity(quantityId, payload) {
      await fetchJson(`${this.baseUrl}/quantities/${quantityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          item_name: payload.itemName,
          item_code: payload.itemCode,
          category: payload.category,
          unit: payload.unit,
          planned_quantity: payload.plannedQuantity,
          actual_quantity: payload.actualQuantity,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async updateDesignQuantity(designQuantityId, payload) {
      await fetchJson(`${this.baseUrl}/design-quantities/${designQuantityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          item_name: payload.itemName,
          item_code: payload.itemCode,
          category: payload.category,
          unit: payload.unit,
          target_quantity: payload.targetQuantity,
          design_version: payload.designVersion,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async updateResourceLog(resourceLogId, payload) {
      await fetchJson(`${this.baseUrl}/resource-logs/${resourceLogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          resource_type: payload.resourceType,
          resource_category: payload.resourceCategory,
          resource_subtype: payload.resourceSubtype,
          resource_name: payload.resourceName,
          quantity: payload.quantity,
          unit: payload.unit,
          record_day: payload.recordDay,
          team_name: payload.teamName,
          specification: payload.specification,
          source_type: payload.sourceType,
          supplier: payload.supplier,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async updateDesignSpatialObject(designSpatialObjectId, payload) {
      await fetchJson(`${this.baseUrl}/design-spatial-objects/${designSpatialObjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          name: payload.name,
          design_type: payload.designType,
          coord_system: payload.coordSystem,
          station_start: payload.stationStart,
          station_end: payload.stationEnd,
          bbox_min_x: payload.bboxMinX,
          bbox_min_y: payload.bboxMinY,
          bbox_min_z: payload.bboxMinZ,
          bbox_max_x: payload.bboxMaxX,
          bbox_max_y: payload.bboxMaxY,
          bbox_max_z: payload.bboxMaxZ,
          design_ref: payload.designRef,
          elevation_target: payload.elevationTarget,
          design_version: payload.designVersion,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async updateTerrainRawObject(terrainRawObjectId, payload) {
      await fetchJson(`${this.baseUrl}/terrain/raw-objects/${terrainRawObjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          terrain_type: payload.terrainType,
          coord_system: payload.coordSystem,
          bbox_min_x: payload.bboxMinX,
          bbox_min_y: payload.bboxMinY,
          bbox_min_z: payload.bboxMinZ,
          bbox_max_x: payload.bboxMaxX,
          bbox_max_y: payload.bboxMaxY,
          bbox_max_z: payload.bboxMaxZ,
          heightmap_ref: payload.heightmapRef,
          mesh_ref: payload.meshRef,
          texture_ref: payload.textureRef,
          source: payload.source,
          resolution: payload.resolution,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async updateTerrainChangeSet(terrainChangeSetId, payload) {
      await fetchJson(`${this.baseUrl}/terrain-change-sets/${terrainChangeSetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_id: payload.workAreaId,
          quantity_id: payload.quantityId,
          spatial_raw_object_id: payload.spatialRawObjectId,
          terrain_raw_object_id: payload.terrainRawObjectId,
          change_type: payload.changeType,
          result_ref: payload.resultRef,
          record_day: payload.recordDay,
          notes: payload.notes,
        }),
      });
      return this.loadState();
    }

    async updateWorkArea(workAreaId, payload) {
      await fetchJson(`${this.baseUrl}/work-areas/${workAreaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_area_subtype: payload.workAreaSubtype,
          owner: payload.owner,
          planned_progress: payload.plannedProgress,
          actual_progress: payload.actualProgress,
          description: payload.description,
        }),
      });
      return this.loadState();
    }

    async updateTask(taskId, payload) {
      await fetchJson(`${this.baseUrl}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          work_area_id: payload.workAreaId,
          assignee: payload.assignee,
          due_day: payload.dueDay,
          notes: payload.notes,
          status: payload.status,
          completion_ratio: payload.completionRatio,
        }),
      });
      return this.loadState();
    }

    async updateIssue(issueId, payload) {
      await fetchJson(`${this.baseUrl}/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          work_area_id: payload.workAreaId,
          owner: payload.owner,
          due_day: payload.dueDay,
          severity: payload.severity,
          description: payload.description,
          status: payload.status,
        }),
      });
      return this.loadState();
    }

    async updateReport(reportId, payload) {
      await fetchJson(`${this.baseUrl}/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: payload.author,
          work_area_ids: payload.workAreaIds,
          completed_summary: payload.completedSummary,
          next_plan: payload.nextPlan,
        }),
      });
      return this.loadState();
    }

    async advanceDay() {
      await fetchJson(`${this.baseUrl}/system/advance-day`, { method: "POST" });
      return this.loadState();
    }

    async createDemoTask() {
      await fetchJson(`${this.baseUrl}/system/demo-task`, { method: "POST" });
      return this.loadState();
    }

    async createDemoIssue() {
      await fetchJson(`${this.baseUrl}/system/demo-issue`, { method: "POST" });
      return this.loadState();
    }

    async createDemoReport() {
      await fetchJson(`${this.baseUrl}/system/demo-report`, { method: "POST" });
      return this.loadState();
    }

    async resetState() {
      await fetchJson(`${this.baseUrl}/system/reset-demo`, { method: "POST" });
      return this.loadState();
    }

    async getWorkAreaSpatial(workAreaId) {
      return fetchJson(`${this.baseUrl}/work-areas/${workAreaId}/spatial`);
    }

    async getQuantitySpatial(quantityId) {
      return fetchJson(`${this.baseUrl}/quantities/${quantityId}/spatial`);
    }

    async getWorkAreaHistory(workAreaId) {
      return fetchJson(`${this.baseUrl}/work-areas/${workAreaId}/history`);
    }

    async getTaskHistory(taskId) {
      return fetchJson(`${this.baseUrl}/tasks/${taskId}/history`);
    }

    async getIssueHistory(issueId) {
      return fetchJson(`${this.baseUrl}/issues/${issueId}/history`);
    }

    async getQuantityHistory(quantityId) {
      return fetchJson(`${this.baseUrl}/quantities/${quantityId}/history`);
    }

    async _loadResourceState() {
      const [summary, workAreas, tasks, issues, reports, quantities, designQuantities, designSpatialObjects, terrainRawObjects, terrainChangeSets, resourceLogs, logs] = await Promise.all([
        fetchJson(`${this.baseUrl}/dashboard/summary`),
        fetchJson(`${this.baseUrl}/work-areas`),
        fetchJson(`${this.baseUrl}/tasks`),
        fetchJson(`${this.baseUrl}/issues`),
        fetchJson(`${this.baseUrl}/reports`),
        fetchJson(`${this.baseUrl}/quantities`),
        fetchJson(`${this.baseUrl}/design-quantities`),
        fetchJson(`${this.baseUrl}/design-spatial-objects`),
        fetchJson(`${this.baseUrl}/terrain/raw-objects`),
        fetchJson(`${this.baseUrl}/terrain-change-sets`),
        fetchJson(`${this.baseUrl}/resource-logs`),
        fetchJson(`${this.baseUrl}/logs?limit=20`),
      ]);

      const mappedTasks = tasks.map(mapTask);
      const mappedIssues = issues.map(mapIssue);

      return {
        currentDay: summary.current_day ?? 0,
        sequence: 0,
        logs: logs.map((item) => `[API] ${item.message}`),
        workAreas: workAreas.map(mapWorkArea),
        tasks: mappedTasks,
        issues: mappedIssues,
        reports: reports.map(mapReport),
        quantities: quantities.map(mapQuantity),
        designQuantities: designQuantities.map(mapDesignQuantity),
        designSpatialObjects: designSpatialObjects.map(mapDesignSpatialObject),
        terrainRawObjects: terrainRawObjects.map(mapTerrainRawObject),
        terrainChangeSets: terrainChangeSets.map(mapTerrainChangeSet),
        resourceLogs: resourceLogs.map(mapResourceLog),
      };
    }
  }

  async function createAdapter() {
    if (config.dataMode === "api" && config.apiBaseUrl) {
      const remote = new RemoteAdapter(config.apiBaseUrl);
      try {
        await remote.loadState();
        return remote;
      } catch (error) {
        console.warn("Remote adapter unavailable, falling back to local mode", error);
      }
    }
    return new LocalAdapter();
  }

  global.SiteAssistantApi = {
    buildDemoState,
    TaskStatus,
    IssueStatus,
    IssueSeverity,
    createAdapter,
  };

  function deriveWorkAreaStatus(plannedProgress, actualProgress) {
    if (actualProgress >= 1) {
      return "done";
    }
    if (actualProgress <= 0 && plannedProgress <= 0) {
      return "not_started";
    }
    if (actualProgress + 0.05 < plannedProgress) {
      return "delayed";
    }
    return "in_progress";
  }

  function deriveQuantityStatus(plannedQuantity, actualQuantity) {
    if (plannedQuantity > 0 && actualQuantity >= plannedQuantity) {
      return "done";
    }
    if (actualQuantity <= 0) {
      return "not_started";
    }
    return "in_progress";
  }
})(window);
