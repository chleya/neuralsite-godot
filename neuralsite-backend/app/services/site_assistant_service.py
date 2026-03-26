from __future__ import annotations

import csv
import io
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterator

from app.core.config import settings


class SiteAssistantService:
    def __init__(self) -> None:
        base_dir = Path(__file__).resolve().parents[2]
        raw_path = Path(settings.SITE_ASSISTANT_DB_PATH)
        self.db_path = raw_path if raw_path.is_absolute() else (base_dir / raw_path).resolve()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._seed_if_needed()

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS work_areas (
                    id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'general',
                    work_area_subtype TEXT DEFAULT '',
                    owner TEXT DEFAULT '', planned_progress REAL NOT NULL DEFAULT 0.0,
                    actual_progress REAL NOT NULL DEFAULT 0.0, status TEXT NOT NULL DEFAULT 'not_started',
                    station_start REAL DEFAULT 0.0, station_end REAL DEFAULT 0.0, description TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL, title TEXT NOT NULL,
                    assignee TEXT DEFAULT '', planned_day INTEGER NOT NULL DEFAULT 0,
                    due_day INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'planned',
                    completion_ratio REAL NOT NULL DEFAULT 0.0, notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS issues (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL, title TEXT NOT NULL,
                    owner TEXT DEFAULT '', severity TEXT NOT NULL DEFAULT 'medium',
                    status TEXT NOT NULL DEFAULT 'open', due_day INTEGER NOT NULL DEFAULT 0,
                    description TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    closed_at TEXT DEFAULT NULL, FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS daily_reports (
                    id TEXT PRIMARY KEY, report_day INTEGER NOT NULL DEFAULT 0, author TEXT NOT NULL,
                    completed_summary TEXT NOT NULL, next_plan TEXT DEFAULT '', weather TEXT DEFAULT '',
                    labor_count INTEGER NOT NULL DEFAULT 0, machine_count INTEGER NOT NULL DEFAULT 0,
                    notes TEXT DEFAULT '', created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS engineering_quantities (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL, item_name TEXT NOT NULL,
                    item_code TEXT DEFAULT '', category TEXT DEFAULT 'general', unit TEXT NOT NULL DEFAULT 'm3',
                    planned_quantity REAL NOT NULL DEFAULT 0.0, actual_quantity REAL NOT NULL DEFAULT 0.0,
                    status TEXT NOT NULL DEFAULT 'not_started', notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS design_quantities (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL, item_name TEXT NOT NULL,
                    item_code TEXT DEFAULT '', category TEXT NOT NULL DEFAULT 'general',
                    unit TEXT NOT NULL DEFAULT 'm3', target_quantity REAL NOT NULL DEFAULT 0.0,
                    design_version TEXT DEFAULT '', notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS design_spatial_objects (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL, name TEXT NOT NULL,
                    design_type TEXT NOT NULL, coord_system TEXT NOT NULL DEFAULT 'local',
                    station_start REAL DEFAULT NULL, station_end REAL DEFAULT NULL,
                    bbox_min_x REAL DEFAULT NULL, bbox_min_y REAL DEFAULT NULL, bbox_min_z REAL DEFAULT NULL,
                    bbox_max_x REAL DEFAULT NULL, bbox_max_y REAL DEFAULT NULL, bbox_max_z REAL DEFAULT NULL,
                    design_ref TEXT DEFAULT '', elevation_target REAL DEFAULT NULL,
                    design_version TEXT DEFAULT '', notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS terrain_raw_objects (
                    id TEXT PRIMARY KEY, name TEXT NOT NULL, terrain_type TEXT NOT NULL,
                    coord_system TEXT NOT NULL DEFAULT 'local',
                    bbox_min_x REAL DEFAULT NULL, bbox_min_y REAL DEFAULT NULL, bbox_min_z REAL DEFAULT NULL,
                    bbox_max_x REAL DEFAULT NULL, bbox_max_y REAL DEFAULT NULL, bbox_max_z REAL DEFAULT NULL,
                    heightmap_ref TEXT DEFAULT '', mesh_ref TEXT DEFAULT '', texture_ref TEXT DEFAULT '',
                    source TEXT DEFAULT 'manual', resolution TEXT DEFAULT '', notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS terrain_display_objects (
                    id TEXT PRIMARY KEY, terrain_raw_object_id TEXT NOT NULL,
                    display_name TEXT DEFAULT '', display_ref TEXT DEFAULT '', material_ref TEXT DEFAULT '',
                    visible INTEGER NOT NULL DEFAULT 1, opacity REAL NOT NULL DEFAULT 1.0,
                    sort_order INTEGER NOT NULL DEFAULT 0, notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    FOREIGN KEY (terrain_raw_object_id) REFERENCES terrain_raw_objects(id)
                );
                CREATE TABLE IF NOT EXISTS terrain_change_sets (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL,
                    quantity_id TEXT DEFAULT '', spatial_raw_object_id TEXT DEFAULT '',
                    terrain_raw_object_id TEXT DEFAULT '', change_type TEXT NOT NULL DEFAULT 'fill',
                    result_ref TEXT DEFAULT '', record_day INTEGER NOT NULL DEFAULT 0,
                    recorded_at TEXT NOT NULL, notes TEXT DEFAULT '',
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS resource_logs (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL, resource_type TEXT NOT NULL,
                    resource_category TEXT NOT NULL DEFAULT 'labor',
                    resource_subtype TEXT DEFAULT '',
                    resource_name TEXT NOT NULL, quantity REAL NOT NULL DEFAULT 0.0,
                    unit TEXT NOT NULL DEFAULT '', record_day INTEGER NOT NULL DEFAULT 0,
                    team_name TEXT DEFAULT '', specification TEXT DEFAULT '',
                    source_type TEXT NOT NULL DEFAULT 'manual',
                    supplier TEXT DEFAULT '', notes TEXT DEFAULT '', created_at TEXT NOT NULL,
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS task_status_history (
                    id TEXT PRIMARY KEY, task_id TEXT NOT NULL,
                    old_status TEXT DEFAULT NULL, new_status TEXT NOT NULL,
                    old_completion_ratio REAL DEFAULT NULL, new_completion_ratio REAL DEFAULT NULL,
                    changed_at TEXT NOT NULL, operator TEXT DEFAULT 'system', note TEXT DEFAULT '',
                    FOREIGN KEY (task_id) REFERENCES tasks(id)
                );
                CREATE TABLE IF NOT EXISTS issue_status_history (
                    id TEXT PRIMARY KEY, issue_id TEXT NOT NULL,
                    old_status TEXT DEFAULT NULL, new_status TEXT NOT NULL,
                    old_severity TEXT DEFAULT NULL, new_severity TEXT DEFAULT NULL,
                    changed_at TEXT NOT NULL, operator TEXT DEFAULT 'system', note TEXT DEFAULT '',
                    FOREIGN KEY (issue_id) REFERENCES issues(id)
                );
                CREATE TABLE IF NOT EXISTS work_area_progress_history (
                    id TEXT PRIMARY KEY, work_area_id TEXT NOT NULL,
                    planned_progress REAL DEFAULT NULL, actual_progress REAL NOT NULL,
                    status TEXT DEFAULT NULL, recorded_at TEXT NOT NULL,
                    source TEXT DEFAULT 'manual', note TEXT DEFAULT '',
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS quantity_progress_history (
                    id TEXT PRIMARY KEY, quantity_id TEXT NOT NULL,
                    planned_quantity REAL NOT NULL, actual_quantity REAL NOT NULL,
                    variance_quantity REAL DEFAULT NULL, status TEXT DEFAULT NULL,
                    recorded_at TEXT NOT NULL, source TEXT DEFAULT 'manual', note TEXT DEFAULT '',
                    FOREIGN KEY (quantity_id) REFERENCES engineering_quantities(id)
                );
                CREATE TABLE IF NOT EXISTS spatial_raw_objects (
                    id TEXT PRIMARY KEY, name TEXT NOT NULL, raw_type TEXT NOT NULL,
                    coord_system TEXT NOT NULL DEFAULT 'local',
                    center_x REAL DEFAULT NULL, center_y REAL DEFAULT NULL, center_z REAL DEFAULT NULL,
                    station_start REAL DEFAULT NULL, station_end REAL DEFAULT NULL,
                    bbox_min_x REAL DEFAULT NULL, bbox_min_y REAL DEFAULT NULL, bbox_min_z REAL DEFAULT NULL,
                    bbox_max_x REAL DEFAULT NULL, bbox_max_y REAL DEFAULT NULL, bbox_max_z REAL DEFAULT NULL,
                    geometry_ref TEXT DEFAULT '', source TEXT DEFAULT 'manual', notes TEXT DEFAULT '',
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS spatial_bindings (
                    id TEXT PRIMARY KEY, target_type TEXT NOT NULL, target_id TEXT NOT NULL,
                    spatial_raw_object_id TEXT NOT NULL, binding_role TEXT NOT NULL DEFAULT 'primary',
                    semantic_role TEXT DEFAULT '', created_at TEXT NOT NULL,
                    FOREIGN KEY (spatial_raw_object_id) REFERENCES spatial_raw_objects(id)
                );
                CREATE TABLE IF NOT EXISTS spatial_display_objects (
                    id TEXT PRIMARY KEY, spatial_raw_object_id TEXT NOT NULL,
                    display_name TEXT DEFAULT '', display_type TEXT NOT NULL DEFAULT 'label',
                    display_ref TEXT DEFAULT '', color_hint TEXT DEFAULT '', style_code TEXT DEFAULT '',
                    label_text TEXT DEFAULT '', visible INTEGER NOT NULL DEFAULT 1,
                    sort_order INTEGER NOT NULL DEFAULT 0, lod_level INTEGER NOT NULL DEFAULT 0,
                    notes TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    FOREIGN KEY (spatial_raw_object_id) REFERENCES spatial_raw_objects(id)
                );
                CREATE TABLE IF NOT EXISTS report_work_areas (
                    report_id TEXT NOT NULL, work_area_id TEXT NOT NULL,
                    PRIMARY KEY (report_id, work_area_id),
                    FOREIGN KEY (report_id) REFERENCES daily_reports(id),
                    FOREIGN KEY (work_area_id) REFERENCES work_areas(id)
                );
                CREATE TABLE IF NOT EXISTS operation_logs (
                    id TEXT PRIMARY KEY, action_type TEXT NOT NULL, target_type TEXT NOT NULL,
                    target_id TEXT NOT NULL, operator TEXT DEFAULT 'system',
                    message TEXT NOT NULL, created_at TEXT NOT NULL
                );
                """
            )
            self._ensure_schema_columns(conn)

    def _ensure_schema_columns(self, conn: sqlite3.Connection) -> None:
        work_area_columns = {row["name"] for row in conn.execute("PRAGMA table_info(work_areas)").fetchall()}
        if "work_area_subtype" not in work_area_columns:
            conn.execute("ALTER TABLE work_areas ADD COLUMN work_area_subtype TEXT DEFAULT ''")

        resource_columns = {row["name"] for row in conn.execute("PRAGMA table_info(resource_logs)").fetchall()}
        resource_column_defs = {
            "resource_category": "TEXT NOT NULL DEFAULT 'labor'",
            "resource_subtype": "TEXT DEFAULT ''",
            "team_name": "TEXT DEFAULT ''",
            "specification": "TEXT DEFAULT ''",
            "source_type": "TEXT NOT NULL DEFAULT 'manual'",
        }
        for column_name, column_def in resource_column_defs.items():
            if column_name not in resource_columns:
                conn.execute(f"ALTER TABLE resource_logs ADD COLUMN {column_name} {column_def}")
        conn.execute(
            """
            UPDATE resource_logs
            SET resource_category = COALESCE(NULLIF(resource_category, ''), resource_type),
                source_type = COALESCE(NULLIF(source_type, ''), 'manual')
            """
        )

    @property
    def current_day(self) -> int:
        with self._connect() as conn:
            row = conn.execute("SELECT value FROM app_meta WHERE key = 'current_day'").fetchone()
            return int(row["value"]) if row else 0

    def get_summary(self) -> dict[str, Any]:
        current_day = self.current_day
        work_areas = self.list_work_areas()
        tasks = self.list_tasks()
        issues = self.list_issues()
        reports = self.list_reports(report_day=current_day)
        quantity_summary = self.get_quantity_summary()
        due_tasks = [item for item in tasks if item["status"] != "done" and item["planned_day"] <= current_day]
        due_tasks.sort(key=lambda item: (item["due_day"], item["id"]))
        open_issues = [item for item in issues if item["status"] != "closed"]
        open_issues.sort(key=lambda item: (item["due_day"], item["id"]))
        avg = sum(item["actual_progress"] for item in work_areas) / len(work_areas) if work_areas else 0.0
        return {
            "current_day": current_day,
            "work_area_count": len(work_areas),
            "avg_progress": avg,
            "due_tasks": len(due_tasks),
            "open_issues": len(open_issues),
            "overdue_tasks": len([item for item in tasks if self._task_overdue(item, current_day)]),
            "overdue_issues": len([item for item in issues if self._issue_overdue(item, current_day)]),
            "today_reports": len(reports),
            "quantity_item_count": quantity_summary["item_count"],
            "design_quantity_item_count": len(self.list_design_quantities()),
            "design_spatial_item_count": len(self.list_design_spatial_objects()),
            "terrain_item_count": len(self.list_terrain_raw_objects()),
            "terrain_change_item_count": len(self.list_terrain_change_sets()),
            "resource_log_count": len(self.list_resource_logs()),
            "next_task": due_tasks[0] if due_tasks else None,
            "next_issue": open_issues[0] if open_issues else None,
        }

    def list_work_areas(self) -> list[dict[str, Any]]:
        return self._query_all("SELECT * FROM work_areas ORDER BY name ASC")

    def get_work_area(self, work_area_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM work_areas WHERE id = ?", (work_area_id,))

    def list_work_area_progress_history(self, work_area_id: str) -> list[dict[str, Any]]:
        return self._query_all(
            "SELECT * FROM work_area_progress_history WHERE work_area_id = ? ORDER BY recorded_at ASC",
            (work_area_id,),
        )

    def create_work_area(
        self,
        *,
        name: str,
        work_area_type: str = "general",
        work_area_subtype: str = "",
        owner: str = "",
        planned_progress: float = 0.0,
        actual_progress: float = 0.0,
        description: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("work_areas", "wa"),
            "name": name,
            "type": work_area_type,
            "work_area_subtype": work_area_subtype,
            "owner": owner,
            "planned_progress": planned_progress,
            "actual_progress": actual_progress,
            "status": self._derive_work_area_status(planned_progress, actual_progress),
            "station_start": 0.0,
            "station_end": 0.0,
            "description": description,
            "created_at": now,
            "updated_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO work_areas VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            self._record_work_area_progress_history(
                conn,
                work_area_id=record["id"],
                planned_progress=record["planned_progress"],
                actual_progress=record["actual_progress"],
                status=record["status"],
                source="manual",
                note="Work area created",
            )
            self._log(conn, "create_work_area", "work_area", record["id"], record["name"])
        return record

    def update_work_area(
        self,
        work_area_id: str,
        *,
        work_area_subtype: str | None = None,
        owner: str | None = None,
        planned_progress: float | None = None,
        actual_progress: float | None = None,
        description: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_work_area(work_area_id)
        if not record:
            return None
        next_work_area_subtype = work_area_subtype if work_area_subtype is not None else record.get("work_area_subtype", "")
        next_owner = owner if owner is not None else record["owner"]
        next_planned = planned_progress if planned_progress is not None else record["planned_progress"]
        next_actual = actual_progress if actual_progress is not None else record["actual_progress"]
        next_description = description if description is not None else record["description"]
        next_status = self._derive_work_area_status(next_planned, next_actual)
        updated_at = self._now()
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE work_areas
                SET work_area_subtype = ?, owner = ?, planned_progress = ?, actual_progress = ?, status = ?, description = ?, updated_at = ?
                WHERE id = ?
                """,
                (next_work_area_subtype, next_owner, next_planned, next_actual, next_status, next_description, updated_at, work_area_id),
            )
            if (
                next_planned != record["planned_progress"]
                or next_actual != record["actual_progress"]
                or next_status != record["status"]
            ):
                self._record_work_area_progress_history(
                    conn,
                    work_area_id=work_area_id,
                    planned_progress=next_planned,
                    actual_progress=next_actual,
                    status=next_status,
                    source="manual",
                    note="Work area progress updated",
                )
            self._log(conn, "update_work_area", "work_area", work_area_id, f"Work area -> {next_status}")
        record["work_area_subtype"] = next_work_area_subtype
        record["owner"] = next_owner
        record["planned_progress"] = next_planned
        record["actual_progress"] = next_actual
        record["status"] = next_status
        record["description"] = next_description
        record["updated_at"] = updated_at
        return record

    def list_tasks(self, *, status: str | None = None, work_area_id: str | None = None, assignee: str | None = None, overdue: bool | None = None) -> list[dict[str, Any]]:
        sql = "SELECT * FROM tasks WHERE 1=1"
        params: list[Any] = []
        if status is not None:
            sql += " AND status = ?"; params.append(status)
        if work_area_id is not None:
            sql += " AND work_area_id = ?"; params.append(work_area_id)
        if assignee is not None:
            sql += " AND assignee = ?"; params.append(assignee)
        if overdue is True:
            sql += " AND status != 'done' AND due_day > 0 AND ? > due_day"; params.append(self.current_day)
        if overdue is False:
            sql += " AND NOT (status != 'done' AND due_day > 0 AND ? > due_day)"; params.append(self.current_day)
        sql += " ORDER BY due_day ASC, id ASC"
        return self._query_all(sql, tuple(params))

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM tasks WHERE id = ?", (task_id,))

    def list_task_status_history(self, task_id: str) -> list[dict[str, Any]]:
        return self._query_all(
            "SELECT * FROM task_status_history WHERE task_id = ? ORDER BY changed_at ASC",
            (task_id,),
        )

    def create_task(self, *, title: str, work_area_id: str, assignee: str, due_day: int | None = None, notes: str = "") -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("tasks", "task"), "work_area_id": work_area_id, "title": title,
            "assignee": assignee or "Field Team", "planned_day": self.current_day,
            "due_day": due_day if due_day is not None else self.current_day + 2, "status": "planned",
            "completion_ratio": 0.0, "notes": notes, "created_at": now, "updated_at": now,
        }
        with self._connect() as conn:
            conn.execute("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._record_task_history(
                conn,
                task_id=record["id"],
                old_status=None,
                new_status=record["status"],
                old_completion_ratio=None,
                new_completion_ratio=record["completion_ratio"],
                note="Task created",
            )
            self._log(conn, "create_task", "task", record["id"], record["title"])
        return record

    def update_task(
        self,
        task_id: str,
        *,
        title: str | None = None,
        work_area_id: str | None = None,
        assignee: str | None = None,
        due_day: int | None = None,
        notes: str | None = None,
        status: str | None = None,
        completion_ratio: float | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_task(task_id)
        if not record:
            return None
        next_title = title if title is not None else record["title"]
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_assignee = assignee if assignee is not None else record["assignee"]
        next_due_day = due_day if due_day is not None else record["due_day"]
        next_notes = notes if notes is not None else record["notes"]
        next_status = status if status is not None else record["status"]
        ratio = completion_ratio if completion_ratio is not None else (1.0 if next_status == "done" else record["completion_ratio"])
        updated_at = self._now()
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE tasks
                SET title = ?, work_area_id = ?, assignee = ?, due_day = ?, notes = ?, status = ?, completion_ratio = ?, updated_at = ?
                WHERE id = ?
                """,
                (next_title, next_work_area_id, next_assignee, next_due_day, next_notes, next_status, ratio, updated_at, task_id),
            )
            if next_status != record["status"] or ratio != record["completion_ratio"]:
                self._record_task_history(
                    conn,
                    task_id=task_id,
                    old_status=record["status"],
                    new_status=next_status,
                    old_completion_ratio=record["completion_ratio"],
                    new_completion_ratio=ratio,
                    note="Task status updated",
                )
            self._log(conn, "update_task", "task", task_id, f"Task -> {next_status}")
        record["title"] = next_title
        record["work_area_id"] = next_work_area_id
        record["assignee"] = next_assignee
        record["due_day"] = next_due_day
        record["notes"] = next_notes
        record["status"] = next_status
        record["completion_ratio"] = ratio
        record["updated_at"] = updated_at
        return record

    def list_issues(self, *, status: str | None = None, severity: str | None = None, work_area_id: str | None = None, overdue: bool | None = None) -> list[dict[str, Any]]:
        sql = "SELECT * FROM issues WHERE 1=1"
        params: list[Any] = []
        if status is not None:
            sql += " AND status = ?"; params.append(status)
        if severity is not None:
            sql += " AND severity = ?"; params.append(severity)
        if work_area_id is not None:
            sql += " AND work_area_id = ?"; params.append(work_area_id)
        if overdue is True:
            sql += " AND status != 'closed' AND due_day > 0 AND ? > due_day"; params.append(self.current_day)
        if overdue is False:
            sql += " AND NOT (status != 'closed' AND due_day > 0 AND ? > due_day)"; params.append(self.current_day)
        sql += " ORDER BY due_day ASC, id ASC"
        return self._query_all(sql, tuple(params))

    def get_issue(self, issue_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM issues WHERE id = ?", (issue_id,))

    def list_issue_status_history(self, issue_id: str) -> list[dict[str, Any]]:
        return self._query_all(
            "SELECT * FROM issue_status_history WHERE issue_id = ? ORDER BY changed_at ASC",
            (issue_id,),
        )

    def create_issue(self, *, title: str, work_area_id: str, owner: str, severity: str = "medium", due_day: int | None = None, description: str = "") -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("issues", "issue"), "work_area_id": work_area_id, "title": title,
            "owner": owner or "Safety Officer", "severity": severity, "status": "open",
            "due_day": due_day if due_day is not None else self.current_day + 1, "description": description,
            "created_at": now, "updated_at": now, "closed_at": None,
        }
        with self._connect() as conn:
            conn.execute("INSERT INTO issues VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._record_issue_history(
                conn,
                issue_id=record["id"],
                old_status=None,
                new_status=record["status"],
                old_severity=None,
                new_severity=record["severity"],
                note="Issue created",
            )
            self._log(conn, "create_issue", "issue", record["id"], record["title"])
        return record

    def update_issue(
        self,
        issue_id: str,
        *,
        title: str | None = None,
        work_area_id: str | None = None,
        owner: str | None = None,
        severity: str | None = None,
        due_day: int | None = None,
        description: str | None = None,
        status: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_issue(issue_id)
        if not record:
            return None
        next_title = title if title is not None else record["title"]
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_owner = owner if owner is not None else record["owner"]
        next_severity = severity if severity is not None else record["severity"]
        next_due_day = due_day if due_day is not None else record["due_day"]
        next_description = description if description is not None else record["description"]
        next_status = status if status is not None else record["status"]
        updated_at = self._now()
        closed_at = self._now() if next_status == "closed" else None
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE issues
                SET title = ?, work_area_id = ?, owner = ?, severity = ?, due_day = ?, description = ?, status = ?, updated_at = ?, closed_at = ?
                WHERE id = ?
                """,
                (next_title, next_work_area_id, next_owner, next_severity, next_due_day, next_description, next_status, updated_at, closed_at, issue_id),
            )
            if next_status != record["status"] or next_severity != record["severity"]:
                self._record_issue_history(
                    conn,
                    issue_id=issue_id,
                    old_status=record["status"],
                    new_status=next_status,
                    old_severity=record["severity"],
                    new_severity=next_severity,
                    note="Issue status updated",
                )
            self._log(conn, "update_issue", "issue", issue_id, f"Issue -> {next_status}")
        record["title"] = next_title
        record["work_area_id"] = next_work_area_id
        record["owner"] = next_owner
        record["severity"] = next_severity
        record["due_day"] = next_due_day
        record["description"] = next_description
        record["status"] = next_status
        record["updated_at"] = updated_at
        record["closed_at"] = closed_at
        return record

    def list_reports(self, *, report_day: int | None = None, work_area_id: str | None = None, author: str | None = None) -> list[dict[str, Any]]:
        sql = "SELECT DISTINCT dr.* FROM daily_reports dr LEFT JOIN report_work_areas rwa ON rwa.report_id = dr.id WHERE 1=1"
        params: list[Any] = []
        if report_day is not None:
            sql += " AND dr.report_day = ?"; params.append(report_day)
        if work_area_id is not None:
            sql += " AND rwa.work_area_id = ?"; params.append(work_area_id)
        if author is not None:
            sql += " AND dr.author = ?"; params.append(author)
        sql += " ORDER BY dr.report_day DESC, dr.created_at DESC"
        reports = self._query_all(sql, tuple(params))
        with self._connect() as conn:
            for report in reports:
                rows = conn.execute("SELECT work_area_id FROM report_work_areas WHERE report_id = ? ORDER BY work_area_id", (report["id"],)).fetchall()
                report["work_area_ids"] = [row["work_area_id"] for row in rows]
        return reports

    def get_report(self, report_id: str) -> dict[str, Any] | None:
        reports = self.list_reports()
        return next((item for item in reports if item["id"] == report_id), None)

    def list_quantities(
        self,
        *,
        work_area_id: str | None = None,
        category: str | None = None,
        status: str | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM engineering_quantities WHERE 1=1"
        params: list[Any] = []
        if work_area_id is not None:
            sql += " AND work_area_id = ?"; params.append(work_area_id)
        if category is not None:
            sql += " AND category = ?"; params.append(category)
        if status is not None:
            sql += " AND status = ?"; params.append(status)
        sql += " ORDER BY work_area_id ASC, item_name ASC, id ASC"
        return self._query_all(sql, tuple(params))

    def get_quantity(self, quantity_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM engineering_quantities WHERE id = ?", (quantity_id,))

    def list_quantity_progress_history(self, quantity_id: str) -> list[dict[str, Any]]:
        return self._query_all(
            "SELECT * FROM quantity_progress_history WHERE quantity_id = ? ORDER BY recorded_at ASC",
            (quantity_id,),
        )

    def list_design_quantities(
        self,
        *,
        work_area_id: str | None = None,
        category: str | None = None,
        design_version: str | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM design_quantities WHERE 1=1"
        params: list[Any] = []
        if work_area_id is not None:
            sql += " AND work_area_id = ?"; params.append(work_area_id)
        if category is not None:
            sql += " AND category = ?"; params.append(category)
        if design_version is not None:
            sql += " AND design_version = ?"; params.append(design_version)
        sql += " ORDER BY work_area_id ASC, item_name ASC, id ASC"
        return self._query_all(sql, tuple(params))

    def get_design_quantity(self, design_quantity_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM design_quantities WHERE id = ?", (design_quantity_id,))

    def list_design_spatial_objects(
        self,
        *,
        work_area_id: str | None = None,
        design_type: str | None = None,
        design_version: str | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM design_spatial_objects WHERE 1=1"
        params: list[Any] = []
        if work_area_id:
            sql += " AND work_area_id = ?"
            params.append(work_area_id)
        if design_type:
            sql += " AND design_type = ?"
            params.append(design_type)
        if design_version:
            sql += " AND design_version = ?"
            params.append(design_version)
        sql += " ORDER BY name ASC"
        return self._query_all(sql, tuple(params))

    def get_design_spatial_object(self, design_spatial_object_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM design_spatial_objects WHERE id = ?", (design_spatial_object_id,))

    def get_work_area_design_spatial(self, work_area_id: str) -> dict[str, Any] | None:
        work_area = self.get_work_area(work_area_id)
        if work_area is None:
            return None
        return {
            "work_area": work_area,
            "design_spatial": self.list_design_spatial_objects(work_area_id=work_area_id),
        }

    def list_terrain_raw_objects(
        self,
        *,
        terrain_type: str | None = None,
        coord_system: str | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM terrain_raw_objects WHERE 1=1"
        params: list[Any] = []
        if terrain_type:
            sql += " AND terrain_type = ?"
            params.append(terrain_type)
        if coord_system:
            sql += " AND coord_system = ?"
            params.append(coord_system)
        sql += " ORDER BY name ASC"
        return self._query_all(sql, tuple(params))

    def get_terrain_raw_object(self, terrain_raw_object_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM terrain_raw_objects WHERE id = ?", (terrain_raw_object_id,))

    def list_terrain_display_objects(self, terrain_raw_object_id: str) -> list[dict[str, Any]]:
        return self._query_all(
            "SELECT * FROM terrain_display_objects WHERE terrain_raw_object_id = ? ORDER BY sort_order ASC, id ASC",
            (terrain_raw_object_id,),
        )

    def get_terrain_payload(self, terrain_raw_object_id: str) -> dict[str, Any] | None:
        terrain = self.get_terrain_raw_object(terrain_raw_object_id)
        if terrain is None:
            return None
        return {
            "terrain": terrain,
            "display_objects": self.list_terrain_display_objects(terrain_raw_object_id),
        }

    def list_terrain_change_sets(
        self,
        *,
        work_area_id: str | None = None,
        change_type: str | None = None,
        record_day: int | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM terrain_change_sets WHERE 1=1"
        params: list[Any] = []
        if work_area_id is not None:
            sql += " AND work_area_id = ?"; params.append(work_area_id)
        if change_type is not None:
            sql += " AND change_type = ?"; params.append(change_type)
        if record_day is not None:
            sql += " AND record_day = ?"; params.append(record_day)
        sql += " ORDER BY record_day DESC, recorded_at DESC, id DESC"
        return self._query_all(sql, tuple(params))

    def get_terrain_change_set(self, terrain_change_set_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM terrain_change_sets WHERE id = ?", (terrain_change_set_id,))

    def get_work_area_terrain_changes(self, work_area_id: str) -> dict[str, Any] | None:
        work_area = self.get_work_area(work_area_id)
        if work_area is None:
            return None
        return {
            "work_area": work_area,
            "terrain_change_sets": self.list_terrain_change_sets(work_area_id=work_area_id),
        }

    def get_design_quantity_summary(self, *, work_area_id: str | None = None) -> dict[str, Any]:
        design_quantities = self.list_design_quantities(work_area_id=work_area_id)
        actual_quantities = self.list_quantities(work_area_id=work_area_id)
        actual_by_key = {(item["item_code"] or item["item_name"]): item for item in actual_quantities}
        items: list[dict[str, Any]] = []
        total_target = 0.0
        total_actual = 0.0
        for item in design_quantities:
            key = item["item_code"] or item["item_name"]
            actual_item = actual_by_key.get(key)
            target = float(item["target_quantity"] or 0.0)
            actual = float(actual_item["actual_quantity"] or 0.0) if actual_item else 0.0
            variance = actual - target
            total_target += target
            total_actual += actual
            items.append(
                {
                    "id": item["id"],
                    "work_area_id": item["work_area_id"],
                    "item_name": item["item_name"],
                    "item_code": item["item_code"],
                    "category": item["category"],
                    "unit": item["unit"],
                    "target_quantity": target,
                    "actual_quantity": actual,
                    "variance_quantity": variance,
                    "design_version": item["design_version"],
                }
            )
        return {
            "work_area_id": work_area_id,
            "item_count": len(items),
            "total_target_quantity": total_target,
            "total_actual_quantity": total_actual,
            "total_variance": total_actual - total_target,
            "completion_ratio": (total_actual / total_target) if total_target > 0 else 0.0,
            "items": items,
        }

    def list_resource_logs(
        self,
        *,
        work_area_id: str | None = None,
        resource_type: str | None = None,
        resource_category: str | None = None,
        record_day: int | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM resource_logs WHERE 1=1"
        params: list[Any] = []
        if work_area_id is not None:
            sql += " AND work_area_id = ?"; params.append(work_area_id)
        if resource_type is not None:
            sql += " AND resource_type = ?"; params.append(resource_type)
        if resource_category is not None:
            sql += " AND resource_category = ?"; params.append(resource_category)
        if record_day is not None:
            sql += " AND record_day = ?"; params.append(record_day)
        sql += " ORDER BY record_day DESC, created_at DESC, id DESC"
        return self._query_all(sql, tuple(params))

    def get_resource_log(self, resource_log_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM resource_logs WHERE id = ?", (resource_log_id,))

    def get_resource_summary(self, *, work_area_id: str | None = None, record_day: int | None = None) -> dict[str, Any]:
        logs = self.list_resource_logs(work_area_id=work_area_id, record_day=record_day)
        totals: dict[str, float] = {"labor": 0.0, "machine": 0.0, "material": 0.0}
        for item in logs:
            resource_category = item.get("resource_category") or item["resource_type"]
            totals[resource_category] = totals.get(resource_category, 0.0) + float(item["quantity"] or 0.0)
        return {
            "work_area_id": work_area_id,
            "record_day": record_day,
            "item_count": len(logs),
            "totals": totals,
            "items": logs,
        }

    def list_spatial_raw_objects(
        self,
        *,
        raw_type: str | None = None,
        coord_system: str | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM spatial_raw_objects WHERE 1=1"
        params: list[Any] = []
        if raw_type is not None:
            sql += " AND raw_type = ?"; params.append(raw_type)
        if coord_system is not None:
            sql += " AND coord_system = ?"; params.append(coord_system)
        sql += " ORDER BY name ASC, id ASC"
        return self._query_all(sql, tuple(params))

    def get_spatial_raw_object(self, spatial_raw_object_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM spatial_raw_objects WHERE id = ?", (spatial_raw_object_id,))

    def create_spatial_raw_object(
        self,
        *,
        name: str,
        raw_type: str,
        coord_system: str = "local",
        center_x: float | None = None,
        center_y: float | None = None,
        center_z: float | None = None,
        station_start: float | None = None,
        station_end: float | None = None,
        bbox_min_x: float | None = None,
        bbox_min_y: float | None = None,
        bbox_min_z: float | None = None,
        bbox_max_x: float | None = None,
        bbox_max_y: float | None = None,
        bbox_max_z: float | None = None,
        geometry_ref: str = "",
        source: str = "manual",
        notes: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("spatial_raw_objects", "sro"),
            "name": name,
            "raw_type": raw_type,
            "coord_system": coord_system,
            "center_x": center_x,
            "center_y": center_y,
            "center_z": center_z,
            "station_start": station_start,
            "station_end": station_end,
            "bbox_min_x": bbox_min_x,
            "bbox_min_y": bbox_min_y,
            "bbox_min_z": bbox_min_z,
            "bbox_max_x": bbox_max_x,
            "bbox_max_y": bbox_max_y,
            "bbox_max_z": bbox_max_z,
            "geometry_ref": geometry_ref,
            "source": source,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO spatial_raw_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                tuple(record.values()),
            )
            self._log(conn, "create_spatial_raw_object", "spatial_raw_object", record["id"], record["name"])
        return record

    def update_spatial_raw_object(
        self,
        spatial_raw_object_id: str,
        *,
        name: str | None = None,
        raw_type: str | None = None,
        coord_system: str | None = None,
        center_x: float | None = None,
        center_y: float | None = None,
        center_z: float | None = None,
        station_start: float | None = None,
        station_end: float | None = None,
        bbox_min_x: float | None = None,
        bbox_min_y: float | None = None,
        bbox_min_z: float | None = None,
        bbox_max_x: float | None = None,
        bbox_max_y: float | None = None,
        bbox_max_z: float | None = None,
        geometry_ref: str | None = None,
        source: str | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_spatial_raw_object(spatial_raw_object_id)
        if not record:
            return None
        next_record = {
            "name": name if name is not None else record["name"],
            "raw_type": raw_type if raw_type is not None else record["raw_type"],
            "coord_system": coord_system if coord_system is not None else record["coord_system"],
            "center_x": center_x if center_x is not None else record["center_x"],
            "center_y": center_y if center_y is not None else record["center_y"],
            "center_z": center_z if center_z is not None else record["center_z"],
            "station_start": station_start if station_start is not None else record["station_start"],
            "station_end": station_end if station_end is not None else record["station_end"],
            "bbox_min_x": bbox_min_x if bbox_min_x is not None else record["bbox_min_x"],
            "bbox_min_y": bbox_min_y if bbox_min_y is not None else record["bbox_min_y"],
            "bbox_min_z": bbox_min_z if bbox_min_z is not None else record["bbox_min_z"],
            "bbox_max_x": bbox_max_x if bbox_max_x is not None else record["bbox_max_x"],
            "bbox_max_y": bbox_max_y if bbox_max_y is not None else record["bbox_max_y"],
            "bbox_max_z": bbox_max_z if bbox_max_z is not None else record["bbox_max_z"],
            "geometry_ref": geometry_ref if geometry_ref is not None else record["geometry_ref"],
            "source": source if source is not None else record["source"],
            "notes": notes if notes is not None else record["notes"],
            "updated_at": self._now(),
        }
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE spatial_raw_objects
                SET name = ?, raw_type = ?, coord_system = ?, center_x = ?, center_y = ?, center_z = ?,
                    station_start = ?, station_end = ?, bbox_min_x = ?, bbox_min_y = ?, bbox_min_z = ?,
                    bbox_max_x = ?, bbox_max_y = ?, bbox_max_z = ?, geometry_ref = ?, source = ?, notes = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    next_record["name"], next_record["raw_type"], next_record["coord_system"],
                    next_record["center_x"], next_record["center_y"], next_record["center_z"],
                    next_record["station_start"], next_record["station_end"],
                    next_record["bbox_min_x"], next_record["bbox_min_y"], next_record["bbox_min_z"],
                    next_record["bbox_max_x"], next_record["bbox_max_y"], next_record["bbox_max_z"],
                    next_record["geometry_ref"], next_record["source"], next_record["notes"],
                    next_record["updated_at"], spatial_raw_object_id,
                ),
            )
            self._log(conn, "update_spatial_raw_object", "spatial_raw_object", spatial_raw_object_id, next_record["name"])
        return self.get_spatial_raw_object(spatial_raw_object_id)

    def list_spatial_bindings(
        self,
        *,
        target_type: str | None = None,
        target_id: str | None = None,
        spatial_raw_object_id: str | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM spatial_bindings WHERE 1=1"
        params: list[Any] = []
        if target_type is not None:
            sql += " AND target_type = ?"; params.append(target_type)
        if target_id is not None:
            sql += " AND target_id = ?"; params.append(target_id)
        if spatial_raw_object_id is not None:
            sql += " AND spatial_raw_object_id = ?"; params.append(spatial_raw_object_id)
        sql += " ORDER BY binding_role ASC, id ASC"
        return self._query_all(sql, tuple(params))

    def get_spatial_binding(self, spatial_binding_id: str) -> dict[str, Any] | None:
        return self._query_one("SELECT * FROM spatial_bindings WHERE id = ?", (spatial_binding_id,))

    def list_spatial_display_objects(
        self,
        *,
        spatial_raw_object_id: str | None = None,
        visible: bool | None = None,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM spatial_display_objects WHERE 1=1"
        params: list[Any] = []
        if spatial_raw_object_id is not None:
            sql += " AND spatial_raw_object_id = ?"; params.append(spatial_raw_object_id)
        if visible is not None:
            sql += " AND visible = ?"; params.append(1 if visible else 0)
        sql += " ORDER BY sort_order ASC, id ASC"
        return self._query_all(sql, tuple(params))

    def create_spatial_binding(
        self,
        *,
        target_type: str,
        target_id: str,
        spatial_raw_object_id: str,
        binding_role: str = "primary",
        semantic_role: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("spatial_bindings", "sb"),
            "target_type": target_type,
            "target_id": target_id,
            "spatial_raw_object_id": spatial_raw_object_id,
            "binding_role": binding_role,
            "semantic_role": semantic_role,
            "created_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO spatial_bindings VALUES (?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            self._log(conn, "create_spatial_binding", "spatial_binding", record["id"], f"{target_type}:{target_id}")
        return record

    def update_spatial_binding(
        self,
        spatial_binding_id: str,
        *,
        target_type: str | None = None,
        target_id: str | None = None,
        spatial_raw_object_id: str | None = None,
        binding_role: str | None = None,
        semantic_role: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_spatial_binding(spatial_binding_id)
        if not record:
            return None
        next_record = {
            "target_type": target_type if target_type is not None else record["target_type"],
            "target_id": target_id if target_id is not None else record["target_id"],
            "spatial_raw_object_id": spatial_raw_object_id if spatial_raw_object_id is not None else record["spatial_raw_object_id"],
            "binding_role": binding_role if binding_role is not None else record["binding_role"],
            "semantic_role": semantic_role if semantic_role is not None else record["semantic_role"],
        }
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE spatial_bindings
                SET target_type = ?, target_id = ?, spatial_raw_object_id = ?, binding_role = ?, semantic_role = ?
                WHERE id = ?
                """,
                (
                    next_record["target_type"],
                    next_record["target_id"],
                    next_record["spatial_raw_object_id"],
                    next_record["binding_role"],
                    next_record["semantic_role"],
                    spatial_binding_id,
                ),
            )
            self._log(conn, "update_spatial_binding", "spatial_binding", spatial_binding_id, f"{next_record['target_type']}:{next_record['target_id']}")
        return self.get_spatial_binding(spatial_binding_id)

    def get_work_area_spatial(self, work_area_id: str) -> dict[str, Any] | None:
        work_area = self.get_work_area(work_area_id)
        if work_area is None:
            return None
        return {
            "work_area": work_area,
            "spatial": self._get_bound_spatial_records(target_type="work_area", target_id=work_area_id),
        }

    def get_quantity_spatial(self, quantity_id: str) -> dict[str, Any] | None:
        quantity = self.get_quantity(quantity_id)
        if quantity is None:
            return None
        return {
            "quantity": quantity,
            "spatial": self._get_bound_spatial_records(target_type="quantity", target_id=quantity_id),
        }

    def get_quantity_summary(self, *, work_area_id: str | None = None) -> dict[str, Any]:
        quantities = self.list_quantities(work_area_id=work_area_id)
        categories: dict[str, dict[str, Any]] = {}
        warnings: list[dict[str, Any]] = []
        total_planned = 0.0
        total_actual = 0.0

        for quantity in quantities:
            planned = float(quantity["planned_quantity"] or 0.0)
            actual = float(quantity["actual_quantity"] or 0.0)
            variance = actual - planned
            ratio = (actual / planned) if planned > 0 else (1.0 if actual > 0 else 0.0)
            category_key = quantity["category"] or "general"
            total_planned += planned
            total_actual += actual

            bucket = categories.setdefault(
                category_key,
                {
                    "category": category_key,
                    "item_count": 0,
                    "total_planned_quantity": 0.0,
                    "total_actual_quantity": 0.0,
                },
            )
            bucket["item_count"] += 1
            bucket["total_planned_quantity"] += planned
            bucket["total_actual_quantity"] += actual

            if planned > 0 and actual < planned:
                warnings.append(
                    {
                        "id": quantity["id"],
                        "item_name": quantity["item_name"],
                        "work_area_id": quantity["work_area_id"],
                        "category": category_key,
                        "unit": quantity["unit"],
                        "planned_quantity": planned,
                        "actual_quantity": actual,
                        "variance": variance,
                        "completion_ratio": ratio,
                        "warning_level": "danger" if ratio < 0.5 else "warn",
                    }
                )

        category_rows: list[dict[str, Any]] = []
        for bucket in categories.values():
            planned = bucket["total_planned_quantity"]
            actual = bucket["total_actual_quantity"]
            bucket["total_variance"] = actual - planned
            bucket["completion_ratio"] = (actual / planned) if planned > 0 else (1.0 if actual > 0 else 0.0)
            bucket["status"] = self._derive_quantity_status(planned, actual)
            category_rows.append(bucket)

        category_rows.sort(key=lambda item: (item["category"], item["item_count"]))
        warnings.sort(key=lambda item: (item["completion_ratio"], item["item_name"]))

        return {
            "work_area_id": work_area_id,
            "item_count": len(quantities),
            "total_planned_quantity": total_planned,
            "total_actual_quantity": total_actual,
            "total_variance": total_actual - total_planned,
            "completion_ratio": (total_actual / total_planned) if total_planned > 0 else (1.0 if total_actual > 0 else 0.0),
            "categories": category_rows,
            "warnings": warnings,
        }

    def create_quantity(
        self,
        *,
        work_area_id: str,
        item_name: str,
        item_code: str = "",
        category: str = "general",
        unit: str = "m3",
        planned_quantity: float = 0.0,
        actual_quantity: float = 0.0,
        notes: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("engineering_quantities", "qty"),
            "work_area_id": work_area_id,
            "item_name": item_name,
            "item_code": item_code,
            "category": category,
            "unit": unit,
            "planned_quantity": planned_quantity,
            "actual_quantity": actual_quantity,
            "status": self._derive_quantity_status(planned_quantity, actual_quantity),
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO engineering_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            self._record_quantity_progress_history(
                conn,
                quantity_id=record["id"],
                planned_quantity=record["planned_quantity"],
                actual_quantity=record["actual_quantity"],
                status=record["status"],
                source="manual",
                note="Quantity created",
            )
            self._log(conn, "create_quantity", "quantity", record["id"], record["item_name"])
        return record

    def update_quantity(
        self,
        quantity_id: str,
        *,
        work_area_id: str | None = None,
        item_name: str | None = None,
        item_code: str | None = None,
        category: str | None = None,
        unit: str | None = None,
        planned_quantity: float | None = None,
        actual_quantity: float | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_quantity(quantity_id)
        if not record:
            return None
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_item_name = item_name if item_name is not None else record["item_name"]
        next_item_code = item_code if item_code is not None else record["item_code"]
        next_category = category if category is not None else record["category"]
        next_unit = unit if unit is not None else record["unit"]
        next_planned = planned_quantity if planned_quantity is not None else record["planned_quantity"]
        next_actual = actual_quantity if actual_quantity is not None else record["actual_quantity"]
        next_notes = notes if notes is not None else record["notes"]
        next_status = self._derive_quantity_status(next_planned, next_actual)
        updated_at = self._now()
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE engineering_quantities
                SET work_area_id = ?, item_name = ?, item_code = ?, category = ?, unit = ?, planned_quantity = ?,
                    actual_quantity = ?, status = ?, notes = ?, updated_at = ?
                WHERE id = ?
                """,
                (next_work_area_id, next_item_name, next_item_code, next_category, next_unit, next_planned,
                 next_actual, next_status, next_notes, updated_at, quantity_id),
            )
            if (
                next_planned != record["planned_quantity"]
                or next_actual != record["actual_quantity"]
                or next_status != record["status"]
            ):
                self._record_quantity_progress_history(
                    conn,
                    quantity_id=quantity_id,
                    planned_quantity=next_planned,
                    actual_quantity=next_actual,
                    status=next_status,
                    source="manual",
                    note="Quantity progress updated",
                )
            self._log(conn, "update_quantity", "quantity", quantity_id, next_item_name)
        return self.get_quantity(quantity_id)

    def create_design_quantity(
        self,
        *,
        work_area_id: str,
        item_name: str,
        item_code: str = "",
        category: str = "general",
        unit: str = "m3",
        target_quantity: float = 0.0,
        design_version: str = "",
        notes: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("design_quantities", "dq"),
            "work_area_id": work_area_id,
            "item_name": item_name,
            "item_code": item_code,
            "category": category,
            "unit": unit,
            "target_quantity": target_quantity,
            "design_version": design_version,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO design_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            self._log(conn, "create_design_quantity", "design_quantity", record["id"], record["item_name"])
        return record

    def update_design_quantity(
        self,
        design_quantity_id: str,
        *,
        work_area_id: str | None = None,
        item_name: str | None = None,
        item_code: str | None = None,
        category: str | None = None,
        unit: str | None = None,
        target_quantity: float | None = None,
        design_version: str | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_design_quantity(design_quantity_id)
        if not record:
            return None
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_item_name = item_name if item_name is not None else record["item_name"]
        next_item_code = item_code if item_code is not None else record["item_code"]
        next_category = category if category is not None else record["category"]
        next_unit = unit if unit is not None else record["unit"]
        next_target = target_quantity if target_quantity is not None else record["target_quantity"]
        next_design_version = design_version if design_version is not None else record["design_version"]
        next_notes = notes if notes is not None else record["notes"]
        updated_at = self._now()
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE design_quantities
                SET work_area_id = ?, item_name = ?, item_code = ?, category = ?, unit = ?,
                    target_quantity = ?, design_version = ?, notes = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    next_work_area_id,
                    next_item_name,
                    next_item_code,
                    next_category,
                    next_unit,
                    next_target,
                    next_design_version,
                    next_notes,
                    updated_at,
                    design_quantity_id,
                ),
            )
            self._log(conn, "update_design_quantity", "design_quantity", design_quantity_id, next_item_name)
        return self.get_design_quantity(design_quantity_id)

    def create_design_spatial_object(
        self,
        *,
        work_area_id: str,
        name: str,
        design_type: str,
        coord_system: str = "local",
        station_start: float | None = None,
        station_end: float | None = None,
        bbox_min_x: float | None = None,
        bbox_min_y: float | None = None,
        bbox_min_z: float | None = None,
        bbox_max_x: float | None = None,
        bbox_max_y: float | None = None,
        bbox_max_z: float | None = None,
        design_ref: str = "",
        elevation_target: float | None = None,
        design_version: str = "",
        notes: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("design_spatial_objects", "dso"),
            "work_area_id": work_area_id,
            "name": name,
            "design_type": design_type,
            "coord_system": coord_system,
            "station_start": station_start,
            "station_end": station_end,
            "bbox_min_x": bbox_min_x,
            "bbox_min_y": bbox_min_y,
            "bbox_min_z": bbox_min_z,
            "bbox_max_x": bbox_max_x,
            "bbox_max_y": bbox_max_y,
            "bbox_max_z": bbox_max_z,
            "design_ref": design_ref,
            "elevation_target": elevation_target,
            "design_version": design_version,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO design_spatial_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            self._log(conn, "create_design_spatial_object", "design_spatial_object", record["id"], record["name"])
        return record

    def update_design_spatial_object(
        self,
        design_spatial_object_id: str,
        *,
        work_area_id: str | None = None,
        name: str | None = None,
        design_type: str | None = None,
        coord_system: str | None = None,
        station_start: float | None = None,
        station_end: float | None = None,
        bbox_min_x: float | None = None,
        bbox_min_y: float | None = None,
        bbox_min_z: float | None = None,
        bbox_max_x: float | None = None,
        bbox_max_y: float | None = None,
        bbox_max_z: float | None = None,
        design_ref: str | None = None,
        elevation_target: float | None = None,
        design_version: str | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_design_spatial_object(design_spatial_object_id)
        if not record:
            return None
        next_record = {
            "work_area_id": work_area_id if work_area_id is not None else record["work_area_id"],
            "name": name if name is not None else record["name"],
            "design_type": design_type if design_type is not None else record["design_type"],
            "coord_system": coord_system if coord_system is not None else record["coord_system"],
            "station_start": station_start if station_start is not None else record["station_start"],
            "station_end": station_end if station_end is not None else record["station_end"],
            "bbox_min_x": bbox_min_x if bbox_min_x is not None else record["bbox_min_x"],
            "bbox_min_y": bbox_min_y if bbox_min_y is not None else record["bbox_min_y"],
            "bbox_min_z": bbox_min_z if bbox_min_z is not None else record["bbox_min_z"],
            "bbox_max_x": bbox_max_x if bbox_max_x is not None else record["bbox_max_x"],
            "bbox_max_y": bbox_max_y if bbox_max_y is not None else record["bbox_max_y"],
            "bbox_max_z": bbox_max_z if bbox_max_z is not None else record["bbox_max_z"],
            "design_ref": design_ref if design_ref is not None else record["design_ref"],
            "elevation_target": elevation_target if elevation_target is not None else record["elevation_target"],
            "design_version": design_version if design_version is not None else record["design_version"],
            "notes": notes if notes is not None else record["notes"],
            "updated_at": self._now(),
        }
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE design_spatial_objects
                SET work_area_id = ?, name = ?, design_type = ?, coord_system = ?, station_start = ?, station_end = ?,
                    bbox_min_x = ?, bbox_min_y = ?, bbox_min_z = ?, bbox_max_x = ?, bbox_max_y = ?, bbox_max_z = ?,
                    design_ref = ?, elevation_target = ?, design_version = ?, notes = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    next_record["work_area_id"],
                    next_record["name"],
                    next_record["design_type"],
                    next_record["coord_system"],
                    next_record["station_start"],
                    next_record["station_end"],
                    next_record["bbox_min_x"],
                    next_record["bbox_min_y"],
                    next_record["bbox_min_z"],
                    next_record["bbox_max_x"],
                    next_record["bbox_max_y"],
                    next_record["bbox_max_z"],
                    next_record["design_ref"],
                    next_record["elevation_target"],
                    next_record["design_version"],
                    next_record["notes"],
                    next_record["updated_at"],
                    design_spatial_object_id,
                ),
            )
            self._log(conn, "update_design_spatial_object", "design_spatial_object", design_spatial_object_id, next_record["name"])
        return self.get_design_spatial_object(design_spatial_object_id)

    def create_terrain_raw_object(
        self,
        *,
        name: str,
        terrain_type: str,
        coord_system: str = "local",
        bbox_min_x: float | None = None,
        bbox_min_y: float | None = None,
        bbox_min_z: float | None = None,
        bbox_max_x: float | None = None,
        bbox_max_y: float | None = None,
        bbox_max_z: float | None = None,
        heightmap_ref: str = "",
        mesh_ref: str = "",
        texture_ref: str = "",
        source: str = "manual",
        resolution: str = "",
        notes: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("terrain_raw_objects", "tro"),
            "name": name,
            "terrain_type": terrain_type,
            "coord_system": coord_system,
            "bbox_min_x": bbox_min_x,
            "bbox_min_y": bbox_min_y,
            "bbox_min_z": bbox_min_z,
            "bbox_max_x": bbox_max_x,
            "bbox_max_y": bbox_max_y,
            "bbox_max_z": bbox_max_z,
            "heightmap_ref": heightmap_ref,
            "mesh_ref": mesh_ref,
            "texture_ref": texture_ref,
            "source": source,
            "resolution": resolution,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        display_record = {
            "id": self._next_id("terrain_display_objects", "tdo"),
            "terrain_raw_object_id": record["id"],
            "display_name": record["name"],
            "display_ref": record["mesh_ref"] or record["heightmap_ref"],
            "material_ref": record["texture_ref"],
            "visible": 1,
            "opacity": 1.0,
            "sort_order": 0,
            "notes": record["notes"],
            "created_at": now,
            "updated_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO terrain_raw_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            conn.execute(
                "INSERT INTO terrain_display_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(display_record.values()),
            )
            self._log(conn, "create_terrain_raw_object", "terrain_raw_object", record["id"], record["name"])
        return self.get_terrain_raw_object(record["id"]) or record

    def update_terrain_raw_object(
        self,
        terrain_raw_object_id: str,
        *,
        name: str | None = None,
        terrain_type: str | None = None,
        coord_system: str | None = None,
        bbox_min_x: float | None = None,
        bbox_min_y: float | None = None,
        bbox_min_z: float | None = None,
        bbox_max_x: float | None = None,
        bbox_max_y: float | None = None,
        bbox_max_z: float | None = None,
        heightmap_ref: str | None = None,
        mesh_ref: str | None = None,
        texture_ref: str | None = None,
        source: str | None = None,
        resolution: str | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_terrain_raw_object(terrain_raw_object_id)
        if not record:
            return None
        next_record = {
            "name": name if name is not None else record["name"],
            "terrain_type": terrain_type if terrain_type is not None else record["terrain_type"],
            "coord_system": coord_system if coord_system is not None else record["coord_system"],
            "bbox_min_x": bbox_min_x if bbox_min_x is not None else record["bbox_min_x"],
            "bbox_min_y": bbox_min_y if bbox_min_y is not None else record["bbox_min_y"],
            "bbox_min_z": bbox_min_z if bbox_min_z is not None else record["bbox_min_z"],
            "bbox_max_x": bbox_max_x if bbox_max_x is not None else record["bbox_max_x"],
            "bbox_max_y": bbox_max_y if bbox_max_y is not None else record["bbox_max_y"],
            "bbox_max_z": bbox_max_z if bbox_max_z is not None else record["bbox_max_z"],
            "heightmap_ref": heightmap_ref if heightmap_ref is not None else record["heightmap_ref"],
            "mesh_ref": mesh_ref if mesh_ref is not None else record["mesh_ref"],
            "texture_ref": texture_ref if texture_ref is not None else record["texture_ref"],
            "source": source if source is not None else record["source"],
            "resolution": resolution if resolution is not None else record["resolution"],
            "notes": notes if notes is not None else record["notes"],
            "updated_at": self._now(),
        }
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE terrain_raw_objects
                SET name = ?, terrain_type = ?, coord_system = ?, bbox_min_x = ?, bbox_min_y = ?, bbox_min_z = ?,
                    bbox_max_x = ?, bbox_max_y = ?, bbox_max_z = ?, heightmap_ref = ?, mesh_ref = ?, texture_ref = ?,
                    source = ?, resolution = ?, notes = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    next_record["name"],
                    next_record["terrain_type"],
                    next_record["coord_system"],
                    next_record["bbox_min_x"],
                    next_record["bbox_min_y"],
                    next_record["bbox_min_z"],
                    next_record["bbox_max_x"],
                    next_record["bbox_max_y"],
                    next_record["bbox_max_z"],
                    next_record["heightmap_ref"],
                    next_record["mesh_ref"],
                    next_record["texture_ref"],
                    next_record["source"],
                    next_record["resolution"],
                    next_record["notes"],
                    next_record["updated_at"],
                    terrain_raw_object_id,
                ),
            )
            conn.execute(
                """
                UPDATE terrain_display_objects
                SET display_name = ?, display_ref = ?, material_ref = ?, notes = ?, updated_at = ?
                WHERE terrain_raw_object_id = ?
                """,
                (
                    next_record["name"],
                    next_record["mesh_ref"] or next_record["heightmap_ref"],
                    next_record["texture_ref"],
                    next_record["notes"],
                    next_record["updated_at"],
                    terrain_raw_object_id,
                ),
            )
            self._log(conn, "update_terrain_raw_object", "terrain_raw_object", terrain_raw_object_id, next_record["name"])
        return self.get_terrain_raw_object(terrain_raw_object_id)

    def create_terrain_change_set(
        self,
        *,
        work_area_id: str,
        quantity_id: str = "",
        spatial_raw_object_id: str = "",
        terrain_raw_object_id: str = "",
        change_type: str = "fill",
        result_ref: str = "",
        record_day: int | None = None,
        notes: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("terrain_change_sets", "tcs"),
            "work_area_id": work_area_id,
            "quantity_id": quantity_id,
            "spatial_raw_object_id": spatial_raw_object_id,
            "terrain_raw_object_id": terrain_raw_object_id,
            "change_type": change_type,
            "result_ref": result_ref,
            "record_day": self.current_day if record_day is None else record_day,
            "recorded_at": now,
            "notes": notes,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO terrain_change_sets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            self._log(conn, "create_terrain_change_set", "terrain_change_set", record["id"], record["change_type"])
        return record

    def update_terrain_change_set(
        self,
        terrain_change_set_id: str,
        *,
        work_area_id: str | None = None,
        quantity_id: str | None = None,
        spatial_raw_object_id: str | None = None,
        terrain_raw_object_id: str | None = None,
        change_type: str | None = None,
        result_ref: str | None = None,
        record_day: int | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_terrain_change_set(terrain_change_set_id)
        if not record:
            return None
        next_record = {
            "work_area_id": work_area_id if work_area_id is not None else record["work_area_id"],
            "quantity_id": quantity_id if quantity_id is not None else record["quantity_id"],
            "spatial_raw_object_id": spatial_raw_object_id if spatial_raw_object_id is not None else record["spatial_raw_object_id"],
            "terrain_raw_object_id": terrain_raw_object_id if terrain_raw_object_id is not None else record["terrain_raw_object_id"],
            "change_type": change_type if change_type is not None else record["change_type"],
            "result_ref": result_ref if result_ref is not None else record["result_ref"],
            "record_day": record_day if record_day is not None else record["record_day"],
            "notes": notes if notes is not None else record["notes"],
        }
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE terrain_change_sets
                SET work_area_id = ?, quantity_id = ?, spatial_raw_object_id = ?, terrain_raw_object_id = ?,
                    change_type = ?, result_ref = ?, record_day = ?, notes = ?
                WHERE id = ?
                """,
                (
                    next_record["work_area_id"],
                    next_record["quantity_id"],
                    next_record["spatial_raw_object_id"],
                    next_record["terrain_raw_object_id"],
                    next_record["change_type"],
                    next_record["result_ref"],
                    next_record["record_day"],
                    next_record["notes"],
                    terrain_change_set_id,
                ),
            )
            self._log(conn, "update_terrain_change_set", "terrain_change_set", terrain_change_set_id, next_record["change_type"])
        return self.get_terrain_change_set(terrain_change_set_id)

    def create_resource_log(
        self,
        *,
        work_area_id: str,
        resource_type: str,
        resource_category: str | None = None,
        resource_subtype: str = "",
        resource_name: str,
        quantity: float = 0.0,
        unit: str = "",
        record_day: int | None = None,
        team_name: str = "",
        specification: str = "",
        source_type: str = "manual",
        supplier: str = "",
        notes: str = "",
    ) -> dict[str, Any]:
        now = self._now()
        record = {
            "id": self._next_id("resource_logs", "rl"),
            "work_area_id": work_area_id,
            "resource_type": resource_type,
            "resource_category": resource_category or resource_type,
            "resource_subtype": resource_subtype,
            "resource_name": resource_name,
            "quantity": quantity,
            "unit": unit,
            "record_day": self.current_day if record_day is None else record_day,
            "team_name": team_name,
            "specification": specification,
            "source_type": source_type or "manual",
            "supplier": supplier,
            "notes": notes,
            "created_at": now,
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO resource_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tuple(record.values()),
            )
            self._log(conn, "create_resource_log", "resource_log", record["id"], record["resource_name"])
        return record

    def update_resource_log(
        self,
        resource_log_id: str,
        *,
        work_area_id: str | None = None,
        resource_type: str | None = None,
        resource_category: str | None = None,
        resource_subtype: str | None = None,
        resource_name: str | None = None,
        quantity: float | None = None,
        unit: str | None = None,
        record_day: int | None = None,
        team_name: str | None = None,
        specification: str | None = None,
        source_type: str | None = None,
        supplier: str | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_resource_log(resource_log_id)
        if not record:
            return None
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_resource_type = resource_type if resource_type is not None else record["resource_type"]
        next_resource_category = resource_category if resource_category is not None else (record.get("resource_category") or next_resource_type)
        next_resource_subtype = resource_subtype if resource_subtype is not None else record.get("resource_subtype", "")
        next_resource_name = resource_name if resource_name is not None else record["resource_name"]
        next_quantity = quantity if quantity is not None else record["quantity"]
        next_unit = unit if unit is not None else record["unit"]
        next_record_day = record_day if record_day is not None else record["record_day"]
        next_team_name = team_name if team_name is not None else record.get("team_name", "")
        next_specification = specification if specification is not None else record.get("specification", "")
        next_source_type = source_type if source_type is not None else record.get("source_type", "manual")
        next_supplier = supplier if supplier is not None else record["supplier"]
        next_notes = notes if notes is not None else record["notes"]
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE resource_logs
                SET work_area_id = ?, resource_type = ?, resource_category = ?, resource_subtype = ?, resource_name = ?, quantity = ?, unit = ?,
                    record_day = ?, team_name = ?, specification = ?, source_type = ?, supplier = ?, notes = ?
                WHERE id = ?
                """,
                (
                    next_work_area_id,
                    next_resource_type,
                    next_resource_category,
                    next_resource_subtype,
                    next_resource_name,
                    next_quantity,
                    next_unit,
                    next_record_day,
                    next_team_name,
                    next_specification,
                    next_source_type,
                    next_supplier,
                    next_notes,
                    resource_log_id,
                ),
            )
            self._log(conn, "update_resource_log", "resource_log", resource_log_id, next_resource_name)
        return self.get_resource_log(resource_log_id)

    def create_report(self, *, author: str, work_area_ids: list[str], completed_summary: str, next_plan: str = "", weather: str = "", labor_count: int = 0, machine_count: int = 0, notes: str = "") -> dict[str, Any]:
        now = self._now()
        report_id = self._next_id("daily_reports", "report")
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO daily_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (report_id, self.current_day, author, completed_summary, next_plan, weather, labor_count, machine_count, notes, now),
            )
            for work_area_id in work_area_ids:
                conn.execute("INSERT OR IGNORE INTO report_work_areas VALUES (?, ?)", (report_id, work_area_id))
            self._log(conn, "create_report", "report", report_id, completed_summary)
        return self.get_report(report_id) or {}

    def update_report(
        self,
        report_id: str,
        *,
        author: str | None = None,
        work_area_ids: list[str] | None = None,
        completed_summary: str | None = None,
        next_plan: str | None = None,
        weather: str | None = None,
        labor_count: int | None = None,
        machine_count: int | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        record = self.get_report(report_id)
        if not record:
            return None
        next_author = author if author is not None else record["author"]
        next_work_area_ids = work_area_ids if work_area_ids is not None else record["work_area_ids"]
        next_completed_summary = completed_summary if completed_summary is not None else record["completed_summary"]
        next_next_plan = next_plan if next_plan is not None else record["next_plan"]
        next_weather = weather if weather is not None else record["weather"]
        next_labor_count = labor_count if labor_count is not None else record["labor_count"]
        next_machine_count = machine_count if machine_count is not None else record["machine_count"]
        next_notes = notes if notes is not None else record["notes"]
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE daily_reports
                SET author = ?, completed_summary = ?, next_plan = ?, weather = ?, labor_count = ?, machine_count = ?, notes = ?
                WHERE id = ?
                """,
                (next_author, next_completed_summary, next_next_plan, next_weather, next_labor_count, next_machine_count, next_notes, report_id),
            )
            conn.execute("DELETE FROM report_work_areas WHERE report_id = ?", (report_id,))
            for work_area_id in next_work_area_ids:
                conn.execute("INSERT OR IGNORE INTO report_work_areas VALUES (?, ?)", (report_id, work_area_id))
            self._log(conn, "update_report", "report", report_id, next_completed_summary)
        return self.get_report(report_id)

    def list_logs(self, *, target_type: str | None = None, target_id: str | None = None, limit: int | None = None) -> list[dict[str, Any]]:
        sql = "SELECT * FROM operation_logs WHERE 1=1"
        params: list[Any] = []
        if target_type is not None:
            sql += " AND target_type = ?"; params.append(target_type)
        if target_id is not None:
            sql += " AND target_id = ?"; params.append(target_id)
        sql += " ORDER BY created_at DESC"
        if limit is not None:
            sql += " LIMIT ?"; params.append(limit)
        return self._query_all(sql, tuple(params))

    def get_import_template(self, dataset: str) -> str:
        templates = {
            "work_areas": (
                ["id", "name", "type", "work_area_subtype", "owner", "planned_progress", "actual_progress", "description"],
                ["", "K1+500-K2+000 Pavement", "road", "paving", "Liu Gong", "0.25", "0.10", "Road paving work area"],
            ),
            "quantities": (
                ["id", "work_area_id", "item_name", "item_code", "category", "unit", "planned_quantity", "actual_quantity", "notes"],
                ["", "wa_road_001", "Asphalt Paving", "ASP-001", "paving", "m2", "6800", "1200", "Imported from Excel"],
            ),
            "design_quantities": (
                ["id", "work_area_id", "item_name", "item_code", "category", "unit", "target_quantity", "design_version", "notes"],
                ["", "wa_road_001", "Asphalt Paving", "ASP-001", "paving", "m2", "6800", "V1", "Design target"],
            ),
            "resource_logs": (
                ["id", "work_area_id", "resource_type", "resource_category", "resource_subtype", "resource_name", "quantity", "unit", "record_day", "team_name", "specification", "source_type", "supplier", "notes"],
                ["", "wa_road_001", "machine", "machine", "paver", "Paver", "2", "set", str(self.current_day), "Road Team", "ABG-8820", "manual", "Road Team", "Shift A"],
            ),
            "design_spatial_objects": (
                ["id", "work_area_id", "name", "design_type", "coord_system", "station_start", "station_end", "bbox_min_x", "bbox_min_y", "bbox_min_z", "bbox_max_x", "bbox_max_y", "bbox_max_z", "design_ref", "elevation_target", "design_version", "notes"],
                ["", "wa_road_001", "Pavement Design Range", "alignment", "station", "1500", "2000", "", "", "", "", "", "", "design://pavement_alignment_v1", "", "V1", "Target alignment"],
            ),
            "daily_reports": (
                ["id", "report_day", "author", "work_area_ids", "completed_summary", "next_plan", "weather", "labor_count", "machine_count", "notes"],
                ["", str(self.current_day), "日报导入", "wa_road_001|wa_bridge_001", "Completed paving and pier formwork", "Continue paving and pier concrete", "cloudy", "28", "6", "Imported from report package"],
            ),
            "terrain_change_sets": (
                ["id", "work_area_id", "quantity_id", "spatial_raw_object_id", "terrain_raw_object_id", "change_type", "result_ref", "record_day", "notes"],
                ["", "wa_road_001", "qty_001", "sro_003", "tro_001", "paving", "terrain-result://paving_day2", str(self.current_day), "Imported terrain change"],
            ),
        }
        if dataset not in templates:
            raise ValueError(f"Unsupported import dataset: {dataset}")
        output = io.StringIO()
        writer = csv.writer(output)
        headers, sample = templates[dataset]
        writer.writerow(headers)
        writer.writerow(sample)
        return output.getvalue()

    def import_tabular_data(self, dataset: str, text: str) -> dict[str, Any]:
        if not text.strip():
            return {"dataset": dataset, "created": 0, "updated": 0, "errors": [{"row": 0, "message": "Import text is empty"}], "total": 0}

        reader = self._build_tabular_reader(text)
        created = 0
        updated = 0
        errors: list[dict[str, Any]] = []

        with self._connect() as conn:
            for index, row in enumerate(reader, start=2):
                normalized = {self._normalize_header(key): self._clean_cell(value) for key, value in row.items() if key is not None}
                if not any(value != "" for value in normalized.values()):
                    continue
                try:
                    action = self._import_dataset_row_with_conn(conn, dataset, normalized)
                    if action == "created":
                        created += 1
                    else:
                        updated += 1
                except Exception as error:
                    errors.append({"row": index, "message": str(error)})

        return {
            "dataset": dataset,
            "created": created,
            "updated": updated,
            "errors": errors,
            "total": created + updated,
        }

    def export_tabular_data(self, dataset: str) -> str:
        dataset_map: dict[str, tuple[list[str], list[dict[str, Any]]]] = {
            "work_areas": (
                ["id", "name", "type", "work_area_subtype", "owner", "planned_progress", "actual_progress", "description"],
                self.list_work_areas(),
            ),
            "quantities": (
                ["id", "work_area_id", "item_name", "item_code", "category", "unit", "planned_quantity", "actual_quantity", "notes"],
                self.list_quantities(),
            ),
            "design_quantities": (
                ["id", "work_area_id", "item_name", "item_code", "category", "unit", "target_quantity", "design_version", "notes"],
                self.list_design_quantities(),
            ),
            "resource_logs": (
                ["id", "work_area_id", "resource_type", "resource_category", "resource_subtype", "resource_name", "quantity", "unit", "record_day", "team_name", "specification", "source_type", "supplier", "notes"],
                self.list_resource_logs(),
            ),
            "design_spatial_objects": (
                ["id", "work_area_id", "name", "design_type", "coord_system", "station_start", "station_end", "bbox_min_x", "bbox_min_y", "bbox_min_z", "bbox_max_x", "bbox_max_y", "bbox_max_z", "design_ref", "elevation_target", "design_version", "notes"],
                self.list_design_spatial_objects(),
            ),
            "daily_reports": (
                ["id", "report_day", "author", "work_area_ids", "completed_summary", "next_plan", "weather", "labor_count", "machine_count", "notes"],
                self.list_reports(),
            ),
            "terrain_change_sets": (
                ["id", "work_area_id", "quantity_id", "spatial_raw_object_id", "terrain_raw_object_id", "change_type", "result_ref", "record_day", "notes"],
                self.list_terrain_change_sets(),
            ),
        }
        if dataset not in dataset_map:
            raise ValueError(f"Unsupported export dataset: {dataset}")

        headers, rows = dataset_map[dataset]
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        for row in rows:
            values: list[Any] = []
            for header in headers:
                value = row.get(header, "")
                if dataset == "daily_reports" and header == "work_area_ids" and isinstance(value, list):
                    value = "|".join(value)
                values.append(value)
            writer.writerow(values)
        return output.getvalue()

    def advance_day(self) -> dict[str, Any]:
        with self._connect() as conn:
            day = self.current_day + 1
            conn.execute("INSERT INTO app_meta(key, value) VALUES('current_day', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", (str(day),))
            self._log(conn, "advance_day", "system", "day", f"Advance to day {day}")
        return self.get_state()

    def create_demo_task(self) -> dict[str, Any]:
        self.create_task(title=f"Validation task Day {self.current_day}", work_area_id="wa_road_001", assignee="QA Team", due_day=self.current_day + 1, notes="Created from validation console")
        return self.get_state()

    def create_demo_issue(self) -> dict[str, Any]:
        self.create_issue(title=f"Validation issue Day {self.current_day}", work_area_id="wa_road_001", owner="Site Lead", severity="high", due_day=self.current_day + 1, description="Created from validation console")
        return self.get_state()

    def create_demo_report(self) -> dict[str, Any]:
        self.create_report(author="Validation User", work_area_ids=["wa_road_001"], completed_summary=f"Validation summary on day {self.current_day}", next_plan="Continue validation flow tomorrow")
        return self.get_state()

    def reset_demo(self) -> dict[str, Any]:
        with self._connect() as conn:
            conn.execute("DELETE FROM report_work_areas")
            conn.execute("DELETE FROM task_status_history")
            conn.execute("DELETE FROM issue_status_history")
            conn.execute("DELETE FROM work_area_progress_history")
            conn.execute("DELETE FROM quantity_progress_history")
            conn.execute("DELETE FROM design_spatial_objects")
            conn.execute("DELETE FROM design_quantities")
            conn.execute("DELETE FROM terrain_display_objects")
            conn.execute("DELETE FROM terrain_raw_objects")
            conn.execute("DELETE FROM terrain_change_sets")
            conn.execute("DELETE FROM resource_logs")
            conn.execute("DELETE FROM spatial_display_objects")
            conn.execute("DELETE FROM spatial_bindings")
            conn.execute("DELETE FROM spatial_raw_objects")
            conn.execute("DELETE FROM daily_reports")
            conn.execute("DELETE FROM engineering_quantities")
            conn.execute("DELETE FROM tasks")
            conn.execute("DELETE FROM issues")
            conn.execute("DELETE FROM operation_logs")
            conn.execute("DELETE FROM work_areas")
            conn.execute("DELETE FROM app_meta")
        self._seed_if_needed()
        return self.get_state()

    def get_state(self) -> dict[str, Any]:
        return {
            "current_day": self.current_day,
            "work_areas": self.list_work_areas(),
            "tasks": self.list_tasks(),
            "issues": self.list_issues(),
            "reports": self.list_reports(),
            "quantities": self.list_quantities(),
            "design_quantities": self.list_design_quantities(),
            "design_spatial_objects": self.list_design_spatial_objects(),
            "terrain_raw_objects": self.list_terrain_raw_objects(),
            "terrain_change_sets": self.list_terrain_change_sets(),
            "resource_logs": self.list_resource_logs(),
            "logs": self.list_logs(limit=50),
        }

    def legacy_snapshot(self) -> dict[str, Any]:
        return {
            "currentDay": self.current_day,
            "sequence": 0,
            "logs": [f"[{item['created_at']}] {item['message']}" for item in self.list_logs(limit=50)],
            "workAreas": [{"id": x["id"], "name": x["name"], "type": x["type"], "workAreaSubtype": x.get("work_area_subtype", ""), "plannedProgress": x["planned_progress"], "actualProgress": x["actual_progress"], "owner": x["owner"]} for x in self.list_work_areas()],
            "tasks": [{"id": x["id"], "title": x["title"], "workAreaId": x["work_area_id"], "assignee": x["assignee"], "plannedDay": x["planned_day"], "dueDay": x["due_day"], "status": x["status"], "completionRatio": x["completion_ratio"], "notes": x["notes"]} for x in self.list_tasks()],
            "issues": [{"id": x["id"], "title": x["title"], "workAreaId": x["work_area_id"], "owner": x["owner"], "dueDay": x["due_day"], "severity": x["severity"], "status": x["status"], "description": x["description"]} for x in self.list_issues()],
            "reports": [{"id": x["id"], "reportDay": x["report_day"], "author": x["author"], "workAreaIds": x["work_area_ids"], "completedSummary": x["completed_summary"], "nextPlan": x["next_plan"]} for x in self.list_reports()],
            "quantities": [{"id": x["id"], "workAreaId": x["work_area_id"], "itemName": x["item_name"], "itemCode": x["item_code"], "category": x["category"], "unit": x["unit"], "plannedQuantity": x["planned_quantity"], "actualQuantity": x["actual_quantity"], "status": x["status"], "notes": x["notes"]} for x in self.list_quantities()],
            "designQuantities": [{"id": x["id"], "workAreaId": x["work_area_id"], "itemName": x["item_name"], "itemCode": x["item_code"], "category": x["category"], "unit": x["unit"], "targetQuantity": x["target_quantity"], "designVersion": x["design_version"], "notes": x["notes"]} for x in self.list_design_quantities()],
            "designSpatialObjects": [{"id": x["id"], "workAreaId": x["work_area_id"], "name": x["name"], "designType": x["design_type"], "coordSystem": x["coord_system"], "stationStart": x["station_start"], "stationEnd": x["station_end"], "bboxMinX": x["bbox_min_x"], "bboxMinY": x["bbox_min_y"], "bboxMinZ": x["bbox_min_z"], "bboxMaxX": x["bbox_max_x"], "bboxMaxY": x["bbox_max_y"], "bboxMaxZ": x["bbox_max_z"], "designRef": x["design_ref"], "elevationTarget": x["elevation_target"], "designVersion": x["design_version"], "notes": x["notes"]} for x in self.list_design_spatial_objects()],
            "terrainRawObjects": [{"id": x["id"], "name": x["name"], "terrainType": x["terrain_type"], "coordSystem": x["coord_system"], "bboxMinX": x["bbox_min_x"], "bboxMinY": x["bbox_min_y"], "bboxMinZ": x["bbox_min_z"], "bboxMaxX": x["bbox_max_x"], "bboxMaxY": x["bbox_max_y"], "bboxMaxZ": x["bbox_max_z"], "heightmapRef": x["heightmap_ref"], "meshRef": x["mesh_ref"], "textureRef": x["texture_ref"], "source": x["source"], "resolution": x["resolution"], "notes": x["notes"]} for x in self.list_terrain_raw_objects()],
            "terrainChangeSets": [{"id": x["id"], "workAreaId": x["work_area_id"], "quantityId": x["quantity_id"], "spatialRawObjectId": x["spatial_raw_object_id"], "terrainRawObjectId": x["terrain_raw_object_id"], "changeType": x["change_type"], "resultRef": x["result_ref"], "recordDay": x["record_day"], "recordedAt": x["recorded_at"], "notes": x["notes"]} for x in self.list_terrain_change_sets()],
            "resourceLogs": [{
                "id": x["id"],
                "workAreaId": x["work_area_id"],
                "resourceType": x["resource_type"],
                "resourceCategory": x.get("resource_category") or x["resource_type"],
                "resourceSubtype": x.get("resource_subtype", ""),
                "resourceName": x["resource_name"],
                "quantity": x["quantity"],
                "unit": x["unit"],
                "recordDay": x["record_day"],
                "teamName": x.get("team_name", ""),
                "specification": x.get("specification", ""),
                "sourceType": x.get("source_type", "manual"),
                "supplier": x["supplier"],
                "notes": x["notes"],
            } for x in self.list_resource_logs()],
        }

    def _seed_if_needed(self) -> None:
        with self._connect() as conn:
            count = conn.execute("SELECT COUNT(*) AS c FROM work_areas").fetchone()["c"]
            now = self._now()
            conn.execute("INSERT INTO app_meta(key, value) VALUES('current_day', '0') ON CONFLICT(key) DO NOTHING")
            if not count:
                conn.executemany("INSERT INTO work_areas VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("wa_road_001", "K1+000-K1+500 Roadbed", "road", "subgrade", "Zhang Gong", 0.55, 0.48, "in_progress", 1000.0, 1500.0, "Roadbed fill and compaction work area", now, now),
                    ("wa_bridge_001", "Pier P3-P4", "bridge", "bridge_substructure", "Li Gong", 0.35, 0.35, "in_progress", 5000.0, 5100.0, "Bridge pier reinforcement and formwork work area", now, now),
                ])
                conn.execute("INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ("task_001", "wa_road_001", "Complete compaction test section", "Chen Team", 0, 2, "in_progress", 0.6, "Compaction acceptance pending", now, now))
                conn.execute("INSERT INTO issues VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ("issue_001", "wa_road_001", "Drainage ditch backlog", "Wang Supervisor", "high", "open", 1, "Temporary drainage not fully opened before rain.", now, now, None))
                conn.execute("INSERT INTO daily_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ("report_001", 0, "Chen Team", "Roadbed fill and pier reinforcement binding continued.", "Start compaction acceptance and formwork inspection.", "cloudy", 18, 4, "Steel in stock, gravel replenishment tomorrow.", now))
                conn.executemany("INSERT INTO engineering_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("qty_001", "wa_road_001", "Roadbed Fill", "RB-FILL", "earthwork", "m3", 1200.0, 650.0, "in_progress", "Main embankment fill quantity", now, now),
                    ("qty_002", "wa_bridge_001", "Pier Rebar", "PIER-RB", "bridge", "t", 85.0, 30.0, "in_progress", "Pier P3-P4 reinforcement quantity", now, now),
                ])
                conn.executemany("INSERT INTO design_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("dq_001", "wa_road_001", "Roadbed Fill", "RB-FILL", "earthwork", "m3", 1200.0, "V1", "Roadbed design target quantity", now, now),
                    ("dq_002", "wa_bridge_001", "Pier Rebar", "PIER-RB", "bridge", "t", 85.0, "V1", "Pier reinforcement design target quantity", now, now),
                ])
                conn.executemany("INSERT INTO design_spatial_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("dso_001", "wa_road_001", "Roadbed Design Alignment", "alignment", "station", 1000.0, 1500.0, None, None, None, None, None, None, "design://roadbed_alignment_v1", None, "V1", "Design alignment for roadbed work area", now, now),
                    ("dso_002", "wa_bridge_001", "Pier Design Zone", "zone", "local", None, None, 115.0, 30.0, 0.0, 135.0, 46.0, 24.0, "design://pier_zone_v1", 18.5, "V1", "Design space for pier construction zone", now, now),
                ])
                conn.executemany("INSERT INTO terrain_raw_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("tro_001", "Original Site Terrain", "site", "local", 0.0, 0.0, 0.0, 240.0, 160.0, 32.0, "terrain://site_heightmap_v1", "terrain://site_mesh_v1", "terrain://site_texture_v1", "import", "1m", "Original terrain base", now, now),
                    ("tro_002", "Bridge Yard Terrain", "yard", "local", 100.0, 20.0, 0.0, 180.0, 80.0, 18.0, "terrain://yard_heightmap_v1", "", "", "manual", "0.5m", "Bridge yard terrain base", now, now),
                ])
                conn.executemany("INSERT INTO terrain_display_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("tdo_001", "tro_001", "Original Site Terrain", "terrain://site_mesh_v1", "terrain://site_texture_v1", 1, 1.0, 0, "Original terrain base", now, now),
                    ("tdo_002", "tro_002", "Bridge Yard Terrain", "terrain://yard_heightmap_v1", "", 1, 0.9, 1, "Bridge yard terrain base", now, now),
                ])
                conn.executemany("INSERT INTO terrain_change_sets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("tcs_001", "wa_road_001", "qty_001", "sro_003", "tro_001", "fill", "terrain-result://roadbed_fill_day0", 0, now, "Initial fill result zone"),
                    ("tcs_002", "wa_bridge_001", "qty_002", "sro_004", "tro_002", "structure", "terrain-result://pier_rebar_day0", 0, now, "Initial bridge yard structure change"),
                ])
                conn.executemany("INSERT INTO resource_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("rl_001", "wa_road_001", "labor", "labor", "general_worker", "Roadbed Crew", 18.0, "person", 0, "Roadbed Team", "", "manual", "Chen Team", "Seed labor input", now),
                    ("rl_002", "wa_road_001", "machine", "machine", "roller", "Compactor", 2.0, "set", 0, "", "12t", "manual", "", "Seed machine input", now),
                    ("rl_003", "wa_bridge_001", "material", "material", "rebar", "Rebar", 12.0, "t", 0, "", "HRB400", "manual", "Steel Supplier", "Seed material input", now),
                ])
                conn.executemany("INSERT INTO task_status_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("tsh_001", "task_001", None, "planned", None, 0.0, now, "system", "Task created"),
                    ("tsh_002", "task_001", "planned", "in_progress", 0.0, 0.6, now, "system", "Compaction test section started"),
                ])
                conn.executemany("INSERT INTO issue_status_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("ish_001", "issue_001", None, "open", None, "high", now, "system", "Issue created"),
                ])
                conn.executemany("INSERT INTO work_area_progress_history VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("wph_001", "wa_road_001", 0.55, 0.48, "in_progress", now, "report", "Seed work area progress"),
                    ("wph_002", "wa_bridge_001", 0.35, 0.35, "in_progress", now, "report", "Seed work area progress"),
                ])
                conn.executemany("INSERT INTO quantity_progress_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("qph_001", "qty_001", 1200.0, 650.0, -550.0, "in_progress", now, "report", "Seed quantity progress"),
                    ("qph_002", "qty_002", 85.0, 30.0, -55.0, "in_progress", now, "report", "Seed quantity progress"),
                ])
                conn.executemany("INSERT INTO report_work_areas VALUES (?, ?)", [("report_001", "wa_road_001"), ("report_001", "wa_bridge_001")])
                for log_id, action, target_type, target_id, message in [
                    ("log_001", "create_work_area", "work_area", "wa_road_001", "Created work area wa_road_001"),
                    ("log_002", "create_work_area", "work_area", "wa_bridge_001", "Created work area wa_bridge_001"),
                    ("log_003", "create_task", "task", "task_001", "Created task task_001"),
                    ("log_004", "create_issue", "issue", "issue_001", "Created issue issue_001"),
                    ("log_005", "create_report", "report", "report_001", "Created report report_001"),
                    ("log_006", "create_quantity", "quantity", "qty_001", "Created quantity qty_001"),
                    ("log_007", "create_quantity", "quantity", "qty_002", "Created quantity qty_002"),
                    ("log_010", "create_design_quantity", "design_quantity", "dq_001", "Created design quantity dq_001"),
                    ("log_011", "create_design_quantity", "design_quantity", "dq_002", "Created design quantity dq_002"),
                    ("log_015", "create_design_spatial_object", "design_spatial_object", "dso_001", "Created design spatial object dso_001"),
                    ("log_016", "create_design_spatial_object", "design_spatial_object", "dso_002", "Created design spatial object dso_002"),
                    ("log_017", "create_terrain_raw_object", "terrain_raw_object", "tro_001", "Created terrain raw object tro_001"),
                    ("log_018", "create_terrain_raw_object", "terrain_raw_object", "tro_002", "Created terrain raw object tro_002"),
                    ("log_019", "create_terrain_change_set", "terrain_change_set", "tcs_001", "Created terrain change set tcs_001"),
                    ("log_020", "create_terrain_change_set", "terrain_change_set", "tcs_002", "Created terrain change set tcs_002"),
                    ("log_012", "create_resource_log", "resource_log", "rl_001", "Created resource log rl_001"),
                    ("log_013", "create_resource_log", "resource_log", "rl_002", "Created resource log rl_002"),
                    ("log_014", "create_resource_log", "resource_log", "rl_003", "Created resource log rl_003"),
                ]:
                    conn.execute("INSERT INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", (log_id, action, target_type, target_id, message, now))

            spatial_count = conn.execute("SELECT COUNT(*) AS c FROM spatial_raw_objects").fetchone()["c"]
            if not spatial_count:
                self._seed_spatial_data(conn, now)

            design_quantity_count = conn.execute("SELECT COUNT(*) AS c FROM design_quantities").fetchone()["c"]
            if not design_quantity_count:
                conn.executemany("INSERT INTO design_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("dq_001", "wa_road_001", "Roadbed Fill", "RB-FILL", "earthwork", "m3", 1200.0, "V1", "Roadbed design target quantity", now, now),
                    ("dq_002", "wa_bridge_001", "Pier Rebar", "PIER-RB", "bridge", "t", 85.0, "V1", "Pier reinforcement design target quantity", now, now),
                ])
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_010", "create_design_quantity", "design_quantity", "dq_001", "Created design quantity dq_001", now))
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_011", "create_design_quantity", "design_quantity", "dq_002", "Created design quantity dq_002", now))

            design_spatial_count = conn.execute("SELECT COUNT(*) AS c FROM design_spatial_objects").fetchone()["c"]
            if not design_spatial_count:
                conn.executemany("INSERT INTO design_spatial_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("dso_001", "wa_road_001", "Roadbed Design Alignment", "alignment", "station", 1000.0, 1500.0, None, None, None, None, None, None, "design://roadbed_alignment_v1", None, "V1", "Design alignment for roadbed work area", now, now),
                    ("dso_002", "wa_bridge_001", "Pier Design Zone", "zone", "local", None, None, 115.0, 30.0, 0.0, 135.0, 46.0, 24.0, "design://pier_zone_v1", 18.5, "V1", "Design space for pier construction zone", now, now),
                ])
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_015", "create_design_spatial_object", "design_spatial_object", "dso_001", "Created design spatial object dso_001", now))
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_016", "create_design_spatial_object", "design_spatial_object", "dso_002", "Created design spatial object dso_002", now))

            terrain_count = conn.execute("SELECT COUNT(*) AS c FROM terrain_raw_objects").fetchone()["c"]
            if not terrain_count:
                conn.executemany("INSERT INTO terrain_raw_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("tro_001", "Original Site Terrain", "site", "local", 0.0, 0.0, 0.0, 240.0, 160.0, 32.0, "terrain://site_heightmap_v1", "terrain://site_mesh_v1", "terrain://site_texture_v1", "import", "1m", "Original terrain base", now, now),
                    ("tro_002", "Bridge Yard Terrain", "yard", "local", 100.0, 20.0, 0.0, 180.0, 80.0, 18.0, "terrain://yard_heightmap_v1", "", "", "manual", "0.5m", "Bridge yard terrain base", now, now),
                ])
                conn.executemany("INSERT INTO terrain_display_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("tdo_001", "tro_001", "Original Site Terrain", "terrain://site_mesh_v1", "terrain://site_texture_v1", 1, 1.0, 0, "Original terrain base", now, now),
                    ("tdo_002", "tro_002", "Bridge Yard Terrain", "terrain://yard_heightmap_v1", "", 1, 0.9, 1, "Bridge yard terrain base", now, now),
                ])
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_017", "create_terrain_raw_object", "terrain_raw_object", "tro_001", "Created terrain raw object tro_001", now))
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_018", "create_terrain_raw_object", "terrain_raw_object", "tro_002", "Created terrain raw object tro_002", now))

            terrain_change_count = conn.execute("SELECT COUNT(*) AS c FROM terrain_change_sets").fetchone()["c"]
            if not terrain_change_count:
                conn.executemany("INSERT INTO terrain_change_sets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("tcs_001", "wa_road_001", "qty_001", "sro_003", "tro_001", "fill", "terrain-result://roadbed_fill_day0", 0, now, "Initial fill result zone"),
                    ("tcs_002", "wa_bridge_001", "qty_002", "sro_004", "tro_002", "structure", "terrain-result://pier_rebar_day0", 0, now, "Initial bridge yard structure change"),
                ])
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_019", "create_terrain_change_set", "terrain_change_set", "tcs_001", "Created terrain change set tcs_001", now))
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_020", "create_terrain_change_set", "terrain_change_set", "tcs_002", "Created terrain change set tcs_002", now))

            resource_log_count = conn.execute("SELECT COUNT(*) AS c FROM resource_logs").fetchone()["c"]
            if not resource_log_count:
                conn.executemany("INSERT INTO resource_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    ("rl_001", "wa_road_001", "labor", "labor", "general_worker", "Roadbed Crew", 18.0, "person", 0, "Roadbed Team", "", "manual", "Chen Team", "Seed labor input", now),
                    ("rl_002", "wa_road_001", "machine", "machine", "roller", "Compactor", 2.0, "set", 0, "", "12t", "manual", "", "Seed machine input", now),
                    ("rl_003", "wa_bridge_001", "material", "material", "rebar", "Rebar", 12.0, "t", 0, "", "HRB400", "manual", "Steel Supplier", "Seed material input", now),
                ])
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_012", "create_resource_log", "resource_log", "rl_001", "Created resource log rl_001", now))
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_013", "create_resource_log", "resource_log", "rl_002", "Created resource log rl_002", now))
                conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", ("log_014", "create_resource_log", "resource_log", "rl_003", "Created resource log rl_003", now))

            task_history_count = conn.execute("SELECT COUNT(*) AS c FROM task_status_history").fetchone()["c"]
            issue_history_count = conn.execute("SELECT COUNT(*) AS c FROM issue_status_history").fetchone()["c"]
            work_area_history_count = conn.execute("SELECT COUNT(*) AS c FROM work_area_progress_history").fetchone()["c"]
            quantity_history_count = conn.execute("SELECT COUNT(*) AS c FROM quantity_progress_history").fetchone()["c"]
            if not task_history_count or not issue_history_count or not work_area_history_count or not quantity_history_count:
                self._seed_history_data(
                    conn,
                    now,
                    seed_tasks=not task_history_count,
                    seed_issues=not issue_history_count,
                    seed_work_areas=not work_area_history_count,
                    seed_quantities=not quantity_history_count,
                )

    def _query_all(self, sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
        with self._connect() as conn:
            return [dict(row) for row in conn.execute(sql, params).fetchall()]

    def _query_one(self, sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute(sql, params).fetchone()
            return dict(row) if row else None

    def _build_tabular_reader(self, text: str) -> csv.DictReader:
        sample = text[:2048]
        delimiter = ","
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
            delimiter = dialect.delimiter
        except csv.Error:
            delimiter = "\t" if "\t" in sample else ","
        return csv.DictReader(io.StringIO(text), delimiter=delimiter)

    def _normalize_header(self, value: str) -> str:
        return (value or "").strip().lower()

    def _clean_cell(self, value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()

    def _parse_optional_float(self, value: str) -> float | None:
        if value == "":
            return None
        return float(value)

    def _parse_optional_int(self, value: str) -> int | None:
        if value == "":
            return None
        return int(float(value))

    def _parse_work_area_ids(self, value: str) -> list[str]:
        if not value:
            return []
        parts = re.split(r"[|;,]+", value)
        return [part.strip() for part in parts if part and part.strip()]

    def _import_dataset_row(self, dataset: str, row: dict[str, str]) -> str:
        with self._connect() as conn:
            return self._import_dataset_row_with_conn(conn, dataset, row)

    def _import_dataset_row_with_conn(self, conn: sqlite3.Connection, dataset: str, row: dict[str, str]) -> str:
        if dataset == "work_areas":
            record_id = row.get("id", "")
            payload = {
                "name": row["name"],
                "work_area_type": row.get("type", "general") or "general",
                "work_area_subtype": row.get("work_area_subtype", ""),
                "owner": row.get("owner", ""),
                "planned_progress": self._parse_optional_float(row.get("planned_progress", "")) or 0.0,
                "actual_progress": self._parse_optional_float(row.get("actual_progress", "")) or 0.0,
                "description": row.get("description", ""),
            }
            if record_id and self._row_exists_with_conn(conn, "work_areas", record_id):
                self._update_work_area_with_conn(conn, record_id, work_area_subtype=payload["work_area_subtype"], owner=payload["owner"], planned_progress=payload["planned_progress"], actual_progress=payload["actual_progress"], description=payload["description"])
                return "updated"
            self._create_work_area_with_optional_id(conn=conn, id=record_id or None, **payload)
            return "created"

        if dataset == "quantities":
            record_id = row.get("id", "")
            payload = {
                "work_area_id": row["work_area_id"],
                "item_name": row["item_name"],
                "item_code": row.get("item_code", ""),
                "category": row.get("category", "general") or "general",
                "unit": row.get("unit", "m3") or "m3",
                "planned_quantity": self._parse_optional_float(row.get("planned_quantity", "")) or 0.0,
                "actual_quantity": self._parse_optional_float(row.get("actual_quantity", "")) or 0.0,
                "notes": row.get("notes", ""),
            }
            if record_id and self._row_exists_with_conn(conn, "engineering_quantities", record_id):
                self._update_quantity_with_conn(conn, record_id, **payload)
                return "updated"
            self._create_quantity_with_optional_id(conn=conn, id=record_id or None, **payload)
            return "created"

        if dataset == "design_quantities":
            record_id = row.get("id", "")
            payload = {
                "work_area_id": row["work_area_id"],
                "item_name": row["item_name"],
                "item_code": row.get("item_code", ""),
                "category": row.get("category", "general") or "general",
                "unit": row.get("unit", "m3") or "m3",
                "target_quantity": self._parse_optional_float(row.get("target_quantity", "")) or 0.0,
                "design_version": row.get("design_version", ""),
                "notes": row.get("notes", ""),
            }
            if record_id and self._row_exists_with_conn(conn, "design_quantities", record_id):
                self._update_design_quantity_with_conn(conn, record_id, **payload)
                return "updated"
            self._create_design_quantity_with_optional_id(conn=conn, id=record_id or None, **payload)
            return "created"

        if dataset == "resource_logs":
            record_id = row.get("id", "")
            payload = {
                "work_area_id": row["work_area_id"],
                "resource_type": row.get("resource_type", "labor") or "labor",
                "resource_category": row.get("resource_category", "") or (row.get("resource_type", "labor") or "labor"),
                "resource_subtype": row.get("resource_subtype", ""),
                "resource_name": row["resource_name"],
                "quantity": self._parse_optional_float(row.get("quantity", "")) or 0.0,
                "unit": row.get("unit", ""),
                "record_day": self._parse_optional_int(row.get("record_day", "")),
                "team_name": row.get("team_name", ""),
                "specification": row.get("specification", ""),
                "source_type": row.get("source_type", "") or "manual",
                "supplier": row.get("supplier", ""),
                "notes": row.get("notes", ""),
            }
            if record_id and self._row_exists_with_conn(conn, "resource_logs", record_id):
                self._update_resource_log_with_conn(conn, record_id, **payload)
                return "updated"
            self._create_resource_log_with_optional_id(conn=conn, id=record_id or None, **payload)
            return "created"

        if dataset == "design_spatial_objects":
            record_id = row.get("id", "")
            payload = {
                "work_area_id": row["work_area_id"],
                "name": row["name"],
                "design_type": row.get("design_type", "reference") or "reference",
                "coord_system": row.get("coord_system", "local") or "local",
                "station_start": self._parse_optional_float(row.get("station_start", "")),
                "station_end": self._parse_optional_float(row.get("station_end", "")),
                "bbox_min_x": self._parse_optional_float(row.get("bbox_min_x", "")),
                "bbox_min_y": self._parse_optional_float(row.get("bbox_min_y", "")),
                "bbox_min_z": self._parse_optional_float(row.get("bbox_min_z", "")),
                "bbox_max_x": self._parse_optional_float(row.get("bbox_max_x", "")),
                "bbox_max_y": self._parse_optional_float(row.get("bbox_max_y", "")),
                "bbox_max_z": self._parse_optional_float(row.get("bbox_max_z", "")),
                "design_ref": row.get("design_ref", ""),
                "elevation_target": self._parse_optional_float(row.get("elevation_target", "")),
                "design_version": row.get("design_version", ""),
                "notes": row.get("notes", ""),
            }
            if record_id and self._row_exists_with_conn(conn, "design_spatial_objects", record_id):
                self._update_design_spatial_object_with_conn(conn, record_id, **payload)
                return "updated"
            self._create_design_spatial_with_optional_id(conn=conn, id=record_id or None, **payload)
            return "created"

        if dataset == "daily_reports":
            record_id = row.get("id", "")
            payload = {
                "report_day": self._parse_optional_int(row.get("report_day", "")),
                "author": row.get("author", "") or "日报导入",
                "work_area_ids": self._parse_work_area_ids(row.get("work_area_ids", "")),
                "completed_summary": row.get("completed_summary", ""),
                "next_plan": row.get("next_plan", ""),
                "weather": row.get("weather", ""),
                "labor_count": self._parse_optional_int(row.get("labor_count", "")) or 0,
                "machine_count": self._parse_optional_int(row.get("machine_count", "")) or 0,
                "notes": row.get("notes", ""),
            }
            if record_id and self._row_exists_with_conn(conn, "daily_reports", record_id):
                self._update_report_with_conn(conn, record_id, **payload)
                return "updated"
            self._create_report_with_optional_id(conn=conn, id=record_id or None, **payload)
            return "created"

        if dataset == "terrain_change_sets":
            record_id = row.get("id", "")
            payload = {
                "work_area_id": row["work_area_id"],
                "quantity_id": row.get("quantity_id", ""),
                "spatial_raw_object_id": row.get("spatial_raw_object_id", ""),
                "terrain_raw_object_id": row.get("terrain_raw_object_id", ""),
                "change_type": row.get("change_type", "fill") or "fill",
                "result_ref": row.get("result_ref", ""),
                "record_day": self._parse_optional_int(row.get("record_day", "")),
                "notes": row.get("notes", ""),
            }
            if record_id and self._row_exists_with_conn(conn, "terrain_change_sets", record_id):
                self._update_terrain_change_set_with_conn(conn, record_id, **payload)
                return "updated"
            self._create_terrain_change_set_with_optional_id(conn=conn, id=record_id or None, **payload)
            return "created"

        raise ValueError(f"Unsupported import dataset: {dataset}")

    def _next_id(self, table: str, prefix: str) -> str:
        with self._connect() as conn:
            return self._next_id_with_conn(conn, table, prefix)

    def _next_id_with_conn(self, conn: sqlite3.Connection, table: str, prefix: str) -> str:
        rows = conn.execute(f"SELECT id FROM {table} WHERE id LIKE ?", (f"{prefix}_%",)).fetchall()
        max_suffix = 0
        for row in rows:
            value = str(row["id"])
            suffix = value.split("_")[-1]
            if suffix.isdigit():
                max_suffix = max(max_suffix, int(suffix))
        return f"{prefix}_{max_suffix + 1:03d}"

    def _row_exists_with_conn(self, conn: sqlite3.Connection, table: str, record_id: str) -> bool:
        row = conn.execute(f"SELECT 1 FROM {table} WHERE id = ? LIMIT 1", (record_id,)).fetchone()
        return row is not None

    def _task_overdue(self, item: dict[str, Any], current_day: int) -> bool:
        return item["status"] != "done" and item["due_day"] > 0 and current_day > item["due_day"]

    def _issue_overdue(self, item: dict[str, Any], current_day: int) -> bool:
        return item["status"] != "closed" and item["due_day"] > 0 and current_day > item["due_day"]

    def _derive_work_area_status(self, planned_progress: float, actual_progress: float) -> str:
        if actual_progress >= 1.0:
            return "done"
        if actual_progress <= 0 and planned_progress <= 0:
            return "not_started"
        if actual_progress + 0.05 < planned_progress:
            return "delayed"
        return "in_progress"

    def _derive_quantity_status(self, planned_quantity: float, actual_quantity: float) -> str:
        if actual_quantity >= planned_quantity and planned_quantity > 0:
            return "done"
        if actual_quantity <= 0:
            return "not_started"
        return "in_progress"

    def _create_work_area_with_optional_id(self, *, name: str, work_area_type: str, work_area_subtype: str = "", owner: str = "", planned_progress: float = 0.0, actual_progress: float = 0.0, description: str = "", id: str | None = None, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
        if not id:
            if conn is None:
                return self.create_work_area(name=name, work_area_type=work_area_type, work_area_subtype=work_area_subtype, owner=owner, planned_progress=planned_progress, actual_progress=actual_progress, description=description)
            id = self._next_id_with_conn(conn, "work_areas", "wa")
        now = self._now()
        status = self._derive_work_area_status(planned_progress, actual_progress)
        record = {
            "id": id,
            "name": name,
            "type": work_area_type,
            "work_area_subtype": work_area_subtype,
            "owner": owner,
            "planned_progress": planned_progress,
            "actual_progress": actual_progress,
            "status": status,
            "station_start": 0.0,
            "station_end": 0.0,
            "description": description,
            "created_at": now,
            "updated_at": now,
        }
        if conn is None:
            with self._connect() as conn:
                conn.execute("INSERT INTO work_areas VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
                self._record_work_area_progress_history(conn, work_area_id=id, planned_progress=planned_progress, actual_progress=actual_progress, status=status, source="import", note="Imported work area")
                self._log(conn, "create_work_area", "work_area", id, name)
        else:
            conn.execute("INSERT INTO work_areas VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._record_work_area_progress_history(conn, work_area_id=id, planned_progress=planned_progress, actual_progress=actual_progress, status=status, source="import", note="Imported work area")
            self._log(conn, "create_work_area", "work_area", id, name)
        return record

    def _create_quantity_with_optional_id(self, *, work_area_id: str, item_name: str, item_code: str = "", category: str = "general", unit: str = "m3", planned_quantity: float = 0.0, actual_quantity: float = 0.0, notes: str = "", id: str | None = None, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
        if not id:
            if conn is None:
                return self.create_quantity(work_area_id=work_area_id, item_name=item_name, item_code=item_code, category=category, unit=unit, planned_quantity=planned_quantity, actual_quantity=actual_quantity, notes=notes)
            id = self._next_id_with_conn(conn, "engineering_quantities", "qty")
        now = self._now()
        status = self._derive_quantity_status(planned_quantity, actual_quantity)
        record = {
            "id": id,
            "work_area_id": work_area_id,
            "item_name": item_name,
            "item_code": item_code,
            "category": category,
            "unit": unit,
            "planned_quantity": planned_quantity,
            "actual_quantity": actual_quantity,
            "status": status,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        if conn is None:
            with self._connect() as conn:
                conn.execute("INSERT INTO engineering_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
                self._record_quantity_progress_history(conn, quantity_id=id, planned_quantity=planned_quantity, actual_quantity=actual_quantity, status=status, source="import", note="Imported quantity")
                self._log(conn, "create_quantity", "quantity", id, item_name)
        else:
            conn.execute("INSERT INTO engineering_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._record_quantity_progress_history(conn, quantity_id=id, planned_quantity=planned_quantity, actual_quantity=actual_quantity, status=status, source="import", note="Imported quantity")
            self._log(conn, "create_quantity", "quantity", id, item_name)
        return record

    def _create_design_quantity_with_optional_id(self, *, work_area_id: str, item_name: str, item_code: str = "", category: str = "general", unit: str = "m3", target_quantity: float = 0.0, design_version: str = "", notes: str = "", id: str | None = None, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
        if not id:
            if conn is None:
                return self.create_design_quantity(work_area_id=work_area_id, item_name=item_name, item_code=item_code, category=category, unit=unit, target_quantity=target_quantity, design_version=design_version, notes=notes)
            id = self._next_id_with_conn(conn, "design_quantities", "dq")
        now = self._now()
        record = {
            "id": id,
            "work_area_id": work_area_id,
            "item_name": item_name,
            "item_code": item_code,
            "category": category,
            "unit": unit,
            "target_quantity": target_quantity,
            "design_version": design_version,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        if conn is None:
            with self._connect() as conn:
                conn.execute("INSERT INTO design_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
                self._log(conn, "create_design_quantity", "design_quantity", id, item_name)
        else:
            conn.execute("INSERT INTO design_quantities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._log(conn, "create_design_quantity", "design_quantity", id, item_name)
        return record

    def _create_design_spatial_with_optional_id(self, *, work_area_id: str, name: str, design_type: str, coord_system: str = "local", station_start: float | None = None, station_end: float | None = None, bbox_min_x: float | None = None, bbox_min_y: float | None = None, bbox_min_z: float | None = None, bbox_max_x: float | None = None, bbox_max_y: float | None = None, bbox_max_z: float | None = None, design_ref: str = "", elevation_target: float | None = None, design_version: str = "", notes: str = "", id: str | None = None, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
        if not id:
            if conn is None:
                return self.create_design_spatial_object(work_area_id=work_area_id, name=name, design_type=design_type, coord_system=coord_system, station_start=station_start, station_end=station_end, bbox_min_x=bbox_min_x, bbox_min_y=bbox_min_y, bbox_min_z=bbox_min_z, bbox_max_x=bbox_max_x, bbox_max_y=bbox_max_y, bbox_max_z=bbox_max_z, design_ref=design_ref, elevation_target=elevation_target, design_version=design_version, notes=notes)
            id = self._next_id_with_conn(conn, "design_spatial_objects", "dso")
        now = self._now()
        record = {
            "id": id,
            "work_area_id": work_area_id,
            "name": name,
            "design_type": design_type,
            "coord_system": coord_system,
            "station_start": station_start,
            "station_end": station_end,
            "bbox_min_x": bbox_min_x,
            "bbox_min_y": bbox_min_y,
            "bbox_min_z": bbox_min_z,
            "bbox_max_x": bbox_max_x,
            "bbox_max_y": bbox_max_y,
            "bbox_max_z": bbox_max_z,
            "design_ref": design_ref,
            "elevation_target": elevation_target,
            "design_version": design_version,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        if conn is None:
            with self._connect() as conn:
                conn.execute("INSERT INTO design_spatial_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
                self._log(conn, "create_design_spatial_object", "design_spatial_object", id, name)
        else:
            conn.execute("INSERT INTO design_spatial_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._log(conn, "create_design_spatial_object", "design_spatial_object", id, name)
        return record

    def _create_resource_log_with_optional_id(self, *, work_area_id: str, resource_type: str, resource_category: str | None = None, resource_subtype: str = "", resource_name: str, quantity: float = 0.0, unit: str = "", record_day: int | None = None, team_name: str = "", specification: str = "", source_type: str = "manual", supplier: str = "", notes: str = "", id: str | None = None, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
        if not id:
            if conn is None:
                return self.create_resource_log(work_area_id=work_area_id, resource_type=resource_type, resource_category=resource_category, resource_subtype=resource_subtype, resource_name=resource_name, quantity=quantity, unit=unit, record_day=record_day, team_name=team_name, specification=specification, source_type=source_type, supplier=supplier, notes=notes)
            id = self._next_id_with_conn(conn, "resource_logs", "rl")
        now = self._now()
        record = {
            "id": id,
            "work_area_id": work_area_id,
            "resource_type": resource_type,
            "resource_category": resource_category or resource_type,
            "resource_subtype": resource_subtype,
            "resource_name": resource_name,
            "quantity": quantity,
            "unit": unit,
            "record_day": self.current_day if record_day is None else record_day,
            "team_name": team_name,
            "specification": specification,
            "source_type": source_type or "manual",
            "supplier": supplier,
            "notes": notes,
            "created_at": now,
        }
        if conn is None:
            with self._connect() as conn:
                conn.execute("INSERT INTO resource_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
                self._log(conn, "create_resource_log", "resource_log", id, resource_name)
        else:
            conn.execute("INSERT INTO resource_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._log(conn, "create_resource_log", "resource_log", id, resource_name)
        return record

    def _create_report_with_optional_id(self, *, author: str, work_area_ids: list[str], completed_summary: str, next_plan: str = "", weather: str = "", labor_count: int = 0, machine_count: int = 0, notes: str = "", report_day: int | None = None, id: str | None = None, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
        if not id:
            if conn is None:
                return self.create_report(author=author, work_area_ids=work_area_ids, completed_summary=completed_summary, next_plan=next_plan, weather=weather, labor_count=labor_count, machine_count=machine_count, notes=notes)
            id = self._next_id_with_conn(conn, "daily_reports", "report")
        now = self._now()
        record = {
            "id": id,
            "report_day": self.current_day if report_day is None else report_day,
            "author": author,
            "completed_summary": completed_summary,
            "next_plan": next_plan,
            "weather": weather,
            "labor_count": labor_count,
            "machine_count": machine_count,
            "notes": notes,
            "created_at": now,
        }
        if conn is None:
            with self._connect() as conn:
                conn.execute("INSERT INTO daily_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
                for work_area_id in work_area_ids:
                    conn.execute("INSERT OR IGNORE INTO report_work_areas VALUES (?, ?)", (id, work_area_id))
                self._log(conn, "create_report", "report", id, completed_summary)
        else:
            conn.execute("INSERT INTO daily_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            for work_area_id in work_area_ids:
                conn.execute("INSERT OR IGNORE INTO report_work_areas VALUES (?, ?)", (id, work_area_id))
            self._log(conn, "create_report", "report", id, completed_summary)
        created = self.get_report(id) or record
        created["work_area_ids"] = work_area_ids
        return created

    def _create_terrain_change_set_with_optional_id(self, *, work_area_id: str, quantity_id: str = "", spatial_raw_object_id: str = "", terrain_raw_object_id: str = "", change_type: str = "fill", result_ref: str = "", record_day: int | None = None, notes: str = "", id: str | None = None, conn: sqlite3.Connection | None = None) -> dict[str, Any]:
        if not id:
            if conn is None:
                return self.create_terrain_change_set(work_area_id=work_area_id, quantity_id=quantity_id, spatial_raw_object_id=spatial_raw_object_id, terrain_raw_object_id=terrain_raw_object_id, change_type=change_type, result_ref=result_ref, record_day=record_day, notes=notes)
            id = self._next_id_with_conn(conn, "terrain_change_sets", "tcs")
        now = self._now()
        record = {
            "id": id,
            "work_area_id": work_area_id,
            "quantity_id": quantity_id,
            "spatial_raw_object_id": spatial_raw_object_id,
            "terrain_raw_object_id": terrain_raw_object_id,
            "change_type": change_type,
            "result_ref": result_ref,
            "record_day": self.current_day if record_day is None else record_day,
            "recorded_at": now,
            "notes": notes,
        }
        if conn is None:
            with self._connect() as conn:
                conn.execute("INSERT INTO terrain_change_sets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
                self._log(conn, "create_terrain_change_set", "terrain_change_set", id, change_type)
        else:
            conn.execute("INSERT INTO terrain_change_sets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", tuple(record.values()))
            self._log(conn, "create_terrain_change_set", "terrain_change_set", id, change_type)
        return record

    def _update_work_area_with_conn(self, conn: sqlite3.Connection, work_area_id: str, *, work_area_subtype: str | None = None, owner: str | None = None, planned_progress: float | None = None, actual_progress: float | None = None, description: str | None = None) -> dict[str, Any] | None:
        row = conn.execute("SELECT * FROM work_areas WHERE id = ?", (work_area_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        next_work_area_subtype = work_area_subtype if work_area_subtype is not None else record.get("work_area_subtype", "")
        next_owner = owner if owner is not None else record["owner"]
        next_planned = planned_progress if planned_progress is not None else record["planned_progress"]
        next_actual = actual_progress if actual_progress is not None else record["actual_progress"]
        next_description = description if description is not None else record["description"]
        next_status = self._derive_work_area_status(next_planned, next_actual)
        updated_at = self._now()
        conn.execute(
            """
            UPDATE work_areas
            SET work_area_subtype = ?, owner = ?, planned_progress = ?, actual_progress = ?, status = ?, description = ?, updated_at = ?
            WHERE id = ?
            """,
            (next_work_area_subtype, next_owner, next_planned, next_actual, next_status, next_description, updated_at, work_area_id),
        )
        if next_planned != record["planned_progress"] or next_actual != record["actual_progress"] or next_status != record["status"]:
            self._record_work_area_progress_history(conn, work_area_id=work_area_id, planned_progress=next_planned, actual_progress=next_actual, status=next_status, source="import", note="Imported work area update")
        self._log(conn, "update_work_area", "work_area", work_area_id, record["name"])
        return dict(conn.execute("SELECT * FROM work_areas WHERE id = ?", (work_area_id,)).fetchone())

    def _update_quantity_with_conn(self, conn: sqlite3.Connection, quantity_id: str, *, work_area_id: str | None = None, item_name: str | None = None, item_code: str | None = None, category: str | None = None, unit: str | None = None, planned_quantity: float | None = None, actual_quantity: float | None = None, notes: str | None = None) -> dict[str, Any] | None:
        row = conn.execute("SELECT * FROM engineering_quantities WHERE id = ?", (quantity_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_item_name = item_name if item_name is not None else record["item_name"]
        next_item_code = item_code if item_code is not None else record["item_code"]
        next_category = category if category is not None else record["category"]
        next_unit = unit if unit is not None else record["unit"]
        next_planned = planned_quantity if planned_quantity is not None else record["planned_quantity"]
        next_actual = actual_quantity if actual_quantity is not None else record["actual_quantity"]
        next_notes = notes if notes is not None else record["notes"]
        next_status = self._derive_quantity_status(next_planned, next_actual)
        updated_at = self._now()
        conn.execute(
            """
            UPDATE engineering_quantities
            SET work_area_id = ?, item_name = ?, item_code = ?, category = ?, unit = ?, planned_quantity = ?,
                actual_quantity = ?, status = ?, notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (next_work_area_id, next_item_name, next_item_code, next_category, next_unit, next_planned, next_actual, next_status, next_notes, updated_at, quantity_id),
        )
        if next_planned != record["planned_quantity"] or next_actual != record["actual_quantity"] or next_status != record["status"]:
            self._record_quantity_progress_history(conn, quantity_id=quantity_id, planned_quantity=next_planned, actual_quantity=next_actual, status=next_status, source="import", note="Imported quantity update")
        self._log(conn, "update_quantity", "quantity", quantity_id, next_item_name)
        return dict(conn.execute("SELECT * FROM engineering_quantities WHERE id = ?", (quantity_id,)).fetchone())

    def _update_design_quantity_with_conn(self, conn: sqlite3.Connection, design_quantity_id: str, *, work_area_id: str | None = None, item_name: str | None = None, item_code: str | None = None, category: str | None = None, unit: str | None = None, target_quantity: float | None = None, design_version: str | None = None, notes: str | None = None) -> dict[str, Any] | None:
        row = conn.execute("SELECT * FROM design_quantities WHERE id = ?", (design_quantity_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_item_name = item_name if item_name is not None else record["item_name"]
        next_item_code = item_code if item_code is not None else record["item_code"]
        next_category = category if category is not None else record["category"]
        next_unit = unit if unit is not None else record["unit"]
        next_target = target_quantity if target_quantity is not None else record["target_quantity"]
        next_design_version = design_version if design_version is not None else record["design_version"]
        next_notes = notes if notes is not None else record["notes"]
        updated_at = self._now()
        conn.execute(
            """
            UPDATE design_quantities
            SET work_area_id = ?, item_name = ?, item_code = ?, category = ?, unit = ?,
                target_quantity = ?, design_version = ?, notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (next_work_area_id, next_item_name, next_item_code, next_category, next_unit, next_target, next_design_version, next_notes, updated_at, design_quantity_id),
        )
        self._log(conn, "update_design_quantity", "design_quantity", design_quantity_id, next_item_name)
        return dict(conn.execute("SELECT * FROM design_quantities WHERE id = ?", (design_quantity_id,)).fetchone())

    def _update_resource_log_with_conn(self, conn: sqlite3.Connection, resource_log_id: str, *, work_area_id: str | None = None, resource_type: str | None = None, resource_category: str | None = None, resource_subtype: str | None = None, resource_name: str | None = None, quantity: float | None = None, unit: str | None = None, record_day: int | None = None, team_name: str | None = None, specification: str | None = None, source_type: str | None = None, supplier: str | None = None, notes: str | None = None) -> dict[str, Any] | None:
        row = conn.execute("SELECT * FROM resource_logs WHERE id = ?", (resource_log_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        next_work_area_id = work_area_id if work_area_id is not None else record["work_area_id"]
        next_resource_type = resource_type if resource_type is not None else record["resource_type"]
        next_resource_category = resource_category if resource_category is not None else (record.get("resource_category") or next_resource_type)
        next_resource_subtype = resource_subtype if resource_subtype is not None else record.get("resource_subtype", "")
        next_resource_name = resource_name if resource_name is not None else record["resource_name"]
        next_quantity = quantity if quantity is not None else record["quantity"]
        next_unit = unit if unit is not None else record["unit"]
        next_record_day = record_day if record_day is not None else record["record_day"]
        next_team_name = team_name if team_name is not None else record.get("team_name", "")
        next_specification = specification if specification is not None else record.get("specification", "")
        next_source_type = source_type if source_type is not None else record.get("source_type", "manual")
        next_supplier = supplier if supplier is not None else record["supplier"]
        next_notes = notes if notes is not None else record["notes"]
        conn.execute(
            """
            UPDATE resource_logs
            SET work_area_id = ?, resource_type = ?, resource_category = ?, resource_subtype = ?, resource_name = ?, quantity = ?, unit = ?, record_day = ?, team_name = ?, specification = ?, source_type = ?, supplier = ?, notes = ?
            WHERE id = ?
            """,
            (next_work_area_id, next_resource_type, next_resource_category, next_resource_subtype, next_resource_name, next_quantity, next_unit, next_record_day, next_team_name, next_specification, next_source_type, next_supplier, next_notes, resource_log_id),
        )
        self._log(conn, "update_resource_log", "resource_log", resource_log_id, next_resource_name)
        return dict(conn.execute("SELECT * FROM resource_logs WHERE id = ?", (resource_log_id,)).fetchone())

    def _update_design_spatial_object_with_conn(self, conn: sqlite3.Connection, design_spatial_object_id: str, *, work_area_id: str | None = None, name: str | None = None, design_type: str | None = None, coord_system: str | None = None, station_start: float | None = None, station_end: float | None = None, bbox_min_x: float | None = None, bbox_min_y: float | None = None, bbox_min_z: float | None = None, bbox_max_x: float | None = None, bbox_max_y: float | None = None, bbox_max_z: float | None = None, design_ref: str | None = None, elevation_target: float | None = None, design_version: str | None = None, notes: str | None = None) -> dict[str, Any] | None:
        row = conn.execute("SELECT * FROM design_spatial_objects WHERE id = ?", (design_spatial_object_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        updated_at = self._now()
        next_values = {
            "work_area_id": work_area_id if work_area_id is not None else record["work_area_id"],
            "name": name if name is not None else record["name"],
            "design_type": design_type if design_type is not None else record["design_type"],
            "coord_system": coord_system if coord_system is not None else record["coord_system"],
            "station_start": station_start if station_start is not None else record["station_start"],
            "station_end": station_end if station_end is not None else record["station_end"],
            "bbox_min_x": bbox_min_x if bbox_min_x is not None else record["bbox_min_x"],
            "bbox_min_y": bbox_min_y if bbox_min_y is not None else record["bbox_min_y"],
            "bbox_min_z": bbox_min_z if bbox_min_z is not None else record["bbox_min_z"],
            "bbox_max_x": bbox_max_x if bbox_max_x is not None else record["bbox_max_x"],
            "bbox_max_y": bbox_max_y if bbox_max_y is not None else record["bbox_max_y"],
            "bbox_max_z": bbox_max_z if bbox_max_z is not None else record["bbox_max_z"],
            "design_ref": design_ref if design_ref is not None else record["design_ref"],
            "elevation_target": elevation_target if elevation_target is not None else record["elevation_target"],
            "design_version": design_version if design_version is not None else record["design_version"],
            "notes": notes if notes is not None else record["notes"],
        }
        conn.execute(
            """
            UPDATE design_spatial_objects
            SET work_area_id = ?, name = ?, design_type = ?, coord_system = ?, station_start = ?, station_end = ?,
                bbox_min_x = ?, bbox_min_y = ?, bbox_min_z = ?, bbox_max_x = ?, bbox_max_y = ?, bbox_max_z = ?,
                design_ref = ?, elevation_target = ?, design_version = ?, notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (next_values["work_area_id"], next_values["name"], next_values["design_type"], next_values["coord_system"], next_values["station_start"], next_values["station_end"], next_values["bbox_min_x"], next_values["bbox_min_y"], next_values["bbox_min_z"], next_values["bbox_max_x"], next_values["bbox_max_y"], next_values["bbox_max_z"], next_values["design_ref"], next_values["elevation_target"], next_values["design_version"], next_values["notes"], updated_at, design_spatial_object_id),
        )
        self._log(conn, "update_design_spatial_object", "design_spatial_object", design_spatial_object_id, next_values["name"])
        return dict(conn.execute("SELECT * FROM design_spatial_objects WHERE id = ?", (design_spatial_object_id,)).fetchone())

    def _update_report_with_conn(self, conn: sqlite3.Connection, report_id: str, *, report_day: int | None = None, author: str | None = None, work_area_ids: list[str] | None = None, completed_summary: str | None = None, next_plan: str | None = None, weather: str | None = None, labor_count: int | None = None, machine_count: int | None = None, notes: str | None = None) -> dict[str, Any] | None:
        row = conn.execute("SELECT * FROM daily_reports WHERE id = ?", (report_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        existing_work_area_ids = [item["work_area_id"] for item in conn.execute("SELECT work_area_id FROM report_work_areas WHERE report_id = ? ORDER BY work_area_id ASC", (report_id,)).fetchall()]
        next_report_day = report_day if report_day is not None else record["report_day"]
        next_author = author if author is not None else record["author"]
        next_work_area_ids = work_area_ids if work_area_ids is not None else existing_work_area_ids
        next_completed_summary = completed_summary if completed_summary is not None else record["completed_summary"]
        next_next_plan = next_plan if next_plan is not None else record["next_plan"]
        next_weather = weather if weather is not None else record["weather"]
        next_labor_count = labor_count if labor_count is not None else record["labor_count"]
        next_machine_count = machine_count if machine_count is not None else record["machine_count"]
        next_notes = notes if notes is not None else record["notes"]
        conn.execute(
            """
            UPDATE daily_reports
            SET report_day = ?, author = ?, completed_summary = ?, next_plan = ?, weather = ?, labor_count = ?, machine_count = ?, notes = ?
            WHERE id = ?
            """,
            (next_report_day, next_author, next_completed_summary, next_next_plan, next_weather, next_labor_count, next_machine_count, next_notes, report_id),
        )
        conn.execute("DELETE FROM report_work_areas WHERE report_id = ?", (report_id,))
        for work_area_id in next_work_area_ids:
            conn.execute("INSERT OR IGNORE INTO report_work_areas VALUES (?, ?)", (report_id, work_area_id))
        self._log(conn, "update_report", "report", report_id, next_completed_summary)
        updated = dict(conn.execute("SELECT * FROM daily_reports WHERE id = ?", (report_id,)).fetchone())
        updated["work_area_ids"] = next_work_area_ids
        return updated

    def _update_terrain_change_set_with_conn(self, conn: sqlite3.Connection, terrain_change_set_id: str, *, work_area_id: str | None = None, quantity_id: str | None = None, spatial_raw_object_id: str | None = None, terrain_raw_object_id: str | None = None, change_type: str | None = None, result_ref: str | None = None, record_day: int | None = None, notes: str | None = None) -> dict[str, Any] | None:
        row = conn.execute("SELECT * FROM terrain_change_sets WHERE id = ?", (terrain_change_set_id,)).fetchone()
        if not row:
            return None
        record = dict(row)
        next_values = {
            "work_area_id": work_area_id if work_area_id is not None else record["work_area_id"],
            "quantity_id": quantity_id if quantity_id is not None else record["quantity_id"],
            "spatial_raw_object_id": spatial_raw_object_id if spatial_raw_object_id is not None else record["spatial_raw_object_id"],
            "terrain_raw_object_id": terrain_raw_object_id if terrain_raw_object_id is not None else record["terrain_raw_object_id"],
            "change_type": change_type if change_type is not None else record["change_type"],
            "result_ref": result_ref if result_ref is not None else record["result_ref"],
            "record_day": record_day if record_day is not None else record["record_day"],
            "notes": notes if notes is not None else record["notes"],
        }
        conn.execute(
            """
            UPDATE terrain_change_sets
            SET work_area_id = ?, quantity_id = ?, spatial_raw_object_id = ?, terrain_raw_object_id = ?,
                change_type = ?, result_ref = ?, record_day = ?, notes = ?
            WHERE id = ?
            """,
            (next_values["work_area_id"], next_values["quantity_id"], next_values["spatial_raw_object_id"], next_values["terrain_raw_object_id"], next_values["change_type"], next_values["result_ref"], next_values["record_day"], next_values["notes"], terrain_change_set_id),
        )
        self._log(conn, "update_terrain_change_set", "terrain_change_set", terrain_change_set_id, next_values["change_type"])
        return dict(conn.execute("SELECT * FROM terrain_change_sets WHERE id = ?", (terrain_change_set_id,)).fetchone())

    def _seed_spatial_data(self, conn: sqlite3.Connection, now: str) -> None:
        conn.executemany("INSERT OR IGNORE INTO spatial_raw_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            ("sro_001", "Roadbed Main Range", "range", "station", None, None, None, 1000.0, 1500.0, None, None, None, None, None, None, "", "manual", "Main range for K1+000-K1+500 roadbed work area", now, now),
            ("sro_002", "Pier P3-P4 Zone", "bbox", "local", 125.0, 38.0, 12.0, None, None, 115.0, 30.0, 0.0, 135.0, 46.0, 24.0, "", "manual", "Bounding box for pier work area", now, now),
            ("sro_003", "Roadbed Fill Coverage", "range", "station", None, None, None, 1080.0, 1420.0, None, None, None, None, None, None, "", "manual", "Coverage for roadbed fill quantity", now, now),
            ("sro_004", "Pier Rebar Core", "bbox", "local", 126.5, 39.5, 13.0, None, None, 121.0, 34.0, 6.0, 132.0, 45.0, 20.0, "", "manual", "Core reinforcement zone for pier quantity", now, now),
        ])
        conn.executemany("INSERT OR IGNORE INTO spatial_bindings VALUES (?, ?, ?, ?, ?, ?, ?)", [
            ("sb_001", "work_area", "wa_road_001", "sro_001", "primary", "main_alignment", now),
            ("sb_002", "work_area", "wa_bridge_001", "sro_002", "primary", "pier_zone", now),
            ("sb_003", "quantity", "qty_001", "sro_003", "coverage", "fill_zone", now),
            ("sb_004", "quantity", "qty_002", "sro_004", "coverage", "rebar_zone", now),
        ])
        conn.executemany("INSERT OR IGNORE INTO spatial_display_objects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            ("sdo_001", "sro_001", "Roadbed Range Display", "line", "godot://roadbed_range_line", "#b55233", "road-main", "K1+000-K1+500", 1, 10, 0, "Main work area line display", now, now),
            ("sdo_002", "sro_002", "Pier Zone Display", "area", "godot://pier_bbox_area", "#2f7b52", "bridge-zone", "Pier P3-P4", 1, 20, 0, "Pier zone area display", now, now),
            ("sdo_003", "sro_003", "Roadbed Fill Display", "line", "godot://roadbed_fill_range", "#b67421", "quantity-fill", "Roadbed Fill", 1, 30, 1, "Quantity coverage line", now, now),
            ("sdo_004", "sro_004", "Pier Rebar Display", "marker", "godot://pier_rebar_marker", "#a13f3f", "quantity-rebar", "Pier Rebar", 1, 40, 1, "Quantity marker display", now, now),
        ])
        for log_id, action, target_type, target_id, message in [
            ("log_008", "create_spatial_raw_object", "spatial_raw_object", "sro_001", "Created spatial raw object sro_001"),
            ("log_009", "create_spatial_binding", "spatial_binding", "sb_001", "Created spatial binding sb_001"),
        ]:
            conn.execute("INSERT OR IGNORE INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", (log_id, action, target_type, target_id, message, now))

    def _seed_history_data(
        self,
        conn: sqlite3.Connection,
        now: str,
        *,
        seed_tasks: bool,
        seed_issues: bool,
        seed_work_areas: bool,
        seed_quantities: bool,
    ) -> None:
        if seed_tasks:
            tasks = conn.execute("SELECT * FROM tasks ORDER BY id ASC").fetchall()
            for row in tasks:
                conn.execute(
                    "INSERT OR IGNORE INTO task_status_history VALUES (?, ?, ?, ?, ?, ?, ?, 'system', ?)",
                    (
                        self._next_id_with_conn(conn, "task_status_history", "tsh"),
                        row["id"],
                        None,
                        row["status"],
                        None,
                        row["completion_ratio"],
                        now,
                        "Seed task history",
                    ),
                )
        if seed_issues:
            issues = conn.execute("SELECT * FROM issues ORDER BY id ASC").fetchall()
            for row in issues:
                conn.execute(
                    "INSERT OR IGNORE INTO issue_status_history VALUES (?, ?, ?, ?, ?, ?, ?, 'system', ?)",
                    (
                        self._next_id_with_conn(conn, "issue_status_history", "ish"),
                        row["id"],
                        None,
                        row["status"],
                        None,
                        row["severity"],
                        now,
                        "Seed issue history",
                    ),
                )
        if seed_work_areas:
            work_areas = conn.execute("SELECT * FROM work_areas ORDER BY id ASC").fetchall()
            for row in work_areas:
                conn.execute(
                    "INSERT OR IGNORE INTO work_area_progress_history VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        self._next_id_with_conn(conn, "work_area_progress_history", "wph"),
                        row["id"],
                        row["planned_progress"],
                        row["actual_progress"],
                        row["status"],
                        now,
                        "seed",
                        "Seed work area progress",
                    ),
                )
        if seed_quantities:
            quantities = conn.execute("SELECT * FROM engineering_quantities ORDER BY id ASC").fetchall()
            for row in quantities:
                conn.execute(
                    "INSERT OR IGNORE INTO quantity_progress_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        self._next_id_with_conn(conn, "quantity_progress_history", "qph"),
                        row["id"],
                        row["planned_quantity"],
                        row["actual_quantity"],
                        row["actual_quantity"] - row["planned_quantity"],
                        row["status"],
                        now,
                        "seed",
                        "Seed quantity progress",
                    ),
                )

    def _get_bound_spatial_records(self, *, target_type: str, target_id: str) -> list[dict[str, Any]]:
        bindings = self.list_spatial_bindings(target_type=target_type, target_id=target_id)
        records: list[dict[str, Any]] = []
        for binding in bindings:
            raw_object = self.get_spatial_raw_object(binding["spatial_raw_object_id"])
            display_objects = self.list_spatial_display_objects(spatial_raw_object_id=binding["spatial_raw_object_id"])
            records.append(
                {
                    "binding": binding,
                    "raw_object": raw_object,
                    "display_objects": display_objects,
                }
            )
        return records

    def _record_task_history(
        self,
        conn: sqlite3.Connection,
        *,
        task_id: str,
        old_status: str | None,
        new_status: str,
        old_completion_ratio: float | None,
        new_completion_ratio: float | None,
        note: str = "",
    ) -> None:
        history_id = self._next_id_with_conn(conn, "task_status_history", "tsh")
        conn.execute(
            "INSERT INTO task_status_history VALUES (?, ?, ?, ?, ?, ?, ?, 'system', ?)",
            (history_id, task_id, old_status, new_status, old_completion_ratio, new_completion_ratio, self._now(), note),
        )

    def _record_issue_history(
        self,
        conn: sqlite3.Connection,
        *,
        issue_id: str,
        old_status: str | None,
        new_status: str,
        old_severity: str | None,
        new_severity: str | None,
        note: str = "",
    ) -> None:
        history_id = self._next_id_with_conn(conn, "issue_status_history", "ish")
        conn.execute(
            "INSERT INTO issue_status_history VALUES (?, ?, ?, ?, ?, ?, ?, 'system', ?)",
            (history_id, issue_id, old_status, new_status, old_severity, new_severity, self._now(), note),
        )

    def _record_work_area_progress_history(
        self,
        conn: sqlite3.Connection,
        *,
        work_area_id: str,
        planned_progress: float | None,
        actual_progress: float,
        status: str | None,
        source: str = "manual",
        note: str = "",
    ) -> None:
        history_id = self._next_id_with_conn(conn, "work_area_progress_history", "wph")
        conn.execute(
            "INSERT INTO work_area_progress_history VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (history_id, work_area_id, planned_progress, actual_progress, status, self._now(), source, note),
        )

    def _record_quantity_progress_history(
        self,
        conn: sqlite3.Connection,
        *,
        quantity_id: str,
        planned_quantity: float,
        actual_quantity: float,
        status: str | None,
        source: str = "manual",
        note: str = "",
    ) -> None:
        history_id = self._next_id_with_conn(conn, "quantity_progress_history", "qph")
        conn.execute(
            "INSERT INTO quantity_progress_history VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                history_id,
                quantity_id,
                planned_quantity,
                actual_quantity,
                actual_quantity - planned_quantity,
                status,
                self._now(),
                source,
                note,
            ),
        )

    def _log(self, conn: sqlite3.Connection, action_type: str, target_type: str, target_id: str, message: str) -> None:
        log_id = self._next_id_with_conn(conn, "operation_logs", "log")
        conn.execute("INSERT INTO operation_logs VALUES (?, ?, ?, ?, 'system', ?, ?)", (log_id, action_type, target_type, target_id, message, self._now()))

    def _now(self) -> str:
        return datetime.now(UTC).isoformat()


site_assistant_service = SiteAssistantService()
