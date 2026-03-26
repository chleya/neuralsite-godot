"""
NeuralSite Comprehensive API Stress Test
全面压力测试：所有API端点、混合负载、边界情况
"""

import requests
import time
import concurrent.futures
import random
import json
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


class StressTestRunner:
    def __init__(self):
        self.results = {}
        self.created_entities = []
        self.created_sections = []
        self.created_projects = []

    def log(self, msg):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

    def check_api(self):
        """检查API是否可用"""
        try:
            resp = requests.get(f"{API_BASE}/health", timeout=5)
            if resp.status_code == 200:
                self.log(f"API健康: {resp.json()}")
                return True
        except Exception as e:
            self.log(f"API不可用: {e}")
            return False
        return False

    # ========== 创建测试 ==========

    def test_project_create(self, count=20):
        """测试项目创建"""
        self.log(f"测试: 创建 {count} 个项目")
        start = time.time()
        created = []
        errors = []

        def create_project(i):
            data = {
                "code": f"stress_proj_{int(time.time())}_{i}",
                "name": f"压力测试项目_{i}",
                "location": f"测试地点_{i}",
                "total_length": random.randint(1000, 10000),
                "budget": random.randint(1000000, 100000000),
            }
            resp = requests.post(f"{API_BASE}/projects", json=data, timeout=10)
            return resp

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(create_project, i) for i in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    resp = future.result()
                    if resp.status_code == 200:
                        created.append(resp.json().get("id"))
                    else:
                        errors.append(resp.text[:100])
                except Exception as e:
                    errors.append(str(e))
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.created_projects = created
        self.results["project_create"] = {
            "qps": qps,
            "errors": len(errors),
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 错误={len(errors)}, 耗时={elapsed:.2f}s")
        return created, errors

    def test_section_create(self, project_id, count=30):
        """测试标段创建"""
        self.log(f"测试: 创建 {count} 个标段")
        start = time.time()
        created = []
        errors = []

        def create_section(i):
            data = {
                "project_id": project_id,
                "code": f"stress_sec_{int(time.time())}_{i}",
                "name": f"压力测试标段_{i}",
                "start_station": f"K{random.randint(1, 10)}+{random.randint(0, 999):03d}",
                "end_station": f"K{random.randint(11, 20)}+{random.randint(0, 999):03d}",
                "length": random.randint(500, 5000),
                "contract_amount": random.randint(1000000, 50000000),
            }
            resp = requests.post(f"{API_BASE}/sections", json=data, timeout=10)
            return resp

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(create_section, i) for i in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    resp = future.result()
                    if resp.status_code == 200:
                        created.append(resp.json().get("id"))
                    else:
                        errors.append(resp.text[:100])
                except Exception as e:
                    errors.append(str(e))
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.created_sections = created
        self.results["section_create"] = {
            "qps": qps,
            "errors": len(errors),
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 错误={len(errors)}, 耗时={elapsed:.2f}s")
        return created, errors

    def test_entity_create(self, section_id, count=50):
        """测试实体创建"""
        self.log(f"测试: 创建 {count} 个实体")
        start = time.time()
        created = []
        errors = []

        def create_entity(i):
            km = random.randint(1, 50)
            start_m = i * 10
            end_m = start_m + random.randint(100, 500)
            data = {
                "section_id": section_id,
                "entity_type": random.choice(
                    ["road", "bridge", "culvert", "fence", "sign"]
                ),
                "code": f"stress_ent_{int(time.time())}_{i}",
                "name": f"压力测试实体_{i}",
                "start_station": f"K{km}+{start_m:03d}",
                "end_station": f"K{km}+{end_m:03d}",
                "lateral_offset": random.uniform(-10, 10),
                "width": random.choice([12, 24, 36]),
                "lanes": random.choice([2, 4, 6]),
                "progress": random.random(),
                "construction_phase": random.choice(
                    ["planning", "earthwork", "pavement"]
                ),
            }
            resp = requests.post(f"{API_BASE}/entities", json=data, timeout=10)
            return resp

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(create_entity, i) for i in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    resp = future.result()
                    if resp.status_code == 200:
                        created.append(resp.json().get("id"))
                    else:
                        errors.append(resp.text[:100])
                except Exception as e:
                    errors.append(str(e))
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.created_entities = created
        self.results["entity_create"] = {
            "qps": qps,
            "errors": len(errors),
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 错误={len(errors)}, 耗时={elapsed:.2f}s")
        return created, errors

    # ========== 读取测试 ==========

    def test_list_entities(self, count=50):
        """测试实体列表查询"""
        self.log(f"测试: 实体列表查询 {count} 次")
        start = time.time()
        success = 0
        errors = 0

        def get_entities():
            resp = requests.get(f"{API_BASE}/entities?limit=100", timeout=10)
            return resp.status_code == 200

        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(get_entities) for _ in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    if future.result():
                        success += 1
                    else:
                        errors += 1
                except:
                    errors += 1
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.results["list_entities"] = {
            "qps": qps,
            "success": success,
            "errors": errors,
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 成功={success}, 错误={errors}")
        return success, errors

    def test_get_single_entity(self, entity_ids, count=100):
        """测试单个实体查询"""
        self.log(f"测试: 单个实体查询 {count} 次")
        if not entity_ids:
            self.log("  无实体ID，跳过")
            return 0, count

        start = time.time()
        success = 0
        errors = 0

        def get_entity():
            eid = random.choice(entity_ids)
            resp = requests.get(f"{API_BASE}/entities/{eid}", timeout=10)
            return resp.status_code == 200

        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(get_entity) for _ in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    if future.result():
                        success += 1
                    else:
                        errors += 1
                except:
                    errors += 1
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.results["get_entity"] = {
            "qps": qps,
            "success": success,
            "errors": errors,
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 成功={success}, 错误={errors}")
        return success, errors

    def test_filter_entities(self, count=50):
        """测试实体过滤查询"""
        self.log(f"测试: 实体过滤查询 {count} 次")
        start = time.time()
        success = 0
        errors = 0
        filters = [
            {"entity_type": "road"},
            {"entity_type": "bridge"},
            {"construction_phase": "earthwork"},
        ]

        def filter_entities():
            params = random.choice(filters)
            query = "&".join([f"{k}={v}" for k, v in params.items()])
            resp = requests.get(f"{API_BASE}/entities?{query}&limit=20", timeout=10)
            return resp.status_code == 200

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(filter_entities) for _ in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    if future.result():
                        success += 1
                    else:
                        errors += 1
                except:
                    errors += 1
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.results["filter_entities"] = {
            "qps": qps,
            "success": success,
            "errors": errors,
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 成功={success}, 错误={errors}")
        return success, errors

    # ========== 更新测试 ==========

    def test_update_entities(self, entity_ids, count=30):
        """测试实体更新"""
        self.log(f"测试: 实体更新 {count} 次")
        if not entity_ids:
            self.log("  无实体ID，跳过")
            return 0

        start = time.time()
        success = 0
        errors = 0

        def update_entity(i):
            eid = random.choice(entity_ids)
            data = {
                "progress": random.random(),
                "notes": f"压力测试更新_{i}_{int(time.time())}",
                "construction_phase": random.choice(
                    ["planning", "earthwork", "pavement"]
                ),
            }
            resp = requests.put(f"{API_BASE}/entities/{eid}", json=data, timeout=10)
            return (
                resp.status_code == 200,
                resp.status_code,
                resp.text[:100] if resp.status_code != 200 else "",
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(update_entity, i) for i in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    ok, status, err = future.result()
                    if ok:
                        success += 1
                    else:
                        errors += 1
                        if errors <= 3:
                            self.log(f"  更新失败 {status}: {err}")
                except Exception as e:
                    errors += 1
                    if errors <= 3:
                        self.log(f"  异常: {e}")
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.results["update_entities"] = {
            "qps": qps,
            "success": success,
            "errors": errors,
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 成功={success}, 错误={errors}")
        return errors

    # ========== 删除测试 ==========

    def test_delete_entities(self, entity_ids, count=20):
        """测试实体删除"""
        self.log(f"测试: 实体软删除 {count} 次")
        if not entity_ids:
            self.log("  无实体ID，跳过")
            return 0

        start = time.time()
        success = 0
        errors = 0

        def delete_entity(eid):
            resp = requests.delete(f"{API_BASE}/entities/{eid}", timeout=10)
            return resp.status_code in [200, 204]

        test_ids = entity_ids[:count]
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(delete_entity, eid) for eid in test_ids]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    if future.result():
                        success += 1
                    else:
                        errors += 1
                except:
                    errors += 1
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.results["delete_entities"] = {
            "qps": qps,
            "success": success,
            "errors": errors,
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 成功={success}, 错误={errors}")
        return errors

    # ========== 资源记录测试 ==========

    def test_resource_records(self, entity_id, count=20):
        """测试资源记录创建"""
        self.log(f"测试: 资源记录创建 {count} 次")
        start = time.time()
        success = 0
        errors = 0
        record_templates = {
            "personnel": {
                "entity_id": entity_id,
                "quantity": 5,
                "unit": "人",
                "date": "2026-03-26",
                "name": "测试人员",
                "role": "工程师",
            },
            "equipment": {
                "entity_id": entity_id,
                "quantity": 2,
                "unit": "台",
                "date": "2026-03-26",
                "equipment_type": "挖掘机",
                "status": "正常",
            },
            "materials": {
                "entity_id": entity_id,
                "quantity": 100,
                "unit": "吨",
                "date": "2026-03-26",
                "material_type": "钢材",
                "specification": "标准",
            },
            "funds": {
                "entity_id": entity_id,
                "amount": 50000.0,
                "date": "2026-03-26",
                "budget_category": "设备采购",
                "payment_method": "银行转账",
            },
        }

        def create_record(i):
            rtype = random.choice(["personnel", "equipment", "materials", "funds"])
            data = record_templates[rtype].copy()
            data["quantity"] = random.randint(1, 100)
            resp = requests.post(f"{API_BASE}/resources/{rtype}", json=data, timeout=10)
            return resp.status_code == 200, resp.status_code, resp.text[:100]

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(create_record, i) for i in range(count)]
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    ok, status, err = future.result()
                    if ok:
                        success += 1
                    else:
                        errors += 1
                        if errors <= 3:
                            self.log(f"  创建失败 {status}: {err}")
                except Exception as e:
                    errors += 1
                    if errors <= 3:
                        self.log(f"  异常: {e}")
                print(f"\r  进度: {i + 1}/{count}", end="", flush=True)

        elapsed = time.time() - start
        qps = count / elapsed if elapsed > 0 else 0
        self.results["resource_records"] = {
            "qps": qps,
            "success": success,
            "errors": errors,
            "elapsed": elapsed,
        }
        print(f"\n  结果: QPS={qps:.2f}, 成功={success}, 错误={errors}")
        return errors

    # ========== 边界测试 ==========

    def test_invalid_data(self):
        """测试无效数据处理"""
        self.log("测试: 无效数据处理")
        test_cases = [
            ("/entities", {"entity_type": "invalid_type"}, "无效实体类型"),
            (
                "/entities",
                {"start_station": "K1+999", "end_station": "K0+001"},
                "起始终点大于终止点",
            ),
            ("/entities", {"progress": 1.5}, "进度值超出范围"),
            ("/entities", {"lateral_offset": 99999}, "偏移值过大"),
            ("/sections", {"code": ""}, "空代码"),
            ("/projects", {"name": "x" * 500}, "名称过长"),
        ]

        errors_handled = 0
        for endpoint, data, desc in test_cases:
            resp = requests.post(f"{API_BASE}{endpoint}", json=data, timeout=10)
            if resp.status_code >= 400:
                errors_handled += 1
                print(f"  [OK] {desc}: 正确拒绝 ({resp.status_code})")
            else:
                print(f"  [FAIL] {desc}: 应被拒绝但返回 {resp.status_code}")

        self.results["invalid_data"] = {
            "correct_rejections": errors_handled,
            "total": len(test_cases),
        }
        print(f"\n  结果: 正确处理 {errors_handled}/{len(test_cases)} 个无效请求")
        return len(test_cases) - errors_handled

    def test_concurrent_conflicts(self, section_id, count=20):
        """测试并发冲突（同时更新同一实体）"""
        self.log(f"测试: 并发冲突 {count} 个同时更新")

        # 先创建一个实体
        data = {
            "section_id": section_id,
            "entity_type": "road",
            "code": f"conflict_test_{int(time.time())}",
            "name": "冲突测试实体",
            "start_station": "K1+000",
            "end_station": "K1+100",
        }
        resp = requests.post(f"{API_BASE}/entities", json=data, timeout=10)
        if resp.status_code != 200:
            self.log("  无法创建测试实体，跳过")
            return -1
        entity_id = resp.json().get("id")

        start = time.time()
        success = 0
        errors = 0

        def update_same_entity():
            data = {"progress": random.random()}
            resp = requests.put(
                f"{API_BASE}/entities/{entity_id}", json=data, timeout=10
            )
            return resp.status_code == 200

        with concurrent.futures.ThreadPoolExecutor(max_workers=count) as executor:
            futures = [executor.submit(update_same_entity) for _ in range(count)]
            for future in concurrent.futures.as_completed(futures):
                try:
                    if future.result():
                        success += 1
                    else:
                        errors += 1
                except:
                    errors += 1

        elapsed = time.time() - start
        self.log(f"  结果: 成功={success}, 错误={errors}, 耗时={elapsed:.2f}s")

        # 清理
        requests.delete(f"{API_BASE}/entities/{entity_id}", timeout=10)

        self.results["concurrent_conflicts"] = {"success": success, "errors": errors}
        return errors

    # ========== 清理 ==========

    def cleanup(self):
        """清理测试数据"""
        self.log("清理测试数据...")

        # 清理实体
        for eid in self.created_entities:
            try:
                requests.delete(f"{API_BASE}/entities/{eid}", timeout=5)
            except:
                pass

        # 清理标段
        for sid in self.created_sections:
            try:
                requests.delete(f"{API_BASE}/sections/{sid}", timeout=5)
            except:
                pass

        # 清理项目
        for pid in self.created_projects:
            try:
                requests.delete(f"{API_BASE}/projects/{pid}", timeout=5)
            except:
                pass

        self.log("清理完成")

    # ========== 运行所有测试 ==========

    def run_all_tests(self):
        """运行完整测试套件"""
        print("\n" + "=" * 60)
        cprint(Colors.HEADER, "NeuralSite 全方位压力测试")
        print("=" * 60)

        if not self.check_api():
            cprint(Colors.FAIL, "API不可用，退出")
            return

        # 1. 创建测试数据
        print("\n" + "-" * 40)
        cprint(Colors.OKBLUE, "阶段1: 创建测试数据")
        print("-" * 40)

        projects, _ = self.test_project_create(10)
        if not projects:
            cprint(Colors.FAIL, "无法创建项目，退出")
            return

        sections, _ = self.test_section_create(projects[0], 20)
        if not sections:
            cprint(Colors.FAIL, "无法创建标段，退出")
            return

        entities, _ = self.test_entity_create(sections[0], 50)
        if not entities:
            cprint(Colors.FAIL, "无法创建实体，退出")
            return

        # 2. 读取测试
        print("\n" + "-" * 40)
        cprint(Colors.OKBLUE, "阶段2: 读取性能测试")
        print("-" * 40)

        self.test_list_entities(50)
        self.test_get_single_entity(entities, 100)
        self.test_filter_entities(30)

        # 3. 更新测试
        print("\n" + "-" * 40)
        cprint(Colors.OKBLUE, "阶段3: 更新性能测试")
        print("-" * 40)

        self.test_update_entities(entities, 30)
        self.test_resource_records(entities[0], 20)

        # 4. 并发冲突测试
        print("\n" + "-" * 40)
        cprint(Colors.OKBLUE, "阶段4: 并发冲突测试")
        print("-" * 40)

        self.test_concurrent_conflicts(sections[0], 20)

        # 5. 边界测试
        print("\n" + "-" * 40)
        cprint(Colors.OKBLUE, "阶段5: 边界与错误处理")
        print("-" * 40)

        self.test_invalid_data()

        # 6. 清理
        print("\n" + "-" * 40)
        self.cleanup()

        # 7. 结果汇总
        print("\n" + "=" * 60)
        cprint(Colors.HEADER, "压力测试结果汇总")
        print("=" * 60)

        for name, result in self.results.items():
            status = (
                Colors.OKGREEN + "[OK]"
                if result.get("errors", 0) == 0 or result.get("qps", 0) > 0
                else Colors.WARNING + "[WARN]"
            )
            print(f"  {status} {name}:")
            if "qps" in result:
                print(f"      QPS={result['qps']:.2f}, 错误={result.get('errors', 0)}")
            elif "correct_rejections" in result:
                print(
                    f"      正确拒绝={result['correct_rejections']}/{result['total']}"
                )
            else:
                print(
                    f"      成功={result.get('success', 0)}, 错误={result.get('errors', 0)}"
                )

        print(f"\n完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    runner = StressTestRunner()
    runner.run_all_tests()
