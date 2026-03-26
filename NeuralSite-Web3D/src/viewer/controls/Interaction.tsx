// Interaction - Transform controls for dragging entities
import { useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, useSelectedNode, stationToX } from '../../core';
import type { RoadNode, VehicleNode } from '../../core';

interface DragState {
  isDragging: boolean;
  startX: number;
  startZ: number;
  originalStationStart: number;
}

export function TransformControls() {
  const selectedNode = useSelectedNode();
  const updateNode = useSceneStore((s) => s.updateNode);
  const { camera, gl } = useThree();
  
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const intersectionPoint = useRef(new THREE.Vector3());

  const getMouseNDC = useCallback((event: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }, [gl.domElement]);

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!selectedNode) return;
    event.stopPropagation();

    const node = selectedNode;
    let startX = 0, startZ = 0;

    if ('stationRange' in node) {
      startX = stationToX(node.stationRange.start.value);
    } else if ('position' in node) {
      startX = node.position.x;
      startZ = node.position.z;
    }

    setDragState({
      isDragging: true,
      startX,
      startZ,
      originalStationStart: 'stationRange' in node ? node.stationRange.start.value : 0,
    });

    gl.domElement.setPointerCapture(event.pointerId);
  }, [selectedNode, gl.domElement]);

  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!dragState || !selectedNode) return;
    event.stopPropagation();

    const mouse = getMouseNDC(event.nativeEvent as MouseEvent);
    raycaster.current.setFromCamera(mouse, camera);
    
    raycaster.current.ray.intersectPlane(dragPlaneRef.current, intersectionPoint.current);
    
    if (!intersectionPoint.current) return;

    const deltaX = intersectionPoint.current.x - dragState.startX;
    const deltaZ = intersectionPoint.current.z - dragState.startZ;

    if ('stationRange' in selectedNode) {
      const stationDelta = Math.round(deltaX * 1000);
      const originalStart = dragState.originalStationStart;
      const newStationStart = Math.max(0, originalStart + stationDelta);
      const stationLength = selectedNode.stationRange.end.value - selectedNode.stationRange.start.value;
      const newStationEnd = newStationStart + stationLength;
      
      const formatStation = (val: number) => ({
        value: val,
        formatted: `K${Math.floor(val / 1000)}+${(val % 1000).toString().padStart(3, '0')}`,
      });

      updateNode(selectedNode.id, {
        stationRange: {
          start: formatStation(newStationStart),
          end: formatStation(newStationEnd),
        },
      } as Partial<RoadNode>);
    } else if ('position' in selectedNode) {
      const vehicleNode = selectedNode as VehicleNode;
      updateNode(selectedNode.id, {
        position: {
          x: vehicleNode.position.x + deltaX,
          y: vehicleNode.position.y,
          z: vehicleNode.position.z + deltaZ,
        },
      } as Partial<VehicleNode>);
      
      setDragState(prev => prev ? { ...prev, startX: intersectionPoint.current.x, startZ: intersectionPoint.current.z } : null);
    }
  }, [dragState, selectedNode, camera, getMouseNDC, updateNode]);

  const handlePointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!dragState) return;
    event.stopPropagation();
    setDragState(null);
    gl.domElement.releasePointerCapture(event.pointerId);
  }, [dragState, gl.domElement]);

  if (!selectedNode) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.005, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      visible={false}
    >
      <planeGeometry args={[2000, 2000]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export function SelectionHighlight() {
  const selectedNode = useSelectedNode();
  
  if (!selectedNode) return null;

  const position = new THREE.Vector3(0, 0, 0);
  let size = 2;

  if ('stationRange' in selectedNode) {
    const startX = stationToX(selectedNode.stationRange.start.value);
    const endX = stationToX(selectedNode.stationRange.end.value);
    position.set((startX + endX) / 2, 1, 0);
    size = Math.max(endX - startX, 4);
  } else if ('position' in selectedNode) {
    position.set(selectedNode.position.x, selectedNode.position.y + 1, selectedNode.position.z);
    size = 3;
  }

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[size * 1.2, 2, size * 1.2]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
