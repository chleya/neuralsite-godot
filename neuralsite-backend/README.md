---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022057e50978e3afa7fc28ef27e158e7e43dfa481580720fbe5723a708327cc2e89e022100f462a48250315b7e7ba87d52847666e0d6629df47f31bac88efaa768ce9b762a
    ReservedCode2: 3045022029e59d0c444c442df41e378aa4514c0dc949354a6928950d06e26aa75467359b0221008781c5ce2c4f7f72765c09b26627e006c4efe7befb371e20fd6d18cb90eef7af
---

# NeuralSite - 智网工程管理系统

基于"毫米级空间+标签"架构的数据驱动型工程管理平台。

## 技术栈

- **后端框架**: FastAPI (Python 3.10+)
- **数据库**: PostgreSQL + PostGIS
- **缓存**: Redis
- **可视化**: Godot 4.3
- **区块链**: 哈希存证（联盟链）

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

### 3. 初始化数据库

```bash
python -m alembic upgrade head
```

### 4. 启动服务

```bash
# 开发模式
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 5. 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 核心功能

### 空间计算服务
- 桩号 ↔ 三维坐标转换
- 空间索引查询
- 邻近桩号搜索

### 实体管理
- 工程实体（路基、桥梁、涵洞等）CRUD
- 属性标签管理
- 空间范围查询

### 状态管理
- 状态快照创建和查询
- 时间维度状态追溯
- 进度跟踪

### 事件管理
- 施工事件记录
- 天气、停工、问题等事件
- 事件影响分析

### 高级查询
- 实时位置查询
- 版本模拟预测
- 施工动画生成

## 项目结构

```
backend/
├── app/
│   ├── api/              # API路由
│   │   ├── v1/
│   │   │   ├── space.py
│   │   │   ├── entities.py
│   │   │   ├── states.py
│   │   │   ├── events.py
│   │   │   └── query.py
│   │   └── dependencies.py
│   ├── core/             # 核心配置
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/           # 数据模型
│   │   ├── entity.py
│   │   ├── state.py
│   │   └── event.py
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # 业务逻辑
│   │   ├── space_service.py
│   │   ├── entity_service.py
│   │   ├── state_service.py
│   │   ├── event_service.py
│   │   └── simulation_service.py
│   └── utils/            # 工具函数
├── alembic/              # 数据库迁移
├── tests/                # 测试
├── .env.example
├── requirements.txt
└── main.py
```

## API示例

### 实时查询

```bash
# 查询指定桩号的当前状态
curl "http://localhost:8000/api/v1/query/realtime?station=K0+000"
```

### 版本模拟

```bash
# 模拟项目在某时间点的状态
curl "http://localhost:8000/api/v1/simulation/project?target_time=2026-06-01T00:00:00"
```

## 许可证

MIT License
