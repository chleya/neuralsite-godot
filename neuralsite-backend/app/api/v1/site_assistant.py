"""
Site Assistant API routes for the MVP web client.
"""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from fastapi.responses import PlainTextResponse

from app.services.site_assistant_service import site_assistant_service


router = APIRouter(tags=["site-assistant"])
legacy_router = APIRouter(prefix="/site-assistant", tags=["site-assistant-legacy"])


class EntryCreatePayload(BaseModel):
    type: Literal["task", "issue", "report"]
    title: str = Field(min_length=1, max_length=200)
    owner: str = ""
    workAreaId: str = "wa_road_001"
    notes: str = ""


class TaskCreatePayload(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    work_area_id: str
    assignee: str = ""
    due_day: int | None = None
    notes: str = ""


class WorkAreaCreatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    type: Literal["road", "bridge", "drainage", "traffic_safety", "greening", "temporary", "general"] = "general"
    work_area_subtype: str = ""
    owner: str = ""
    planned_progress: float = Field(default=0.0, ge=0.0, le=1.0)
    actual_progress: float = Field(default=0.0, ge=0.0, le=1.0)
    description: str = ""


class WorkAreaUpdatePayload(BaseModel):
    work_area_subtype: str | None = None
    owner: str | None = None
    planned_progress: float | None = Field(default=None, ge=0.0, le=1.0)
    actual_progress: float | None = Field(default=None, ge=0.0, le=1.0)
    description: str | None = None


class TaskStatusPayload(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    work_area_id: str | None = None
    assignee: str | None = None
    due_day: int | None = None
    notes: str | None = None
    status: Literal["planned", "in_progress", "blocked", "done"] | None = None
    completion_ratio: float | None = Field(default=None, ge=0.0, le=1.0)


class IssueCreatePayload(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    work_area_id: str
    owner: str = ""
    severity: Literal["low", "medium", "high", "critical"] = "medium"
    due_day: int | None = None
    description: str = ""


class IssueStatusPayload(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    work_area_id: str | None = None
    owner: str | None = None
    severity: Literal["low", "medium", "high", "critical"] | None = None
    due_day: int | None = None
    description: str | None = None
    status: Literal["open", "in_progress", "waiting_review", "closed"] | None = None


class ReportCreatePayload(BaseModel):
    author: str = Field(min_length=1, max_length=100)
    work_area_ids: list[str]
    completed_summary: str = Field(min_length=1, max_length=500)
    next_plan: str = ""
    weather: str = ""
    labor_count: int = 0
    machine_count: int = 0
    notes: str = ""


class ReportUpdatePayload(BaseModel):
    author: str | None = Field(default=None, min_length=1, max_length=100)
    work_area_ids: list[str] | None = None
    completed_summary: str | None = Field(default=None, min_length=1, max_length=500)
    next_plan: str | None = None
    weather: str | None = None
    labor_count: int | None = None
    machine_count: int | None = None
    notes: str | None = None


class QuantityCreatePayload(BaseModel):
    work_area_id: str
    item_name: str = Field(min_length=1, max_length=200)
    item_code: str = ""
    category: str = "general"
    unit: str = "m3"
    planned_quantity: float = 0.0
    actual_quantity: float = 0.0
    notes: str = ""


class QuantityUpdatePayload(BaseModel):
    work_area_id: str | None = None
    item_name: str | None = Field(default=None, min_length=1, max_length=200)
    item_code: str | None = None
    category: str | None = None
    unit: str | None = None
    planned_quantity: float | None = None
    actual_quantity: float | None = None
    notes: str | None = None


class DesignQuantityCreatePayload(BaseModel):
    work_area_id: str
    item_name: str = Field(min_length=1, max_length=200)
    item_code: str = ""
    category: str = "general"
    unit: str = "m3"
    target_quantity: float = 0.0
    design_version: str = ""
    notes: str = ""


class DesignQuantityUpdatePayload(BaseModel):
    work_area_id: str | None = None
    item_name: str | None = Field(default=None, min_length=1, max_length=200)
    item_code: str | None = None
    category: str | None = None
    unit: str | None = None
    target_quantity: float | None = None
    design_version: str | None = None
    notes: str | None = None


class DesignSpatialObjectCreatePayload(BaseModel):
    work_area_id: str
    name: str = Field(min_length=1, max_length=200)
    design_type: Literal["alignment", "surface", "zone", "reference"]
    coord_system: Literal["local", "station", "world"] = "local"
    station_start: float | None = None
    station_end: float | None = None
    bbox_min_x: float | None = None
    bbox_min_y: float | None = None
    bbox_min_z: float | None = None
    bbox_max_x: float | None = None
    bbox_max_y: float | None = None
    bbox_max_z: float | None = None
    design_ref: str = ""
    elevation_target: float | None = None
    design_version: str = ""
    notes: str = ""


class DesignSpatialObjectUpdatePayload(BaseModel):
    work_area_id: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=200)
    design_type: Literal["alignment", "surface", "zone", "reference"] | None = None
    coord_system: Literal["local", "station", "world"] | None = None
    station_start: float | None = None
    station_end: float | None = None
    bbox_min_x: float | None = None
    bbox_min_y: float | None = None
    bbox_min_z: float | None = None
    bbox_max_x: float | None = None
    bbox_max_y: float | None = None
    bbox_max_z: float | None = None
    design_ref: str | None = None
    elevation_target: float | None = None
    design_version: str | None = None
    notes: str | None = None


class TerrainRawObjectCreatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    terrain_type: str = "site"
    coord_system: Literal["local", "station", "world"] = "local"
    bbox_min_x: float | None = None
    bbox_min_y: float | None = None
    bbox_min_z: float | None = None
    bbox_max_x: float | None = None
    bbox_max_y: float | None = None
    bbox_max_z: float | None = None
    heightmap_ref: str = ""
    mesh_ref: str = ""
    texture_ref: str = ""
    source: str = "manual"
    resolution: str = ""
    notes: str = ""


class TerrainRawObjectUpdatePayload(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    terrain_type: str | None = None
    coord_system: Literal["local", "station", "world"] | None = None
    bbox_min_x: float | None = None
    bbox_min_y: float | None = None
    bbox_min_z: float | None = None
    bbox_max_x: float | None = None
    bbox_max_y: float | None = None
    bbox_max_z: float | None = None
    heightmap_ref: str | None = None
    mesh_ref: str | None = None
    texture_ref: str | None = None
    source: str | None = None
    resolution: str | None = None
    notes: str | None = None


class TerrainChangeSetCreatePayload(BaseModel):
    work_area_id: str
    quantity_id: str = ""
    spatial_raw_object_id: str = ""
    terrain_raw_object_id: str = ""
    change_type: str = "fill"
    result_ref: str = ""
    record_day: int | None = None
    notes: str = ""


class TerrainChangeSetUpdatePayload(BaseModel):
    work_area_id: str | None = None
    quantity_id: str | None = None
    spatial_raw_object_id: str | None = None
    terrain_raw_object_id: str | None = None
    change_type: str | None = None
    result_ref: str | None = None
    record_day: int | None = None
    notes: str | None = None


class ResourceLogCreatePayload(BaseModel):
    work_area_id: str
    resource_type: Literal["labor", "machine", "material"]
    resource_category: Literal["labor", "machine", "material"] | None = None
    resource_subtype: str = ""
    resource_name: str = Field(min_length=1, max_length=200)
    quantity: float = 0.0
    unit: str = ""
    record_day: int | None = None
    team_name: str = ""
    specification: str = ""
    source_type: Literal["manual", "daily_report", "imported"] = "manual"
    supplier: str = ""
    notes: str = ""


class ResourceLogUpdatePayload(BaseModel):
    work_area_id: str | None = None
    resource_type: Literal["labor", "machine", "material"] | None = None
    resource_category: Literal["labor", "machine", "material"] | None = None
    resource_subtype: str | None = None
    resource_name: str | None = Field(default=None, min_length=1, max_length=200)
    quantity: float | None = None
    unit: str | None = None
    record_day: int | None = None
    team_name: str | None = None
    specification: str | None = None
    source_type: Literal["manual", "daily_report", "imported"] | None = None
    supplier: str | None = None
    notes: str | None = None


class BulkImportPayload(BaseModel):
    text: str = Field(min_length=1)


class SpatialRawObjectCreatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    raw_type: Literal["point", "line", "range", "bbox", "reference"]
    coord_system: Literal["local", "station", "world"] = "local"
    center_x: float | None = None
    center_y: float | None = None
    center_z: float | None = None
    station_start: float | None = None
    station_end: float | None = None
    bbox_min_x: float | None = None
    bbox_min_y: float | None = None
    bbox_min_z: float | None = None
    bbox_max_x: float | None = None
    bbox_max_y: float | None = None
    bbox_max_z: float | None = None
    geometry_ref: str = ""
    source: str = "manual"
    notes: str = ""


class SpatialRawObjectUpdatePayload(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    raw_type: Literal["point", "line", "range", "bbox", "reference"] | None = None
    coord_system: Literal["local", "station", "world"] | None = None
    center_x: float | None = None
    center_y: float | None = None
    center_z: float | None = None
    station_start: float | None = None
    station_end: float | None = None
    bbox_min_x: float | None = None
    bbox_min_y: float | None = None
    bbox_min_z: float | None = None
    bbox_max_x: float | None = None
    bbox_max_y: float | None = None
    bbox_max_z: float | None = None
    geometry_ref: str | None = None
    source: str | None = None
    notes: str | None = None


class SpatialBindingCreatePayload(BaseModel):
    target_type: Literal["work_area", "quantity"]
    target_id: str
    spatial_raw_object_id: str
    binding_role: Literal["primary", "coverage", "display"] = "primary"
    semantic_role: str = ""


class SpatialBindingUpdatePayload(BaseModel):
    target_type: Literal["work_area", "quantity"] | None = None
    target_id: str | None = None
    spatial_raw_object_id: str | None = None
    binding_role: Literal["primary", "coverage", "display"] | None = None
    semantic_role: str | None = None


@router.get("/dashboard/summary")
async def get_dashboard_summary() -> dict:
    return site_assistant_service.get_summary()


@router.get("/imports/{dataset}/template", response_class=PlainTextResponse)
async def download_import_template(
    dataset: Literal["work_areas", "quantities", "design_quantities", "resource_logs", "daily_reports", "design_spatial_objects", "terrain_change_sets"],
) -> str:
    try:
        return site_assistant_service.get_import_template(dataset)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/exports/{dataset}", response_class=PlainTextResponse)
async def download_export_dataset(
    dataset: Literal["work_areas", "quantities", "design_quantities", "resource_logs", "daily_reports", "design_spatial_objects", "terrain_change_sets"],
) -> str:
    try:
        return site_assistant_service.export_tabular_data(dataset)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/imports/{dataset}")
async def import_dataset_rows(
    dataset: Literal["work_areas", "quantities", "design_quantities", "resource_logs", "daily_reports", "design_spatial_objects", "terrain_change_sets"],
    payload: BulkImportPayload,
) -> dict:
    try:
        return site_assistant_service.import_tabular_data(dataset, payload.text)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/work-areas")
async def list_work_areas() -> list[dict]:
    return site_assistant_service.list_work_areas()


@router.get("/spatial/raw-objects")
async def list_spatial_raw_objects(
    raw_type: str | None = None,
    coord_system: str | None = None,
) -> list[dict]:
    return site_assistant_service.list_spatial_raw_objects(
        raw_type=raw_type,
        coord_system=coord_system,
    )


@router.post("/spatial/raw-objects")
async def create_spatial_raw_object(payload: SpatialRawObjectCreatePayload) -> dict:
    return site_assistant_service.create_spatial_raw_object(
        name=payload.name,
        raw_type=payload.raw_type,
        coord_system=payload.coord_system,
        center_x=payload.center_x,
        center_y=payload.center_y,
        center_z=payload.center_z,
        station_start=payload.station_start,
        station_end=payload.station_end,
        bbox_min_x=payload.bbox_min_x,
        bbox_min_y=payload.bbox_min_y,
        bbox_min_z=payload.bbox_min_z,
        bbox_max_x=payload.bbox_max_x,
        bbox_max_y=payload.bbox_max_y,
        bbox_max_z=payload.bbox_max_z,
        geometry_ref=payload.geometry_ref,
        source=payload.source,
        notes=payload.notes,
    )


@router.patch("/spatial/raw-objects/{spatial_raw_object_id}")
async def update_spatial_raw_object(spatial_raw_object_id: str, payload: SpatialRawObjectUpdatePayload) -> dict:
    raw_object = site_assistant_service.update_spatial_raw_object(
        spatial_raw_object_id,
        name=payload.name,
        raw_type=payload.raw_type,
        coord_system=payload.coord_system,
        center_x=payload.center_x,
        center_y=payload.center_y,
        center_z=payload.center_z,
        station_start=payload.station_start,
        station_end=payload.station_end,
        bbox_min_x=payload.bbox_min_x,
        bbox_min_y=payload.bbox_min_y,
        bbox_min_z=payload.bbox_min_z,
        bbox_max_x=payload.bbox_max_x,
        bbox_max_y=payload.bbox_max_y,
        bbox_max_z=payload.bbox_max_z,
        geometry_ref=payload.geometry_ref,
        source=payload.source,
        notes=payload.notes,
    )
    if raw_object is None:
        raise HTTPException(status_code=404, detail="Spatial raw object not found")
    return raw_object


@router.get("/spatial/bindings")
async def list_spatial_bindings(
    target_type: str | None = None,
    target_id: str | None = None,
    spatial_raw_object_id: str | None = None,
) -> list[dict]:
    return site_assistant_service.list_spatial_bindings(
        target_type=target_type,
        target_id=target_id,
        spatial_raw_object_id=spatial_raw_object_id,
    )


@router.post("/spatial/bindings")
async def create_spatial_binding(payload: SpatialBindingCreatePayload) -> dict:
    return site_assistant_service.create_spatial_binding(
        target_type=payload.target_type,
        target_id=payload.target_id,
        spatial_raw_object_id=payload.spatial_raw_object_id,
        binding_role=payload.binding_role,
        semantic_role=payload.semantic_role,
    )


@router.patch("/spatial/bindings/{spatial_binding_id}")
async def update_spatial_binding(spatial_binding_id: str, payload: SpatialBindingUpdatePayload) -> dict:
    binding = site_assistant_service.update_spatial_binding(
        spatial_binding_id,
        target_type=payload.target_type,
        target_id=payload.target_id,
        spatial_raw_object_id=payload.spatial_raw_object_id,
        binding_role=payload.binding_role,
        semantic_role=payload.semantic_role,
    )
    if binding is None:
        raise HTTPException(status_code=404, detail="Spatial binding not found")
    return binding


@router.post("/work-areas")
async def create_work_area(payload: WorkAreaCreatePayload) -> dict:
    return site_assistant_service.create_work_area(
        name=payload.name,
        work_area_type=payload.type,
        work_area_subtype=payload.work_area_subtype,
        owner=payload.owner,
        planned_progress=payload.planned_progress,
        actual_progress=payload.actual_progress,
        description=payload.description,
    )


@router.get("/work-areas/{work_area_id}")
async def get_work_area(work_area_id: str) -> dict:
    work_area = site_assistant_service.get_work_area(work_area_id)
    if work_area is None:
        raise HTTPException(status_code=404, detail="Work area not found")
    return work_area


@router.get("/work-areas/{work_area_id}/history")
async def get_work_area_history(work_area_id: str) -> list[dict]:
    work_area = site_assistant_service.get_work_area(work_area_id)
    if work_area is None:
        raise HTTPException(status_code=404, detail="Work area not found")
    return site_assistant_service.list_work_area_progress_history(work_area_id)


@router.get("/work-areas/{work_area_id}/spatial")
async def get_work_area_spatial(work_area_id: str) -> dict:
    payload = site_assistant_service.get_work_area_spatial(work_area_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Work area not found")
    return payload


@router.patch("/work-areas/{work_area_id}")
async def update_work_area(work_area_id: str, payload: WorkAreaUpdatePayload) -> dict:
    work_area = site_assistant_service.update_work_area(
        work_area_id,
        work_area_subtype=payload.work_area_subtype,
        owner=payload.owner,
        planned_progress=payload.planned_progress,
        actual_progress=payload.actual_progress,
        description=payload.description,
    )
    if work_area is None:
        raise HTTPException(status_code=404, detail="Work area not found")
    return work_area


@router.get("/tasks")
async def list_tasks(
    status: str | None = None,
    work_area_id: str | None = None,
    assignee: str | None = None,
    overdue: bool | None = Query(default=None),
) -> list[dict]:
    return site_assistant_service.list_tasks(
        status=status,
        work_area_id=work_area_id,
        assignee=assignee,
        overdue=overdue,
    )


@router.get("/tasks/{task_id}")
async def get_task(task_id: str) -> dict:
    task = site_assistant_service.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/tasks/{task_id}/history")
async def get_task_history(task_id: str) -> list[dict]:
    task = site_assistant_service.get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return site_assistant_service.list_task_status_history(task_id)


@router.post("/tasks")
async def create_task(payload: TaskCreatePayload) -> dict:
    return site_assistant_service.create_task(
        title=payload.title,
        work_area_id=payload.work_area_id,
        assignee=payload.assignee,
        due_day=payload.due_day,
        notes=payload.notes,
    )


@router.patch("/tasks/{task_id}")
async def update_task(task_id: str, payload: TaskStatusPayload) -> dict:
    task = site_assistant_service.update_task(
        task_id,
        title=payload.title,
        work_area_id=payload.work_area_id,
        assignee=payload.assignee,
        due_day=payload.due_day,
        notes=payload.notes,
        status=payload.status,
        completion_ratio=payload.completion_ratio,
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/issues")
async def list_issues(
    status: str | None = None,
    severity: str | None = None,
    work_area_id: str | None = None,
    overdue: bool | None = Query(default=None),
) -> list[dict]:
    return site_assistant_service.list_issues(
        status=status,
        severity=severity,
        work_area_id=work_area_id,
        overdue=overdue,
    )


@router.get("/issues/{issue_id}")
async def get_issue(issue_id: str) -> dict:
    issue = site_assistant_service.get_issue(issue_id)
    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.get("/issues/{issue_id}/history")
async def get_issue_history(issue_id: str) -> list[dict]:
    issue = site_assistant_service.get_issue(issue_id)
    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return site_assistant_service.list_issue_status_history(issue_id)


@router.post("/issues")
async def create_issue(payload: IssueCreatePayload) -> dict:
    return site_assistant_service.create_issue(
        title=payload.title,
        work_area_id=payload.work_area_id,
        owner=payload.owner,
        severity=payload.severity,
        due_day=payload.due_day,
        description=payload.description,
    )


@router.patch("/issues/{issue_id}")
async def update_issue(issue_id: str, payload: IssueStatusPayload) -> dict:
    issue = site_assistant_service.update_issue(
        issue_id,
        title=payload.title,
        work_area_id=payload.work_area_id,
        owner=payload.owner,
        severity=payload.severity,
        due_day=payload.due_day,
        description=payload.description,
        status=payload.status,
    )
    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.get("/reports")
async def list_reports(
    report_day: int | None = None,
    work_area_id: str | None = None,
    author: str | None = None,
) -> list[dict]:
    return site_assistant_service.list_reports(
        report_day=report_day,
        work_area_id=work_area_id,
        author=author,
    )


@router.get("/reports/{report_id}")
async def get_report(report_id: str) -> dict:
    report = site_assistant_service.get_report(report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/reports")
async def create_report(payload: ReportCreatePayload) -> dict:
    return site_assistant_service.create_report(
        author=payload.author,
        work_area_ids=payload.work_area_ids,
        completed_summary=payload.completed_summary,
        next_plan=payload.next_plan,
        weather=payload.weather,
        labor_count=payload.labor_count,
        machine_count=payload.machine_count,
        notes=payload.notes,
    )


@router.patch("/reports/{report_id}")
async def update_report(report_id: str, payload: ReportUpdatePayload) -> dict:
    report = site_assistant_service.update_report(
        report_id,
        author=payload.author,
        work_area_ids=payload.work_area_ids,
        completed_summary=payload.completed_summary,
        next_plan=payload.next_plan,
        weather=payload.weather,
        labor_count=payload.labor_count,
        machine_count=payload.machine_count,
        notes=payload.notes,
    )
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/quantities")
async def list_quantities(
    work_area_id: str | None = None,
    category: str | None = None,
    status: str | None = None,
) -> list[dict]:
    return site_assistant_service.list_quantities(
        work_area_id=work_area_id,
        category=category,
        status=status,
    )


@router.get("/quantities-summary")
async def get_quantity_summary(work_area_id: str | None = None) -> dict:
    return site_assistant_service.get_quantity_summary(work_area_id=work_area_id)


@router.get("/design-quantities")
async def list_design_quantities(
    work_area_id: str | None = None,
    category: str | None = None,
    design_version: str | None = None,
) -> list[dict]:
    return site_assistant_service.list_design_quantities(
        work_area_id=work_area_id,
        category=category,
        design_version=design_version,
    )


@router.get("/design-quantities-summary")
async def get_design_quantity_summary(work_area_id: str | None = None) -> dict:
    return site_assistant_service.get_design_quantity_summary(work_area_id=work_area_id)


@router.get("/design-quantities/{design_quantity_id}")
async def get_design_quantity(design_quantity_id: str) -> dict:
    quantity = site_assistant_service.get_design_quantity(design_quantity_id)
    if quantity is None:
        raise HTTPException(status_code=404, detail="Design quantity not found")
    return quantity


@router.get("/design-spatial-objects")
async def list_design_spatial_objects(
    work_area_id: str | None = None,
    design_type: str | None = None,
    design_version: str | None = None,
) -> list[dict]:
    return site_assistant_service.list_design_spatial_objects(
        work_area_id=work_area_id,
        design_type=design_type,
        design_version=design_version,
    )


@router.get("/design-spatial-objects/{design_spatial_object_id}")
async def get_design_spatial_object(design_spatial_object_id: str) -> dict:
    design_spatial_object = site_assistant_service.get_design_spatial_object(design_spatial_object_id)
    if design_spatial_object is None:
        raise HTTPException(status_code=404, detail="Design spatial object not found")
    return design_spatial_object


@router.get("/work-areas/{work_area_id}/design-spatial")
async def get_work_area_design_spatial(work_area_id: str) -> dict:
    payload = site_assistant_service.get_work_area_design_spatial(work_area_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Work area not found")
    return payload


@router.get("/terrain/raw-objects")
async def list_terrain_raw_objects(
    terrain_type: str | None = None,
    coord_system: str | None = None,
) -> list[dict]:
    return site_assistant_service.list_terrain_raw_objects(
        terrain_type=terrain_type,
        coord_system=coord_system,
    )


@router.get("/terrain/raw-objects/{terrain_raw_object_id}")
async def get_terrain_raw_object(terrain_raw_object_id: str) -> dict:
    payload = site_assistant_service.get_terrain_payload(terrain_raw_object_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Terrain raw object not found")
    return payload


@router.post("/terrain/raw-objects")
async def create_terrain_raw_object(payload: TerrainRawObjectCreatePayload) -> dict:
    return site_assistant_service.create_terrain_raw_object(
        name=payload.name,
        terrain_type=payload.terrain_type,
        coord_system=payload.coord_system,
        bbox_min_x=payload.bbox_min_x,
        bbox_min_y=payload.bbox_min_y,
        bbox_min_z=payload.bbox_min_z,
        bbox_max_x=payload.bbox_max_x,
        bbox_max_y=payload.bbox_max_y,
        bbox_max_z=payload.bbox_max_z,
        heightmap_ref=payload.heightmap_ref,
        mesh_ref=payload.mesh_ref,
        texture_ref=payload.texture_ref,
        source=payload.source,
        resolution=payload.resolution,
        notes=payload.notes,
    )


@router.patch("/terrain/raw-objects/{terrain_raw_object_id}")
async def update_terrain_raw_object(terrain_raw_object_id: str, payload: TerrainRawObjectUpdatePayload) -> dict:
    terrain = site_assistant_service.update_terrain_raw_object(
        terrain_raw_object_id,
        name=payload.name,
        terrain_type=payload.terrain_type,
        coord_system=payload.coord_system,
        bbox_min_x=payload.bbox_min_x,
        bbox_min_y=payload.bbox_min_y,
        bbox_min_z=payload.bbox_min_z,
        bbox_max_x=payload.bbox_max_x,
        bbox_max_y=payload.bbox_max_y,
        bbox_max_z=payload.bbox_max_z,
        heightmap_ref=payload.heightmap_ref,
        mesh_ref=payload.mesh_ref,
        texture_ref=payload.texture_ref,
        source=payload.source,
        resolution=payload.resolution,
        notes=payload.notes,
    )
    if terrain is None:
        raise HTTPException(status_code=404, detail="Terrain raw object not found")
    return terrain


@router.get("/terrain-change-sets")
async def list_terrain_change_sets(
    work_area_id: str | None = None,
    change_type: str | None = None,
    record_day: int | None = None,
) -> list[dict]:
    return site_assistant_service.list_terrain_change_sets(
        work_area_id=work_area_id,
        change_type=change_type,
        record_day=record_day,
    )


@router.get("/terrain-change-sets/{terrain_change_set_id}")
async def get_terrain_change_set(terrain_change_set_id: str) -> dict:
    terrain_change_set = site_assistant_service.get_terrain_change_set(terrain_change_set_id)
    if terrain_change_set is None:
        raise HTTPException(status_code=404, detail="Terrain change set not found")
    return terrain_change_set


@router.get("/work-areas/{work_area_id}/terrain-changes")
async def get_work_area_terrain_changes(work_area_id: str) -> dict:
    payload = site_assistant_service.get_work_area_terrain_changes(work_area_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Work area not found")
    return payload


@router.post("/terrain-change-sets")
async def create_terrain_change_set(payload: TerrainChangeSetCreatePayload) -> dict:
    return site_assistant_service.create_terrain_change_set(
        work_area_id=payload.work_area_id,
        quantity_id=payload.quantity_id,
        spatial_raw_object_id=payload.spatial_raw_object_id,
        terrain_raw_object_id=payload.terrain_raw_object_id,
        change_type=payload.change_type,
        result_ref=payload.result_ref,
        record_day=payload.record_day,
        notes=payload.notes,
    )


@router.patch("/terrain-change-sets/{terrain_change_set_id}")
async def update_terrain_change_set(terrain_change_set_id: str, payload: TerrainChangeSetUpdatePayload) -> dict:
    terrain_change_set = site_assistant_service.update_terrain_change_set(
        terrain_change_set_id,
        work_area_id=payload.work_area_id,
        quantity_id=payload.quantity_id,
        spatial_raw_object_id=payload.spatial_raw_object_id,
        terrain_raw_object_id=payload.terrain_raw_object_id,
        change_type=payload.change_type,
        result_ref=payload.result_ref,
        record_day=payload.record_day,
        notes=payload.notes,
    )
    if terrain_change_set is None:
        raise HTTPException(status_code=404, detail="Terrain change set not found")
    return terrain_change_set


@router.post("/design-spatial-objects")
async def create_design_spatial_object(payload: DesignSpatialObjectCreatePayload) -> dict:
    return site_assistant_service.create_design_spatial_object(
        work_area_id=payload.work_area_id,
        name=payload.name,
        design_type=payload.design_type,
        coord_system=payload.coord_system,
        station_start=payload.station_start,
        station_end=payload.station_end,
        bbox_min_x=payload.bbox_min_x,
        bbox_min_y=payload.bbox_min_y,
        bbox_min_z=payload.bbox_min_z,
        bbox_max_x=payload.bbox_max_x,
        bbox_max_y=payload.bbox_max_y,
        bbox_max_z=payload.bbox_max_z,
        design_ref=payload.design_ref,
        elevation_target=payload.elevation_target,
        design_version=payload.design_version,
        notes=payload.notes,
    )


@router.patch("/design-spatial-objects/{design_spatial_object_id}")
async def update_design_spatial_object(design_spatial_object_id: str, payload: DesignSpatialObjectUpdatePayload) -> dict:
    design_spatial_object = site_assistant_service.update_design_spatial_object(
        design_spatial_object_id,
        work_area_id=payload.work_area_id,
        name=payload.name,
        design_type=payload.design_type,
        coord_system=payload.coord_system,
        station_start=payload.station_start,
        station_end=payload.station_end,
        bbox_min_x=payload.bbox_min_x,
        bbox_min_y=payload.bbox_min_y,
        bbox_min_z=payload.bbox_min_z,
        bbox_max_x=payload.bbox_max_x,
        bbox_max_y=payload.bbox_max_y,
        bbox_max_z=payload.bbox_max_z,
        design_ref=payload.design_ref,
        elevation_target=payload.elevation_target,
        design_version=payload.design_version,
        notes=payload.notes,
    )
    if design_spatial_object is None:
        raise HTTPException(status_code=404, detail="Design spatial object not found")
    return design_spatial_object


@router.post("/design-quantities")
async def create_design_quantity(payload: DesignQuantityCreatePayload) -> dict:
    return site_assistant_service.create_design_quantity(
        work_area_id=payload.work_area_id,
        item_name=payload.item_name,
        item_code=payload.item_code,
        category=payload.category,
        unit=payload.unit,
        target_quantity=payload.target_quantity,
        design_version=payload.design_version,
        notes=payload.notes,
    )


@router.patch("/design-quantities/{design_quantity_id}")
async def update_design_quantity(design_quantity_id: str, payload: DesignQuantityUpdatePayload) -> dict:
    quantity = site_assistant_service.update_design_quantity(
        design_quantity_id,
        work_area_id=payload.work_area_id,
        item_name=payload.item_name,
        item_code=payload.item_code,
        category=payload.category,
        unit=payload.unit,
        target_quantity=payload.target_quantity,
        design_version=payload.design_version,
        notes=payload.notes,
    )
    if quantity is None:
        raise HTTPException(status_code=404, detail="Design quantity not found")
    return quantity


@router.get("/resource-logs")
async def list_resource_logs(
    work_area_id: str | None = None,
    resource_type: str | None = None,
    resource_category: str | None = None,
    record_day: int | None = None,
) -> list[dict]:
    return site_assistant_service.list_resource_logs(
        work_area_id=work_area_id,
        resource_type=resource_type,
        resource_category=resource_category,
        record_day=record_day,
    )


@router.get("/resource-logs-summary")
async def get_resource_logs_summary(
    work_area_id: str | None = None,
    record_day: int | None = None,
) -> dict:
    return site_assistant_service.get_resource_summary(
        work_area_id=work_area_id,
        record_day=record_day,
    )


@router.get("/resource-logs/{resource_log_id}")
async def get_resource_log(resource_log_id: str) -> dict:
    resource_log = site_assistant_service.get_resource_log(resource_log_id)
    if resource_log is None:
        raise HTTPException(status_code=404, detail="Resource log not found")
    return resource_log


@router.post("/resource-logs")
async def create_resource_log(payload: ResourceLogCreatePayload) -> dict:
    return site_assistant_service.create_resource_log(
        work_area_id=payload.work_area_id,
        resource_type=payload.resource_type,
        resource_category=payload.resource_category,
        resource_subtype=payload.resource_subtype,
        resource_name=payload.resource_name,
        quantity=payload.quantity,
        unit=payload.unit,
        record_day=payload.record_day,
        team_name=payload.team_name,
        specification=payload.specification,
        source_type=payload.source_type,
        supplier=payload.supplier,
        notes=payload.notes,
    )


@router.patch("/resource-logs/{resource_log_id}")
async def update_resource_log(resource_log_id: str, payload: ResourceLogUpdatePayload) -> dict:
    resource_log = site_assistant_service.update_resource_log(
        resource_log_id,
        work_area_id=payload.work_area_id,
        resource_type=payload.resource_type,
        resource_category=payload.resource_category,
        resource_subtype=payload.resource_subtype,
        resource_name=payload.resource_name,
        quantity=payload.quantity,
        unit=payload.unit,
        record_day=payload.record_day,
        team_name=payload.team_name,
        specification=payload.specification,
        source_type=payload.source_type,
        supplier=payload.supplier,
        notes=payload.notes,
    )
    if resource_log is None:
        raise HTTPException(status_code=404, detail="Resource log not found")
    return resource_log


@router.get("/quantities/{quantity_id}")
async def get_quantity(quantity_id: str) -> dict:
    quantity = site_assistant_service.get_quantity(quantity_id)
    if quantity is None:
        raise HTTPException(status_code=404, detail="Quantity not found")
    return quantity


@router.get("/quantities/{quantity_id}/history")
async def get_quantity_history(quantity_id: str) -> list[dict]:
    quantity = site_assistant_service.get_quantity(quantity_id)
    if quantity is None:
        raise HTTPException(status_code=404, detail="Quantity not found")
    return site_assistant_service.list_quantity_progress_history(quantity_id)


@router.get("/quantities/{quantity_id}/spatial")
async def get_quantity_spatial(quantity_id: str) -> dict:
    payload = site_assistant_service.get_quantity_spatial(quantity_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Quantity not found")
    return payload


@router.post("/quantities")
async def create_quantity(payload: QuantityCreatePayload) -> dict:
    return site_assistant_service.create_quantity(
        work_area_id=payload.work_area_id,
        item_name=payload.item_name,
        item_code=payload.item_code,
        category=payload.category,
        unit=payload.unit,
        planned_quantity=payload.planned_quantity,
        actual_quantity=payload.actual_quantity,
        notes=payload.notes,
    )


@router.patch("/quantities/{quantity_id}")
async def update_quantity(quantity_id: str, payload: QuantityUpdatePayload) -> dict:
    quantity = site_assistant_service.update_quantity(
        quantity_id,
        work_area_id=payload.work_area_id,
        item_name=payload.item_name,
        item_code=payload.item_code,
        category=payload.category,
        unit=payload.unit,
        planned_quantity=payload.planned_quantity,
        actual_quantity=payload.actual_quantity,
        notes=payload.notes,
    )
    if quantity is None:
        raise HTTPException(status_code=404, detail="Quantity not found")
    return quantity


@router.get("/logs")
async def list_logs(
    target_type: str | None = None,
    target_id: str | None = None,
    limit: int | None = Query(default=20, ge=1, le=200),
) -> list[dict]:
    return site_assistant_service.list_logs(
        target_type=target_type,
        target_id=target_id,
        limit=limit,
    )


@router.get("/system/state")
async def get_system_state() -> dict:
    return {"current_day": site_assistant_service.current_day}


@router.post("/system/advance-day")
async def advance_system_day() -> dict:
    return site_assistant_service.advance_day()


@router.post("/system/demo-task")
async def create_system_demo_task() -> dict:
    return site_assistant_service.create_demo_task()


@router.post("/system/demo-issue")
async def create_system_demo_issue() -> dict:
    return site_assistant_service.create_demo_issue()


@router.post("/system/demo-report")
async def create_system_demo_report() -> dict:
    return site_assistant_service.create_demo_report()


@router.post("/system/reset-demo")
async def reset_system_demo() -> dict:
    return site_assistant_service.reset_demo()


@legacy_router.get("/state")
async def get_legacy_state() -> dict:
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/entries")
async def create_legacy_entry(payload: EntryCreatePayload) -> dict:
    if payload.type == "task":
        site_assistant_service.create_task(
            title=payload.title,
            work_area_id=payload.workAreaId,
            assignee=payload.owner,
            notes=payload.notes,
        )
    elif payload.type == "issue":
        site_assistant_service.create_issue(
            title=payload.title,
            work_area_id=payload.workAreaId,
            owner=payload.owner,
            description=payload.notes,
        )
    else:
        site_assistant_service.create_report(
            author=payload.owner or "Daily Reporter",
            work_area_ids=[payload.workAreaId],
            completed_summary=payload.title,
            next_plan=payload.notes or "Continue next work package",
        )
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/complete-first-task")
async def complete_first_task() -> dict:
    tasks = site_assistant_service.list_tasks(status=None, overdue=None)
    if tasks:
        site_assistant_service.update_task(tasks[0]["id"], status="done", completion_ratio=1.0)
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/progress-first-issue")
async def progress_first_issue() -> dict:
    issues = [issue for issue in site_assistant_service.list_issues(status=None, overdue=None) if issue["status"] != "closed"]
    if issues:
        target = issues[0]
        next_status = "waiting_review" if target["status"] == "in_progress" else "in_progress"
        site_assistant_service.update_issue(target["id"], status=next_status)
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/close-first-issue")
async def close_first_issue() -> dict:
    issues = [issue for issue in site_assistant_service.list_issues(status=None, overdue=None) if issue["status"] != "closed"]
    if issues:
        site_assistant_service.update_issue(issues[0]["id"], status="closed")
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/advance-day")
async def advance_day() -> dict:
    site_assistant_service.advance_day()
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/demo-task")
async def create_demo_task() -> dict:
    site_assistant_service.create_demo_task()
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/demo-issue")
async def create_demo_issue() -> dict:
    site_assistant_service.create_demo_issue()
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/demo-report")
async def create_demo_report() -> dict:
    site_assistant_service.create_demo_report()
    return site_assistant_service.legacy_snapshot()


@legacy_router.post("/actions/reset-demo")
async def reset_demo() -> dict:
    site_assistant_service.reset_demo()
    return site_assistant_service.legacy_snapshot()


@legacy_router.patch("/tasks/{task_id}")
async def update_legacy_task(task_id: str, payload: dict) -> dict:
    task = site_assistant_service.update_task(
        task_id,
        status=payload["status"],
        completion_ratio=payload.get("completionRatio"),
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return site_assistant_service.legacy_snapshot()


@legacy_router.patch("/issues/{issue_id}")
async def update_legacy_issue(issue_id: str, payload: dict) -> dict:
    issue = site_assistant_service.update_issue(issue_id, status=payload["status"])
    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    return site_assistant_service.legacy_snapshot()
