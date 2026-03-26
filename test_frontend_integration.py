#!/usr/bin/env python3
"""
NeuralSite 前端 → 后端 集成测试
验证前端创建/更新实体时数据是否能正确流转到后端

注意：需要先启动后端和前端
"""

import requests
import json
import time
import sys
from datetime import datetime

BACKEND_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"


class FrontendIntegrationTester:
    def __init__(self):
        self.session = requests.Session()
        self.results = []

    def log(self, test_name, passed, detail=""):
        status = "[PASS]" if passed else "[FAIL]"
        self.results.append((test_name, passed))
        print(f"{status}: {test_name}")
        if detail:
            print(f"      {detail}")

    def test_backend_running(self):
        """检查后端是否运行"""
        try:
            r = requests.get(f"{BACKEND_URL.replace('/api/v1', '')}/health", timeout=2)
            self.log("后端运行状态", r.status_code == 200)
            return r.status_code == 200
        except:
            self.log("后端运行状态", False, "后端未启动")
            return False

    def test_backend_create_entity(self):
        """模拟前端创建实体 - 调用后端API"""
        print("\n  模拟前端调用 apiService.createEntity()")

        # 模拟 CreatePanel 提交的格式
        entity_id = f"road_test_{int(time.time())}"
        payload = {
            "entity_type": "road",
            "code": entity_id,  # 前端传入的ID
            "name": f"前端测试道路_{datetime.now().strftime('%H%M%S')}",
            "start_station": "K20+000.000",
            "end_station": "K21+000.000",
            "lateral_offset": 0,
            "width": 12,
            "lanes": 4,
            "design_elevation": 100,
            "progress": 0,
            "construction_phase": "planning",
        }

        r = requests.post(f"{BACKEND_URL}/entities", json=payload)
        if r.status_code == 200:
            data = r.json()
            # 关键检查：后端返回的ID是否与前端传入的一致
            id_match = data.get("id") == entity_id or data.get("id") == payload.get(
                "code"
            )
            self.log(
                "前端ID与后端ID一致性",
                id_match,
                f"前端ID: {entity_id}, 后端ID: {data.get('id')}",
            )

            # 检查所有字段是否正确保存
            fields_ok = (
                data.get("entity_type") == "road"
                and data.get("name") == payload["name"]
                and data.get("start_station") == payload["start_station"]
                and data.get("lanes") == 4
            )
            self.log("实体字段完整性", fields_ok, f"保存的字段: {list(data.keys())}")

            return data
        else:
            self.log("创建实体", False, f"状态码: {r.status_code}")
            return None

    def test_backend_update_progress(self):
        """模拟前端更新进度 - 调用后端API"""
        print("\n  模拟前端调用 apiService.updateEntity()")

        # 先创建一个实体
        entity_id = f"road_update_{int(time.time())}"
        create_payload = {
            "entity_type": "road",
            "code": entity_id,
            "name": "进度测试道路",
            "start_station": "K30+000.000",
            "end_station": "K31+000.000",
            "progress": 0.2,
            "construction_phase": "earthwork",
        }

        r = requests.post(f"{BACKEND_URL}/entities", json=create_payload)
        if r.status_code != 200:
            self.log("创建测试实体", False)
            return False

        created = r.json()
        backend_id = created.get("id")

        # 模拟 updateNode 调用
        update_payload = {"progress": 0.75, "construction_phase": "pavement"}

        r = requests.put(f"{BACKEND_URL}/entities/{backend_id}", json=update_payload)
        if r.status_code == 200:
            updated = r.json()
            progress_ok = updated.get("progress") == 0.75
            phase_ok = updated.get("construction_phase") == "pavement"
            self.log(
                "进度更新",
                progress_ok and phase_ok,
                f"进度: {updated.get('progress')}, 阶段: {updated.get('construction_phase')}",
            )
            return True
        else:
            self.log("进度更新", False, f"状态码: {r.status_code}")
            return False

    def test_quality_record_flow(self):
        """测试质量记录流程"""
        print("\n  模拟前端 IssueRegistration → apiService.createQualityRecord()")

        # 先创建实体
        entity_id = f"road_quality_{int(time.time())}"
        create_payload = {
            "entity_type": "road",
            "code": entity_id,
            "name": "质量测试道路",
            "start_station": "K40+000.000",
            "end_station": "K40+500.000",
        }

        r = requests.post(f"{BACKEND_URL}/entities", json=create_payload)
        if r.status_code != 200:
            self.log("创建质量测试实体", False)
            return False

        # 获取后端分配的ID
        backend_entity = r.json()
        backend_id = backend_entity.get("id")

        # 创建质量记录
        quality_payload = {
            "entity_id": backend_id,  # 使用后端ID
            "record_date": datetime.now().strftime("%Y-%m-%d"),
            "inspection_type": "日常检查",
            "issue_found": "测试质量问题",
            "issue_severity": "minor",
        }

        r = requests.post(f"{BACKEND_URL}/quality", json=quality_payload)
        if r.status_code == 200:
            data = r.json()
            self.log("质量记录创建", True, f"记录ID: {data.get('id')}")
            return True
        else:
            self.log("质量记录创建", False, f"状态码: {r.status_code}, 响应: {r.text}")
            return False

    def test_safety_record_flow(self):
        """测试安全记录流程"""
        print("\n  模拟前端 IssueRegistration → apiService.createSafetyRecord()")

        # 先创建实体
        entity_id = f"road_safety_{int(time.time())}"
        create_payload = {
            "entity_type": "road",
            "code": entity_id,
            "name": "安全测试道路",
            "start_station": "K50+000.000",
            "end_station": "K50+500.000",
        }

        r = requests.post(f"{BACKEND_URL}/entities", json=create_payload)
        if r.status_code != 200:
            self.log("创建安全测试实体", False)
            return False

        backend_entity = r.json()
        backend_id = backend_entity.get("id")

        # 创建安全记录
        safety_payload = {
            "entity_id": backend_id,
            "record_date": datetime.now().strftime("%Y-%m-%d"),
            "inspection_type": "安全检查",
            "hazard_description": "测试安全隐患",
            "risk_level": "critical",
        }

        r = requests.post(f"{BACKEND_URL}/safety", json=safety_payload)
        if r.status_code == 200:
            data = r.json()
            self.log("安全记录创建", True, f"记录ID: {data.get('id')}")
            return True
        else:
            self.log("安全记录创建", False, f"状态码: {r.status_code}")
            return False

    def run_all_tests(self):
        """运行所有测试"""
        print("=" * 60)
        print("NeuralSite 前端→后端 集成测试")
        print("=" * 60)

        # 检查后端
        print("\n[检查] 后端状态...")
        if not self.test_backend_running():
            print("\n❌ 后端未运行！请执行:")
            print("   1. 打开终端1: cd F:\\NeuralSite-Godot\\neuralsite-backend")
            print("   2. 执行: python space_api.py")
            print("   3. 保持后端运行，重新运行此脚本")
            return False

        # 测试流程
        print("\n[1/5] 测试实体创建流程...")
        self.test_backend_create_entity()

        print("\n[2/5] 测试进度更新流程...")
        self.test_backend_update_progress()

        print("\n[3/5] 测试质量记录流程...")
        self.test_quality_record_flow()

        print("\n[4/5] 测试安全记录流程...")
        self.test_safety_record_flow()

        # 总结
        print("\n" + "=" * 60)
        print("测试结果汇总")
        print("=" * 60)
        passed = sum(1 for _, p in self.results if p)
        total = len(self.results)
        print(f"通过: {passed}/{total}")

        if passed == total:
            print("\n[PASS] 所有前端集成测试通过！")
            print("\n下一步: 启动前端并测试完整流程")
            print("   cd F:\\NeuralSite-Godot\\NeuralSite-Web3D")
            print("   npm run dev")
            return True
        else:
            print("\n[FAIL] 部分测试失败")
            return False


def main():
    tester = FrontendIntegrationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
