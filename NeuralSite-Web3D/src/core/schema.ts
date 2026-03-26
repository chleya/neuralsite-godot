// Schema - Entity type definitions
import { z } from 'zod';

// ============ Construction phases ============
export const ConstructionPhaseSchema = z.enum([
  'planning',
  'clearing',
  'earthwork',
  'pavement',
  'finishing',
  'completed',
]);

export type ConstructionPhase = z.infer<typeof ConstructionPhaseSchema>;

// ============ Entity types (from backend database) ============
export const EntityTypeSchema = z.enum([
  'roadbed',
  'bridge',
  'culvert',
  'tunnel',
  'slope',
  'drainage',
  'pavement',
  'foundation',
  'auxiliary',
]);

export type EntityType = z.infer<typeof EntityTypeSchema>;

// ============ Station (桩号) ============
export const StationSchema = z.object({
  value: z.number(),
  formatted: z.string(),
});

export type Station = z.infer<typeof StationSchema>;

// Station range
export const StationRangeSchema = z.object({
  start: StationSchema,
  end: StationSchema,
});

export type StationRange = z.infer<typeof StationRangeSchema>;

// Station parsing utilities
export function parseStation(station: string): { km: number; m: number; value: number } {
  const match = station.match(/K(\d+)\+(\d+(?:\.\d+)?)/);
  if (match) {
    const km = parseInt(match[1], 10);
    const m = parseFloat(match[2]);
    return { km, m, value: km * 1000 + m };
  }
  return { km: 0, m: 0, value: 0 };
}

export function formatStation(value: number, decimals: number = 3): string {
  const km = Math.floor(value / 1000);
  const m = value % 1000;
  const mStr = decimals > 0 ? m.toFixed(decimals).replace(/\.?0+$/, '') : Math.round(m).toString();
  return `K${km}+${mStr.padStart(3, '0')}`;
}

export function validateStation(station: string): { valid: boolean; error?: string } {
  if (!station || typeof station !== 'string') {
    return { valid: false, error: '桩号不能为空' };
  }
  
  const match = station.match(/^K(\d+)\+(\d+(?:\.\d+)?)$/);
  if (!match) {
    return { valid: false, error: '格式应为 K0+000 或 K0+000.5' };
  }
  
  const km = parseInt(match[1], 10);
  const m = parseFloat(match[2]);
  
  if (km < 0) {
    return { valid: false, error: '公里数不能为负' };
  }
  
  if (m < 0 || m >= 1000) {
    return { valid: false, error: '米数必须在 0-999.999 之间' };
  }
  
  return { valid: true };
}

export function stationToFloat(station: string): number {
  const parsed = parseStation(station);
  return parsed.value;
}

// ============ Base entity ============
export const BaseNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  visible: z.boolean().default(true),
});

export type BaseNode = z.infer<typeof BaseNodeSchema>;

// ============ Road entity ============
export const RoadNodeSchema = BaseNodeSchema.extend({
  type: z.literal('road'),
  stationRange: StationRangeSchema,
  lanes: z.number().default(4),
  width: z.number().default(12),
  elevation: z.number().default(0),
  elevation_base: z.number().nullable().optional(),
  lateral_offset: z.number().default(0),
  phase: ConstructionPhaseSchema.default('planning'),
  progress: z.number().min(0).max(1).default(0),
});

export type RoadNode = z.infer<typeof RoadNodeSchema>;

