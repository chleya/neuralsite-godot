#!/usr/bin/env python3
"""
NeuralSite API测试脚本
用于验证后端API功能
"""

import asyncio
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from app.services.space_service import space_service
from app.services.entity_service import entity_service
from app.services.state_service import state_service
from app.services.event_service import event_service
from app.core.database import AsyncSessionLocal


async def test_space_service():
    """测试空间计算服务"""
    print("\n=== 测试空间计算服务 ===")

    # 测试桩号解析
    station = "K1+500.500"
    total_mm = space_service.parse_station(station)
    print(f"桩号 {station} -> {total_mm} mm")

    # 测试桩号格式化
    formatted = space_service.format_station(1500500)
    print(f"1500500 mm -> {formatted}")

    # 测试桩号转坐标
    coord = space_service.station_to_coordinates("K0+000", 0, 100)
    print(f"桩号 K0+000 -> 坐标 ({coord.x}, {coord.y}, {coord.z})")

    # 测试坐标转桩号
    station_back = space_service.coordinate_to_station(coord, 0)
    print(f"坐标转桩号 -> {station_back}")

    print("✓ 空间计算服务测试通过")


async def test_entity_crud(db):
    """测试实体CRUD"""
    print("\n=== 测试实体CRUD ===")

    # 创建实体
    entity = await entity_service.create(
        db=db,
        entity_type="roadbed",
        name="测试路基",
        start_station="K0+000",
        end_station="K1+000",
        lateral_offset=0,
        elevation_base=100.0,
        width=26.0,
        height=2.5,
        properties={"施工单位": "XX公司", "设计等级": "一级"}
    )
    print(f"创建实体: {entity.name} (ID: {entity.id})")

    # 查询实体
    fetched = await entity_service.get_by_id(db, entity.id)
    print(f"查询实体: {fetched.name}")

    # 更新实体
    updated = await entity_service.update(
        db=db,
        entity_id=entity.id,
        name="测试路基（已修改）"
    )
    print(f"更新实体: {updated.name}")

    # 删除实体
    deleted = await entity_service.delete(db, entity.id)
    print(f"删除实体: {'成功' if deleted else '失败'}")

    print("✓ 实体CRUD测试通过")
    return entity.id


async def test_state_service(db, entity_id):
    """测试状态服务"""
    print("\n=== 测试状态服务 ===")

    now = datetime.now()

    # 创建状态快照
    state = await state_service.create(
        db=db,
        entity_id=entity_id,
        timestamp=now,
        state_type="earthwork",
        progress=50.0,
        quality_status="qualified",
        images=["http://example.com/img1.jpg"],
        notes="土方施工中"
    )
    print(f"创建状态: {state.state_type} - 进度: {state.progress}%")

    # 查询最新状态
    latest = await state_service.get_entity_latest(db, entity_id)
    print(f"最新状态: {latest.state_type} - 进度: {latest.progress}%")

    # 模拟未来状态
    future_time = now + timedelta(days=30)
    simulated = await state_service.simulate_state(db, entity_id, future_time)
    print(f"模拟状态(30天后): {simulated}")

    print("✓ 状态服务测试通过")


async def test_event_service(db):
    """测试事件服务"""
    print("\n=== 测试事件服务 ===")

    now = datetime.now()

    # 创建事件
    event = await event_service.create(
        db=db,
        event_type="weather",
        start_time=now,
        station_range="K0+000～K1+000",
        start_station="K0+000",
        end_station="K1+000",
        description="测试天气事件",
        impact_level="medium"
    )
    print(f"创建事件: {event.event_type} - {event.description}")

    # 查询事件
    events = await event_service.list_all(db, limit=10)
    print(f"查询事件: 共{len(events)}条")

    # 影响分析
    analysis = await event_service.get_impact_analysis(db)
    print(f"影响分析: {analysis}")

    print("✓ 事件服务测试通过")


async def test_query_api(db):
    """测试查询API"""
    print("\n=== 测试查询API ===")

    # 创建测试实体和状态
    entity = await entity_service.create(
        db=db,
        entity_type="bridge",
        name="测试桥梁",
        start_station="K0+500",
        end_station="K0+600",
        lateral_offset=0,
        elevation_base=105.0,
        width=26.0,
        height=10.0
    )

    now = datetime.now()
    await state_service.create(
        db=db,
        entity_id=entity.id,
        timestamp=now,
        state_type="structure",
        progress=75.0,
        quality_status="qualified"
    )

    # 实时查询
    entities_at_location = await entity_service.query_by_station(db, "K0+550")
    print(f"位置K0+550查询: 共{len(entities_at_location)}个实体")

    # 获取当前状态
    current_states = await state_service.get_current_states(db)
    print(f"当前状态查询: 共{len(current_states)}条")

    # 清理测试数据
    await entity_service.delete(db, entity.id)

    print("✓ 查询API测试通过")


async def main():
    """主测试函数"""
    print("=" * 50)
    print("NeuralSite API 测试")
    print("=" * 50)

    # 测试空间服务（不需要数据库）
    await test_space_service()

    # 创建数据库会话
    async with AsyncSessionLocal() as db:
        try:
            # 测试实体CRUD
            entity_id = await test_entity_crud(db)

            # 测试状态服务
            await test_state_service(db, entity_id)

            # 测试事件服务
            await test_event_service(db)

            # 测试查询API
            await test_query_api(db)

            # 提交所有更改
            await db.commit()

        except Exception as e:
            print(f"\n✗ 测试失败: {e}")
            await db.rollback()
            import traceback
            traceback.print_exc()
            return False

    print("\n" + "=" * 50)
    print("所有测试通过！✓")
    print("=" * 50)
    return True


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
