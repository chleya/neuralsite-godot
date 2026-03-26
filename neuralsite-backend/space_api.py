"""
NeuralSite Space API - 道路/桥梁工程施工管理
完整数据库设计和 API
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, date, timedelta
from enum import Enum
from jose import JWTError, jwt
from passlib.context import CryptContext
import sqlite3
import json
import re
import uuid
import csv
import io
import os

app = FastAPI(title="NeuralSite 工程管理系统", version="2.0.0")

# Valid entity types
ENTITY_TYPES = Literal[
    "road", "bridge", "culvert", "fence", "sign", "building", "other"
]

# JWT Configuration
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "neuralsite-dev-secret-key-change-in-production-2026"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# CORS configuration - allow localhost for development, configurable for production
def get_cors_origins():
    env_origins = os.getenv("CORS_ORIGINS", "")
    if env_origins:
        return [o.strip() for o in env_origins.split(",") if o.strip()]
    return ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ 数据库设置 ============

DB_PATH = "neuralsite.db"


def get_db():
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys = ON")  # Enable FK constraints
        return conn
    except sqlite3.OperationalError as e:
        if "locked" in str(e).lower():
            raise HTTPException(status_code=503, detail="数据库被占用，请稍后重试")
        raise HTTPException(status_code=500, detail=f"数据库连接失败: {str(e)}")


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 项目表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            construction_unit TEXT,
            supervision_unit TEXT,
            design_unit TEXT,
            planned_start_date TEXT,
            planned_end_date TEXT,
            planned_duration_days INTEGER,
            total_budget REAL,
            status TEXT DEFAULT 'planning',
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # 用户表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name TEXT,
            is_active INTEGER DEFAULT 1,
            is_admin INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    # 分段/工点表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sections (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            start_station TEXT NOT NULL,
            end_station TEXT NOT NULL,
            length REAL,
            terrain_type TEXT,
            construction_difficulty TEXT,
            status TEXT DEFAULT 'planning',
            priority INTEGER DEFAULT 0,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)

    # 实体表 (道路、桥梁、涵洞等)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entities (
            id TEXT PRIMARY KEY,
            section_id TEXT,
            project_id TEXT,
            entity_type TEXT NOT NULL,
            code TEXT,
            name TEXT NOT NULL,
            start_station TEXT NOT NULL,
            end_station TEXT NOT NULL,
            lateral_offset REAL DEFAULT 0,
            width REAL,
            height REAL,
            lanes INTEGER DEFAULT 4,
            design_elevation REAL,
            actual_elevation REAL,
            progress REAL DEFAULT 0,
            construction_phase TEXT DEFAULT 'planning',
            planned_start_date TEXT,
            actual_start_date TEXT,
            planned_end_date TEXT,
            actual_end_date TEXT,
            planned_duration_days INTEGER,
            cost_budget REAL,
            cost_actual REAL,
            quality_status TEXT DEFAULT 'pending',
            safety_level TEXT DEFAULT 'normal',
            status TEXT DEFAULT 'active',
            notes TEXT,
            deleted_at TEXT,
            properties TEXT,
            alignment_type TEXT DEFAULT 'straight',
            curve_radius REAL,
            curve_length REAL,
            start_azimuth REAL DEFAULT 0,
            vertical_type TEXT DEFAULT 'level',
            start_elevation REAL DEFAULT 0,
            end_elevation REAL DEFAULT 0,
            vertical_curve_length REAL,
            grade_in REAL DEFAULT 0,
            grade_out REAL DEFAULT 0,
            cross_section_type TEXT DEFAULT 'fill',
            formation_width REAL DEFAULT 12,
            side_slope_fill REAL DEFAULT 1.5,
            side_slope_cut REAL DEFAULT 0.75,
            pavement_thickness REAL DEFAULT 0.5,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (section_id) REFERENCES sections(id),
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)

    # 工程量清单表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quantities (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            section_id TEXT,
            entity_id TEXT,
            item_code TEXT NOT NULL,
            item_name TEXT NOT NULL,
            unit TEXT NOT NULL,
            design_quantity REAL DEFAULT 0,
            approved_quantity REAL DEFAULT 0,
            actual_quantity REAL DEFAULT 0,
            unit_price REAL DEFAULT 0,
            total_price REAL DEFAULT 0,
            category TEXT,
            subcategory TEXT,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (section_id) REFERENCES sections(id),
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 进度记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS progress_records (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            section_id TEXT,
            entity_id TEXT,
            record_date TEXT NOT NULL,
            planned_progress REAL DEFAULT 0,
            actual_progress REAL DEFAULT 0,
            planned_completion_date TEXT,
            actual_completion_date TEXT,
            work_description TEXT,
            worker_count INTEGER DEFAULT 0,
            equipment_count INTEGER DEFAULT 0,
            weather TEXT,
            issues TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (section_id) REFERENCES sections(id),
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 质量记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quality_records (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            section_id TEXT,
            entity_id TEXT,
            record_date TEXT NOT NULL,
            inspection_type TEXT NOT NULL,
            inspection_item TEXT,
            inspector TEXT,
            result TEXT,
            issue_found TEXT,
            issue_severity TEXT,
            disposition TEXT,
            status TEXT DEFAULT 'open',
            photos TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (section_id) REFERENCES sections(id),
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 安全记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS safety_records (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            section_id TEXT,
            entity_id TEXT,
            record_date TEXT NOT NULL,
            inspection_type TEXT NOT NULL,
            hazard_type TEXT,
            hazard_description TEXT,
            risk_level TEXT,
            corrective_action TEXT,
            responsible_person TEXT,
            deadline TEXT,
            status TEXT DEFAULT 'open',
            closed_date TEXT,
            photos TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (section_id) REFERENCES sections(id),
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 资源投入表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resource_inputs (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            section_id TEXT,
            entity_id TEXT,
            record_date TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_name TEXT NOT NULL,
            unit TEXT,
            planned_quantity REAL DEFAULT 0,
            actual_quantity REAL DEFAULT 0,
            utilization_rate REAL DEFAULT 0,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id),
            FOREIGN KEY (section_id) REFERENCES sections(id),
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 语义标签表 (9大分类)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS semantic_tags (
            id TEXT PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            name_en TEXT,
            category TEXT NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#6b7280',
            icon TEXT,
            parent_id TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (parent_id) REFERENCES semantic_tags(id)
        )
    """)

    # 实体-标签关联表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entity_tags (
            entity_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (entity_id, tag_id),
            FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES semantic_tags(id) ON DELETE CASCADE
        )
    """)

    # 实体状态版本表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entity_versions (
            id TEXT PRIMARY KEY,
            entity_id TEXT NOT NULL,
            version_number INTEGER NOT NULL,
            state_data TEXT NOT NULL,
            change_description TEXT,
            created_by TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
        )
    """)

    # 模板表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            config TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # 导入历史表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS import_history (
            id TEXT PRIMARY KEY,
            import_type TEXT NOT NULL,
            filename TEXT NOT NULL,
            success_count INTEGER DEFAULT 0,
            failed_count INTEGER DEFAULT 0,
            errors TEXT,
            created_at TEXT NOT NULL
        )
    """)

    # 人员表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS personnel (
            id TEXT PRIMARY KEY,
            entity_id TEXT,
            name TEXT NOT NULL,
            工种 TEXT,
            team TEXT,
            qualification TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL,
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 资金表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS funds (
            id TEXT PRIMARY KEY,
            entity_id TEXT,
            budget_category TEXT NOT NULL,
            amount REAL DEFAULT 0,
            used_amount REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL,
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 设备表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipment (
            id TEXT PRIMARY KEY,
            entity_id TEXT,
            equipment_type TEXT NOT NULL,
            usage_hours REAL DEFAULT 0,
            status TEXT DEFAULT 'active',
            created_at TEXT NOT NULL,
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 材料表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS materials (
            id TEXT PRIMARY KEY,
            entity_id TEXT,
            material_type TEXT NOT NULL,
            quantity REAL DEFAULT 0,
            unit TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (entity_id) REFERENCES entities(id)
        )
    """)

    # 索引
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_sections_project ON sections(project_id)"
    )
    # Entities indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_entities_section ON entities(section_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_entities_project ON entities(project_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type)"
    )

    # Migration: Add missing columns to existing database
    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN deleted_at TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists

    try:
        cursor.execute(
            "ALTER TABLE entities ADD COLUMN alignment_type TEXT DEFAULT 'straight'"
        )
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN curve_radius REAL")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN curve_length REAL")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN start_azimuth REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute(
            "ALTER TABLE entities ADD COLUMN vertical_type TEXT DEFAULT 'level'"
        )
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN start_elevation REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN end_elevation REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN vertical_curve_length REAL")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN grade_in REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE entities ADD COLUMN grade_out REAL DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute(
            "ALTER TABLE entities ADD COLUMN cross_section_type TEXT DEFAULT 'fill'"
        )
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute(
            "ALTER TABLE entities ADD COLUMN formation_width REAL DEFAULT 12"
        )
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute(
            "ALTER TABLE entities ADD COLUMN side_slope_fill REAL DEFAULT 1.5"
        )
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute(
            "ALTER TABLE entities ADD COLUMN side_slope_cut REAL DEFAULT 0.75"
        )
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute(
            "ALTER TABLE entities ADD COLUMN pavement_thickness REAL DEFAULT 0.5"
        )
    except sqlite3.OperationalError:
        pass

    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_entities_deleted ON entities(deleted_at)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_entities_station ON entities(start_station)"
    )

    # Quantities indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_quantities_project ON quantities(project_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_quantities_entity ON quantities(entity_id)"
    )

    # Progress/Quality/Safety indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_progress_entity ON progress_records(entity_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_progress_date ON progress_records(record_date)"
    )
    cursor.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_entity_date ON progress_records(entity_id, record_date)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_quality_entity ON quality_records(entity_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_quality_date ON quality_records(record_date)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_safety_entity ON safety_records(entity_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_safety_date ON safety_records(record_date)"
    )

    # Resource tables indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_personnel_entity ON personnel(entity_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_equipment_entity ON equipment(entity_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_materials_entity ON materials(entity_id)"
    )
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_funds_entity ON funds(entity_id)")

    # Semantic tags indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_tags_category ON semantic_tags(category)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_entity_tags_tag ON entity_tags(tag_id)"
    )

    # Entity versions indexes
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_versions_entity ON entity_versions(entity_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_versions_created ON entity_versions(created_at)"
    )

    # Initialize default semantic tags (9 categories)
    cursor.execute("SELECT COUNT(*) FROM semantic_tags")
    if cursor.fetchone()[0] == 0:
        now = datetime.now().isoformat()
        default_tags = [
            (
                "tag_001",
                "subgrade",
                "路基工程",
                "Subgrade",
                "structure",
                "路基土石方工程",
                "#8b5cf6",
                "layers",
                None,
                1,
            ),
            (
                "tag_002",
                "pavement",
                "路面工程",
                "Pavement",
                "structure",
                "沥青/水泥混凝土路面",
                "#3b82f6",
                "road",
                None,
                2,
            ),
            (
                "tag_003",
                "bridge",
                "桥梁工程",
                "Bridge",
                "structure",
                "大中小桥及通道",
                "#06b6d4",
                "bridge",
                None,
                3,
            ),
            (
                "tag_004",
                "culvert",
                "涵洞工程",
                "Culvert",
                "structure",
                "盖板涵/波纹管涵",
                "#10b981",
                "arch",
                None,
                4,
            ),
            (
                "tag_005",
                "tunnel",
                "隧道工程",
                "Tunnel",
                "structure",
                "隧道开挖支护",
                "#f59e0b",
                "warehouse",
                None,
                5,
            ),
            (
                "tag_006",
                "drainage",
                "排水工程",
                "Drainage",
                "auxiliary",
                "边沟/排水沟/盲沟",
                "#6366f1",
                "droplets",
                None,
                6,
            ),
            (
                "tag_007",
                "protection",
                "防护工程",
                "Protection",
                "auxiliary",
                "挡墙/护坡/抗滑桩",
                "#ec4899",
                "shield",
                None,
                7,
            ),
            (
                "tag_008",
                "traffic",
                "交通工程",
                "Traffic",
                "auxiliary",
                "标志标线/护栏/声屏障",
                "#84cc16",
                "triangle-alert",
                None,
                8,
            ),
            (
                "tag_009",
                "auxiliary",
                "附属工程",
                "Auxiliary",
                "auxiliary",
                "绿化/照明/隔离栅",
                "#f43f5e",
                "square",
                None,
                9,
            ),
        ]
        for tag_data in default_tags:
            cursor.execute(
                """INSERT INTO semantic_tags (id, code, name, name_en, category, description, color, icon, parent_id, sort_order, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                tag_data + (now,),
            )

    # 初始化演示项目
    cursor.execute("SELECT COUNT(*) FROM projects")
    if cursor.fetchone()[0] == 0:
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
        now = datetime.now().isoformat()
        cursor.execute(
            """
            INSERT INTO projects (id, code, name, construction_unit, supervision_unit, 
                planned_start_date, planned_end_date, total_budget, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                project_id,
                "NS-2026-001",
                "XX高速公路一期工程",
                "XX路桥工程有限公司",
                "XX监理咨询有限公司",
                "2026-01-01",
                "2027-12-31",
                500000000.0,
                "in_progress",
                now,
                now,
            ),
        )

        # 初始化演示分段
        sections = [
            ("sec_001", "K0+000", "K5+000", "路基一标", "路基"),
            ("sec_002", "K5+000", "K10+000", "路基二标", "路基"),
            ("sec_003", "K5+500", "K6+000", "XX河大桥", "桥梁"),
            ("sec_004", "K8+000", "K8+200", "XX1号通道", "涵洞"),
        ]
        for sec_id, start_st, end_st, name, sec_type in sections:
            cursor.execute(
                """
                INSERT INTO sections (id, project_id, code, name, start_station, end_station, 
                    length, terrain_type, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    sec_id,
                    project_id,
                    sec_id.upper(),
                    name,
                    start_st,
                    end_st,
                    5000 if "路基" in name else 500 if "桥" in name else 200,
                    sec_type,
                    "planning",
                    now,
                    now,
                ),
            )

        # 初始化演示实体
        entities = [
            (
                "road_001",
                "sec_001",
                "road",
                "K0+000 - K2+000 道路",
                "K0+000.000",
                "K2+000.000",
                0.45,
                "earthwork",
            ),
            (
                "road_002",
                "sec_001",
                "road",
                "K2+000 - K5+000 道路",
                "K2+000.000",
                "K5+000.000",
                0.30,
                "earthwork",
            ),
            (
                "road_003",
                "sec_002",
                "road",
                "K5+000 - K8+000 道路",
                "K5+000.000",
                "K8+000.000",
                0.10,
                "planning",
            ),
            (
                "bridge_001",
                "sec_003",
                "bridge",
                "XX河大桥",
                "K5+500.000",
                "K5+900.000",
                0.60,
                "pavement",
            ),
            (
                "culvert_001",
                "sec_004",
                "culvert",
                "XX1号通道",
                "K8+000.000",
                "K8+200.000",
                0.80,
                "finishing",
            ),
        ]
        for ent_id, sec_id, ent_type, name, start_st, end_st, prog, phase in entities:
            cursor.execute(
                """
                INSERT INTO entities (id, section_id, project_id, entity_type, code, name,
                    start_station, end_station, progress, construction_phase, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    ent_id,
                    sec_id,
                    project_id,
                    ent_type,
                    ent_id.upper(),
                    name,
                    start_st,
                    end_st,
                    prog,
                    phase,
                    "active",
                    now,
                    now,
                ),
            )

        # 初始化演示工程量
        quantities = [
            ("q_001", "土方开挖", "m³", 150000, 150000, 75000),
            ("q_002", "土方回填", "m³", 120000, 120000, 60000),
            ("q_003", "级配碎石垫层", "m³", 25000, 25000, 10000),
            ("q_004", "水泥稳定碎石基层", "m³", 30000, 30000, 9000),
            ("q_005", "沥青混凝土面层", "m³", 20000, 20000, 0),
            ("q_006", "钢筋", "吨", 500, 500, 300),
            ("q_007", "混凝土", "m³", 8000, 8000, 4800),
        ]
        for i, (qid, name, unit, design, approved, actual) in enumerate(quantities):
            cursor.execute(
                """
                INSERT INTO quantities (id, project_id, section_id, entity_id, item_code, item_name,
                    unit, design_quantity, approved_quantity, actual_quantity, total_price, category, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    qid,
                    project_id,
                    "sec_001",
                    "road_001",
                    f"Q{i + 1:03d}",
                    name,
                    unit,
                    design,
                    approved,
                    actual,
                    0,
                    "路基工程" if i < 4 else "路面工程",
                    now,
                    now,
                ),
            )

    # Initialize default admin user
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        admin_id = f"user_{uuid.uuid4().hex[:8]}"
        now = datetime.now().isoformat()
        admin_password = os.getenv(
            "ADMIN_PASSWORD", "admin123"
        )  # Default password for first login
        cursor.execute(
            """INSERT INTO users (id, username, email, hashed_password, full_name, is_active, is_admin, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                admin_id,
                "admin",
                "admin@neuralsite.local",
                pwd_context.hash(admin_password),
                "系统管理员",
                1,
                1,
                now,
                now,
            ),
        )

    conn.commit()
    conn.close()


