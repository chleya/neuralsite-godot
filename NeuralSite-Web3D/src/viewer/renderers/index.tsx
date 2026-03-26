// Entity Renderers - Improved with proper geometry generation
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore, sceneRegistry, isRoad, isBridge, isVehicle, isSafetySign, isFence, generateRoadMesh, generateBridgeMesh, generateVehicleMesh } from '../../core';
import { useEditorStore } from '../../core/editor-store';
import type { AnyNode, RoadNode, BridgeNode, VehicleNode, SafetySignNode, FenceNode } from '../../core';

// Entity mesh with registry
interface EntityMeshProps {
  node: AnyNode;
  geometry: THREE.BufferGeometry;
  material?: THREE.Material;
  position?: THREE.Vector3;
  onClick?: (event?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => void;
}

function EntityMesh({ node, geometry, material, position, onClick }: EntityMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const sceneSelection = useSceneStore((s) => s.selection);
  const editorSelectedIds = useEditorStore((s) => s.selectedIds);
  const setHoveredId = useEditorStore((s) => s.setHoveredId);
  const isSelected = sceneSelection.nodeId === node.id || editorSelectedIds.includes(node.id);

  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      sceneRegistry.register(node.id, node.type, mesh);
    }
    return () => {
      if (mesh) {
        sceneRegistry.unregister(node.id, mesh);
      }
    };
  }, [node.id, node.type]);

  const finalMaterial = useMemo(() => {
    if (isSelected) {
      return new THREE.MeshStandardMaterial({
        color: '#ffff00',
        emissive: '#ffff00',
        emissiveIntensity: 0.5,
      });
    }
    if (material instanceof THREE.Material) return material;
    return new THREE.MeshStandardMaterial({ color: '#888888' });
  }, [isSelected, material]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.({ metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
  }, [onClick]);

  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setHoveredId(node.id);
  }, [node.id, setHoveredId]);

  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    setHoveredId(null);
  }, [setHoveredId]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={finalMaterial}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// Road Renderer - Enhanced
export function RoadRenderer({ node }: { node: RoadNode }) {
  const setSelection = useSceneStore((s) => s.setSelection);
  const clearDirty = useSceneStore((s) => s.clearDirty);

  const { geometry, position } = useMemo(() => {
    return generateRoadMesh(node);
  }, [node]);

  const material = useMemo(() => {
    const colors: Record<string, string> = {
      planning: '#4A90D9',
      clearing: '#FFB84D',
      earthwork: '#996633',
      pavement: '#666666',
      finishing: '#66CC66',
      completed: '#333333',
    };
    return new THREE.MeshStandardMaterial({
      color: colors[node.phase] || '#888888',
      transparent: node.phase === 'planning',
      opacity: node.phase === 'planning' ? 0.5 : 1,
    });
  }, [node.phase]);

  useFrame(() => {
    if (useSceneStore.getState().dirtyNodes.has(node.id)) {
      clearDirty(node.id);
    }
  });

  const handleClick = useCallback((e?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
    const editorSelectedIds = useEditorStore.getState().selectedIds;
    const addToSelection = useEditorStore.getState().addToSelection;
    const removeFromSelection = useEditorStore.getState().removeFromSelection;
    const setSelectedIds = useEditorStore.getState().setSelectedIds;

    const isMultiSelect = e?.metaKey || e?.ctrlKey;

    if (isMultiSelect) {
      if (editorSelectedIds.includes(node.id)) {
        removeFromSelection(node.id);
      } else {
        addToSelection(node.id);
      }
    } else {
      setSelectedIds([node.id]);
    }

    setSelection({
      nodeId: node.id,
      nodeType: node.type,
      position: { x: position.x, y: position.y, z: position.z },
    });
  }, [node.id, node.type, position, setSelection]);

  const labelPosition = useMemo(() => {
    return new THREE.Vector3(position.x, position.y + 3, position.z);
  }, [position]);

  return (
    <group>
      <EntityMesh
        node={node}
        geometry={geometry}
        material={material}
        position={position}
        onClick={handleClick}
      />
      <Html position={labelPosition} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
          <div className="font-medium">{node.name}</div>
          <div className="text-gray-400">{node.phase} | {(node.progress * 100).toFixed(0)}%</div>
        </div>
      </Html>
    </group>
  );
}

