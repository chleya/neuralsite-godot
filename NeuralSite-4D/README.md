---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022100cf15f8a8349543ce976e652ffcb2cce13f185c91c2cc574cc24e32c7ffd597b602206880f9d019c738a954a8470a89adaeafc8c3d310e8b4339def4ce8de8713956a
    ReservedCode2: 3045022100f00ad04393407c4e1178cb94d3ca8f357baac5b4f41b8f8a7e649e01be56262802202f697d0746d5e58948b676aaf4d2a48e8c7d71639df81af6d0dfdbfc9c749cb8
---

# NeuralSite-4D

智网四维施工可视化系统 - 基于"毫米级空间+标签"架构

## 项目介绍

NeuralSite-4D 是一款基于 Godot 4.3 开发的四维施工可视化模拟系统，专门为道路工程施工管理设计。系统采用创新的"毫米级空间+标签"数据架构，实现空间连续性管理与实体状态可视化。

## 核心特性

### 1. 毫米级空间管理
- 空间是连续的，只计算不存储
- 桩号与三维坐标实时转换
- 支持任意位置的精确定位

### 2. 实体贴纸模型
- 工程实体作为"贴纸"叠加在连续空间上
- 支持路基、桥梁、涵洞、隧道、边坡、排水设施等实体类型
- 每个实体可附加属性标签

### 3. 四维施工模拟
- 时间轴控制施工进度
- 实时查询任意时间点的施工状态
- 版本模拟预测未来施工效果

### 4. 状态可视化
- 六种施工阶段颜色编码：
  - 规划（蓝色半透明）
  - 清表（橙色）
  - 土方（棕色）
  - 路面（灰色）
  - 收尾（浅绿色）
  - 完成（深灰色）

## 系统要求

- Godot Engine 4.3+
- CPU: 支持 AVX 指令集的 x86-64 处理器
- 内存: 4GB+
- 显卡: 支持 OpenGL ES 3.0

## 快速开始

### 1. 安装 Godot 4.3

从 [Godot 官网](https://godotengine.org/) 下载并安装 Godot 4.3。

### 2. 导入项目

1. 打开 Godot 引擎
2. 点击"导入"按钮
3. 选择项目目录 `NeuralSite-4D`
4. 点击"导入并运行"

### 3. 操作控制

| 按键 | 功能 |
|------|------|
| 空格键 | 旋转相机 |
| 拖动滑块 | 控制施工进度 |
| R键 | 重置时间轴 |
| F1键 | 打印统计信息 |
| F2键 | 切换调试信息 |

## 项目结构

```
NeuralSite-4D/
├── project.godot          # Godot项目配置
├── scenes/
│   └── Main.tscn          # 主场景
├── scripts/
│   ├── Main.gd           # 主控制器
│   ├── Entity3D.gd        # 实体3D节点
│   ├── SpaceService.gd    # 空间计算服务
│   ├── EventBus.gd        # 事件总线
│   └── APIClient.gd      # API客户端
├── icon.svg               # 项目图标
└── README.md             # 说明文档
```

## API集成

### 连接到后端服务

1. 编辑 `scripts/APIClient.gd`
2. 修改 `backend_url` 变量：
   ```gdscript
   var backend_url: String = "http://你的服务器地址:8000/api/v1"
   ```
3. 设置 `use_mock_api = false`

### API端点

- **实时查询**: `GET /api/v1/query/realtime?station=K0+000`
- **版本模拟**: `GET /api/v1/simulation/project?target_time=2026-06-01`
- **实体管理**: `/api/v1/entities`
- **状态管理**: `/api/v1/states`
- **事件管理**: `/api/v1/events`

## 核心功能

### 实时查询

回答"这个位置现在是什么状态？"

```bash
curl "http://localhost:8000/api/v1/query/realtime?station=K0+000"
```

返回该位置的所有实体及其当前状态。

### 版本模拟

回答"这个施工步骤完成后会是什么样子？"

```bash
curl "http://localhost:8000/api/v1/simulation/project?target_time=2026-06-01"
```

返回项目在目标时间点的预测状态及可视化数据。

## 数据模型

### 实体层（贴纸）

实体作为"贴纸"叠加在连续空间上：

- **id**: 唯一标识
- **entity_type**: 实体类型（roadbed/bridge/culvert/tunnel/slope/drainage）
- **name**: 名称
- **start_station/end_station**: 桩号范围
- **lateral_offset**: 横向偏移
- **elevation_base**: 基础高程
- **properties**: 属性标签

### 状态层（快照）

每个时间点的状态快照：

- **state_type**: 状态类型（planning→clearing→earthwork→pavement→finishing→completed）
- **progress**: 进度百分比（0-100）
- **quality_status**: 质量状态

### 事件层（扰动）

施工过程中的事件记录：

- **event_type**: 事件类型（weather/stoppage/issue/inspection/payment/personnel）
- **station_range**: 桩号范围
- **impact_level**: 影响程度

## 技术栈

- **引擎**: Godot 4.3
- **脚本**: GDScript
- **后端**: FastAPI (Python)
- **数据库**: PostgreSQL + PostGIS
- **API**: RESTful

## 许可证

MIT License

## 作者

MiniMax Agent

## 版本

当前版本: 1.0.0
