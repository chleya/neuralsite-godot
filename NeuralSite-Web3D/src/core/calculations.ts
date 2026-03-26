// Engineering Calculations - 几何计算和工程量统计
import type { AnyNode, RoadNode, BridgeNode } from './schema';
import { parseStation, formatStation } from './schema';

// ============ 几何计算 ============

export interface StationRange {
  start: number; // 米
  end: number;
}

export interface GeometryParams {
  width: number;
  height?: number;
  thickness?: number;
  length: number;
}

// 道路工程量计算
export interface RoadQuantities {
  length: number; // 长度 m
  area: number; // 面积 m²
  excavationVolume: number; // 土方量 m³
  subgradeVolume: number; // 路基体积 m³
  pavementVolume: number; // 路面体积 m³
  asphaltWeight: number; // 沥青用量 吨
  formworkArea: number; // 模板面积 m²
}

export function calculateRoadQuantities(
  stationRange: StationRange,
  width: number,
  options: {
    pavementThickness?: number; // 路面厚度 m
    subgradeHeight?: number; // 路基高度 m
    asphaltDensity?: number; // 沥青密度 t/m³
  } = {}
): RoadQuantities {
  const length = stationRange.end - stationRange.start;
  const area = length * width;
  
  const {
    pavementThickness = 0.2, // 默认20cm
    subgradeHeight = 2.0, // 默认2m
    asphaltDensity = 2.4, // 沥青混凝土密度 2.4 t/m³
  } = options;

  // 土方量（假设边坡1:1.5）
  const excavationVolume = area * subgradeHeight * 1.2; // 简单估算
  
  // 路基体积
  const subgradeVolume = area * subgradeHeight;
  
  // 路面体积
  const pavementVolume = area * pavementThickness;
  
  // 沥青用量
  const asphaltWeight = pavementVolume * asphaltDensity;
  
  // 模板面积（两侧）
  const formworkArea = length * 2 * subgradeHeight;

  return {
    length,
    area,
    excavationVolume: Math.round(excavationVolume * 100) / 100,
    subgradeVolume: Math.round(subgradeVolume * 100) / 100,
    pavementVolume: Math.round(pavementVolume * 100) / 100,
    asphaltWeight: Math.round(asphaltWeight * 100) / 100,
    formworkArea: Math.round(formworkArea * 100) / 100,
  };
}

// 桥梁工程量计算
export interface BridgeQuantities {
  length: number; // 桥梁长度 m
  deckArea: number; // 桥面面积 m²
  concreteVolume: number; // 混凝土用量 m³
  deckConcrete: number; // 桥面板混凝土
  pierConcrete: number; // 墩柱混凝土
  pileConcrete: number; // 桩基混凝土
  beamConcrete: number; // 梁混凝土
  rebarWeight: number; // 钢筋用量 吨
  deckRebar: number; // 桥面板钢筋
  pierRebar: number; // 墩柱钢筋
  pileRebar: number; // 桩基钢筋
  beamRebar: number; // 梁钢筋
}

export function calculateBridgeQuantities(
  stationRange: StationRange,
  width: number,
  options: {
    spanCount?: number;
    spanLength?: number;
    deckThickness?: number;
    pierHeight?: number;
    pierDiameter?: number;
    pileLength?: number;
    pileDiameter?: number;
    rebarRatio?: number; // 含钢率 kg/m³
  } = {}
): BridgeQuantities {
  const length = stationRange.end - stationRange.start;
  const deckArea = length * width;
  
  const {
    spanCount = 3,
    deckThickness = 1.5,
    pierHeight = 10,
    pierDiameter = 2,
    pileLength = 30,
    pileDiameter = 1.5,
    rebarRatio = 120, // 默认含钢率 120 kg/m³
  } = options;

  // 桥面板混凝土
  const deckConcrete = deckArea * deckThickness;
  
  // 墩柱混凝土（每跨2个墩柱）
  const pierVolume = Math.PI * Math.pow(pierDiameter / 2, 2) * pierHeight;
  const pierConcrete = pierVolume * spanCount * 2;
  
  // 桩基混凝土（每墩2根桩）
  const pileVolume = Math.PI * Math.pow(pileDiameter / 2, 2) * pileLength;
  const pileConcrete = pileVolume * spanCount * 2 * 2;
  
  // 梁混凝土（每跨一片梁）
  const beamVolume = length * width * 0.8; // 简化估算
  const beamConcrete = beamVolume * spanCount;

  // 总混凝土
  const concreteVolume = deckConcrete + pierConcrete + pileConcrete + beamConcrete;

  // 钢筋用量
  const deckRebar = deckConcrete * rebarRatio;
  const pierRebar = pierConcrete * rebarRatio;
  const pileRebar = pileConcrete * rebarRatio * 1.2; // 桩基含钢率稍高
  const beamRebar = beamConcrete * rebarRatio;
  const rebarWeight = deckRebar + pierRebar + pileRebar + beamRebar;

  return {
    length,
    deckArea: Math.round(deckArea * 100) / 100,
    concreteVolume: Math.round(concreteVolume * 100) / 100,
    deckConcrete: Math.round(deckConcrete * 100) / 100,
    pierConcrete: Math.round(pierConcrete * 100) / 100,
    pileConcrete: Math.round(pileConcrete * 100) / 100,
    beamConcrete: Math.round(beamConcrete * 100) / 100,
    rebarWeight: Math.round(rebarWeight / 1000 * 100) / 100, // 转换为吨
    deckRebar: Math.round(deckRebar / 1000 * 100) / 100,
    pierRebar: Math.round(pierRebar / 1000 * 100) / 100,
    pileRebar: Math.round(pileRebar / 1000 * 100) / 100,
    beamRebar: Math.round(beamRebar / 1000 * 100) / 100,
  };
}

