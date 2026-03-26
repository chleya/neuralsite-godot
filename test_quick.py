"""
NeuralSite Quick Performance Test
快速性能测试：验证系统响应能力
"""

import requests
import time
import concurrent.futures
import random
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def check_api():
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=5)
        return resp.status_code == 200
    except:
        return False


def create_entity(i, section_id):
    km = random.randint(1, 5)
    data = {
        "section_id": section_id,
        "entity_type": random.choice(["road", "bridge"]),
        "code": f"quick_{int(time.time())}_{i}",
        "name": f"快速测试_{i}",
        "start_station": f"K{km}+{random.randint(0, 500):03d}",
        "end_station": f"K{km}+{random.randint(500, 999):03d}",
        "progress": random.random(),
    }
    resp = requests.post(f"{API_BASE}/entities", json=data, timeout=15)
    return resp.status_code == 200, resp.json().get(
        "id"
    ) if resp.status_code == 200 else None


def update_entity(entity_id):
    data = {"progress": random.random()}
    resp = requests.put(f"{API_BASE}/entities/{entity_id}", json=data, timeout=15)
    return resp.status_code == 200


def get_entities():
    resp = requests.get(f"{API_BASE}/entities?limit=100", timeout=15)
    return resp.status_code == 200


def delete_entity(entity_id):
    resp = requests.delete(f"{API_BASE}/entities/{entity_id}", timeout=10)
    return resp.status_code in [200, 204]


def main():
    print("=" * 60)
    print("NeuralSite 快速性能测试")
    print("=" * 60)

    if not check_api():
        print("API不可用")
        return

    log("获取标段...")
    resp = requests.get(f"{API_BASE}/sections?limit=1", timeout=10)
    data = resp.json()
    items = data if isinstance(data, list) else data.get("items", [])
    if not items:
        print("无可用标段")
        return
    section_id = items[0]["id"]
    log(f"使用标段: {section_id}")

    # 测试1: 创建 20 个实体
    print("\n--- 测试1: 创建 20 个实体 ---")
    start = time.time()
    ids = []
    for i in range(20):
        ok, eid = create_entity(i, section_id)
        if ok:
            ids.append(eid)
    create_time = time.time() - start
    print(f"  耗时: {create_time:.2f}s, QPS: {20 / create_time:.2f}, 成功: {len(ids)}")

    # 测试2: 100 次并发读取
    print("\n--- 测试2: 100 次并发读取 ---")
    start = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
        futures = [ex.submit(get_entities) for _ in range(100)]
        success = sum(1 for f in concurrent.futures.as_completed(futures) if f.result())
    read_time = time.time() - start
    print(f"  耗时: {read_time:.2f}s, QPS: {100 / read_time:.2f}, 成功: {success}")

    # 测试3: 20 次并发更新
    print("\n--- 测试3: 20 次并发更新 ---")
    if ids:
        start = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
            futures = [ex.submit(update_entity, random.choice(ids)) for _ in range(20)]
            success = sum(
                1 for f in concurrent.futures.as_completed(futures) if f.result()
            )
        update_time = time.time() - start
        print(
            f"  耗时: {update_time:.2f}s, QPS: {20 / update_time:.2f}, 成功: {success}"
        )

    # 测试4: 50 次并发创建
    print("\n--- 测试4: 50 次并发创建 ---")
    start = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        futures = [ex.submit(create_entity, i, section_id) for i in range(50)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    concurrent_create_time = time.time() - start
    success = sum(1 for ok, _ in results if ok)
    print(
        f"  耗时: {concurrent_create_time:.2f}s, QPS: {50 / concurrent_create_time:.2f}, 成功: {success}"
    )

    # 清理
    print("\n--- 清理 ---")
    deleted = 0
    for eid in ids:
        if delete_entity(eid):
            deleted += 1
    print(f"  已删除: {deleted}/{len(ids)}")

    # 汇总
    print("\n" + "=" * 60)
    print("结果汇总:")
    print(f"  创建(顺序): QPS={20 / create_time:.2f}")
    print(f"  读取(并发): QPS={100 / read_time:.2f}")
    if ids:
        print(f"  更新(并发): QPS={20 / update_time:.2f}")
    print(f"  创建(并发): QPS={50 / concurrent_create_time:.2f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
