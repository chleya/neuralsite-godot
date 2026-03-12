# NeuralSite-Godot 4D 施工模拟器

基于 Godot 4.3 的道路桥梁施工4D可视化系统

## 快速开始

1. 下载 Godot 4.3: https://godotengine.org/download
2. 解压并运行 godot.exe
3. 点击 "Import" 选择 `F:\NeuralSite-Godot` 文件夹
4. 按 F5 运行

## 项目结构

```
NeuralSite-Godot/
├── scenes/
│   └── Main.tscn          # 主场景
├── scripts/
│   ├── Main.gd            # 主控制器
│   ├── RoadData.gd       # 道路数据模型
│   ├── RoadSegment.gd    # 道路渲染节点
│   ├── TimelineManager.gd # 时间轴管理
│   ├── MockAPIClient.gd  # 模拟API客户端
│   ├── APIClient.gd      # 真实API客户端
│   ├── EventBus.gd       # 事件总线
│   └── TestRunner.gd     # 测试脚本
├── resources/
├── test_roads.geojson    # 测试数据
└── project.godot         # 项目配置
```

## 核心功能

- [x] 道路3D渲染 (RoadSegment)
- [x] 阶段可视化 (planning → clearing → earthwork → pavement → finishing → completed)
- [x] 时间轴控制 (TimelineManager)
- [x] 模拟数据 (MockAPIClient)
- [x] GeoJSON导入/导出

## 操作说明

| 按键 | 功能 |
|------|------|
| SPACE | 旋转相机 |
| 拖动滑块 | 控制时间/进度 |
| F1 | 打印统计摘要 |
| F2 | 切换调试信息 |
| R | 重置时间轴 |

## 数据模型

### 阶段颜色

- planning: 蓝色半透明
- clearing: 橙色
- earthwork: 棕色
- pavement: 灰色
- finishing: 浅绿色
- completed: 深灰色

### API 接口

模拟数据包含:
- 15个桩号 (K0+000 ~ K14+000)
- 30个事件
- 项目统计

## 对接真实后端

1. 修改 `project.godot` 中的 MockAPIClient autoload
2. 或在 Main.gd 中设置 `use_mock_api = false`
3. 配置 `backend_url` 指向真实API地址

## 技术栈

- Godot 4.3
- GDScript
- RESTful API
- GeoJSON

## 版本

v2.0 (2026-03-09) - 精简重构版
