"""
NeuralSite Stress Test Suite
压力测试：并发创建、大数据加载、频繁更新删除
"""

import requests
import time
import concurrent.futures
import random
from datetime import datetime

API_BASE = "http://localhost:8000/api/v1"


def timing_decorator(func):
    """装饰器：测量函数执行时间"""

    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        return result, elapsed

    return wrapper


@timing_decorator
def create_entity(index):
    """创建单个实体"""
    km = random.randint(1, 50)
    start_m = index % 1000
    end_m = start_m + random.randint(100, 500)  # 确保 end > start
    data = {
        "entity_type": random.choice(["road", "bridge", "culvert"]),
        "code": f"stress_{index}_{int(time.time())}",
        "name": f"压力测试实体_{index}",
        "start_station": f"K{km}+{start_m:03d}",
        "end_station": f"K{km}+{end_m:03d}",
        "lateral_offset": 0,
        "width": random.choice([12, 24, 36]),
        "lanes": random.choice([2, 4, 6]),
        "progress": random.random(),
        "construction_phase": random.choice(["planning", "earthwork", "pavement"]),
    }
    resp = requests.post(f"{API_BASE}/entities", json=data, timeout=10)
    return resp


@timing_decorator
def update_entity(entity_id):
    """更新实体"""
    data = {"progress": random.random(), "notes": f"压力测试更新_{int(time.time())}"}
    resp = requests.put(f"{API_BASE}/entities/{entity_id}", json=data, timeout=10)
    return resp


@timing_decorator
def delete_entity(entity_id):
    """删除实体"""
    resp = requests.delete(f"{API_BASE}/entities/{entity_id}", timeout=10)
    return resp


@timing_decorator
def get_entities():
    """获取所有实体"""
    resp = requests.get(f"{API_BASE}/entities?limit=1000", timeout=10)
    return resp


@timing_decorator
def get_entity(entity_id):
    """获取单个实体"""
    resp = requests.get(f"{API_BASE}/entities/{entity_id}", timeout=10)
    return resp


def test_concurrent_creation(count=50):
    """测试并发创建"""
    print(f"\n{'=' * 60}")
    print(f"测试: 并发创建 {count} 个实体")
    print(f"{'=' * 60}")

    start = time.time()
    created_ids = []
    errors = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(create_entity, i) for i in range(count)]

        for i, future in enumerate(concurrent.futures.as_completed(futures)):
            try:
                resp, elapsed = future.result()
                if resp.status_code == 200:
                    created_ids.append(resp.json().get("id"))
                    print(f"\r  创建进度: {i + 1}/{count}", end="", flush=True)
                else:
                    errors += 1
                    print(f"\n  错误 [{resp.status_code}]: {resp.text[:100]}")
            except Exception as e:
                errors += 1
                print(f"\n  异常: {e}")

    total_time = time.time() - start
    print(f"\n\n结果:")
    print(f"  - 总耗时: {total_time:.2f}秒")
    print(f"  - 成功: {len(created_ids)}")
    print(f"  - 失败: {errors}")
    print(f"  - QPS: {count / total_time:.2f} 请求/秒")

    return created_ids, errors


def test_large_data_load():
    """测试大数据加载"""
    print(f"\n{'=' * 60}")
    print(f"测试: 大数据加载 (获取1000+实体)")
    print(f"{'=' * 60}")

    resp, elapsed = get_entities()

    if resp.status_code == 200:
        data = resp.json()
        total = data.get("total", 0)
        items = len(data.get("items", []))
        print(f"\n结果:")
        print(f"  - 查询耗时: {elapsed * 1000:.2f}ms")
        print(f"  - 总实体数: {total}")
        print(f"  - 返回数量: {items}")
    else:
        print(f"  错误: {resp.status_code}")

    return elapsed, resp.status_code


