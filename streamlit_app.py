# -*- coding: utf-8 -*-
"""
NeuralSite 快速验证原型
Streamlit版本 - 秒级验证数据逻辑
"""

import streamlit as st
import pandas as pd
import pydeck as pdk
import random
from datetime import datetime, timedelta


# ============================================================
# 页面配置
# ============================================================

st.set_page_config(
    page_title="NeuralSite 验证原型",
    page_icon="🚧",
    layout="wide"
)


# ============================================================
# 数据模型 (内存模拟)
# ============================================================

class ProjectData:
    """项目数据"""
    
    def __init__(self):
        self.entities = []
        self.events = []
        self._init_demo_data()
    
    def _init_demo_data(self):
        # 道路
        for i in range(5):
            self.entities.append({
                "id": f"road_{i+1}",
                "name": f"K{i+1}+000 路段",
                "type": "road",
                "category": "infrastructure",
                "phase": random.choice(["planning", "clearing", "earthwork", "pavement", "completed"]),
                "progress": random.uniform(0, 1),
                "quantity": random.uniform(1000, 10000),
                "unit_price": 500,
                "cost_progress": True,  # 总价模式
                "position": [500000 + i * 100, 4000000 + i * 50, 0],
                "precision": 0.001
            })
        
        # 桥梁
        for i in range(3):
            self.entities.append({
                "id": f"bridge_{i+1}",
                "name": f"{i+1}号桥",
                "type": "bridge",
                "category": "infrastructure",
                "phase": random.choice(["planning", "structure", "completed"]),
                "progress": random.uniform(0, 1),
                "quantity": random.uniform(5000, 20000),
                "unit_price": 800,
                "cost_progress": True,
                "position": [500050 + i * 150, 4000050 + i * 30, 0],
                "precision": 0.01
            })
        
        # 桩基
        for i in range(10):
            self.entities.append({
                "id": f"pile_{i+1}",
                "name": f"桩基 {i+1}",
                "type": "pile",
                "category": "structure",
                "phase": random.choice(["planning", "structure", "completed"]),
                "progress": random.uniform(0, 1),
                "reinforcement_count": random.randint(8, 16),
                "reinforcement_diameter": 25,
                "position": [500030 + i * 20, 4000020 + i * 10, 0],
                "precision": 0.01
            })
        
        # 墩柱
        for i in range(4):
            self.entities.append({
                "id": f"pier_{i+1}",
                "name": f"墩柱 {i+1}",
                "type": "pier",
                "category": "structure",
                "phase": random.choice(["planning", "structure", "completed"]),
                "progress": random.uniform(0, 1),
                "pier_height": random.uniform(10, 20),
                "pier_diameter": 1.5,
                "position": [500040 + i * 30, 4000030 + i * 15, 0],
                "precision": 0.01
            })
    
    def get_entities(self, entity_type=None):
        if entity_type:
            return [e for e in self.entities if e["type"] == entity_type]
        return self.entities
    
    def update_progress(self, entity_id, new_progress):
        for e in self.entities:
            if e["id"] == entity_id:
                e["progress"] = min(1.0, max(0.0, new_progress))
                # 更新阶段
                p = e["progress"]
                if p >= 1.0:
                    e["phase"] = "completed"
                elif p >= 0.9:
                    e["phase"] = "finishing"
                elif p >= 0.7:
                    e["phase"] = "pavement"
                elif p >= 0.3:
                    e["phase"] = "earthwork"
                elif p >= 0.1:
                    e["phase"] = "clearing"
                else:
                    e["phase"] = "planning"
                break
    
    def add_entity(self, entity_data):
        entity_data["id"] = f"{entity_data['type']}_{len(self.entities)+1}"
        self.entities.append(entity_data)
    
    def get_stats(self):
        total = len(self.entities)
        by_type = {}
        by_phase = {}
        total_cost = 0
        
        for e in self.entities:
            t = e["type"]
            by_type[t] = by_type.get(t, 0) + 1
            
            p = e["phase"]
            by_phase[p] = by_phase.get(p, 0) + 1
            
            if "quantity" in e and "unit_price" in e:
                total_cost += e["quantity"] * e["unit_price"] * e.get("progress", 0)
        
        avg_progress = sum(e.get("progress", 0) for e in self.entities) / total if total > 0 else 0
        
        return {
            "total": total,
            "by_type": by_type,
            "by_phase": by_phase,
            "avg_progress": avg_progress,
            "total_cost": total_cost
        }


# 初始化数据
if "project" not in st.session_state:
    st.session_state.project = ProjectData()


# ============================================================
# 页面标题
# ============================================================

st.title("🚧 NeuralSite 快速验证原型")
st.markdown("**秒级迭代验证** | 数据逻辑 → 立即显示")


# ============================================================
# 侧边栏 - 控制面板
# ============================================================