// ============ 工程量统计汇总 ============

export interface QuantitiesSummary {
  totalLength: number;
  totalArea: number;
  totalConcrete: number;
  totalRebar: number;
  totalEarthwork: number;
  totalAsphalt: number;
  byType: Record<string, {
    count: number;
    length?: number;
    area?: number;
    concrete?: number;
    rebar?: number;
  }>;
}

export function calculateQuantitiesSummary(nodes: Record<string, AnyNode>): QuantitiesSummary {
  const summary: QuantitiesSummary = {
    totalLength: 0,
    totalArea: 0,
    totalConcrete: 0,
    totalRebar: 0,
    totalEarthwork: 0,
    totalAsphalt: 0,
    byType: {},
  };

  for (const node of Object.values(nodes)) {
    const type = node.type;
    
    if (!summary.byType[type]) {
      summary.byType[type] = { count: 0 };
    }
    summary.byType[type].count++;

    if ('stationRange' in node) {
      const range: StationRange = {
        start: node.stationRange.start.value,
        end: node.stationRange.end.value,
      };
      const width = node.width || 12;
      const length = range.end - range.start;

      if (type === 'road') {
        const qty = calculateRoadQuantities(range, width);
        summary.totalLength += length;
        summary.totalArea += qty.area;
        summary.totalEarthwork += qty.excavationVolume;
        summary.totalAsphalt += qty.asphaltWeight;
        
        summary.byType[type].length = (summary.byType[type].length || 0) + length;
        summary.byType[type].area = (summary.byType[type].area || 0) + qty.area;
      } else if (type === 'bridge') {
        const qty = calculateBridgeQuantities(range, width);
        summary.totalLength += length;
        summary.totalArea += qty.deckArea;
        summary.totalConcrete += qty.concreteVolume;
        summary.totalRebar += qty.rebarWeight;
        
        summary.byType[type].length = (summary.byType[type].length || 0) + length;
        summary.byType[type].area = (summary.byType[type].area || 0) + qty.deckArea;
        summary.byType[type].concrete = (summary.byType[type].concrete || 0) + qty.concreteVolume;
        summary.byType[type].rebar = (summary.byType[type].rebar || 0) + qty.rebarWeight;
      }
    }
  }

  // 四舍五入
  summary.totalLength = Math.round(summary.totalLength * 100) / 100;
  summary.totalArea = Math.round(summary.totalArea * 100) / 100;
  summary.totalConcrete = Math.round(summary.totalConcrete * 100) / 100;
  summary.totalRebar = Math.round(summary.totalRebar * 100) / 100;
  summary.totalEarthwork = Math.round(summary.totalEarthwork * 100) / 100;
  summary.totalAsphalt = Math.round(summary.totalAsphalt * 100) / 100;

  return summary;
}

// ============ 距离和面积计算 ============

export function calculateDistance2D(
  p1: { x: number; z: number },
  p2: { x: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function calculateDistance3D(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function calculatePolygonArea(points: Array<{ x: number; z: number }>): number {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].z;
    area -= points[j].x * points[i].z;
  }
  return Math.abs(area / 2);
}
