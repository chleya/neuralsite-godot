// QuantityPanel - Engineering quantity statistics
import { useMemo } from 'react';
import { useSceneStore } from '../../core/store';
import type { AnyNode, RoadNode, BridgeNode } from '../../core/schema';

interface QuantityCardProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  icon: string;
  color: string;
}

function QuantityCard({ label, value, unit, icon, color }: QuantityCardProps) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold text-white">
          {value !== null && value !== undefined ? value.toFixed(2) : '—'}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
    </div>
  );
}

export function QuantityPanel() {
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  
  const totals = useMemo(() => {
    let concreteVolume = 0;
    let rebarWeight = 0;
    let earthworkVolume = 0;
    let asphaltWeight = 0;
    let formworkArea = 0;
    let totalLength = 0;
    
    rootNodeIds.forEach((id) => {
      const node = nodes[id];
      if (!node) return;
      
      // Get quantities from node properties or calculate
      if ('stationRange' in node) {
        const roadNode = node as RoadNode | BridgeNode;
        const length = (roadNode.stationRange.end.value - roadNode.stationRange.start.value) / 1000; // km
        const width = node.width || 12;
        
        totalLength += length;
        
        if (node.type === 'bridge') {
          // Bridge quantities
          concreteVolume += length * width * 0.8 * 2; // approximate deck volume
          rebarWeight += length * width * 80; // approximate rebar
          formworkArea += length * width * 2;
        } else {
          // Road quantities
          earthworkVolume += length * width * 1.5; // approximate cut/fill
          asphaltWeight += length * width * 0.1 * 2.4; // asphalt density
          concreteVolume += length * width * 0.3; // base course
        }
      }
    });
    
    return {
      concreteVolume,
      rebarWeight,
      earthworkVolume,
      asphaltWeight,
      formworkArea,
      totalLength,
    };
  }, [nodes, rootNodeIds]);
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">工程量统计</h3>
        <span className="text-xs text-gray-500">自动计算</span>
      </div>
      
      {/* Summary */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <div className="text-sm text-gray-400">总长度</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{totals.totalLength.toFixed(3)}</span>
          <span className="text-gray-400">km</span>
        </div>
      </div>
      
      {/* Quantity cards grid */}
      <div className="grid grid-cols-2 gap-3">
        <QuantityCard
          label="混凝土"
          value={totals.concreteVolume}
          unit="m³"
          icon="🧱"
          color="blue"
        />
        <QuantityCard
          label="钢筋"
          value={totals.rebarWeight}
          unit="吨"
          icon="🔩"
          color="gray"
        />
        <QuantityCard
          label="土方"
          value={totals.earthworkVolume}
          unit="m³"
          icon="⛰️"
          color="yellow"
        />
        <QuantityCard
          label="沥青"
          value={totals.asphaltWeight}
          unit="吨"
          icon="🛢️"
          color="red"
        />
      </div>
      
      {/* Additional info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 模板面积: {totals.formworkArea.toFixed(2)} m²</p>
        <p>• 数据基于当前实体自动汇总</p>
      </div>
    </div>
  );
}

// Compact quantity summary for sidebar
export function CompactQuantitySummary() {
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  
  const summary = useMemo(() => {
    let totalLength = 0;
    let entityCount = rootNodeIds.length;
    
    rootNodeIds.forEach((id) => {
      const node = nodes[id];
      if (!node || !('stationRange' in node)) return;
      
      const roadNode = node as RoadNode | BridgeNode;
      const length = (roadNode.stationRange.end.value - roadNode.stationRange.start.value) / 1000;
      totalLength += length;
    });
    
    return { totalLength, entityCount };
  }, [nodes, rootNodeIds]);
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <div>
        <span className="text-gray-500">实体: </span>
        <span className="text-white">{summary.entityCount}</span>
      </div>
      <div>
        <span className="text-gray-500">总长: </span>
        <span className="text-white">{summary.totalLength.toFixed(2)} km</span>
      </div>
    </div>
  );
}