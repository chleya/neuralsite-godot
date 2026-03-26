import { useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../../core/store';
import { useEditorStore } from '../../core/editor-store';

interface GripPoint {
  entityId: string;
  type: 'start' | 'end';
  position: THREE.Vector3;
}

export function GripHandler() {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const nodes = useSceneStore((s) => s.nodes);
  const updateNode = useSceneStore((s) => s.updateNode);
  const [dragging, setDragging] = useState<GripPoint | null>(null);

  const handleGripDrag = useCallback((point: GripPoint, worldPos: THREE.Vector3) => {
    if (!point) return;

    const node = nodes[point.entityId];
    if (!node || !('stationRange' in node)) return;

    const stationValue = worldPos.x * 1000;
    const newStation = `K${Math.floor(Math.abs(stationValue) / 1000)}+${String(Math.floor(Math.abs(stationValue) % 1000)).padStart(3, '0')}`;

    if (point.type === 'start') {
      updateNode(point.entityId, {
        stationRange: {
          start: { value: Math.abs(stationValue), formatted: newStation },
          end: node.stationRange.end,
        },
      } as any);
    } else {
      updateNode(point.entityId, {
        stationRange: {
          start: node.stationRange.start,
          end: { value: Math.abs(stationValue), formatted: newStation },
        },
      } as any);
    }
  }, [nodes, updateNode]);

  const getGripPoints = (): GripPoint[] => {
    if (selectedIds.length !== 1) return [];

    const node = nodes[selectedIds[0]];
    if (!node || !('stationRange' in node)) return [];

    const startX = node.stationRange.start.value / 1000;
    const endX = node.stationRange.end.value / 1000;
    const lateral = (node as any).lateral_offset || 0;

    return [
      {
        entityId: node.id,
        type: 'start',
        position: new THREE.Vector3(startX, 0.5, lateral),
      },
      {
        entityId: node.id,
        type: 'end',
        position: new THREE.Vector3(endX, 0.5, lateral),
      },
    ];
  };

  const grips = getGripPoints();

  if (grips.length === 0) return null;

  return (
    <group>
      {grips.map((grip) => (
        <GripSphere
          key={`${grip.entityId}-${grip.type}`}
          grip={grip}
          onDrag={handleGripDrag}
          isDragging={dragging?.entityId === grip.entityId && dragging?.type === grip.type}
          onDragStart={() => setDragging(grip)}
          onDragEnd={() => setDragging(null)}
        />
      ))}
    </group>
  );
}

interface GripSphereProps {
  grip: GripPoint;
  onDrag: (point: GripPoint, worldPos: THREE.Vector3) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function GripSphere({ grip, onDrag, isDragging, onDragStart, onDragEnd }: GripSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionRef = useRef(new THREE.Vector3());

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    onDragStart();

    const handleMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, camera);
      if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectionRef.current)) {
        onDrag(grip, intersectionRef.current);
      }
    };

    const handleUp = () => {
      onDragEnd();
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [grip, onDrag, onDragStart, onDragEnd, camera, gl]);

  const color = isDragging ? '#3b82f6' : hovered ? '#60a5fa' : '#ffffff';
  const scale = isDragging ? 1.5 : hovered ? 1.3 : 1.0;

  return (
    <group position={[grip.position.x, grip.position.y, grip.position.z]}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={[scale, scale, scale]}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