with st.sidebar:
    st.header("⚙️ 控制面板")
    
    # 时间轴控制
    st.subheader("⏱️ 时间轴")
    current_day = st.slider("当前天数", 0, 365, 0)
    
    play_btn = st.button("▶️ 播放")
    pause_btn = st.button("⏸️ 暂停")
    reset_btn = st.button("🔄 重置")
    
    if play_btn:
        st.session_state.playing = True
    if pause_btn:
        st.session_state.playing = False
    if reset_btn:
        current_day = 0
    
    # 添加实体
    st.subheader("➕ 添加实体")
    new_type = st.selectbox("类型", ["road", "bridge", "pile", "pier", "vehicle"])
    if st.button("添加"):
        new_entity = {
            "name": f"新{new_type}",
            "type": new_type,
            "category": "structure" if new_type in ["pile", "pier"] else "infrastructure",
            "phase": "planning",
            "progress": 0,
            "position": [500000, 4000000, 0]
        }
        st.session_state.project.add_entity(new_entity)
        st.success(f"添加了 {new_type}!")


# ============================================================
# 主区域 - 数据展示
# ============================================================

# 统计卡片
stats = st.session_state.project.get_stats()

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("实体总数", stats["total"])

with col2:
    st.metric("平均进度", f"{stats['avg_progress']*100:.1f}%")

with col3:
    st.metric("累计产值", f"¥{stats['total_cost']:,.0f}")

with col4:
    phase_counts = list(stats["by_phase"].values())
    in_progress = sum(phase_counts) - stats["by_phase"].get("completed", 0)
    st.metric("施工中", in_progress)


# ============================================================
# 3D地图
# ============================================================

st.subheader("🗺️ 3D视图")

# 准备地图数据
entities = st.session_state.project.get_entities()

# 颜色映射
color_map = {
    "planning": [100, 149, 237],      # 蓝色
    "clearing": [255, 191, 0],       # 橙色
    "earthwork": [139, 69, 19],      # 棕色
    "pavement": [128, 128, 128],     # 灰色
    "structure": [205, 92, 92],      # 红色
    "finishing": [144, 238, 144],    # 浅绿
    "completed": [50, 50, 50]        # 深灰
}

# 转换为pydeck格式
map_data = []
for e in entities:
    color = color_map.get(e["phase"], [128, 128, 128])
    # 进度影响透明度
    alpha = 150 if e["progress"] < 1 else 255
    
    map_data.append({
        "position": e["position"],
        "color": color + [alpha],
        "name": e["name"],
        "type": e["type"],
        "phase": e["phase"],
        "progress": e["progress"]
    })

# 渲染地图
st.pydeck_chart(pdk.Deck(
    map_style='mapbox://styles/mapbox/dark-v10',
    initial_view_state=pdk.ViewState(
        latitude=40.01,
        longitude=116.5,
        zoom=13,
        pitch=45
    ),
    layers=[
        pdk.Layer(
            'ScatterplotLayer',
            data=map_data,
            get_position='position',
            get_color='color',
            get_radius=50,
            pickable=True,
            opacity=0.8
        )
    ],
    tooltip={"text": "{name}\n{type} - {phase}\n进度: {progress:.0%}"}
))


# ============================================================
# 实体列表 & 编辑
# ============================================================

col_left, col_right = st.columns(2)

with col_left:
    st.subheader("📋 实体列表")
    
    # 类型筛选
    filter_type = st.selectbox("筛选类型", ["全部"] + list(stats["by_type"].keys()))
    
    if filter_type == "全部":
        display_entities = entities
    else:
        display_entities = [e for e in entities if e["type"] == filter_type]
    
    # 显示实体
    for e in display_entities:
        with st.expander(f"{e['name']} ({e['phase']})"):
            st.write(f"类型: {e['type']}")
            st.write(f"精度: {e.get('precision', 'N/A')}m")
            
            # 进度滑块
            new_progress = st.slider(
                "进度", 0.0, 1.0, 
                e["progress"],
                key=f"progress_{e['id']}"
            )
            
            if new_progress != e["progress"]:
                st.session_state.project.update_progress(e["id"], new_progress)
                st.rerun()
            
            # 显示详情
            if e["type"] == "pile":
                st.write(f"钢筋: {e.get('reinforcement_count', 'N/A')}根")
                st.write(f"直径: {e.get('reinforcement_diameter', 'N/A')}mm")
            elif e["type"] == "pier":
                st.write(f"墩高: {e.get('pier_height', 'N/A')}m")
                st.write(f"墩径: {e.get('pier_diameter', 'N/A')}m")
            elif e["type"] == "road":
                st.write(f"工程量: {e.get('quantity', 0):.0f}")
                st.write(f"单价: ¥{e.get('unit_price', 0)}/m²")


with col_right:
    st.subheader("📊 统计")
    
    # 阶段分布
    st.write("### 阶段分布")
    if stats["by_phase"]:
        phase_df = pd.DataFrame(
            list(stats["by_phase"].items()),
            columns=["阶段", "数量"]
        )
        st.bar_chart(phase_df.set_index("阶段"))
    
    # 类型分布
    st.write("### 类型分布")
    if stats["by_type"]:
        type_df = pd.DataFrame(
            list(stats["by_type"].items()),
            columns=["类型", "数量"]
        )
        st.bar_chart(type_df.set_index("类型"))


# ============================================================
# 底部 - 信息
# ============================================================

st.markdown("---")
st.caption(f"🕐 最后更新: {datetime.now().strftime('%H:%M:%S')}")
st.caption("💡 直接修改滑块即可实时验证数据逻辑！")
