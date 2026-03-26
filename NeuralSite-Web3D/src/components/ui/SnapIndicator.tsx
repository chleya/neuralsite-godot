import { useMemo } from 'react';
import { useEditorStore } from '../../core/editor-store';
import { useSceneStore } from '../../core/store';
import * as THREE from 'three';

interface SnapPoint {
  type: 'endpoint' | 'midpoint' | 'center' | 'perpendicular';
  position: { x: number; y: number; z: number };
  distance: number;
  entityId: string;
}

export function useSnap() {
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  
  const getSnapPoint = (): SnapPoint | null => {
    if (!snapEnabled) return null;
    
    const cursor = new THREE.Vector3(cursorPosition.x, cursorPosition.y, cursorPosition.z);
    let closest: SnapPoint | null = null;
    let minDist = 2.0;
    
    rootNodeIds.forEach((id) => {
      const node = nodes[id];
      if (!node || !('stationRange' in node)) return;
      
      const station = node.stationRange;
      const lateral = (node as any).lateral_offset || 0;
      
      const startX = station.start.value / 1000;
      const endX = station.end.value / 1000;
      
      const startPoint = new THREE.Vector3(startX, 0, lateral);
      const endPoint = new THREE.Vector3(endX, 0, lateral);
      const midPoint = new THREE.Vector3((startX + endX) / 2, 0, lateral);
      
      const endpoints = [
        { type: 'endpoint' as const, point: startPoint, entityId: id },
        { type: 'endpoint' as const, point: endPoint, entityId: id },
      ];
      
      const midpoints = [
        { type: 'midpoint' as const, point: midPoint, entityId: id },
      ];
      
      const allPoints = [...endpoints, ...midpoints];
      
      allPoints.forEach(({ type, point, entityId }) => {
        const dist = cursor.distanceTo(point);
        if (dist < minDist) {
          minDist = dist;
          closest = {
            type,
            position: { x: point.x, y: point.y, z: point.z },
            distance: dist,
            entityId,
          };
        }
      });
      
      const dx = endPoint.x - startPoint.x;
      const dz = endPoint.z - startPoint.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      
      if (len > 0.1) {
        const t = Math.max(0, Math.min(1, ((cursor.x - startPoint.x) * dx + (cursor.z - startPoint.z) * dz) / (len * len)));
        const projX = startPoint.x + t * dx;
        const projZ = startPoint.z + t * dz;
        const perpDist = Math.sqrt((cursor.x - projX) ** 2 + (cursor.z - projZ) ** 2);
        
        if (perpDist < minDist && perpDist < 1.0) {
          minDist = perpDist;
          closest = {
            type: 'perpendicular',
            position: { x: projX, y: 0, z: projZ },
            distance: perpDist,
            entityId: id,
          };
        }
      }
    });
    
    return closest;
  };
  
  return { getSnapPoint, snapEnabled };
}

export function SnapIndicator() {
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const { getSnapPoint, snapEnabled } = useSnap();
  
  const snapPoint = getSnapPoint();
  
  if (!snapEnabled || !snapPoint) return null;
  
  const snapColor = {
    endpoint: '#ffff00',
    midpoint: '#00ffff',
    center: '#ff00ff',
    perpendicular: '#00ff00',
  }[snapPoint.type];
  
  return (
    <group position={[snapPoint.position.x, 0.5, snapPoint.position.z]}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={snapColor} transparent opacity={0.8} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.4, 0.6, 16]} />
        <meshBasicMaterial color={snapColor} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