// Bridge Renderer - Enhanced with full structure
export function BridgeRenderer({ node }: { node: BridgeNode }) {
  const setSelection = useSceneStore((s) => s.setSelection);
  const clearDirty = useSceneStore((s) => s.clearDirty);

  const bridgeData = useMemo(() => {
    return generateBridgeMesh(node);
  }, [node]);

  const deckMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: node.phase === 'completed' ? '#555555' : '#777777',
      transparent: node.phase !== 'completed',
      opacity: node.phase === 'completed' ? 1 : 0.7,
    });
  }, [node.phase]);

  useFrame(() => {
    if (useSceneStore.getState().dirtyNodes.has(node.id)) {
      clearDirty(node.id);
    }
  });

  const handleClick = useCallback((e?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
    const editorSelectedIds = useEditorStore.getState().selectedIds;
    const addToSelection = useEditorStore.getState().addToSelection;
    const removeFromSelection = useEditorStore.getState().removeFromSelection;
    const setSelectedIds = useEditorStore.getState().setSelectedIds;

    const isMultiSelect = e?.metaKey || e?.ctrlKey;

    if (isMultiSelect) {
      if (editorSelectedIds.includes(node.id)) {
        removeFromSelection(node.id);
      } else {
        addToSelection(node.id);
      }
    } else {
      setSelectedIds([node.id]);
    }

    setSelection({
      nodeId: node.id,
      nodeType: node.type,
      position: { x: bridgeData.deck.position.x, y: bridgeData.deck.position.y, z: 0 },
    });
  }, [node.id, node.type, bridgeData.deck.position, setSelection]);

  const labelPosition = useMemo(() => {
    return new THREE.Vector3(bridgeData.deck.position.x, bridgeData.deck.position.y + 5, 0);
  }, [bridgeData.deck.position]);

  return (
    <group>
      {/* Deck */}
      <EntityMesh
        node={node}
        geometry={bridgeData.deck.geometry}
        material={deckMaterial}
        position={bridgeData.deck.position}
        onClick={handleClick}
      />
      
      {/* Piles */}
      {bridgeData.piles.map((pile, i) => (
        <mesh
          key={`pile-${i}`}
          geometry={pile.geometry}
          material={pile.material}
          position={pile.position}
          castShadow
        />
      ))}
      
      {/* Piers */}
      {bridgeData.piers.map((pier, i) => (
        <mesh
          key={`pier-${i}`}
          geometry={pier.geometry}
          material={pier.material}
          position={pier.position}
          castShadow
        />
      ))}
      
      {/* Beams */}
      {bridgeData.beams.map((beam, i) => (
        <mesh
          key={`beam-${i}`}
          geometry={beam.geometry}
          material={beam.material}
          position={beam.position}
          castShadow
        />
      ))}
      
      {/* Label */}
      <Html position={labelPosition} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
          <div className="font-medium">{node.name}</div>
          <div className="text-gray-400">
            {node.phase} | {(node.progress * 100).toFixed(0)}% | {node.spanCount}跨
          </div>
        </div>
      </Html>
    </group>
  );
}

// Vehicle Renderer
export function VehicleRenderer({ node }: { node: VehicleNode }) {
  const { geometry, material } = useMemo(() => {
    return generateVehicleMesh(node);
  }, [node]);

  const handleClick = useCallback((e?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
    const editorSelectedIds = useEditorStore.getState().selectedIds;
    const addToSelection = useEditorStore.getState().addToSelection;
    const removeFromSelection = useEditorStore.getState().removeFromSelection;
    const setSelectedIds = useEditorStore.getState().setSelectedIds;

    const isMultiSelect = e?.metaKey || e?.ctrlKey;

    if (isMultiSelect) {
      if (editorSelectedIds.includes(node.id)) {
        removeFromSelection(node.id);
      } else {
        addToSelection(node.id);
      }
    } else {
      setSelectedIds([node.id]);
    }

    useSceneStore.getState().setSelection({
      nodeId: node.id,
      nodeType: node.type,
      position: node.position,
    });
  }, [node.id, node.type, node.position]);

  return (
    <EntityMesh
      node={node}
      geometry={geometry}
      material={material}
      position={new THREE.Vector3(node.position.x, node.position.y, node.position.z)}
      onClick={handleClick}
    />
  );
}