// ============ Bridge parts ============
export const PileSchema = z.object({
  id: z.string(),
  station: z.number(),
  lateral: z.number(),
  height: z.number(),
  diameter: z.number(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const PierSchema = z.object({
  id: z.string(),
  station: z.number(),
  lateral: z.number(),
  height: z.number(),
  diameter: z.number(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const BeamSchema = z.object({
  id: z.string(),
  startStation: z.number(),
  endStation: z.number(),
  height: z.number(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const DeckSchema = z.object({
  thickness: z.number(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

// ============ Bridge entity ============
export const BridgeNodeSchema = BaseNodeSchema.extend({
  type: z.literal('bridge'),
  stationRange: StationRangeSchema,
  width: z.number().default(12),
  spanCount: z.number().default(2),
  spanLength: z.number().default(40),
  elevation_base: z.number().nullable().optional(),
  lateral_offset: z.number().default(0),
  phase: ConstructionPhaseSchema.default('planning'),
  progress: z.number().min(0).max(1).default(0),
  parts: z.object({
    piles: z.array(PileSchema).default([]),
    piers: z.array(PierSchema).default([]),
    beams: z.array(BeamSchema).default([]),
    deck: DeckSchema.default({ thickness: 0.5, status: 'pending' }),
  }),
});

export type BridgeNode = z.infer<typeof BridgeNodeSchema>;

// ============ Vehicle entity ============
export const VehicleNodeSchema = BaseNodeSchema.extend({
  type: z.literal('vehicle'),
  vehicleType: z.enum(['excavator', 'bulldozer', 'crane', 'dump_truck', 'paver', 'roller']),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  pathStation: z.number().default(0),
  phase: ConstructionPhaseSchema.default('earthwork'),
  progress: z.number().min(0).max(1).default(0),
});

export type VehicleNode = z.infer<typeof VehicleNodeSchema>;

// ============ Safety sign entity ============
export const SafetySignNodeSchema = BaseNodeSchema.extend({
  type: z.literal('safety_sign'),
  signType: z.enum(['warning', 'danger', 'info']),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  station: z.number(),
  phase: ConstructionPhaseSchema.default('completed'),
  progress: z.number().min(0).max(1).default(1),
});

export type SafetySignNode = z.infer<typeof SafetySignNodeSchema>;

// ============ Fence entity ============
export const FenceNodeSchema = BaseNodeSchema.extend({
  type: z.literal('fence'),
  startPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  endPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  height: z.number().default(1.5),
  phase: ConstructionPhaseSchema.default('completed'),
  progress: z.number().min(0).max(1).default(1),
});

export type FenceNode = z.infer<typeof FenceNodeSchema>;

// ============ Union type for all nodes ============
export const AnyNodeSchema = z.discriminatedUnion('type', [
  RoadNodeSchema,
  BridgeNodeSchema,
  VehicleNodeSchema,
  SafetySignNodeSchema,
  FenceNodeSchema,
]);

export type AnyNode = z.infer<typeof AnyNodeSchema>;

// ============ AnyNodeId type ============
export type AnyNodeId = string;

// ============ Node type guard functions ============
export function isRoad(node: AnyNode): node is RoadNode {
  return node.type === 'road';
}

export function isBridge(node: AnyNode): node is BridgeNode {
  return node.type === 'bridge';
}

export function isVehicle(node: AnyNode): node is VehicleNode {
  return node.type === 'vehicle';
}

export function isSafetySign(node: AnyNode): node is SafetySignNode {
  return node.type === 'safety_sign';
}

export function isFence(node: AnyNode): node is FenceNode {
  return node.type === 'fence';
}

// ============ Quality Status ============
export const QualityStatusSchema = z.enum([
  'pending',
  'inspecting',
  'qualified',
  'unqualified',
  'accepted',
]);

export type QualityStatus = z.infer<typeof QualityStatusSchema>;

// ============ Safety Level ============
export const SafetyLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export type SafetyLevel = z.infer<typeof SafetyLevelSchema>;

// ============ Inspection Record ============
export const InspectionRecordSchema = z.object({
  date: z.string(),
  inspector: z.string(),
  result: z.string(),
  notes: z.string().optional(),
});

export type InspectionRecord = z.infer<typeof InspectionRecordSchema>;

// ============ Safety Inspection ============
export const SafetyInspectionSchema = z.object({
  date: z.string(),
  inspector: z.string(),
  result: z.enum(['pass', 'fail', 'warning']),
  issues: z.array(z.string()).optional(),
});

export type SafetyInspection = z.infer<typeof SafetyInspectionSchema>;

// ============ Backend Entity model (matches database) ============
export const EntitySchema = z.object({
  id: z.string(),
  section_id: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(),
  entity_type: z.string(),
  code: z.string().nullable().optional(),
  name: z.string(),
  start_station: z.string(),
  end_station: z.string(),
  lateral_offset: z.number().default(0),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  lanes: z.number().nullable().optional(),
  design_elevation: z.number().nullable().optional(),
  progress: z.number().min(0).max(1).default(0),
  construction_phase: z.string().nullable().optional(),
  planned_start_date: z.string().nullable().optional(),
  planned_end_date: z.string().nullable().optional(),
  actual_start_date: z.string().nullable().optional(),
  actual_end_date: z.string().nullable().optional(),
  cost_budget: z.number().nullable().optional(),
  quality_status: z.string().default('pending'),
  safety_level: z.string().default('normal'),
  status: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  alignment_type: z.enum(['straight', 'circular', 'spiral']).default('straight'),
  curve_radius: z.number().nullable().optional(),
  curve_length: z.number().nullable().optional(),
  start_azimuth: z.number().default(0),
  vertical_type: z.enum(['level', 'grade', 'vertical_curve']).default('level'),
  start_elevation: z.number().default(0),
  end_elevation: z.number().default(0),
  vertical_curve_length: z.number().nullable().optional(),
  grade_in: z.number().default(0),
  grade_out: z.number().default(0),
  cross_section_type: z.enum(['fill', 'cut', 'mixed']).default('fill'),
  formation_width: z.number().default(12),
  side_slope_fill: z.number().default(1.5),
  side_slope_cut: z.number().default(0.75),
  pavement_thickness: z.number().default(0.5),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Entity = z.infer<typeof EntitySchema>;

// ============ Convert database Entity to scene node ============
export function getRendererType(entityType: string): string {
  switch (entityType) {
    case 'bridge':
      return 'bridge';
    case 'road':
    case 'roadbed':
    case 'pavement':
    case 'foundation':
      return 'road';
    default:
      return 'road';
  }
}

export function entityToNode(entity: Entity): AnyNode {
  const stationStart = parseStation(entity.start_station);
  const stationEnd = parseStation(entity.end_station);
  const rendererType = getRendererType(entity.entity_type);
  const phase = (entity.construction_phase as ConstructionPhase) || 'planning';
  const progress = entity.progress ?? 0;

  const baseNode = {
    id: entity.id,
    type: rendererType,
    name: entity.name,
    visible: true,
    stationRange: {
      start: { value: stationStart.value, formatted: entity.start_station },
      end: { value: stationEnd.value, formatted: entity.end_station },
    },
    width: entity.width ?? 12,
    phase,
    progress,
    elevation_base: entity.design_elevation ?? 0,
    lateral_offset: entity.lateral_offset ?? 0,
  };

  if (rendererType === 'bridge') {
    return {
      ...baseNode,
      type: 'bridge' as const,
      spanCount: 2,
      spanLength: 40,
      parts: {
        piles: [],
        piers: [],
        beams: [],
        deck: { thickness: 0.5, status: 'pending' as const },
      },
    };
  }

  // Road type
  return {
    ...baseNode,
    type: 'road' as const,
    lanes: entity.lanes ?? 4,
    elevation: entity.design_elevation ?? 0,
  };
}

// ============ Helper to generate IDs ============
export function generateId(prefix: string): string {
  const timestamp = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}`;
}

// ============ Semantic Tag System (9 Categories) ============
export const SemanticTagCategorySchema = z.enum(['structure', 'auxiliary']);
export type SemanticTagCategory = z.infer<typeof SemanticTagCategorySchema>;

export const SemanticTagSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  name_en: z.string().nullable().optional(),
  category: SemanticTagCategorySchema,
  description: z.string().nullable().optional(),
  color: z.string().default('#6b7280'),
  icon: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
  sort_order: z.number().default(0),
  created_at: z.string(),
});
export type SemanticTag = z.infer<typeof SemanticTagSchema>;

export const ENTITY_TAGS = [
  { id: 'tag_001', code: 'subgrade', name: '路基工程', name_en: 'Subgrade', category: 'structure' as const, color: '#8b5cf6', icon: 'layers' },
  { id: 'tag_002', code: 'pavement', name: '路面工程', name_en: 'Pavement', category: 'structure' as const, color: '#3b82f6', icon: 'road' },
  { id: 'tag_003', code: 'bridge', name: '桥梁工程', name_en: 'Bridge', category: 'structure' as const, color: '#06b6d4', icon: 'bridge' },
  { id: 'tag_004', code: 'culvert', name: '涵洞工程', name_en: 'Culvert', category: 'structure' as const, color: '#10b981', icon: 'arch' },
  { id: 'tag_005', code: 'tunnel', name: '隧道工程', name_en: 'Tunnel', category: 'structure' as const, color: '#f59e0b', icon: 'warehouse' },
  { id: 'tag_006', code: 'drainage', name: '排水工程', name_en: 'Drainage', category: 'auxiliary' as const, color: '#6366f1', icon: 'droplets' },
  { id: 'tag_007', code: 'protection', name: '防护工程', name_en: 'Protection', category: 'auxiliary' as const, color: '#ec4899', icon: 'shield' },
  { id: 'tag_008', code: 'traffic', name: '交通工程', name_en: 'Traffic', category: 'auxiliary' as const, color: '#84cc16', icon: 'triangle-alert' },
  { id: 'tag_009', code: 'auxiliary', name: '附属工程', name_en: 'Auxiliary', category: 'auxiliary' as const, color: '#f43f5e', icon: 'square' },
] as const;

// ============ Entity Version System ============
export const EntityVersionSchema = z.object({
  id: z.string(),
  entity_id: z.string(),
  version_number: z.number(),
  state_data: z.record(z.any()),
  change_description: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  created_at: z.string(),
});
export type EntityVersion = z.infer<typeof EntityVersionSchema>;
