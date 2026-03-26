// Systems - Geometry generation and processing
import * as THREE from 'three';
import type { AnyNode, RoadNode, BridgeNode, VehicleNode, ConstructionPhase } from './schema';

// Phase colors
export const PHASE_COLORS: Record<ConstructionPhase, string> = {
  planning: '#4A90D9',
  clearing: '#FFB84D',
  earthwork: '#996633',
  pavement: '#666666',
  finishing: '#66CC66',
  completed: '#333333',
};

export function getPhaseColor(phase: ConstructionPhase): string {
  return PHASE_COLORS[phase] || '#888888';
}

// Station (mm) to world X coordinate
export function stationToX(station: number): number {
  return station / 1000;
}

// World X to station
export function xToStation(x: number): number {
  return Math.round(x * 1000);
}

// Generate road geometry based on progress
export function generateRoadMesh(node: RoadNode): { geometry: THREE.BufferGeometry; position: THREE.Vector3 } {
  const startX = stationToX(node.stationRange.start.value);
  const endX = stationToX(node.stationRange.end.value);
  const length = endX - startX;
  const centerX = (startX + endX) / 2;
  
  // Height based on progress (builds up over time)
  const buildHeight = node.phase === 'planning' ? 0 :
                      node.phase === 'clearing' ? 0.05 :
                      node.phase === 'earthwork' ? 0.1 + node.progress * 0.2 :
                      node.phase === 'pavement' ? 0.3 + node.progress * 0.1 :
                      node.phase === 'finishing' ? 0.4 + node.progress * 0.1 :
                      0.5;
  
  const geometry = new THREE.BoxGeometry(length, buildHeight, node.width);
  
  return {
    geometry,
    position: new THREE.Vector3(centerX, buildHeight / 2, 0),
  };
}

// Generate bridge geometry with piles, piers, beams, deck
export function generateBridgeMesh(node: BridgeNode): {
  deck: { geometry: THREE.BufferGeometry; position: THREE.Vector3 };
  piles: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; material: THREE.Material }>;
  piers: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; material: THREE.Material }>;
  beams: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; material: THREE.Material }>;
} {
  const startX = stationToX(node.stationRange.start.value);
  const endX = stationToX(node.stationRange.end.value);
  const length = endX - startX;
  const centerX = (startX + endX) / 2;
  const deckHeight = node.parts.deck.thickness;
  
  // Deck geometry
  const deckGeometry = new THREE.BoxGeometry(length, deckHeight, node.width);
  const deckPosition = new THREE.Vector3(centerX, deckHeight / 2, 0);
  
  // Generate piles
  const piles = node.parts.piles.map((pile) => {
    const pileX = stationToX(pile.station);
    const pileY = pile.height / 2;
    const pileGeometry = new THREE.CylinderGeometry(pile.diameter / 2, pile.diameter / 2, pile.height, 12);
    const material = new THREE.MeshStandardMaterial({
      color: pile.status === 'completed' ? '#555555' : pile.status === 'in_progress' ? '#888866' : '#333333',
      transparent: pile.status !== 'completed',
      opacity: pile.status === 'completed' ? 1 : 0.7,
    });
    
    return {
      geometry: pileGeometry,
      position: new THREE.Vector3(pileX, pileY, pile.lateral),
      material,
    };
  });
  
  // Generate piers (above piles)
  const piers = node.parts.piers.map((pier) => {
    const pierX = stationToX(pier.station);
    const pierY = pier.height / 2;
    const pierGeometry = new THREE.CylinderGeometry(pier.diameter / 2, pier.diameter / 2, pier.height, 12);
    const material = new THREE.MeshStandardMaterial({
      color: pier.status === 'completed' ? '#666666' : pier.status === 'in_progress' ? '#888866' : '#444444',
      transparent: pier.status !== 'completed',
      opacity: pier.status === 'completed' ? 1 : 0.7,
    });
    
    return {
      geometry: pierGeometry,
      position: new THREE.Vector3(pierX, pierY, pier.lateral),
      material,
    };
  });
  
  // Generate beams
  const beams: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; material: THREE.Material }> = [];
  for (let i = 0; i < node.spanCount; i++) {
    const beamStartX = startX + (length / node.spanCount) * i + (length / node.spanCount) / 2;
    const beamGeometry = new THREE.BoxGeometry(length / node.spanCount, 0.8, node.width * 0.8);
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: node.parts.beams[i]?.status === 'completed' ? '#777777' : '#444444',
      transparent: node.parts.beams[i]?.status !== 'completed',
      opacity: node.parts.beams[i]?.status === 'completed' ? 1 : 0.6,
    });
    
    beams.push({
      geometry: beamGeometry,
      position: new THREE.Vector3(beamStartX, deckHeight + 0.4, 0),
      material: beamMaterial,
    });
  }
  
  return { deck: { geometry: deckGeometry, position: deckPosition }, piles, piers, beams };
}

// Generate vehicle geometry
export function generateVehicleMesh(node: VehicleNode): { geometry: THREE.BufferGeometry; material: THREE.Material } {
  const colors: Record<string, string> = {
    excavator: '#FFCC00',
    bulldozer: '#CCBB00',
    crane: '#FFAA00',
    dump_truck: '#FF6600',
    paver: '#666666',
    roller: '#444444',
  };
  
  const color = colors[node.vehicleType] || '#888888';
  
  // Different shapes for different vehicles
  let geometry: THREE.BufferGeometry;
  switch (node.vehicleType) {
    case 'excavator':
      geometry = new THREE.BoxGeometry(3, 2, 1.5);
      break;
    case 'crane':
      geometry = new THREE.BoxGeometry(4, 2, 1.5);
      break;
    case 'dump_truck':
      geometry = new THREE.BoxGeometry(5, 2, 2);
      break;
    default:
      geometry = new THREE.BoxGeometry(3, 1.5, 1.5);
  }
  
  const material = new THREE.MeshStandardMaterial({ color });
  
  return { geometry, material };
}

// Calculate world position from station
export function getWorldPosition(station: number, lateral: number = 0, elevation: number = 0): THREE.Vector3 {
  return new THREE.Vector3(stationToX(station), elevation, lateral);
}

// Interpolate progress at a given day
export function getProgressAtDay(node: AnyNode, currentDay: number, totalDays: number): number {
  if (!('progress' in node)) return 0;
  void currentDay; void totalDays;
  const progress = node.progress;
  return progress;
}

// Generate terrain height at position
export function getTerrainHeight(x: number, z: number): number {
  void x; void z;
  return 0;
}
