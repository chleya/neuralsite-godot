// MoveTool - Drag-based movement with grid snapping
import { useRef, useState, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useEditorStore } from '../../core/editor-store';
import { useSceneStore, stationToX } from '../../core';

export function MoveTool() {
  const { camera, gl } = useThree();
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const rotation = useEditorStore((s) => s.rotation);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const gridSize = useEditorStore((s) => s.gridSize);
  const updateNode = useSceneStore((s) => s.updateNode);
  
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startX: number;
    startZ: number;
    originalPosition: { x: number; y: number; z: number };
    originalStationStart?: number;
  } | null>(null);
  
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const intersectionPoint = useRef(new THREE.Vector3());
  const cursorRef = useRef<string>('auto');
  
  const nodes = useSceneStore((s) => s.nodes);

  const getMouseNDC = useCallback((event: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }, [gl.domElement]);

  const snapValue = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (selectedIds.length === 0) return;

    const firstId = selectedIds[0];
    const node = nodes[firstId];
    if (!node) return;

    let startX = 0, startZ = 0;
    let originalPosition = { x: 0, y: 0, z: 0 };
    let originalStationStart: number = 0;

    if ('stationRange' in node) {
      originalStationStart = node.stationRange.start.value;
      startX = stationToX(originalStationStart);
    } else if ('position' in node) {
      originalPosition = { ...node.position };
      startX = node.position.x;
      startZ = node.position.z;
    } else {
      return;
    }

    setDragState({
      isDragging: true,
      startX: snapValue(startX),
      startZ: snapValue(startZ),
      originalPosition,
      originalStationStart,
    });

    gl.domElement.setPointerCapture(event.pointerId);
    cursorRef.current = 'grabbing';
  }, [selectedIds, nodes, gl.domElement, snapValue]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!dragState || selectedIds.length === 0) return;

    const mouse = getMouseNDC(event as unknown as MouseEvent);
    raycaster.current.setFromCamera(mouse, camera);
    raycaster.current.ray.intersectPlane(dragPlaneRef.current, intersectionPoint.current);

    const snappedX = snapValue(intersectionPoint.current.x);
    const snappedZ = snapValue(intersectionPoint.current.z);
    
    const deltaX = snappedX - dragState.startX;
    const deltaZ = snappedZ - dragState.startZ;

    for (const id of selectedIds) {
      const node = nodes[id];
      if (!node) continue;

      if ('stationRange' in node) {
        const stationDelta = Math.round(deltaX * 1000);
        const newStationStart = Math.max(0, (dragState.originalStationStart || 0) + stationDelta);
        const stationLength = node.stationRange.end.value - node.stationRange.start.value;
        const newStationEnd = newStationStart + stationLength;
        
        const formatStation = (val: number) => ({
          value: val,
          formatted: `K${Math.floor(val / 1000)}+${(val % 1000).toString().padStart(3, '0')}`,
        });

        updateNode(id, {
          stationRange: {
            start: formatStation(newStationStart),
            end: formatStation(newStationEnd),
          },
        });
      } else if ('position' in node) {
        updateNode(id, {
          position: {
            x: dragState.originalPosition.x + deltaX,
            y: dragState.originalPosition.y,
            z: dragState.originalPosition.z + deltaZ,
          },
        });
      }
    }
  }, [dragState, selectedIds, nodes, camera, getMouseNDC, snapValue, updateNode]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (!dragState) return;
    
    setDragState(null);
    gl.domElement.releasePointerCapture(event.pointerId);
    cursorRef.current = 'auto';
  }, [dragState, gl.domElement]);

  // Global event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, [gl.domElement, handlePointerDown, handlePointerMove, handlePointerUp]);

  // Rotation indicator
  if (selectedIds.length > 0 && rotation !== 0) {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[8, 8.2, 32]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
        </mesh>
        <Html position={[0, 5, 0]} center>
          <div className="bg-gray-900/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            旋转: {(rotation * 180 / Math.PI).toFixed(0)}°
          </div>
        </Html>
      </group>
    );
  }

  return null;
}
