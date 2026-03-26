"""
NeuralSite Database Heavy Load Test
持续压力测试：混合负载 + 长时间运行
"""

import requests
import time
import concurrent.futures
import random
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"


class Colors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKCYAN = "\033[96m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"


def cprint(color, msg):
    print(f"{color}{msg}{Colors.ENDC}")


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def check_api():
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=5)
        return resp.status_code == 200
    except:
        return False


def create_entity(i, section_id):
    km = random.randint(1, 20)
    data = {
        "section_id": section_id,
        "entity_type": random.choice(["road", "bridge", "culvert"]),
        "code": f"heavy_{int(time.time())}_{i}",
        "name": f"压力测试_{i}",
        "start_station": f"K{km}+{random.randint(0, 999):03d}",
        "end_station": f"K{km}+{random.randint(0, 999):03d}",
        "progress": random.random(),
    }
    resp = requests.post(f"{API_BASE}/entities", json=data, timeout=10)
    return resp.status_code == 200, resp.json().get(
        "id"
    ) if resp.status_code == 200 else None


def update_entity(entity_id):
    data = {"progress": random.random(), "notes": f"更新_{int(time.time())}"}
    resp = requests.put(f"{API_BASE}/entities/{entity_id}", json=data, timeout=10)
    return resp.status_code == 200


def get_entities():
    resp = requests.get(f"{API_BASE}/entities?limit=100", timeout=10)
    return resp.status_code == 200


def delete_entity(entity_id):
    resp = requests.delete(f"{API_BASE}/entities/{entity_id}", timeout=10)
    return resp.status_code in [200, 204]


def main():
    print("\n" + "=" * 60)
    cprint(Colors.HEADER, "NeuralSite 数据库持续压力测试")
    print("=" * 60)

    if not check_api():
        cprint(Colors.FAIL, "API不可用，退出")
        return

    log("开始持续压力测试...")

    # 获取现有标段用于创建实体
    resp = requests.get(f"{API_BASE}/sections?limit=1", timeout=10)
    if resp.status_code != 200:
        cprint(Colors.FAIL, "无可用标段，退出")
        return

    data = resp.json()
    items = data if isinstance(data, list) else data.get("items", [])
    if not items:
        cprint(Colors.FAIL, "无可用标段，退出")
        return

    section_id = items[0]["id"]
    log(f"使用标段: {section_id}")

    # 阶段1: 持续创建负载 (60秒)
    print("\n" + "-" * 40)
    cprint(Colors.OKBLUE, "阶段1: 持续创建 (60秒)")
    print("-" * 40)

    start = time.time()
    duration = 60
    created_ids = []
    create_errors = 0
    i = 0

    while time.time() - start < duration:
        ok, eid = create_entity(i, section_id)
        if ok:
            created_ids.append(eid)
        else:
            create_errors += 1
        i += 1

        if i % 20 == 0:
            elapsed = time.time() - start
            rate = i / elapsed if elapsed > 0 else 0
            print(
                f"\r  已创建: {i}, 成功率: {len(created_ids) / i * 100:.1f}%, QPS: {rate:.2f}",
                end="",
                flush=True,
            )

    create_duration = time.time() - start
    print(f"\n  总创建: {i}, 成功: {len(created_ids)}, 失败: {create_errors}")
    print(f"  创建QPS: {i / create_duration:.2f}")

    # 阶段2: 混合读写负载 (60秒)
    print("\n" + "-" * 40)
    cprint(Colors.OKBLUE, "阶段2: 混合读写负载 (60秒)")
    print("-" * 40)

    operations = {"read": 0, "update": 0, "create": 0, "delete": 0}
    errors = {"read": 0, "update": 0, "create": 0, "delete": 0}

    start = time.time()
    ops_count = 0

    def mix_workload():
        op = random.choice(["read", "read", "read", "update", "update", "create"])
        if op == "read":
            operations["read"] += 1
            return get_entities()
        elif op == "update" and created_ids:
            operations["update"] += 1
            return update_entity(random.choice(created_ids))
        elif op == "create":
            operations["create"] += 1
            ok, _ = create_entity(ops_count, section_id)
            return ok
        return True

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = []
        while time.time() - start < 30:  # 30秒混合负载
            futures.append(executor.submit(mix_workload))
            ops_count += 1

        for future in concurrent.futures.as_completed(futures):
            try:
                ok = future.result()
                if not ok:
                    pass  # 计数已包含
            except:
                pass

    mix_duration = time.time() - start
    total_ops = sum(operations.values())
    print(f"  总操作: {total_ops}, QPS: {total_ops / mix_duration:.2f}")
    print(
        f"  读: {operations['read']}, 更新: {operations['update']}, 创建: {operations['create']}"
    )

    # 阶段3: 并发读取压力
    print("\n" + "-" * 40)
    cprint(Colors.OKBLUE, "阶段3: 并发读取压力 (100次)")
    print("-" * 40)

    start = time.time()
    success = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
        futures = [executor.submit(get_entities) for _ in range(100)]
        for future in concurrent.futures.as_completed(futures):
            try:
                if future.result():
                    success += 1
            except:
                pass

    read_duration = time.time() - start
    print(f"  100次读取, 耗时: {read_duration:.2f}s, QPS: {100 / read_duration:.2f}")

    # 阶段4: 并发更新压力
    print("\n" + "-" * 40)
    cprint(Colors.OKBLUE, "阶段4: 并发更新压力 (50次)")
    print("-" * 40)

    if created_ids:
        start = time.time()
        update_success = 0

        with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
            futures = [
                executor.submit(update_entity, random.choice(created_ids[:50]))
                for _ in range(50)
            ]
            for future in concurrent.futures.as_completed(futures):
                try:
                    if future.result():
                        update_success += 1
                except:
                    pass

        update_duration = time.time() - start
        print(
            f"  50次更新, 成功: {update_success}, 耗时: {update_duration:.2f}s, QPS: {50 / update_duration:.2f}"
        )

    # 清理
    print("\n" + "-" * 40)
    log("清理测试数据...")

    deleted = 0
    for eid in created_ids[:100]:  # 只清理前100个
        if delete_entity(eid):
            deleted += 1

    log(f"已清理: {deleted}/{len(created_ids[:100])}")

    # 结果汇总
    print("\n" + "=" * 60)
    cprint(Colors.HEADER, "持续压力测试结果")
    print("=" * 60)
    print(f"  创建测试:")
    print(f"    - 60秒内创建: {i} 个实体")
    print(f"    - 创建QPS: {i / create_duration:.2f}")
    print(f"    - 成功率: {len(created_ids) / i * 100:.1f}%")
    print(f"  混合负载:")
    print(f"    - 30秒内操作: {total_ops} 次")
    print(f"    - 混合QPS: {total_ops / mix_duration:.2f}")
    print(f"  读取压力:")
    print(f"    - 100次读取QPS: {100 / read_duration:.2f}")
    if created_ids:
        print(f"  更新压力:")
        print(f"    - 50次更新QPS: {50 / update_duration:.2f}")
    print(f"\n完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
