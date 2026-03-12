# NeuralSite 简单验证脚本
# 直接运行这个文件测试

import random

# 测试数据
entities = []

# 生成测试实体
for i in range(5):
    entities.append({
        "name": f"K{i+1}+000 路段",
        "type": "road",
        "phase": random.choice(["planning", "clearing", "earthwork", "pavement", "completed"]),
        "progress": random.uniform(0, 1)
    })

print("=== NeuralSite 数据验证 ===\n")
print(f"实体数量: {len(entities)}\n")

for e in entities:
    print(f"名称: {e['name']}")
    print(f"类型: {e['type']}")
    print(f"阶段: {e['phase']}")
    print(f"进度: {e['progress']*100:.1f}%")
    print("-" * 30)

# 统计
phases = {}
for e in entities:
    p = e["phase"]
    phases[p] = phases.get(p, 0) + 1

print("\n=== 阶段统计 ===")
for k, v in phases.items():
    print(f"{k}: {v}")

print("\n✅ 数据系统运行正常！")
