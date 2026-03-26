#!/usr/bin/env python3
"""
NeuralSite 端到端测试脚本
验证前后端数据流转
"""

import requests
import json
import time
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"


class NeuralSiteTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.results = []

    def log(self, test_name, passed, detail=""):
        status = "[PASS]" if passed else "[FAIL]"
        self.results.append((test_name, passed))
        print(f"{status}: {test_name}")
        if detail:
            print(f"      {detail}")

    def test_backend_health(self):
        """测试后端是否运行"""
        try:
            r = self.session.get(f"{BASE_URL.replace('/api/v1', '')}/health", timeout=2)
            self.log("后端健康检查", r.status_code == 200, f"状态码: {r.status_code}")
            return r.status_code == 200
        except requests.exceptions.ConnectionError:
            self.log("后端健康检查", False, "无法连接到 http://localhost:8000")
            return False

    def test_get_projects(self):
        """测试获取项目列表"""
        r = self.session.get(f"{BASE_URL}/projects")
        data = r.json()
        self.log(
            "获取项目列表",
            isinstance(data, list) and len(data) > 0,
            f"项目数: {len(data)}",
        )
        return data[0] if data else None

    def test_get_entities(self):
        """测试获取实体列表"""
        r = self.session.get(f"{BASE_URL}/entities")
        data = r.json()
        self.log("获取实体列表", isinstance(data, list), f"实体数: {len(data)}")
        return data

    def test_create_entity(self):
        """测试创建实体"""
        payload = {
            "entity_type": "road",
            "code": f"road_test_{int(time.time())}",
            "name": f"测试道路_{datetime.now().strftime('%H%M%S')}",
            "start_station": "K10+000.000",
            "end_station": "K11+000.000",
            "lateral_offset": 0,
            "width": 12,
            "height": None,
            "lanes": 4,
            "design_elevation": 100,
            "progress": 0.3,
            "construction_phase": "earthwork",
            "planned_start_date": "2026-04-01",
            "planned_end_date": "2026-06-30",
            "cost_budget": 5000000,
            "quality_status": "pending",
            "safety_level": "normal",
            "notes": "自动化测试创建的实体",
        }

        r = self.session.post(f"{BASE_URL}/entities", json=payload)
        if r.status_code == 200:
            data = r.json()
            self.log(
                "创建实体", True, f"ID: {data.get('id')}, 名称: {data.get('name')}"
            )
            return data
        else:
            self.log("创建实体", False, f"状态码: {r.status_code}, 响应: {r.text}")
            return None

    def test_update_entity(self, entity_id):
        """测试更新实体"""
        payload = {
            "progress": 0.65,
            "construction_phase": "pavement",
            "quality_status": "approved",
        }
        r = self.session.put(f"{BASE_URL}/entities/{entity_id}", json=payload)

        if r.status_code == 200:
            data = r.json()
            updated = data.get("progress") == 0.65
            self.log("更新实体进度", updated, f"新进度: {data.get('progress')}")
            return updated
        else:
            self.log("更新实体进度", False, f"状态码: {r.status_code}")
            return False

    def test_create_quality_record(self, entity_id):
        """测试创建质量记录"""
        payload = {
            "entity_id": entity_id,
            "record_date": datetime.now().strftime("%Y-%m-%d"),
            "inspection_type": "日常检查",
            "issue_found": "路基压实度不足",
            "issue_severity": "major",
            "inspector": "测试员",
            "result": "待整改",
        }
        r = self.session.post(f"{BASE_URL}/quality", json=payload)

        if r.status_code == 200:
            data = r.json()
            self.log("创建质量记录", True, f"ID: {data.get('id')}")
            return True
        else:
            self.log("创建质量记录", False, f"状态码: {r.status_code}, 响应: {r.text}")
            return False

    def test_create_safety_record(self, entity_id):
        """测试创建安全记录"""
        payload = {
            "entity_id": entity_id,
            "record_date": datetime.now().strftime("%Y-%m-%d"),
            "inspection_type": "安全检查",
            "hazard_description": "临边防护不到位",
            "risk_level": "critical",
            "corrective_action": "立即整改",
            "responsible_person": "安全员张三",
            "deadline": "2026-03-30",
        }
        r = self.session.post(f"{BASE_URL}/safety", json=payload)

        if r.status_code == 200:
            data = r.json()
            self.log("创建安全记录", True, f"ID: {data.get('id')}")
            return True
        else:
            self.log("创建安全记录", False, f"状态码: {r.status_code}, 响应: {r.text}")
            return False

    def test_dashboard_stats(self):
        """测试Dashboard统计"""
        r = self.session.get(f"{BASE_URL}/stats/dashboard")
        if r.status_code == 200:
            data = r.json()
            has_fields = all(
                k in data
                for k in ["project_count", "entity_by_type", "overall_progress"]
            )
            self.log(
                "Dashboard统计",
                has_fields,
                f"项目: {data.get('project_count')}, 实体类型: {len(data.get('entity_by_type', []))}",
            )
            return True
        else:
            self.log("Dashboard统计", False, f"状态码: {r.status_code}")
            return False

    def test_full_flow(self):
        """完整流程测试"""
        print("=" * 60)
        print("NeuralSite 端到端测试")
        print("=" * 60)

        # 1. 后端健康检查
        print("\n[1/8] 后端健康检查...")
        if not self.test_backend_health():
            print("\n❌ 后端未运行！请先启动后端:")
            print("   cd F:\\NeuralSite-Godot\\neuralsite-backend")
            print("   python space_api.py")
            return False

        # 2. 获取项目
        print("\n[2/8] 获取项目...")
        project = self.test_get_projects()
        if not project:
            print("⚠️ 没有项目（可能需要先初始化数据库）")

        # 3. 获取现有实体
        print("\n[3/8] 获取现有实体...")
        entities = self.test_get_entities()

        # 4. 创建新实体
        print("\n[4/8] 创建新实体...")
        new_entity = self.test_create_entity()
        if not new_entity:
            print("❌ 创建实体失败，跳过后续测试")
            return False

        entity_id = new_entity.get("id")

        # 5. 更新实体
        print("\n[5/8] 更新实体进度...")
        self.test_update_entity(entity_id)

        # 6. 创建质量记录
        print("\n[6/8] 创建质量记录...")
        self.test_create_quality_record(entity_id)

        # 7. 创建安全记录
        print("\n[7/8] 创建安全记录...")
        self.test_create_safety_record(entity_id)

        # 8. Dashboard统计
        print("\n[8/8] Dashboard统计...")
        self.test_dashboard_stats()

        # 验证实体已更新
        print("\n[验证] 再次获取实体列表...")
        entities = self.test_get_entities()
        our_entity = next((e for e in entities if e["id"] == entity_id), None)
        if our_entity:
            print(f"   实体进度: {our_entity.get('progress')}")
            print(f"   施工阶段: {our_entity.get('construction_phase')}")

        # 总结
        print("\n" + "=" * 60)
        print("测试结果汇总")
        print("=" * 60)
        passed = sum(1 for _, p in self.results if p)
        total = len(self.results)
        print(f"通过: {passed}/{total}")

        if passed == total:
            print("\n[PASS] 所有后端API测试通过！")
            return True
        else:
            print("\n[FAIL] 部分测试失败，请检查上面输出")
            return False


def main():
    tester = NeuralSiteTester()
    success = tester.test_full_flow()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
