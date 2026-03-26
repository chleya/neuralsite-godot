# NeuralSite-Godot 4D 施工模拟器

基于 Godot 4.3 的道路桥梁施工4D可视化系统

[![Godot 4.3](https://img.shields.io/badge/Godot-4.3-blue)](https://godotengine.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📋 项目简介

NeuralSite-Godot 是一个沉浸式的道路桥梁施工4D可视化系统，让项目经理和施工团队能够直观地看到"时间"维度上的施工进度，预测延误，优化调度。

## 🚀 快速开始

### 环境要求

- Godot 4.3+
- Python 3.9+ (可选，用于后端)
- 8GB+ RAM

### 安装步骤

1. **下载 Godot 4.3**
   ```bash
   https://godotengine.org/download
   ```

2. **克隆项目**
   ```bash
   git clone https://github.com/chleya/neuralsite-godot.git
   cd neuralsite-godot
   ```

3. **导入 Godot**
   - 运行 Godot 4.3
   - 点击 "Import" 选择项目文件夹
   - 按 `F5` 运行

## 📁 项目结构

```
NeuralSite-Godot/
├── scenes/
│   └── Main.tscn              # 主场景
├── scripts/
│   ├── Core Systems           # 核心系统
│   │   ├── Main.gd
│   │   ├── EntityFactory.gd
│   │   ├── ProjectConfig.gd
│   │   ├── UIManager.gd
│   │   ├── InputHandler.gd
│   │   └── EventBus.gd
│   ├── Entities              # 实体系统
│   │   ├── RoadEntity.gd
│   │   ├── BridgeEntity.gd
│   │   ├── VehicleEntity.gd
│   │   ├── PileEntity.gd
│   │   ├── PierEntity.gd
│   │   ├── CapEntity.gd
│   │   ├── SafetySign.gd
│   │   └── ConstructionFence.gd
│   ├── Systems               # 功能系统
│   │   ├── TimelineManager.gd
│   │   ├── UnifiedTimeline.gd
│   │   ├── TerrainGenerator.gd
│   │   ├── DayNightCycle.gd
│   │   ├── WeatherSystem.gd
│   │   ├── CollisionDetector.gd
│   │   ├── PrecisionCollisionSystem.gd
│   │   ├── ConstructionAnimator.gd
│   │   ├── ExcavatorAttachment.gd
│   │   ├── ConstructionEffects.gd
│   │   ├── ProgressPredictor.gd
│   │   ├── ReportGenerator.gd
│   │   └── PerformanceMonitor.gd
│   ├── Backend Integration   # 后端集成 (NEW)
│   │   ├── APIClient.gd
│   │   ├── BackendService.gd
│   │   ├── SemanticTagVisualizer.gd
│   │   └── TimeTravelQuery.gd
│   └── Communication         # 通信系统
│       ├── WebSocketClient.gd
│       ├── GodotImporter.gd
│       └── GodotExporter.gd
├── zhixian/                  # 后端服务 (外部)
│   └── neuralsite-backend/   # FastAPI 后端
├── docs/
│   └── PROJECT_PLAN.md       # 项目规划
└── project.godot
```

## ✨ 核心功能

### 已完成功能

| 模块 | 状态 | 说明 |
|------|------|------|
| 地形系统 | ✅ | 程序化高度图地形 |
| 道路渲染 | ✅ | 支持6阶段颜色 |
| 桥梁实体 | ✅ | 分阶段建设动画 |
| 车辆实体 | ✅ | 路径跟随 |
| 安全设施 | ✅ | 围挡/标识牌 |
| 昼夜循环 | ✅ | 动态光照 |
| 天气系统 | ✅ | 晴/雨/雾/暴风雨 |
| 施工动画 | ✅ | 打桩/压实/挖掘等 |
| 碰撞检测 | ✅ | 精确碰撞+报警 |
| 进度预测 | ✅ | 延误预警 |
| 报表生成 | ✅ | HTML/CSV/JSON |
| 数据导入导出 | ✅ | GeoJSON |
| WebSocket | ✅ | 实时同步 |
| **后端API集成** | ✅ | FastAPI后端对接 (NEW) |
| **语义标签可视化** | ✅ | 质量/安全3D标签 (NEW) |
| **时间旅行查询** | ✅ | 历史状态回溯 (NEW) |

### 施工阶段

1. **planning** - 规划阶段 (蓝色)
2. **clearing** - 清表阶段 (橙色)
3. **earthwork** - 土方阶段 (棕色)
4. **pavement** - 路面阶段 (灰色)
5. **finishing** - 仕上げ阶段 (浅绿)
6. **completed** - 完成阶段 (深灰)

## 🎮 操作说明

### 相机控制

| 按键/操作 | 功能 |
|----------|------|
| `SPACE` + 鼠标拖动 | 旋转相机 |
| `WASD` | 移动相机 |
| 鼠标滚轮 | 缩放 |
| 右键拖动 | 旋转视角 |

### 时间轴控制

| 按键 | 功能 |
|------|------|
| 拖动滑块 | 控制时间/进度 |
| `T` | 切换时间轴播放 |
| `R` | 重置时间轴 |

### 其他

| 按键 | 功能 |
|------|------|
| `E` | 导出数据 |
| `ESC` | 取消选择 |
| `1-5` | 创建测试实体 |
| `F3` | 同步后端数据 (NEW) |
| `F4` | 显示/隐藏语义标签 (NEW) |
| 点击实体 | 查看详细信息 |

## 🔧 配置

### API配置

在 `Main.gd` 中修改：

```gdscript
@export var use_mock_api: bool = false  # 改为true使用模拟数据
@export var backend_url: String = "http://localhost:8000"
```

### 后端API集成

NeuralSite-Godot 可以连接到 `zhixian/neuralsite-backend` FastAPI后端：

| 端点 | 功能 |
|------|------|
| `GET /api/v1/data/godot/entities` | 获取Godot渲染数据 |
| `GET /api/v1/data/godot/states` | 获取状态数据 |
| `GET /api/v1/realtime` | 实时查询 |
| `GET /api/v1/states/entity/{id}/history` | 历史状态(时间旅行) |
| `GET /api/v1/semantic/tags/entity/{id}` | 语义标签 |

启动后端服务：

```bash
cd zhixian/neuralsite-backend
uvicorn main:app --reload --port 8000
```

然后在 Godot 中按 `F3` 同步后端数据。

### 天气系统

通过 UI 面板或代码切换：

```gdscript
weather_system.set_weather(WeatherSystem.WeatherType.RAIN)
```

## 📊 数据格式

### GeoJSON 导入

```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [[0, 0, 0], [100, 0, 0]]
    },
    "properties": {
      "id": "road_001",
      "name": "K1+000 示范段",
      "lanes": 4,
      "phase": "earthwork",
      "progress": 0.45
    }
  }]
}
```

### 导出数据

```json
{
  "type": "ModificationCollection",
  "modifications": [...],
  "exported_at": "2026-03-19"
}
```

## 🧪 测试

运行测试套件：

1. 在 Godot 中运行 `TestRunner.gd`
2. 或通过命令行：

```bash
godot --script scripts/TestRunner.gd
```

## 📚 文档

- [项目规划书](docs/PROJECT_PLAN.md) - 详细的项目规划
- [API文档](docs/API.md) - API接口文档 (待完成)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v3.1 | 2026-03-19 | 后端API集成、语义标签可视化、时间旅行查询 |
| v3.0 | 2026-03-19 | M1-M4 完成，功能完整 |
| v2.0 | 2026-03-09 | 精简重构版 |
| v1.0 | 2026-03-01 | 项目初始化 |

---

**NeuralSite-Godot** - 让施工进度可视化更直观