init_db()


# ============ Auth Models ============


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


# ============ Auth Dependencies ============


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_user_by_username(username: str) -> Optional[dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None


def get_user_by_id(user_id: str) -> Optional[dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None


def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user_by_username(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    if not current_user.get("is_active"):
        raise HTTPException(status_code=400, detail="用户已被禁用")
    return current_user


def require_admin(current_user: dict = Depends(get_current_active_user)) -> dict:
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return current_user


# ============ Pydantic Models ============


class EntityCreate(BaseModel):
    section_id: Optional[str] = None
    entity_type: ENTITY_TYPES = Field(default="road")
    code: Optional[str] = None
    name: str
    start_station: str
    end_station: str
    lateral_offset: float = Field(default=0)
    width: Optional[float] = None
    height: Optional[float] = None
    lanes: Optional[int] = 4
    design_elevation: Optional[float] = None
    progress: float = Field(default=0, ge=0, le=1)
    construction_phase: str = Field(default="planning")
    planned_start_date: Optional[str] = None
    planned_end_date: Optional[str] = None
    cost_budget: Optional[float] = None
    quality_status: str = Field(default="pending")
    safety_level: str = Field(default="normal")
    notes: Optional[str] = None
    alignment_type: Literal["straight", "circular", "spiral"] = Field(
        default="straight"
    )
    curve_radius: Optional[float] = Field(
        default=None, description="曲线半径(米),仅圆曲线和螺旋曲线需要"
    )
    curve_length: Optional[float] = Field(default=None, description="曲线长度(米)")
    start_azimuth: float = Field(default=0, description="起始方位角(度)")
    vertical_type: Literal["level", "grade", "vertical_curve"] = Field(
        default="level", description="纵坡类型:水平/单坡/竖曲线"
    )
    start_elevation: float = Field(default=0, description="起点高程(米)")
    end_elevation: float = Field(default=0, description="终点高程(米)")
    vertical_curve_length: Optional[float] = Field(
        default=None, description="竖曲线长度(米)"
    )
    grade_in: float = Field(default=0, description="入口纵坡(%)")
    grade_out: float = Field(default=0, description="出口纵坡(%)")
    cross_section_type: Literal["fill", "cut", "mixed"] = Field(
        default="fill", description="横断面类型:填方/挖方/半填半挖"
    )
    formation_width: float = Field(default=12, description="路基宽度(米)")
    side_slope_fill: float = Field(default=1.5, description="填方边坡坡度")
    side_slope_cut: float = Field(default=0.75, description="挖方边坡坡度")
    pavement_thickness: float = Field(default=0.5, description="路面厚度(米)")


class QuantityCreate(BaseModel):
    section_id: Optional[str] = None
    entity_id: Optional[str] = None
    item_code: str
    item_name: str
    unit: str
    design_quantity: float = Field(default=0)
    approved_quantity: Optional[float] = None
    unit_price: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    notes: Optional[str] = None


class ProgressRecordCreate(BaseModel):
    section_id: Optional[str] = None
    entity_id: Optional[str] = None
    record_date: str
    planned_progress: float = Field(default=0)
    actual_progress: float = Field(default=0)
    work_description: Optional[str] = None
    worker_count: Optional[int] = 0
    equipment_count: Optional[int] = 0
    weather: Optional[str] = None
    issues: Optional[str] = None


class QualityRecordCreate(BaseModel):
    section_id: Optional[str] = None
    entity_id: Optional[str] = None
    record_date: str
    inspection_type: str
    inspection_item: Optional[str] = None
    inspector: Optional[str] = None
    result: Optional[str] = None
    issue_found: Optional[str] = None
    issue_severity: Optional[str] = None
    disposition: Optional[str] = None


class SafetyRecordCreate(BaseModel):
    section_id: Optional[str] = None
    entity_id: Optional[str] = None
    record_date: str
    inspection_type: str
    hazard_type: Optional[str] = None
    hazard_description: Optional[str] = None
    risk_level: Optional[str] = None
    corrective_action: Optional[str] = None
    responsible_person: Optional[str] = None
    deadline: Optional[str] = None


class SectionCreate(BaseModel):
    code: str
    name: str
    start_station: str
    end_station: str
    terrain_type: Optional[str] = None
    construction_difficulty: Optional[str] = None
    priority: Optional[int] = 0
    notes: Optional[str] = None


class PersonnelCreate(BaseModel):
    entity_id: Optional[str] = None
    name: str
    工种: Optional[str] = None
    team: Optional[str] = None
    qualification: Optional[str] = None
    status: str = Field(default="active")


class PersonnelSchema(BaseModel):
    id: str
    entity_id: Optional[str] = None
    name: str
    工种: Optional[str] = None
    team: Optional[str] = None
    qualification: Optional[str] = None
    status: str = "active"
    created_at: str


class FundCreate(BaseModel):
    entity_id: Optional[str] = None
    budget_category: str
    amount: float = Field(default=0)
    used_amount: float = Field(default=0)
    status: str = Field(default="active")


class FundSchema(BaseModel):
    id: str
    entity_id: Optional[str] = None
    budget_category: str
    amount: float
    used_amount: float
    status: str = "active"
    created_at: str


class EquipmentCreate(BaseModel):
    entity_id: Optional[str] = None
    equipment_type: str
    usage_hours: float = Field(default=0)
    status: str = Field(default="active")


class EquipmentSchema(BaseModel):
    id: str
    entity_id: Optional[str] = None
    equipment_type: str
    usage_hours: float
    status: str = "active"
    created_at: str


class MaterialCreate(BaseModel):
    entity_id: Optional[str] = None
    material_type: str
    quantity: float = Field(default=0)
    unit: Optional[str] = None


class MaterialSchema(BaseModel):
    id: str
    entity_id: Optional[str] = None
    material_type: str
    quantity: float
    unit: Optional[str] = None
    created_at: str


# ============ Helper Functions ============


def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    for key, value in d.items():
        if isinstance(value, str) and value.startswith("{"):
            try:
                d[key] = json.loads(value)
            except:
                pass
    return d


# ============ Auth Endpoints ============


@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE username = ?", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="用户名已存在")

    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="邮箱已被注册")

    user_id = f"user_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    hashed_password = get_password_hash(user.password)

    cursor.execute(
        """INSERT INTO users (id, username, email, hashed_password, full_name, is_active, is_admin, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            user_id,
            user.username,
            user.email,
            hashed_password,
            user.full_name,
            1,
            0,
            now,
            now,
        ),
    )
    conn.commit()
    conn.close()

    return {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "is_active": True,
        "is_admin": False,
        "created_at": now,
    }


@app.post("/api/v1/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_active_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user.get("full_name"),
        "is_active": bool(current_user["is_active"]),
        "is_admin": bool(current_user["is_admin"]),
        "created_at": current_user["created_at"],
    }


@app.post("/api/v1/auth/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_active_user),
):
    user = authenticate_user(current_user["username"], old_password)
    if not user:
        raise HTTPException(status_code=400, detail="原密码错误")

    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute(
        "UPDATE users SET hashed_password = ?, updated_at = ? WHERE id = ?",
        (get_password_hash(new_password), now, current_user["id"]),
    )
    conn.commit()
    conn.close()

    return {"message": "密码修改成功"}


# ============ API Endpoints ============


@app.get("/")
async def root():
    return {
        "name": "NeuralSite 工程管理系统",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/v1/health")
async def api_v1_health():
    return {"status": "healthy"}


# ============ 项目 API ============


@app.get("/api/v1/projects")
async def list_projects():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.get("/api/v1/projects/{project_id}")
async def get_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="项目不存在")
    return row_to_dict(row)


@app.post("/api/v1/projects")
async def create_project(
    data: dict, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO projects (id, code, name, construction_unit, supervision_unit,
            design_unit, planned_start_date, planned_end_date, planned_duration_days,
            total_budget, status, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            project_id,
            data.get("code", project_id.upper()),
            data.get("name", "新项目"),
            data.get("construction_unit"),
            data.get("supervision_unit"),
            data.get("design_unit"),
            data.get("planned_start_date"),
            data.get("planned_end_date"),
            data.get("planned_duration_days"),
            data.get("total_budget"),
            data.get("status", "planning"),
            data.get("description"),
            now,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return await get_project(project_id)


@app.put("/api/v1/projects/{project_id}")
async def update_project(project_id: str, data: dict):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="项目不存在")

    ALLOWED_FIELDS = {
        "code",
        "name",
        "construction_unit",
        "supervision_unit",
        "design_unit",
        "planned_start_date",
        "planned_end_date",
        "planned_duration_days",
        "total_budget",
        "status",
        "description",
    }

    update_fields = []
    params = []
    for key, value in data.items():
        if key in ALLOWED_FIELDS:
            update_fields.append(f"{key} = ?")
            params.append(value)

    if update_fields:
        update_fields.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(project_id)
        cursor.execute(
            f"UPDATE projects SET {', '.join(update_fields)} WHERE id = ?", params
        )
        conn.commit()

    conn.close()
    return await get_project(project_id)


@app.delete("/api/v1/projects/{project_id}")
async def delete_project(project_id: str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects WHERE id = ?", (project_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="项目不存在")

    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "项目已删除"}


@app.get("/api/v1/projects/{project_id}/summary")
async def get_project_summary(project_id: str):
    conn = get_db()
    cursor = conn.cursor()

    # 基本信息
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    project = row_to_dict(cursor.fetchone())

    # 分段统计
    cursor.execute(
        "SELECT COUNT(*) as count FROM sections WHERE project_id = ?", (project_id,)
    )
    section_count = cursor.fetchone()["count"]

    # 实体统计
    cursor.execute(
        """
        SELECT entity_type, COUNT(*) as count, AVG(progress) as avg_progress 
        FROM entities WHERE project_id = ? GROUP BY entity_type
    """,
        (project_id,),
    )
    entity_stats = [dict(r) for r in cursor.fetchall()]

    # 工程量汇总
    cursor.execute(
        """
        SELECT 
            SUM(design_quantity) as total_design,
            SUM(actual_quantity) as total_actual,
            SUM(approved_quantity * unit_price) as total_value
        FROM quantities WHERE project_id = ?
    """,
        (project_id,),
    )
    quantity_summary = row_to_dict(cursor.fetchone())

    # 最新进度
    cursor.execute(
        """
        SELECT pr.* FROM progress_records pr
        INNER JOIN (
            SELECT entity_id, MAX(record_date) as max_date
            FROM progress_records WHERE entity_id IN 
                (SELECT id FROM entities WHERE project_id = ?)
            GROUP BY entity_id
        ) latest ON pr.entity_id = latest.entity_id AND pr.record_date = latest.max_date
    """,
        (project_id,),
    )
    latest_progress = [row_to_dict(r) for r in cursor.fetchall()]

    # 待处理问题
    cursor.execute(
        "SELECT COUNT(*) as count FROM quality_records WHERE project_id = ? AND status = 'open'",
        (project_id,),
    )
    open_quality_issues = cursor.fetchone()["count"]

    cursor.execute(
        "SELECT COUNT(*) as count FROM safety_records WHERE project_id = ? AND status = 'open'",
        (project_id,),
    )
    open_safety_issues = cursor.fetchone()["count"]

    conn.close()

    return {
        "project": project,
        "section_count": section_count,
        "entity_stats": entity_stats,
        "quantity_summary": quantity_summary,
        "latest_progress": latest_progress,
        "open_quality_issues": open_quality_issues,
        "open_safety_issues": open_safety_issues,
    }


# ============ 分段 API ============


@app.get("/api/v1/sections")
async def list_sections(project_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if project_id:
        cursor.execute(
            "SELECT * FROM sections WHERE project_id = ? ORDER BY start_station",
            (project_id,),
        )
    else:
        cursor.execute("SELECT * FROM sections ORDER BY start_station")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.get("/api/v1/sections/{section_id}")
async def get_section(section_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sections WHERE id = ?", (section_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="分段不存在")
    return row_to_dict(row)


@app.post("/api/v1/sections")
async def create_section(
    data: SectionCreate, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    # 获取项目ID
    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    section_id = f"sec_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    # 计算长度
    try:
        start_mm = parse_station_mm(data.start_station)
        end_mm = parse_station_mm(data.end_station)
        if end_mm <= start_mm:
            conn.close()
            raise HTTPException(status_code=400, detail="终点桩号必须大于起点桩号")
        length = abs(end_mm - start_mm) / 1000
    except ValueError as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"桩号格式错误: {str(e)}")

    cursor.execute(
        """
        INSERT INTO sections (id, project_id, code, name, start_station, end_station, length,
            terrain_type, construction_difficulty, priority, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            section_id,
            project_id,
            data.code,
            data.name,
            data.start_station,
            data.end_station,
            length,
            data.terrain_type,
            data.construction_difficulty,
            data.priority or 0,
            data.notes,
            now,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return await get_section(section_id)


@app.put("/api/v1/sections/{section_id}")
async def update_section(section_id: str, data: dict):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM sections WHERE id = ?", (section_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="分段不存在")

    ALLOWED_FIELDS = {
        "code",
        "name",
        "start_station",
        "end_station",
        "length",
        "terrain_type",
        "construction_difficulty",
        "priority",
        "notes",
    }

    # 验证桩号格式和范围
    new_start = data.get("start_station")
    new_end = data.get("end_station")
    if new_start or new_end:
        try:
            start_mm = parse_station_mm(new_start) if new_start else None
            end_mm = parse_station_mm(new_end) if new_end else None
            if start_mm is not None and end_mm is not None and end_mm <= start_mm:
                conn.close()
                raise HTTPException(status_code=400, detail="终点桩号必须大于起点桩号")
        except ValueError as e:
            conn.close()
            raise HTTPException(status_code=400, detail=f"桩号格式错误: {str(e)}")

    update_fields = []
    params = []
    for key, value in data.items():
        if key in ALLOWED_FIELDS:
            update_fields.append(f"{key} = ?")
            params.append(value)

    if update_fields:
        update_fields.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(section_id)
        cursor.execute(
            f"UPDATE sections SET {', '.join(update_fields)} WHERE id = ?", params
        )
        conn.commit()

    conn.close()
    return await get_section(section_id)


@app.delete("/api/v1/sections/{section_id}")
async def delete_section(section_id: str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM sections WHERE id = ?", (section_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="分段不存在")

    cursor.execute("DELETE FROM sections WHERE id = ?", (section_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "分段已删除"}


# ============ 实体 API ============


@app.get("/api/v1/entities")
async def list_entities(
    project_id: Optional[str] = None,
    section_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    conn = get_db()
    cursor = conn.cursor()

    # Build WHERE clause - exclude soft-deleted
    query = "SELECT * FROM entities WHERE deleted_at IS NULL AND 1=1"
    count_query = (
        "SELECT COUNT(*) as total FROM entities WHERE deleted_at IS NULL AND 1=1"
    )
    params = []

    if project_id:
        query += " AND project_id = ?"
        count_query += " AND project_id = ?"
        params.append(project_id)
    if section_id:
        query += " AND section_id = ?"
        count_query += " AND section_id = ?"
        params.append(section_id)
    if entity_type:
        query += " AND entity_type = ?"
        count_query += " AND entity_type = ?"
        params.append(entity_type)

    # Get total count
    cursor.execute(count_query, params)
    total = cursor.fetchone()["total"]

    # Apply pagination
    query += " ORDER BY start_station LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return {
        "items": [row_to_dict(r) for r in rows],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@app.get("/api/v1/entities/{entity_id}")
async def get_entity(entity_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM entities WHERE id = ?", (entity_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="实体不存在")
    return row_to_dict(row)


@app.post("/api/v1/entities")
async def create_entity(
    data: EntityCreate, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    # 获取项目ID
    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    # 优先使用前端传入的ID，否则生成新的
    entity_id = data.code if data.code else f"{data.entity_type}_{uuid.uuid4().hex[:8]}"

    # 检查ID是否已存在
    cursor.execute("SELECT id FROM entities WHERE id = ?", (entity_id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail=f"实体ID {entity_id} 已存在")

    # 验证名称不能为空
    if not data.name or not data.name.strip():
        conn.close()
        raise HTTPException(status_code=400, detail="名称不能为空")

    # 验证桩号范围
    try:
        start_mm = parse_station_mm(data.start_station)
        end_mm = parse_station_mm(data.end_station)
        if end_mm <= start_mm:
            conn.close()
            raise HTTPException(status_code=400, detail="终点桩号必须大于起点桩号")
    except ValueError as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"桩号格式错误: {str(e)}")

    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO entities (id, section_id, project_id, entity_type, code, name,
            start_station, end_station, lateral_offset, width, height, lanes,
            design_elevation, progress, construction_phase, planned_start_date,
            planned_end_date, cost_budget, quality_status, safety_level, notes, 
            alignment_type, curve_radius, curve_length, start_azimuth,
            vertical_type, start_elevation, end_elevation, vertical_curve_length,
            grade_in, grade_out, cross_section_type, formation_width,
            side_slope_fill, side_slope_cut, pavement_thickness, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            entity_id,
            data.section_id,
            project_id,
            data.entity_type,
            data.code or entity_id.upper(),
            data.name,
            data.start_station,
            data.end_station,
            data.lateral_offset,
            data.width,
            data.height,
            data.lanes,
            data.design_elevation,
            data.progress,
            data.construction_phase,
            data.planned_start_date,
            data.planned_end_date,
            data.cost_budget,
            data.quality_status,
            data.safety_level,
            data.notes,
            data.alignment_type,
            data.curve_radius,
            data.curve_length,
            data.start_azimuth,
            data.vertical_type,
            data.start_elevation,
            data.end_elevation,
            data.vertical_curve_length,
            data.grade_in,
            data.grade_out,
            data.cross_section_type,
            data.formation_width,
            data.side_slope_fill,
            data.side_slope_cut,
            data.pavement_thickness,
            now,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return await get_entity(entity_id)


class BatchEntityCreate(BaseModel):
    entities: List[EntityCreate]


@app.post("/api/v1/entities/batch")
async def create_entities_batch(
    batch: BatchEntityCreate, current_user: dict = Depends(get_current_active_user)
):
    """批量创建实体 - 使用单事务减少DB往返"""
    if len(batch.entities) > 100:
        raise HTTPException(status_code=400, detail="单次批量创建最多100个实体")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    now = datetime.now().isoformat()
    created = []
    errors = []

    existing_ids = set()
    cursor.execute("SELECT id FROM entities")
    for row in cursor.fetchall():
        existing_ids.add(row["id"])

    for i, data in enumerate(batch.entities):
        try:
            entity_id = (
                data.code if data.code else f"{data.entity_type}_{uuid.uuid4().hex[:8]}"
            )

            if entity_id in existing_ids:
                errors.append({"index": i, "id": entity_id, "error": "ID已存在"})
                continue

            if not data.name or not data.name.strip():
                errors.append({"index": i, "id": entity_id, "error": "名称为空"})
                continue

            try:
                start_mm = parse_station_mm(data.start_station)
                end_mm = parse_station_mm(data.end_station)
                if end_mm <= start_mm:
                    errors.append(
                        {"index": i, "id": entity_id, "error": "终点桩号必须大于起点"}
                    )
                    continue
            except ValueError as e:
                errors.append(
                    {"index": i, "id": entity_id, "error": f"桩号格式错误: {e}"}
                )
                continue

            cursor.execute(
                """
                INSERT INTO entities (id, section_id, project_id, entity_type, code, name,
                    start_station, end_station, lateral_offset, width, height, lanes,
                    design_elevation, progress, construction_phase, planned_start_date,
                    planned_end_date, cost_budget, quality_status, safety_level, notes, 
                    alignment_type, curve_radius, curve_length, start_azimuth,
                    vertical_type, start_elevation, end_elevation, vertical_curve_length,
                    grade_in, grade_out, cross_section_type, formation_width,
                    side_slope_fill, side_slope_cut, pavement_thickness, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    entity_id,
                    data.section_id,
                    project_id,
                    data.entity_type,
                    data.code or entity_id.upper(),
                    data.name,
                    data.start_station,
                    data.end_station,
                    data.lateral_offset,
                    data.width,
                    data.height,
                    data.lanes,
                    data.design_elevation,
                    data.progress,
                    data.construction_phase,
                    data.planned_start_date,
                    data.planned_end_date,
                    data.cost_budget,
                    data.quality_status,
                    data.safety_level,
                    data.notes,
                    data.alignment_type,
                    data.curve_radius,
                    data.curve_length,
                    data.start_azimuth,
                    data.vertical_type,
                    data.start_elevation,
                    data.end_elevation,
                    data.vertical_curve_length,
                    data.grade_in,
                    data.grade_out,
                    data.cross_section_type,
                    data.formation_width,
                    data.side_slope_fill,
                    data.side_slope_cut,
                    data.pavement_thickness,
                    now,
                    now,
                ),
            )
            existing_ids.add(entity_id)
            created.append(entity_id)
        except Exception as e:
            errors.append({"index": i, "error": str(e)})

    conn.commit()
    conn.close()

    return {
        "success": len(created),
        "failed": len(errors),
        "created": created,
        "errors": errors if errors else None,
    }


@app.put("/api/v1/entities/{entity_id}")
async def update_entity(
    entity_id: str, data: dict, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM entities WHERE id = ?", (entity_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")

    # Whitelist allowed fields to prevent SQL injection
    ALLOWED_FIELDS = {
        "code",
        "name",
        "start_station",
        "end_station",
        "lateral_offset",
        "width",
        "height",
        "lanes",
        "design_elevation",
        "actual_elevation",
        "progress",
        "construction_phase",
        "planned_start_date",
        "actual_start_date",
        "planned_end_date",
        "actual_end_date",
        "planned_duration_days",
        "cost_budget",
        "cost_actual",
        "quality_status",
        "safety_level",
        "status",
        "notes",
        "section_id",
        "alignment_type",
        "curve_radius",
        "curve_length",
        "start_azimuth",
        "vertical_type",
        "start_elevation",
        "end_elevation",
        "vertical_curve_length",
        "grade_in",
        "grade_out",
        "cross_section_type",
        "formation_width",
        "side_slope_fill",
        "side_slope_cut",
        "pavement_thickness",
    }

    update_fields = []
    params = []
    for key, value in data.items():
        if key in ALLOWED_FIELDS:
            update_fields.append(f"{key} = ?")
            params.append(value)

    if update_fields:
        update_fields.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(entity_id)
        cursor.execute(
            f"UPDATE entities SET {', '.join(update_fields)} WHERE id = ?", params
        )
        conn.commit()

    conn.close()
    return await get_entity(entity_id)


@app.delete("/api/v1/entities/{entity_id}")
async def delete_entity(
    entity_id: str, current_user: dict = Depends(get_current_active_user)
):
    """Soft delete - sets deleted_at timestamp"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE entities SET deleted_at = ? WHERE id = ?",
        (datetime.now().isoformat(), entity_id),
    )
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")
    conn.commit()
    conn.close()
    return {"success": True, "message": "已移至回收站"}


@app.get("/api/v1/entities/trash")
async def list_trash():
    """List soft-deleted entities"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM entities WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
    )
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/entities/{entity_id}/restore")
async def restore_entity(entity_id: str):
    """Restore a soft-deleted entity"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE entities SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL",
        (entity_id,),
    )
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在或未删除")
    conn.commit()
    conn.close()
    return {"success": True, "message": "已恢复"}


@app.delete("/api/v1/entities/{entity_id}/permanent")
async def permanent_delete_entity(entity_id: str):
    """Permanently delete an entity"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM entities WHERE id = ? AND deleted_at IS NOT NULL", (entity_id,)
    )
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在或未删除")
    conn.commit()
    conn.close()
    return {"success": True, "message": "已永久删除"}


@app.get("/api/v1/data/export")
async def export_data():
    """Export all data as JSON for backup"""
    conn = get_db()
    cursor = conn.cursor()

    # Export all tables
    tables = [
        "projects",
        "sections",
        "entities",
        "quantities",
        "progress_records",
        "quality_records",
        "safety_records",
        "personnel",
        "equipment",
        "materials",
        "funds",
    ]

    data = {}
    allowed_tables = set(tables)
    for table in tables:
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        data[table] = [row_to_dict(r) for r in rows]

    conn.close()

    return {"exported_at": datetime.now().isoformat(), "version": "1.0", "data": data}


@app.post("/api/v1/data/import")
async def import_data(
    payload: dict, current_user: dict = Depends(get_current_active_user)
):
    """Import data from backup"""
    if "data" not in payload:
        raise HTTPException(status_code=400, detail="无效的导入数据格式")

    data = payload["data"]
    conn = get_db()
    cursor = conn.cursor()

    imported = {"entities": 0, "projects": 0, "sections": 0}

    ENTITY_ALLOWED_FIELDS = {
        "id",
        "section_id",
        "project_id",
        "entity_type",
        "code",
        "name",
        "start_station",
        "end_station",
        "lateral_offset",
        "width",
        "height",
        "lanes",
        "design_elevation",
        "progress",
        "construction_phase",
        "planned_start_date",
        "planned_end_date",
        "cost_budget",
        "quality_status",
        "safety_level",
        "notes",
        "created_at",
        "updated_at",
    }

    try:
        # Import entities
        if "entities" in data:
            for entity in data["entities"]:
                # Check if exists
                cursor.execute("SELECT id FROM entities WHERE id = ?", (entity["id"],))
                if cursor.fetchone():
                    continue  # Skip existing

                # Filter to only allowed fields (prevent SQL injection)
                keys = [k for k in entity.keys() if k in ENTITY_ALLOWED_FIELDS]
                if not keys:
                    continue
                placeholders = ", ".join(["?"] * len(keys))
                columns = ", ".join(keys)
                cursor.execute(
                    f"INSERT INTO entities ({columns}) VALUES ({placeholders})",
                    [entity[k] for k in keys],
                )
                imported["entities"] += 1

        conn.commit()
        conn.close()

        return {
            "success": True,
            "imported": imported,
            "message": f"成功导入 {imported['entities']} 个实体",
        }
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")


# ============ 工程量 API ============


@app.get("/api/v1/quantities")
async def list_quantities(
    project_id: Optional[str] = None,
    section_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    category: Optional[str] = None,
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM quantities WHERE 1=1"
    params = []

    if project_id:
        query += " AND project_id = ?"
        params.append(project_id)
    if section_id:
        query += " AND section_id = ?"
        params.append(section_id)
    if entity_id:
        query += " AND entity_id = ?"
        params.append(entity_id)
    if category:
        query += " AND category = ?"
        params.append(category)

    query += " ORDER BY item_code"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/quantities")
async def create_quantity(data: QuantityCreate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    quantity_id = f"qty_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    approved_qty = (
        data.approved_quantity
        if data.approved_quantity is not None
        else data.design_quantity
    )
    unit_price = data.unit_price or 0
    total_price = approved_qty * unit_price

    cursor.execute(
        """
        INSERT INTO quantities (id, project_id, section_id, entity_id, item_code, item_name,
            unit, design_quantity, approved_quantity, unit_price, total_price, category, subcategory, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            quantity_id,
            project_id,
            data.section_id,
            data.entity_id,
            data.item_code,
            data.item_name,
            data.unit,
            data.design_quantity,
            approved_qty,
            unit_price,
            total_price,
            data.category,
            data.subcategory,
            data.notes,
            now,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": quantity_id, "success": True}


@app.put("/api/v1/quantities/{quantity_id}")
async def update_quantity(quantity_id: str, data: dict):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM quantities WHERE id = ?", (quantity_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="工程量不存在")

    update_fields = []
    params = []
    for key, value in data.items():
        if key not in ("id", "created_at", "project_id"):
            update_fields.append(f"{key} = ?")
            params.append(value)

    # 重新计算总价
    if "approved_quantity" in data or "unit_price" in data:
        approved_qty = data.get("approved_quantity", existing["approved_quantity"])
        unit_price = data.get("unit_price", existing["unit_price"])
        update_fields.append("total_price = ?")
        params.append(approved_qty * unit_price)

    if update_fields:
        update_fields.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(quantity_id)
        cursor.execute(
            f"UPDATE quantities SET {', '.join(update_fields)} WHERE id = ?", params
        )
        conn.commit()

    cursor.execute("SELECT * FROM quantities WHERE id = ?", (quantity_id,))
    result = row_to_dict(cursor.fetchone())
    conn.close()
    return result


# ============ 进度记录 API ============


@app.get("/api/v1/progress")
async def list_progress(entity_id: Optional[str] = None, limit: int = 100):
    conn = get_db()
    cursor = conn.cursor()

    if entity_id:
        cursor.execute(
            """
            SELECT * FROM progress_records WHERE entity_id = ? 
            ORDER BY record_date DESC LIMIT ?
        """,
            (entity_id, limit),
        )
    else:
        cursor.execute(
            "SELECT * FROM progress_records ORDER BY record_date DESC LIMIT ?", (limit,)
        )

    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/progress")
async def create_progress_record(data: ProgressRecordCreate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    record_id = f"pr_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO progress_records (id, project_id, section_id, entity_id, record_date,
            planned_progress, actual_progress, work_description, worker_count, equipment_count,
            weather, issues, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            record_id,
            project_id,
            data.section_id,
            data.entity_id,
            data.record_date,
            data.planned_progress,
            data.actual_progress,
            data.work_description,
            data.worker_count or 0,
            data.equipment_count or 0,
            data.weather,
            data.issues,
            now,
        ),
    )

    # 更新实体进度
    if data.entity_id and data.actual_progress > 0:
        cursor.execute(
            """
            UPDATE entities SET progress = ?, updated_at = ? WHERE id = ?
        """,
            (data.actual_progress, now, data.entity_id),
        )

    conn.commit()
    conn.close()

    return {"id": record_id, "success": True}


@app.put("/api/v1/progress/{record_id}")
async def update_progress_record(record_id: str, data: dict):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM progress_records WHERE id = ?", (record_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="进度记录不存在")

    ALLOWED_FIELDS = {
        "record_date",
        "planned_progress",
        "actual_progress",
        "work_description",
        "worker_count",
        "equipment_count",
        "weather",
        "issues",
    }

    update_fields = []
    params = []
    for key, value in data.items():
        if key in ALLOWED_FIELDS:
            update_fields.append(f"{key} = ?")
            params.append(value)

    if update_fields:
        cursor.execute(
            f"UPDATE progress_records SET {', '.join(update_fields)} WHERE id = ?",
            params + [record_id],
        )
        conn.commit()

    conn.close()
    return {"id": record_id, "success": True}


# ============ 质量记录 API ============


@app.get("/api/v1/quality")
async def list_quality(
    entity_id: Optional[str] = None, status: Optional[str] = None, limit: int = 100
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM quality_records WHERE 1=1"
    params = []

    if entity_id:
        query += " AND entity_id = ?"
        params.append(entity_id)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY record_date DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/quality")
async def create_quality_record(data: QualityRecordCreate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    record_id = f"qr_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO quality_records (id, project_id, section_id, entity_id, record_date,
            inspection_type, inspection_item, inspector, result, issue_found, issue_severity,
            disposition, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            record_id,
            project_id,
            data.section_id,
            data.entity_id,
            data.record_date,
            data.inspection_type,
            data.inspection_item,
            data.inspector,
            data.result,
            data.issue_found,
            data.issue_severity,
            data.disposition,
            "open",
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": record_id, "success": True}


@app.put("/api/v1/quality/{record_id}")
async def update_quality_record(record_id: str, data: dict):
    conn = get_db()
    cursor = conn.cursor()

    update_fields = []
    params = []
    for key, value in data.items():
        if key not in ("id", "created_at", "project_id"):
            update_fields.append(f"{key} = ?")
            params.append(value)

    if update_fields:
        params.append(record_id)
        cursor.execute(
            f"UPDATE quality_records SET {', '.join(update_fields)} WHERE id = ?",
            params,
        )
        conn.commit()

    conn.close()
    return {"success": True}


# ============ 安全记录 API ============


@app.get("/api/v1/safety")
async def list_safety(
    entity_id: Optional[str] = None, status: Optional[str] = None, limit: int = 100
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM safety_records WHERE 1=1"
    params = []

    if entity_id:
        query += " AND entity_id = ?"
        params.append(entity_id)
    if status:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY record_date DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/safety")
async def create_safety_record(data: SafetyRecordCreate):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    record_id = f"sr_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO safety_records (id, project_id, section_id, entity_id, record_date,
            inspection_type, hazard_type, hazard_description, risk_level, corrective_action,
            responsible_person, deadline, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            record_id,
            project_id,
            data.section_id,
            data.entity_id,
            data.record_date,
            data.inspection_type,
            data.hazard_type,
            data.hazard_description,
            data.risk_level,
            data.corrective_action,
            data.responsible_person,
            data.deadline,
            "open",
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": record_id, "success": True}


# ============ 资源投入 API ============


@app.get("/api/v1/resources")
async def list_resources(
    entity_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: int = 100,
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM resource_inputs WHERE 1=1"
    params = []

    if entity_id:
        query += " AND entity_id = ?"
        params.append(entity_id)
    if resource_type:
        query += " AND resource_type = ?"
        params.append(resource_type)

    query += " ORDER BY record_date DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/resources")
async def create_resource(data: dict):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    resource_id = f"res_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO resource_inputs (id, project_id, section_id, entity_id, record_date,
            resource_type, resource_name, unit, planned_quantity, actual_quantity,
            utilization_rate, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            resource_id,
            project_id,
            data.get("section_id"),
            data.get("entity_id"),
            data["record_date"],
            data["resource_type"],
            data["resource_name"],
            data.get("unit"),
            data.get("planned_quantity", 0),
            data.get("actual_quantity", 0),
            data.get("utilization_rate", 0),
            data.get("notes"),
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": resource_id, "success": True}


# ============ 人员 API ============


@app.get("/api/v1/resources/personnel")
async def list_personnel(entity_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()

    if entity_id:
        cursor.execute(
            "SELECT * FROM personnel WHERE entity_id = ? ORDER BY created_at DESC",
            (entity_id,),
        )
    else:
        cursor.execute("SELECT * FROM personnel ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/resources/personnel")
async def create_personnel(
    data: PersonnelCreate, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="请先创建项目")

    personnel_id = f"per_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO personnel (id, entity_id, name, 工种, team, qualification, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            personnel_id,
            data.entity_id,
            data.name,
            data.工种,
            data.team,
            data.qualification,
            data.status,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": personnel_id, "success": True}


# ============ 资金 API ============


@app.get("/api/v1/resources/funds")
async def list_funds(entity_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()

    if entity_id:
        cursor.execute(
            "SELECT * FROM funds WHERE entity_id = ? ORDER BY created_at DESC",
            (entity_id,),
        )
    else:
        cursor.execute("SELECT * FROM funds ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/resources/funds")
async def create_fund(
    data: FundCreate, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="请先创建项目")

    fund_id = f"fund_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO funds (id, entity_id, budget_category, amount, used_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        (
            fund_id,
            data.entity_id,
            data.budget_category,
            data.amount,
            data.used_amount,
            data.status,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": fund_id, "success": True}


# ============ 设备 API ============


@app.get("/api/v1/resources/equipment")
async def list_equipment(entity_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()

    if entity_id:
        cursor.execute(
            "SELECT * FROM equipment WHERE entity_id = ? ORDER BY created_at DESC",
            (entity_id,),
        )
    else:
        cursor.execute("SELECT * FROM equipment ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/resources/equipment")
async def create_equipment(
    data: EquipmentCreate, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="请先创建项目")

    equipment_id = f"equip_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO equipment (id, entity_id, equipment_type, usage_hours, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            equipment_id,
            data.entity_id,
            data.equipment_type,
            data.usage_hours,
            data.status,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": equipment_id, "success": True}


# ============ 材料 API ============


@app.get("/api/v1/resources/materials")
async def list_materials(entity_id: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()

    if entity_id:
        cursor.execute(
            "SELECT * FROM materials WHERE entity_id = ? ORDER BY created_at DESC",
            (entity_id,),
        )
    else:
        cursor.execute("SELECT * FROM materials ORDER BY created_at DESC")

    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/resources/materials")
async def create_material(
    data: MaterialCreate, current_user: dict = Depends(get_current_active_user)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="请先创建项目")

    material_id = f"mat_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    cursor.execute(
        """
        INSERT INTO materials (id, entity_id, material_type, quantity, unit, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            material_id,
            data.entity_id,
            data.material_type,
            data.quantity,
            data.unit,
            now,
        ),
    )

    conn.commit()
    conn.close()

    return {"id": material_id, "success": True}


@app.delete("/api/v1/resources/personnel/{person_id}")
async def delete_personnel(person_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM personnel WHERE id = ?", (person_id,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/v1/resources/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM equipment WHERE id = ?", (equipment_id,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/v1/resources/materials/{material_id}")
async def delete_material(material_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM materials WHERE id = ?", (material_id,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/v1/resources/funds/{fund_id}")
async def delete_fund(fund_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM funds WHERE id = ?", (fund_id,))
    conn.commit()
    conn.close()
    return {"success": True}


# ============ 统计 API ============


@app.get("/api/v1/stats/dashboard")
async def get_dashboard():
    conn = get_db()
    cursor = conn.cursor()

    # 项目数
    cursor.execute("SELECT COUNT(*) as count FROM projects")
    project_count = cursor.fetchone()["count"]

    # 分段数
    cursor.execute("SELECT COUNT(*) as count FROM sections")
    section_count = cursor.fetchone()["count"]

    # 实体统计
    cursor.execute(
        "SELECT entity_type, COUNT(*) as count, AVG(progress) as avg_progress FROM entities GROUP BY entity_type"
    )
    entity_by_type = [dict(r) for r in cursor.fetchall()]

    # 整体进度
    cursor.execute("SELECT AVG(progress) as overall_progress FROM entities")
    overall = cursor.fetchone()
    overall_progress = overall["overall_progress"] if overall else 0

    # 待处理问题
    cursor.execute(
        "SELECT COUNT(*) as count FROM quality_records WHERE status = 'open'"
    )
    open_quality = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM safety_records WHERE status = 'open'")
    open_safety = cursor.fetchone()["count"]

    # 工程量完成率
    cursor.execute(
        "SELECT SUM(design_quantity) as total_design, SUM(actual_quantity) as total_actual FROM quantities"
    )
    qty = row_to_dict(cursor.fetchone())
    qty_completion = (
        (qty["total_actual"] / qty["total_design"] * 100)
        if qty["total_design"] > 0
        else 0
    )

    conn.close()

    return {
        "project_count": project_count,
        "section_count": section_count,
        "entity_by_type": entity_by_type,
        "overall_progress": round(overall_progress * 100, 1) if overall_progress else 0,
        "open_quality_issues": open_quality,
        "open_safety_issues": open_safety,
        "quantity_completion": round(qty_completion, 1),
    }


# ============ CSV 导入 API ============


def parse_station_mm(station: str) -> float:
    station = station.strip()
    pattern1 = r"^K(\d+)\+(\d{3})$"
    pattern2 = r"^K(\d+)\+(\d{3})\.(\d{1,3})$"

    match = re.match(pattern2, station)
    if match:
        km = int(match.group(1))
        m = int(match.group(2))
        mm = int(match.group(3).ljust(3, "0"))
        return km * 1000000 + m * 1000 + mm

    match = re.match(pattern1, station)
    if match:
        km = int(match.group(1))
        m = int(match.group(2))
        return km * 1000000 + m * 1000

    raise ValueError(f"无效的桩号格式: {station}")


@app.post("/api/v1/entities/import-csv")
async def import_entities_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="只支持 CSV 文件")

    content = await file.read()
    decoded_content = content.decode("utf-8-sig").strip()

    reader = csv.DictReader(io.StringIO(decoded_content))

    success_count = 0
    failed_count = 0
    errors = []

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM projects LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="请先创建项目")
    project_id = row["id"]

    now = datetime.now().isoformat()

    for i, row in enumerate(reader):
        try:
            entity_id = f"imp_{uuid.uuid4().hex[:8]}"

            cursor.execute(
                """
                INSERT INTO entities (id, project_id, entity_type, code, name,
                    start_station, end_station, width, lanes, progress, construction_phase,
                    planned_start_date, planned_end_date, cost_budget, quality_status, safety_level, notes,
                    status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    entity_id,
                    project_id,
                    row.get("entity_type", "road"),
                    row.get("code", entity_id.upper()),
                    row.get("name", f"导入实体_{i + 1}"),
                    row.get("start_station", "K0+000.000"),
                    row.get("end_station", "K0+100.000"),
                    float(row.get("width", 12)) if row.get("width") else None,
                    int(row.get("lanes", 4)) if row.get("lanes") else None,
                    float(row.get("progress", 0)),
                    row.get("construction_phase", "planning"),
                    row.get("planned_start_date"),
                    row.get("planned_end_date"),
                    float(row.get("cost_budget")) if row.get("cost_budget") else None,
                    row.get("quality_status", "pending"),
                    row.get("safety_level", "normal"),
                    row.get("notes"),
                    "active",
                    now,
                    now,
                ),
            )
            success_count += 1
        except Exception as e:
            errors.append({"row": i + 1, "error": str(e)})
            failed_count += 1

    conn.commit()
    conn.close()

    return {
        "success_count": success_count,
        "failed_count": failed_count,
        "errors": errors[:10],
    }


# ============ 模板 API ============


@app.get("/api/v1/templates")
async def list_templates():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM templates ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/templates")
async def create_template(data: dict):
    template_id = f"tmpl_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO templates (id, name, entity_type, config, created_at)
        VALUES (?, ?, ?, ?, ?)
    """,
        (
            template_id,
            data["name"],
            data.get("entity_type", "road"),
            json.dumps(data.get("config", {})),
            now,
        ),
    )
    conn.commit()
    conn.close()

    return {"id": template_id, "success": True}


@app.delete("/api/v1/templates/{template_id}")
async def delete_template(template_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM templates WHERE id = ?", (template_id,))
    conn.commit()
    conn.close()
    return {"success": True}


# ============ 语义标签 API ============


class TagCreate(BaseModel):
    code: str
    name: str
    name_en: Optional[str] = None
    category: str
    description: Optional[str] = None
    color: str = "#6b7280"
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: int = 0


@app.get("/api/v1/tags")
async def list_tags(category: Optional[str] = None):
    """获取所有语义标签"""
    conn = get_db()
    cursor = conn.cursor()

    if category:
        cursor.execute(
            "SELECT * FROM semantic_tags WHERE category = ? ORDER BY sort_order",
            (category,),
        )
    else:
        cursor.execute("SELECT * FROM semantic_tags ORDER BY sort_order")

    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.get("/api/v1/tags/categories")
async def list_tag_categories():
    """获取标签分类列表"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT category FROM semantic_tags ORDER BY category")
    rows = cursor.fetchall()
    conn.close()
    return [r["category"] for r in rows]


@app.get("/api/v1/tags/{tag_id}")
async def get_tag(tag_id: str):
    """获取单个标签"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM semantic_tags WHERE id = ?", (tag_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="标签不存在")
    return row_to_dict(row)


@app.post("/api/v1/tags")
async def create_tag(data: TagCreate):
    """创建新标签"""
    tag_id = f"tag_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM semantic_tags WHERE code = ?", (data.code,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail=f"标签代码 {data.code} 已存在")

    cursor.execute(
        """INSERT INTO semantic_tags (id, code, name, name_en, category, description, color, icon, parent_id, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            tag_id,
            data.code,
            data.name,
            data.name_en,
            data.category,
            data.description,
            data.color,
            data.icon,
            data.parent_id,
            data.sort_order,
            now,
        ),
    )
    conn.commit()
    conn.close()

    return {"id": tag_id, "success": True}


@app.put("/api/v1/tags/{tag_id}")
async def update_tag(tag_id: str, data: dict):
    """更新标签"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM semantic_tags WHERE id = ?", (tag_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="标签不存在")

    ALLOWED_FIELDS = {
        "code",
        "name",
        "name_en",
        "category",
        "description",
        "color",
        "icon",
        "parent_id",
        "sort_order",
    }
    update_fields = []
    params = []
    for key, value in data.items():
        if key in ALLOWED_FIELDS:
            update_fields.append(f"{key} = ?")
            params.append(value)

    if update_fields:
        params.append(tag_id)
        cursor.execute(
            f"UPDATE semantic_tags SET {', '.join(update_fields)} WHERE id = ?", params
        )
        conn.commit()

    conn.close()
    return await get_tag(tag_id)


@app.delete("/api/v1/tags/{tag_id}")
async def delete_tag(tag_id: str):
    """删除标签"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM semantic_tags WHERE id = ?", (tag_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="标签不存在")

    cursor.execute("DELETE FROM semantic_tags WHERE id = ?", (tag_id,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.get("/api/v1/entities/{entity_id}/tags")
async def get_entity_tags(entity_id: str):
    """获取实体的所有标签"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM entities WHERE id = ?", (entity_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")

    cursor.execute(
        """SELECT t.* FROM semantic_tags t
           JOIN entity_tags et ON t.id = et.tag_id
           WHERE et.entity_id = ?
           ORDER BY t.sort_order""",
        (entity_id,),
    )
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@app.post("/api/v1/entities/{entity_id}/tags/{tag_id}")
async def add_entity_tag(entity_id: str, tag_id: str):
    """为实体添加标签"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM entities WHERE id = ?", (entity_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")

    cursor.execute("SELECT id FROM semantic_tags WHERE id = ?", (tag_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="标签不存在")

    now = datetime.now().isoformat()
    try:
        cursor.execute(
            "INSERT INTO entity_tags (entity_id, tag_id, created_at) VALUES (?, ?, ?)",
            (entity_id, tag_id, now),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return {"success": True, "message": "标签已存在"}

    conn.close()
    return {"success": True}


@app.delete("/api/v1/entities/{entity_id}/tags/{tag_id}")
async def remove_entity_tag(entity_id: str, tag_id: str):
    """移除实体的标签"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM entity_tags WHERE entity_id = ? AND tag_id = ?",
        (entity_id, tag_id),
    )
    conn.commit()
    conn.close()
    return {"success": True}


@app.put("/api/v1/entities/{entity_id}/tags")
async def update_entity_tags(entity_id: str, tag_ids: List[str]):
    """更新实体的所有标签"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM entities WHERE id = ?", (entity_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")

    cursor.execute("DELETE FROM entity_tags WHERE entity_id = ?", (entity_id,))

    now = datetime.now().isoformat()
    for tag_id in tag_ids:
        cursor.execute(
            "INSERT INTO entity_tags (entity_id, tag_id, created_at) VALUES (?, ?, ?)",
            (entity_id, tag_id, now),
        )

    conn.commit()
    conn.close()
    return await get_entity_tags(entity_id)


@app.get("/api/v1/tags/{tag_id}/entities")
async def get_entities_by_tag(tag_id: str):
    """获取具有指定标签的所有实体"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM semantic_tags WHERE id = ?", (tag_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="标签不存在")

    cursor.execute(
        """SELECT e.* FROM entities e
           JOIN entity_tags et ON e.id = et.entity_id
           WHERE et.tag_id = ? AND e.deleted_at IS NULL
           ORDER BY e.start_station""",
        (tag_id,),
    )
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


# ============ 实体状态版本 API ============


class VersionCreate(BaseModel):
    change_description: Optional[str] = None
    created_by: Optional[str] = None


class BatchVersionCreate(BaseModel):
    entity_ids: List[str]
    change_description: Optional[str] = None
    created_by: Optional[str] = None


@app.get("/api/v1/entities/{entity_id}/versions")
async def list_entity_versions(entity_id: str, limit: int = 50, skip: int = 0):
    """获取实体的所有版本历史"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM entities WHERE id = ?", (entity_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")

    cursor.execute(
        "SELECT COUNT(*) FROM entity_versions WHERE entity_id = ?",
        (entity_id,),
    )
    total = cursor.fetchone()[0]

    cursor.execute(
        """SELECT * FROM entity_versions WHERE entity_id = ?
           ORDER BY version_number DESC LIMIT ? OFFSET ?""",
        (entity_id, limit, skip),
    )
    rows = cursor.fetchall()
    conn.close()

    return {
        "total": total,
        "items": [row_to_dict(r) for r in rows],
        "limit": limit,
        "skip": skip,
    }


@app.get("/api/v1/entities/{entity_id}/versions/{version_id}")
async def get_entity_version(entity_id: str, version_id: str):
    """获取实体的指定版本"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM entity_versions WHERE id = ? AND entity_id = ?",
        (version_id, entity_id),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="版本不存在")
    return row_to_dict(row)


@app.post("/api/v1/entities/{entity_id}/versions")
async def create_entity_version(entity_id: str, data: VersionCreate):
    """创建实体的新版本快照"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM entities WHERE id = ?", (entity_id,))
    entity = cursor.fetchone()
    if not entity:
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")

    cursor.execute(
        "SELECT COALESCE(MAX(version_number), 0) + 1 FROM entity_versions WHERE entity_id = ?",
        (entity_id,),
    )
    next_version = cursor.fetchone()[0]

    version_id = f"ver_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    entity_data = row_to_dict(entity)
    state_json = json.dumps(entity_data, ensure_ascii=False)

    cursor.execute(
        """INSERT INTO entity_versions (id, entity_id, version_number, state_data, change_description, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            version_id,
            entity_id,
            next_version,
            state_json,
            data.change_description,
            data.created_by,
            now,
        ),
    )
    conn.commit()
    conn.close()

    return {"id": version_id, "version_number": next_version, "success": True}


@app.post("/api/v1/entities/versions/batch")
async def batch_create_versions(
    entity_ids: List[str],
    change_description: Optional[str] = None,
    created_by: Optional[str] = None,
):
    """批量创建多个实体的当前版本快照"""
    created = []
    now = datetime.now().isoformat()
    conn = get_db()
    cursor = conn.cursor()

    for entity_id in entity_ids:
        cursor.execute("SELECT * FROM entities WHERE id = ?", (entity_id,))
        entity = cursor.fetchone()
        if not entity:
            continue

        cursor.execute(
            "SELECT COALESCE(MAX(version_number), 0) + 1 FROM entity_versions WHERE entity_id = ?",
            (entity_id,),
        )
        next_version = cursor.fetchone()[0]

        version_id = f"ver_{uuid.uuid4().hex[:8]}"
        entity_data = row_to_dict(entity)
        state_json = json.dumps(entity_data, ensure_ascii=False)

        try:
            cursor.execute(
                """INSERT INTO entity_versions (id, entity_id, version_number, state_data, change_description, created_by, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    version_id,
                    entity_id,
                    next_version,
                    state_json,
                    change_description,
                    created_by,
                    now,
                ),
            )
            created.append(
                {
                    "entity_id": entity_id,
                    "version_id": version_id,
                    "version_number": next_version,
                }
            )
        except Exception:
            pass

    conn.commit()
    conn.close()

    return {"created": len(created), "versions": created}


@app.post("/api/v1/entities/{entity_id}/versions/{version_id}/restore")
async def restore_entity_version(entity_id: str, version_id: str):
    """恢复实体到指定版本"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM entities WHERE id = ?", (entity_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="实体不存在")

    cursor.execute(
        "SELECT * FROM entity_versions WHERE id = ? AND entity_id = ?",
        (version_id, entity_id),
    )
    version_row = cursor.fetchone()
    if not version_row:
        conn.close()
        raise HTTPException(status_code=404, detail="版本不存在")

    state_data = json.loads(version_row["state_data"])

    allowed_fields = {
        "name",
        "start_station",
        "end_station",
        "lateral_offset",
        "width",
        "height",
        "lanes",
        "design_elevation",
        "progress",
        "construction_phase",
        "planned_start_date",
        "planned_end_date",
        "cost_budget",
        "quality_status",
        "safety_level",
        "status",
        "notes",
        "alignment_type",
        "curve_radius",
        "curve_length",
        "start_azimuth",
        "vertical_type",
        "start_elevation",
        "end_elevation",
        "vertical_curve_length",
        "grade_in",
        "grade_out",
        "cross_section_type",
        "formation_width",
        "side_slope_fill",
        "side_slope_cut",
        "pavement_thickness",
    }

    update_fields = []
    params = []
    for key, value in state_data.items():
        if key in allowed_fields and key not in (
            "id",
            "entity_id",
            "section_id",
            "project_id",
            "code",
            "created_at",
            "updated_at",
        ):
            update_fields.append(f"{key} = ?")
            params.append(value)

    if update_fields:
        update_fields.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(entity_id)
        cursor.execute(
            f"UPDATE entities SET {', '.join(update_fields)} WHERE id = ?", params
        )
        conn.commit()

    conn.close()
    return {"success": True, "message": f"已恢复到版本 {version_row['version_number']}"}


@app.delete("/api/v1/entities/{entity_id}/versions/{version_id}")
async def delete_entity_version(entity_id: str, version_id: str):
    """删除指定版本"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM entity_versions WHERE id = ? AND entity_id = ?",
        (version_id, entity_id),
    )
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="版本不存在")

    cursor.execute("DELETE FROM entity_versions WHERE id = ?", (version_id,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/v1/entities/{entity_id}/versions")
async def delete_all_entity_versions(entity_id: str, keep_latest: bool = False):
    """删除实体的所有版本, optionally keep latest"""
    conn = get_db()
    cursor = conn.cursor()

    if keep_latest:
        cursor.execute(
            """DELETE FROM entity_versions WHERE entity_id = ? 
               AND id NOT IN (SELECT id FROM entity_versions WHERE entity_id = ? ORDER BY version_number DESC LIMIT 1)""",
            (entity_id, entity_id),
        )
    else:
        cursor.execute("DELETE FROM entity_versions WHERE entity_id = ?", (entity_id,))

    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return {"success": True, "deleted": deleted}


DEFAULT_AZIMUTH = 0.0
DEFAULT_START_COORD = {"x": 500000, "y": 3500000, "z": 0}


def parse_station(station: str) -> float:
    import re

    pattern_full = r"^K(\d+)\+(\d+)\.(\d+)$"
    pattern_simple = r"^K(\d+)\+(\d+)$"

    match = re.match(pattern_full, station)
    if match:
        km = int(match.group(1))
        m = int(match.group(2))
        mm = int(match.group(3))
        return km * 1000000 + m * 1000 + mm

    match = re.match(pattern_simple, station)
    if match:
        km = int(match.group(1))
        m = int(match.group(2))
        return km * 1000000 + m * 1000

    return 0.0


def format_station(total_mm: float) -> str:
    if total_mm < 0:
        total_mm = 0
    km = int(total_mm / 1000000)
    remaining = int(total_mm) % 1000000
    m = remaining // 1000
    mm = remaining % 1000
    return f"K{km}+{m:03d}.{mm:03d}"


def station_to_coord(
    station: str,
    lateral_offset: float = 0.0,
    elevation: float = 0.0,
    alignment_type: str = "straight",
    curve_radius: float = None,
    curve_length: float = None,
    start_azimuth: float = 0.0,
) -> dict:
    """
    将桩号转换为坐标，支持直线、圆曲线和螺旋曲线

    参数:
        station: 桩号，如 K1+000
        lateral_offset: 横向偏移(米)
        elevation: 纵向高程
        alignment_type: 线路类型 'straight' | 'circular' | 'spiral'
        curve_radius: 曲线半径(米), 仅圆曲线和螺旋曲线需要
        curve_length: 曲线长度(米), 曲线的总弧长
        start_azimuth: 起始方位角(度)
    """
    import math

    total_mm = parse_station(station)
    along_distance = total_mm / 1000.0  # 转换为米

    rad = math.radians(start_azimuth)

    if alignment_type == "straight":
        x = DEFAULT_START_COORD["x"] + along_distance * math.sin(rad)
        y = DEFAULT_START_COORD["y"] + along_distance * math.cos(rad)
        current_rad = rad
    elif alignment_type == "circular" and curve_radius and curve_length:
        curve_start_distance = 0
        if along_distance <= curve_length:
            delta_angle = along_distance / curve_radius
            curve_start_x = DEFAULT_START_COORD["x"]
            curve_start_y = DEFAULT_START_COORD["y"]
            x = (
                curve_start_x
                + curve_radius * math.sin(rad + delta_angle)
                - curve_radius * math.sin(rad)
            )
            y = (
                curve_start_y
                + curve_radius * (1 - math.cos(rad + delta_angle))
                - (-curve_radius * math.cos(rad) + curve_radius)
            )
            x = (
                DEFAULT_START_COORD["x"]
                + along_distance * math.sin(rad)
                + curve_radius * (math.sin(rad + delta_angle) - math.sin(rad))
            )
            y = (
                DEFAULT_START_COORD["y"]
                + along_distance * math.cos(rad)
                + curve_radius * (1 - math.cos(rad + delta_angle))
            )
            current_rad = rad + delta_angle
        else:
            straight_distance = along_distance - curve_length
            delta_angle = curve_length / curve_radius
            x = (
                DEFAULT_START_COORD["x"]
                + curve_length * math.sin(rad)
                + curve_radius * (math.sin(rad + delta_angle) - math.sin(rad))
            )
            y = (
                DEFAULT_START_COORD["y"]
                + curve_length * math.cos(rad)
                + curve_radius * (1 - math.cos(rad + delta_angle))
            )
            x += straight_distance * math.sin(rad + delta_angle)
            y += straight_distance * math.cos(rad + delta_angle)
            current_rad = rad + delta_angle
    elif alignment_type == "spiral" and curve_radius and curve_length:
        tau = curve_length / (2 * curve_radius)
        if along_distance <= curve_length:
            u = along_distance
            k = 0.003472  # 1/288 用于近似 clothoid
            x = DEFAULT_START_COORD["x"] + u * math.sin(rad + k * u * u / curve_radius)
            y = DEFAULT_START_COORD["y"] + u * math.cos(rad - k * u * u / curve_radius)
            current_rad = rad + k * u * u / curve_radius
        else:
            straight_distance = along_distance - curve_length
            k = 0.003472
            x = (
                DEFAULT_START_COORD["x"]
                + curve_length * math.sin(rad + tau)
                - curve_radius * math.sin(rad)
            )
            y = (
                DEFAULT_START_COORD["y"]
                + curve_length * math.cos(rad - tau)
                + curve_radius * math.cos(rad)
            )
            x += straight_distance * math.sin(rad + tau)
            y += straight_distance * math.cos(rad + tau)
            current_rad = rad + tau
    else:
        x = DEFAULT_START_COORD["x"] + along_distance * math.sin(rad)
        y = DEFAULT_START_COORD["y"] + along_distance * math.cos(rad)
        current_rad = rad

    perp_rad = current_rad + math.pi / 2
    x += lateral_offset * math.cos(perp_rad)
    y -= lateral_offset * math.sin(perp_rad)

    z = elevation if elevation != 0.0 else DEFAULT_START_COORD["z"]
    return {"x": x, "y": y, "z": z}


def coord_to_station(coord: dict, lateral_offset: float = 0.0) -> str:
    dx = coord["x"] - DEFAULT_START_COORD["x"]
    dy = coord["y"] - DEFAULT_START_COORD["y"]

    import math

    rad = math.radians(DEFAULT_AZIMUTH)
    dx -= lateral_offset * math.cos(rad)
    dy += lateral_offset * math.sin(rad)

    along_distance = dy * math.cos(rad) + dx * math.sin(rad)
    total_mm = along_distance * 1000

    return format_station(total_mm)


@app.post("/api/v1/space/station-to-coord")
async def station_to_coord_endpoint(data: dict):
    station = data.get("station", "")
    lateral_offset = data.get("lateral_offset", 0.0)
    elevation = data.get("elevation", 0.0)
    alignment_type = data.get("alignment_type", "straight")
    curve_radius = data.get("curve_radius")
    curve_length = data.get("curve_length")
    start_azimuth = data.get("start_azimuth", 0.0)

    if not station:
        raise HTTPException(status_code=400, detail="station is required")

    coord = station_to_coord(
        station,
        lateral_offset,
        elevation,
        alignment_type,
        curve_radius,
        curve_length,
        start_azimuth,
    )
    return {"station": station, "coord": coord}


@app.post("/api/v1/space/entity-station-to-coord")
async def entity_station_to_coord_endpoint(data: dict):
    """根据实体ID获取曲线参数，计算桩号对应坐标"""
    entity_id = data.get("entity_id")
    station = data.get("station", "")
    lateral_offset = data.get("lateral_offset", 0.0)
    elevation = data.get("elevation", 0.0)

    if not entity_id:
        raise HTTPException(status_code=400, detail="entity_id is required")
    if not station:
        raise HTTPException(status_code=400, detail="station is required")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT alignment_type, curve_radius, curve_length, start_azimuth FROM entities WHERE id = ?",
        (entity_id,),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="实体不存在")

    alignment_type = row["alignment_type"] or "straight"
    curve_radius = row["curve_radius"]
    curve_length = row["curve_length"]
    start_azimuth = row["start_azimuth"] or 0.0

    coord = station_to_coord(
        station,
        lateral_offset,
        elevation,
        alignment_type,
        curve_radius,
        curve_length,
        start_azimuth,
    )
    return {
        "entity_id": entity_id,
        "station": station,
        "coord": coord,
        "alignment_type": alignment_type,
        "curve_radius": curve_radius,
        "curve_length": curve_length,
        "start_azimuth": start_azimuth,
    }


@app.post("/api/v1/space/coord-to-station")
async def coord_to_station_endpoint(data: dict):
    coord = data.get("coord", {})
    lateral_offset = data.get("lateral_offset", 0.0)

    if not coord or "x" not in coord or "y" not in coord:
        raise HTTPException(status_code=400, detail="coord with x, y is required")

    station = coord_to_station(coord, lateral_offset)
    return {"coord": coord, "station": station}


@app.get("/api/v1/space/distance")
async def calculate_distance(station1: str, station2: str):
    if not station1 or not station2:
        raise HTTPException(
            status_code=400, detail="station1 and station2 are required"
        )

    mm1 = parse_station(station1)
    mm2 = parse_station(station2)
    distance = abs(mm2 - mm1) / 1000.0

    return {"station1": station1, "station2": station2, "distance_m": distance}


@app.get("/api/v1/space/nearby")
async def get_nearby_stations(station: str, count: int = 5, interval: float = 1000.0):
    if not station:
        raise HTTPException(status_code=400, detail="station is required")

    total_mm = parse_station(station)
    stations = []
    half = count // 2

    for i in range(-half, half + 1):
        nearby_mm = total_mm + i * interval
        if nearby_mm >= 0:
            stations.append(format_station(nearby_mm))

    return {"station": station, "nearby": stations}


def calculate_vertical_elevation(
    station: str,
    start_station: str,
    end_station: str,
    vertical_type: str = "level",
    start_elevation: float = 0,
    end_elevation: float = 0,
    vertical_curve_length: float = None,
    grade_in: float = 0,
    grade_out: float = 0,
) -> dict:
    """
    计算任意桩号的高程

    参数:
        station: 要计算的桩号
        start_station: 起点桩号
        end_station: 终点桩号
        vertical_type: 纵坡类型 'level'|'grade'|'vertical_curve'
        start_elevation: 起点高程(米)
        end_elevation: 终点高程(米)
        vertical_curve_length: 竖曲线长度(米)
        grade_in: 入口纵坡(%)
        grade_out: 出口纵坡(%)

    返回:
        {station, elevation, grade, is_in_curve}
    """
    import math

    total_mm = parse_station(station)
    start_mm = parse_station(start_station)
    end_mm = parse_station(end_station)

    if total_mm < start_mm or total_mm > end_mm:
        return {"station": station, "elevation": None, "error": "桩号超出范围"}

    station_distance = (total_mm - start_mm) / 1000.0  # 转换为米
    total_length = (end_mm - start_mm) / 1000.0

    if vertical_type == "level":
        elevation = start_elevation
        grade = 0

    elif vertical_type == "grade":
        if total_length > 0:
            grade = (end_elevation - start_elevation) / total_length * 100  # 纵坡 %
        else:
            grade = 0
        elevation = start_elevation + station_distance * grade / 100

    elif vertical_type == "vertical_curve" and vertical_curve_length:
        grade_l = grade_in / 100  # 转换为小数
        grade_r = grade_out / 100
        a = (grade_r - grade_l) / (2 * vertical_curve_length)  # 二次项系数

        vc_start = start_mm / 1000.0
        if station_distance <= vertical_curve_length / 2:
            elevation = (
                start_elevation
                + station_distance * grade_l / 100
                + a * station_distance * station_distance
            )
        else:
            elevation = (
                end_elevation
                - (total_length - station_distance) * grade_r / 100
                - a
                * (total_length - station_distance)
                * (total_length - station_distance)
            )

        if vertical_curve_length > 0:
            if abs(station_distance - total_length / 2) <= vertical_curve_length / 2:
                grade = grade_l + 2 * a * (
                    station_distance - (vc_start + vertical_curve_length / 2)
                )
            elif station_distance < total_length / 2:
                grade = grade_l
            else:
                grade = grade_r
        else:
            grade = 0
    else:
        elevation = start_elevation
        grade = 0

    return {
        "station": station,
        "elevation": round(elevation, 3),
        "grade": round(grade, 4),
        "unit": "m" if vertical_type == "level" else "%",
    }


def calculate_cross_section(
    station: str,
    lateral_offset: float = 0,
    cross_section_type: str = "fill",
    formation_width: float = 12,
    side_slope_fill: float = 1.5,
    side_slope_cut: float = 0.75,
    pavement_thickness: float = 0.5,
    elevation: float = None,
) -> dict:
    """
    计算横断面要素

    返回:
        各点坐标和宽度、高程
    """
    import math

    if elevation is None:
        elevation = 0

    half_width = formation_width / 2

    if cross_section_type == "fill":
        left_slope = side_slope_fill
        right_slope = side_slope_fill
        left_edge_z = elevation
        right_edge_z = elevation
        left_toe_z = elevation - formation_width / 2 * side_slope_fill
        right_toe_z = elevation - formation_width / 2 * side_slope_fill
    elif cross_section_type == "cut":
        left_slope = side_slope_cut
        right_slope = side_slope_cut
        left_edge_z = elevation
        right_edge_z = elevation
        left_toe_z = elevation + formation_width / 2 * side_slope_cut
        right_toe_z = elevation + formation_width / 2 * side_slope_cut
    else:
        left_slope = side_slope_cut
        right_slope = side_slope_fill
        left_edge_z = elevation
        right_edge_z = elevation
        left_toe_z = elevation + formation_width / 2 * side_slope_cut
        right_toe_z = elevation - formation_width / 2 * side_slope_fill

    center_x = lateral_offset
    left_edge_x = center_x - half_width
    right_edge_x = center_x + half_width

    left_slope_start_x = (
        left_edge_x - 1.5 if left_edge_z > left_toe_z else left_edge_x + 1.5
    )
    right_slope_start_x = (
        right_edge_x + 1.5 if right_edge_z > right_toe_z else right_edge_x - 1.5
    )

    return {
        "station": station,
        "lateral_offset": lateral_offset,
        "cross_section_type": cross_section_type,
        "formation_width": formation_width,
        "center": {"x": center_x, "z": elevation},
        "left_edge": {"x": left_edge_x, "z": left_edge_z},
        "right_edge": {"x": right_edge_x, "z": right_edge_z},
        "left_toe": {"x": left_slope_start_x, "z": left_toe_z},
        "right_toe": {"x": right_slope_start_x, "z": right_toe_z},
        "pavement_thickness": pavement_thickness,
        "total_width": abs(left_slope_start_x - right_slope_start_x),
        "cut_width": formation_width / 2 + 1.5
        if cross_section_type in ["cut", "mixed"]
        else 0,
        "fill_width": formation_width / 2 + 1.5
        if cross_section_type in ["fill", "mixed"]
        else 0,
    }


@app.post("/api/v1/space/vertical-elevation")
async def calculate_vertical_elevation_endpoint(data: dict):
    """计算任意桩号的高程"""
    station = data.get("station", "")
    start_station = data.get("start_station", "")
    end_station = data.get("end_station", "")
    vertical_type = data.get("vertical_type", "level")
    start_elevation = data.get("start_elevation", 0)
    end_elevation = data.get("end_elevation", 0)
    vertical_curve_length = data.get("vertical_curve_length")
    grade_in = data.get("grade_in", 0)
    grade_out = data.get("grade_out", 0)

    if not station or not start_station or not end_station:
        raise HTTPException(
            status_code=400, detail="station, start_station, end_station required"
        )

    result = calculate_vertical_elevation(
        station,
        start_station,
        end_station,
        vertical_type,
        start_elevation,
        end_elevation,
        vertical_curve_length,
        grade_in,
        grade_out,
    )
    return result


@app.post("/api/v1/space/entity-vertical-elevation")
async def entity_vertical_elevation_endpoint(data: dict):
    """根据实体ID计算任意桩号的高程"""
    entity_id = data.get("entity_id")
    station = data.get("station", "")

    if not entity_id or not station:
        raise HTTPException(status_code=400, detail="entity_id and station required")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT start_station, end_station, vertical_type, start_elevation, end_elevation,
               vertical_curve_length, grade_in, grade_out 
        FROM entities WHERE id = ?
    """,
        (entity_id,),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="实体不存在")

    result = calculate_vertical_elevation(
        station,
        row["start_station"],
        row["end_station"],
        row["vertical_type"] or "level",
        row["start_elevation"] or 0,
        row["end_elevation"] or 0,
        row["vertical_curve_length"],
        row["grade_in"] or 0,
        row["grade_out"] or 0,
    )
    result["entity_id"] = entity_id
    return result


@app.post("/api/v1/space/cross-section")
async def calculate_cross_section_endpoint(data: dict):
    """计算横断面要素"""
    station = data.get("station", "")
    lateral_offset = data.get("lateral_offset", 0)
    cross_section_type = data.get("cross_section_type", "fill")
    formation_width = data.get("formation_width", 12)
    side_slope_fill = data.get("side_slope_fill", 1.5)
    side_slope_cut = data.get("side_slope_cut", 0.75)
    pavement_thickness = data.get("pavement_thickness", 0.5)
    elevation = data.get("elevation")

    if not station:
        raise HTTPException(status_code=400, detail="station is required")

    return calculate_cross_section(
        station,
        lateral_offset,
        cross_section_type,
        formation_width,
        side_slope_fill,
        side_slope_cut,
        pavement_thickness,
        elevation,
    )


@app.post("/api/v1/space/entity-cross-section")
async def entity_cross_section_endpoint(data: dict):
    """根据实体ID计算横断面要素"""
    entity_id = data.get("entity_id")
    station = data.get("station", "")
    lateral_offset = data.get("lateral_offset", 0)

    if not entity_id or not station:
        raise HTTPException(status_code=400, detail="entity_id and station required")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT cross_section_type, formation_width, side_slope_fill, side_slope_cut,
               pavement_thickness, start_elevation, end_elevation, start_station, end_station,
               vertical_type, vertical_curve_length, grade_in, grade_out
        FROM entities WHERE id = ?
    """,
        (entity_id,),
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="实体不存在")

    elev_result = calculate_vertical_elevation(
        station,
        row["start_station"],
        row["end_station"],
        row["vertical_type"] or "level",
        row["start_elevation"] or 0,
        row["end_elevation"] or 0,
        row["vertical_curve_length"],
        row["grade_in"] or 0,
        row["grade_out"] or 0,
    )
    elevation = elev_result.get("elevation")

    cs_result = calculate_cross_section(
        station,
        lateral_offset,
        row["cross_section_type"] or "fill",
        row["formation_width"] or 12,
        row["side_slope_fill"] or 1.5,
        row["side_slope_cut"] or 0.75,
        row["pavement_thickness"] or 0.5,
        elevation,
    )
    cs_result["entity_id"] = entity_id
    cs_result["elevation"] = elevation
    return cs_result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