def test_rapid_updates(entity_ids, count=20):
    """测试频繁更新（并发）"""
    print(f"\n{'=' * 60}")
    print(f"测试: 频繁更新 ({count} 次，并发)")
    print(f"{'=' * 60}")

    if not entity_ids:
        print("  无实体可测试，跳过")
        return 0

    errors = 0
    start = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(update_entity, random.choice(entity_ids))
            for _ in range(count)
        ]

        for i, future in enumerate(concurrent.futures.as_completed(futures)):
            try:
                resp, elapsed = future.result()
                if resp.status_code != 200:
                    errors += 1
                    print(f"\n  更新失败 [{resp.status_code}]: {resp.text[:100]}")
                print(f"\r  完成: {i + 1}/{count}", end="", flush=True)
            except Exception as e:
                errors += 1
                print(f"\n  异常: {e}")

    total_time = time.time() - start
    print(f"\n\n结果:")
    print(f"  - 总耗时: {total_time:.2f}秒")
    print(f"  - 失败: {errors}")
    print(f"  - QPS: {count / total_time:.2f} 请求/秒")

    return errors


def test_concurrent_reads(count=100):
    """测试并发读取"""
    print(f"\n{'=' * 60}")
    print(f"测试: 并发读取 ({count} 次)")
    print(f"{'=' * 60}")

    start = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(get_entities) for _ in range(count)]
        results = [f.result()[0] for f in concurrent.futures.as_completed(futures)]

    total_time = time.time() - start
    success = sum(1 for r in results if r.status_code == 200)

    print(f"\n结果:")
    print(f"  - 总耗时: {total_time:.2f}秒")
    print(f"  - 成功: {success}/{count}")
    print(f"  - QPS: {count / total_time:.2f} 请求/秒")

    return success, count - success


def cleanup_test_entities(prefix="stress_"):
    """清理测试数据"""
    print(f"\n{'=' * 60}")
    print(f"清理: 删除所有 stress_ 前缀的测试实体")
    print(f"{'=' * 60}")

    resp = requests.get(f"{API_BASE}/entities?limit=1000", timeout=10)
    if resp.status_code == 200:
        entities = resp.json().get("items", [])
        to_delete = [e["id"] for e in entities if "stress_" in e.get("code", "")]

        print(f"  找到 {len(to_delete)} 个测试实体")

        for i, entity_id in enumerate(to_delete):
            delete_entity(entity_id)
            if i % 10 == 0:
                print(f"\r  删除进度: {i + 1}/{len(to_delete)}", end="", flush=True)

        print(f"\n  已删除 {len(to_delete)} 个测试实体")


def main():
    print("=" * 60)
    print("NeuralSite 压力测试")
    print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 前置检查
    print("\n前置检查: API 健康状态")
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=5)
        print(f"  API 状态: {resp.json()}")
    except Exception as e:
        print(f"  API 不可用: {e}")
        return

    # 清理旧测试数据
    cleanup_test_entities()

    # 1. 并发创建测试
    created_ids, create_errors = test_concurrent_creation(50)

    # 2. 大数据加载测试
    load_time, load_status = test_large_data_load()

    # 3. 频繁更新测试
    if created_ids:
        update_errors = test_rapid_updates(created_ids[:20], 20)

    # 4. 并发读取测试
    read_success, read_errors = test_concurrent_reads(100)

    # 清理
    cleanup_test_entities()

    # 总结
    print("\n" + "=" * 60)
    print("压力测试总结")
    print("=" * 60)
    print(
        f"  并发创建: {'通过' if create_errors < 5 else '失败'} ({create_errors} 错误)"
    )
    print(
        f"  大数据加载: {'通过' if load_time < 2 else '警告'} ({load_time * 1000:.0f}ms)"
    )
    print(
        f"  频繁更新: {'通过' if update_errors < 3 else '失败'} ({update_errors} 错误)"
    )
    print(f"  并发读取: {'通过' if read_errors < 5 else '警告'} ({read_errors} 错误)")
    print(f"\n完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