// Safety Sign Renderer
export function SafetySignRenderer({ node }: { node: SafetySignNode }) {
  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(0.8, 1.5, 0.1);
  }, []);

  const material = useMemo(() => {
    const colors: Record<string, string> = {
      warning: '#FFCC00',
      danger: '#FF3333',
      info: '#33CC33',
    };
    return new THREE.MeshStandardMaterial({
      color: colors[node.signType] || '#33CC33',
      emissive: colors[node.signType] === 'danger' ? '#FF0000' : '#000000',
      emissiveIntensity: 0.2,
    });
  }, [node.signType]);

  const handleClick = useCallback((e?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
    const editorSelectedIds = useEditorStore.getState().selectedIds;
    const addToSelection = useEditorStore.getState().addToSelection;
    const removeFromSelection = useEditorStore.getState().removeFromSelection;
    const setSelectedIds = useEditorStore.getState().setSelectedIds;

    const isMultiSelect = e?.metaKey || e?.ctrlKey;

    if (isMultiSelect) {
      if (editorSelectedIds.includes(node.id)) {
        removeFromSelection(node.id);
      } else {
        addToSelection(node.id);
      }
    } else {
      setSelectedIds([node.id]);
    }

    useSceneStore.getState().setSelection({
      nodeId: node.id,
      nodeType: node.type,
      position: node.position,
    });
  }, [node.id, node.type, node.position]);

  return (
    <group position={[node.position.x, node.position.y, node.position.z]}>
      <EntityMesh
        node={node}
        geometry={geometry}
        material={material}
        onClick={handleClick}
      />
      <Html position={[0, 1.5, 0]} center>
        <div className="bg-black/80 text-white px-1 py-0.5 rounded text-xs whitespace-nowrap pointer-events-none">
          {node.name}
        </div>
      </Html>
    </group>
  );
}

// Fence Renderer
export function FenceRenderer({ node }: { node: FenceNode }) {
  const { startPosition: start, endPosition: end, height } = node;
  
  const length = useMemo(() => {
    return Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.y - start.y, 2) +
      Math.pow(end.z - start.z, 2)
    );
  }, [start, end]);

  const midpoint = useMemo(() => {
    return new THREE.Vector3(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2 + height / 2,
      (start.z + end.z) / 2
    );
  }, [start, end, height]);

  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(length, height, 0.1);
  }, [length, height]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({ color: '#FF6600' });
  }, []);

  const handleClick = useCallback((e?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
    const editorSelectedIds = useEditorStore.getState().selectedIds;
    const addToSelection = useEditorStore.getState().addToSelection;
    const removeFromSelection = useEditorStore.getState().removeFromSelection;
    const setSelectedIds = useEditorStore.getState().setSelectedIds;

    const isMultiSelect = e?.metaKey || e?.ctrlKey;

    if (isMultiSelect) {
      if (editorSelectedIds.includes(node.id)) {
        removeFromSelection(node.id);
      } else {
        addToSelection(node.id);
      }
    } else {
      setSelectedIds([node.id]);
    }

    useSceneStore.getState().setSelection({
      nodeId: node.id,
      nodeType: node.type,
      position: midpoint,
    });
  }, [node.id, node.type, midpoint]);

  return (
    <EntityMesh
      node={node}
      geometry={geometry}
      material={material}
      position={midpoint}
      onClick={handleClick}
    />
  );
}

// Node Renderer - dispatches to correct renderer
export function NodeRenderer({ nodeId }: { nodeId: string }) {
  const node = useSceneStore((s) => s.nodes[nodeId]);
  const layerVisibility = useSceneStore((s) => s.layerVisibility);
  const clearDirty = useSceneStore((s) => s.clearDirty);

  useFrame(() => {
    if (node && useSceneStore.getState().dirtyNodes.has(nodeId)) {
      clearDirty(nodeId);
    }
  });

  if (!node) return null;
  
  const isVisible = layerVisibility[node.type] ?? true;
  if (!isVisible) return null;

  if (isRoad(node)) return <RoadRenderer node={node} />;
  if (isBridge(node)) return <BridgeRenderer node={node} />;
  if (isVehicle(node)) return <VehicleRenderer node={node} />;
  if (isSafetySign(node)) return <SafetySignRenderer node={node} />;
  if (isFence(node)) return <FenceRenderer node={node} />;

  return null;
}
