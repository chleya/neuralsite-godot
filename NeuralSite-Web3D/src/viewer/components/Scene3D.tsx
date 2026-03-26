// Scene3D - Main 3D scene component with Canvas, lights, controls
import { Suspense, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore, useSelectedNode, isRoad, isBridge, isFence, isSafetySign } from '../../core';
import { useEditorStore } from '../../core/editor-store';
import { NodeRenderer, RoadRenderer, BridgeRenderer } from '../renderers';
import { SelectionHighlight } from '../controls/Interaction';
import { ToolManager, Toolbar, StatusBar } from '../tools/tool-manager';
import { RoadToolStatus } from '../tools/road-tool';
import { CommandLine } from '../../components/ui/CommandLine';
import { SelectionBox } from '../../components/ui/SelectionBox';
import { DirectDistanceInput } from '../../components/ui/DirectDistanceInput';
import { SnapIndicator } from '../../components/ui/SnapIndicator';
import { LayerPanel } from '../../components/ui/LayerPanel';
import { GripHandler } from '../../components/ui/GripHandler';
import { ViewModeSwitcher } from '../../components/ui/ViewModeSwitcher';
import type { RoadNode, BridgeNode, AnyNode } from '../../core';

// Cursor tracker component
function CursorTracker() {
  const { camera, gl } = useThree();
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);
  const startSelection = useEditorStore((s) => s.startSelection);
  const updateSelection = useEditorStore((s) => s.updateSelection);
  const endSelection = useEditorStore((s) => s.endSelection);
  const activeTool = useEditorStore((s) => s.activeTool);
  const setSelectedIds = useEditorStore((s) => s.setSelectedIds);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersection = new THREE.Vector3();
  
  const isSelecting = activeTool === 'select';
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  
  // THREE.js objects created once
  const raycasterRef = useRef(new THREE.Raycaster());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const canvas = gl.domElement;
    
    const getWorldPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      
      raycasterRef.current.setFromCamera(mouse, camera);
      if (raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionRef.current)) {
        return { x: intersectionRef.current.x, y: intersectionRef.current.z };
      }
      return null;
    };
    
    const updatePosition = (e: MouseEvent) => {
      const pos = getWorldPos(e.clientX, e.clientY);
      if (pos) {
        setCursorPosition({ x: intersectionRef.current.x, y: 0, z: intersectionRef.current.z });
        
        if (isDraggingRef.current && isSelecting) {
          updateSelection(pos);
        }
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      
      if (isSelecting) {
        const pos = getWorldPos(e.clientX, e.clientY);
        if (pos) {
          dragStartRef.current = pos;
          isDraggingRef.current = false;
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      
      if (isSelecting && dragStartRef.current) {
        const pos = getWorldPos(e.clientX, e.clientY);
        
        if (pos) {
          const dx = Math.abs(pos.x - dragStartRef.current.x);
          const dy = Math.abs(pos.y - dragStartRef.current.y);
          
          if (dx > 10 || dy > 10) {
            startSelection(dragStartRef.current);
            updateSelection(pos);
            endSelection();
          }
        }
        
        dragStartRef.current = null;
        isDraggingRef.current = false;
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      
      const pos = getWorldPos(e.clientX, e.clientY);
      if (!pos) return;
      
      const dx = Math.abs(pos.x - dragStartRef.current.x);
      const dy = Math.abs(pos.y - dragStartRef.current.y);
      
      if (dx > 5 || dy > 5) {
        isDraggingRef.current = true;
      }
    };
    
    canvas.addEventListener('mousemove', updatePosition);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousemove', updatePosition);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera, gl.domElement, setCursorPosition, isSelecting, startSelection, updateSelection, endSelection]);
  
  return null;
}

// Preview Renderer - renders temporary entity preview with wireframe
function PreviewRenderer() {
  const previewEntity = useSceneStore((s) => s.previewEntity);
  
  const previewMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#00ff88',
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });
  }, []);
  
  const previewRoadMesh = useMemo(() => {
    if (!previewEntity || !isRoad(previewEntity)) return null;
    const road = previewEntity as RoadNode;
    const { stationRange, width } = road;
    
    const startX = stationRange.start.value / 1000;
    const endX = stationRange.end.value / 1000;
    const length = endX - startX;
    const centerX = (startX + endX) / 2;
    const lateral = road.lateral_offset || 0;
    
    const geometry = new THREE.BoxGeometry(length, 0.5, width);
    return { 
      geometry, 
      position: new THREE.Vector3(centerX, 0.25, lateral) as THREE.Vector3,
      labelPos: new THREE.Vector3(centerX, 2, lateral) as THREE.Vector3,
    };
  }, [previewEntity]);
  
  const previewBridgeMesh = useMemo(() => {
    if (!previewEntity || !isBridge(previewEntity)) return null;
    const bridge = previewEntity as BridgeNode;
    const { stationRange, width } = bridge;
    
    const startX = stationRange.start.value / 1000;
    const endX = stationRange.end.value / 1000;
    const length = endX - startX;
    const centerX = (startX + endX) / 2;
    const lateral = bridge.lateral_offset || 0;
    
    const geometry = new THREE.BoxGeometry(length, 1, width);
    return { 
      geometry, 
      position: new THREE.Vector3(centerX, 1, lateral) as THREE.Vector3,
      labelPos: new THREE.Vector3(centerX, 3, lateral) as THREE.Vector3,
    };
  }, [previewEntity]);
  
  const previewFenceMesh = useMemo(() => {
    if (!previewEntity || !isFence(previewEntity)) return null;
    const fence = previewEntity as any;
    const startX = fence.startPosition?.x || 0;
    const startZ = fence.startPosition?.z || 0;
    const endX = fence.endPosition?.x || startX + 10;
    const endZ = fence.endPosition?.z || startZ;
    const height = fence.height || 1.5;
    
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2));
    const centerX = (startX + endX) / 2;
    const centerZ = (startZ + endZ) / 2;
    const angle = Math.atan2(endZ - startZ, endX - startX);
    
    return { 
      length, 
      height,
      centerX, 
      centerZ,
      angle,
      labelPos: new THREE.Vector3(centerX, height + 1, centerZ) as THREE.Vector3,
    };
  }, [previewEntity]);
  
  const previewSignMesh = useMemo(() => {
    if (!previewEntity || !isSafetySign(previewEntity)) return null;
    const sign = previewEntity as any;
    const posX = sign.position?.x || 0;
    const posZ = sign.position?.z || 0;
    
    return { 
      position: new THREE.Vector3(posX, 1, posZ) as THREE.Vector3,
      labelPos: new THREE.Vector3(posX, 2.5, posZ) as THREE.Vector3,
    };
  }, [previewEntity]);
  
  if (!previewEntity) return null;
  
  if (isRoad(previewEntity) && previewRoadMesh) {
    return (
      <group>
        <mesh geometry={previewRoadMesh.geometry} material={previewMaterial} position={previewRoadMesh.position} />
        <Html position={previewRoadMesh.labelPos} center>
          <div className="bg-green-900/90 text-white px-3 py-1 rounded text-sm font-medium border border-green-500 pointer-events-none">
            预览: {previewEntity.name}
          </div>
        </Html>
      </group>
    );
  }
  
  if (isBridge(previewEntity) && previewBridgeMesh) {
    return (
      <group>
        <mesh geometry={previewBridgeMesh.geometry} material={previewMaterial} position={previewBridgeMesh.position} />
        <Html position={previewBridgeMesh.labelPos} center>
          <div className="bg-green-900/90 text-white px-3 py-1 rounded text-sm font-medium border border-green-500 pointer-events-none">
            预览: {previewEntity.name}
          </div>
        </Html>
      </group>
    );
  }
  
  if (isFence(previewEntity) && previewFenceMesh) {
    return (
      <group position={[previewFenceMesh.centerX, 0, previewFenceMesh.centerZ]} rotation={[0, -previewFenceMesh.angle, 0]}>
        <mesh material={previewMaterial}>
          <boxGeometry args={[previewFenceMesh.length, previewFenceMesh.height, 0.1]} />
        </mesh>
        <Html position={[0, previewFenceMesh.height + 1, 0]} center rotation={[0, previewFenceMesh.angle, 0]}>
          <div className="bg-green-900/90 text-white px-3 py-1 rounded text-sm font-medium border border-green-500 pointer-events-none">
            预览: {previewEntity.name}
          </div>
        </Html>
      </group>
    );
  }
  
  if (isSafetySign(previewEntity) && previewSignMesh) {
    return (
      <group>
        <mesh material={previewMaterial} position={previewSignMesh.position}>
          <boxGeometry args={[0.8, 1.5, 0.1]} />
        </mesh>
        <Html position={previewSignMesh.labelPos} center>
          <div className="bg-green-900/90 text-white px-3 py-1 rounded text-sm font-medium border border-green-500 pointer-events-none">
            预览: {previewEntity.name}
          </div>
        </Html>
      </group>
    );
  }
  
  return null;
}

// Camera Controls with pan/zoom
function CameraControls() {
  const { camera } = useThree();
  const viewMode = useEditorStore((s) => s.viewMode);
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    if (!camera || !controlsRef.current) return;
    
    switch (viewMode) {
      case 'top':
        camera.position.set(0, 200, 0);
        camera.lookAt(0, 0, 0);
        break;
      case 'side':
        camera.position.set(200, 50, 0);
        camera.lookAt(0, 0, 0);
        break;
      case '3d':
      default:
        camera.position.set(50, 50, 50);
        camera.lookAt(0, 0, 0);
        break;
    }
    
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [viewMode, camera]);
  
  const handleFocus = useCallback((target: THREE.Vector3, distance: number = 20) => {
    if (!controlsRef.current || !camera) return;
    
    const offset = camera.position.clone().sub(controlsRef.current.target).normalize().multiplyScalar(distance);
    controlsRef.current.target.copy(target);
    controlsRef.current.update();
    
    const newPos = target.clone().add(offset);
    camera.position.copy(newPos);
  }, [camera]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'f' || e.key === 'F') {
        const selection = useSceneStore.getState().selection;
        if (selection.nodeId) {
          const node = useSceneStore.getState().nodes[selection.nodeId];
          if (node) {
            let pos = new THREE.Vector3(0, 0, 0);
            if ('stationRange' in node) {
              const startX = (node.stationRange.start.value / 1000);
              const endX = (node.stationRange.end.value / 1000);
              pos.set((startX + endX) / 2, 1, (node as any).lateral_offset || 0);
            } else if ('position' in node) {
              pos.set(node.position.x, node.position.y, node.position.z);
            }
            handleFocus(pos, 15);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFocus]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={500}
      maxPolarAngle={viewMode === 'top' ? 0.01 : Math.PI / 2 - 0.1}
      enablePan={true}
      panSpeed={1.5}
      zoomSpeed={1.2}
    />
  );
}

// Hover Tooltip
function HoverTooltip() {
  const [hoveredInfo, setHoveredInfo] = useState<{ node: AnyNode; position: THREE.Vector3 } | null>(null);
  const hoveredId = useEditorStore((s) => s.hoveredId);
  const nodes = useSceneStore((s) => s.nodes);
  const visibleNodes = useEditorStore((s) => s.visibleNodes);
  
  useEffect(() => {
    if (hoveredId && nodes[hoveredId]) {
      const node = nodes[hoveredId];
      const type = node.type;
      if (visibleNodes[type] !== false) {
        let pos = new THREE.Vector3(0, 2, 0);
        if ('stationRange' in node) {
          const startX = (node.stationRange.start.value / 1000);
          const endX = (node.stationRange.end.value / 1000);
          pos.set((startX + endX) / 2, 3, (node as any).lateral_offset || 0);
        } else if ('position' in node) {
          pos.set(node.position.x, node.position.y + 2, node.position.z);
        }
        setHoveredInfo({ node, position: pos });
      }
    } else {
      setHoveredInfo(null);
    }
  }, [hoveredId, nodes, visibleNodes]);
  
  if (!hoveredInfo) return null;
  
  const { node, position } = hoveredInfo;
  
  return (
    <Html position={position} center distanceFactor={30}>
      <div className="bg-gray-900/95 backdrop-blur text-white px-3 py-2 rounded-lg shadow-xl border border-gray-600 pointer-events-none whitespace-nowrap">
        <div className="font-semibold text-sm">{node.name}</div>
        <div className="text-xs text-gray-400 mt-1">
          <span className="text-gray-300">{node.type}</span>
          {'stationRange' in node && (
            <span className="ml-2">
              {node.stationRange.start.formatted} ~ {node.stationRange.end.formatted}
            </span>
          )}
        </div>
        <div className="text-xs mt-1">
          <span className={`px-1.5 py-0.5 rounded ${
            node.phase === 'completed' ? 'bg-green-600' :
            node.phase === 'pavement' ? 'bg-gray-500' :
            node.phase === 'earthwork' ? 'bg-amber-700' :
            'bg-blue-500'
          }`}>
            {node.phase}
          </span>
          <span className="ml-2 text-cyan-400">{(node.progress * 100).toFixed(0)}%</span>
        </div>
      </div>
    </Html>
  );
}

// Terrain with conditional grid
function Terrain() {
  const showGrid = useEditorStore((s) => s.showGrid);
  const gridSize = useEditorStore((s) => s.gridSize);
  
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#3a5a40" />
      </mesh>
      
      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[1000, 1000]}
          cellSize={gridSize}
          cellThickness={0.5}
          cellColor="#555555"
          sectionSize={gridSize * 10}
          sectionThickness={1}
          sectionColor="#888888"
          fadeDistance={500}
          infiniteGrid
        />
      )}
    </>
  );
}

// Lights
function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
    </>
  );
}

// Selection info panel
function SelectionInfo() {
  const selectedNode = useSelectedNode();
  const selectedIds = useEditorStore((s) => s.selectedIds);
  
  if (!selectedNode) return null;

  return (
    <Html position={[10, 5, 10]}>
      <div className="bg-gray-900/95 backdrop-blur rounded-lg shadow-xl p-4 border border-gray-700 w-64">
        <h3 className="font-bold text-white mb-2">{selectedNode.name}</h3>
        <div className="space-y-1 text-sm text-gray-300">
          <p><span className="text-gray-500">类型:</span> {selectedNode.type}</p>
          <p><span className="text-gray-500">阶段:</span> {selectedNode.phase}</p>
          <p><span className="text-gray-500">进度:</span> {(selectedNode.progress * 100).toFixed(1)}%</p>
          {'stationRange' in selectedNode && (
            <p>
              <span className="text-gray-500">桩号:</span>{' '}
              {(selectedNode as RoadNode | BridgeNode).stationRange?.start?.formatted} - {(selectedNode as RoadNode | BridgeNode).stationRange?.end?.formatted}
            </p>
          )}
          {selectedIds.length > 1 && (
            <p className="text-blue-400">+ {selectedIds.length - 1} 个更多选中</p>
          )}
        </div>
      </div>
    </Html>
  );
}

// Scene content
function SceneContent() {
  const rootEntityIds = useSceneStore((s) => s.rootNodeIds);
  const clearSelection = useSceneStore((s) => s.clearSelection);
  const setSelection = useSceneStore((s) => s.setSelection);

  const handleBackgroundClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <>
      <Lights />
      <Terrain />
      <CameraControls />
      <CursorTracker />
      
      {/* Invisible background for deselection */}
      <mesh
        position={[0, -0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
        visible={false}
      >
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Render all entities */}
      {rootEntityIds.map((id) => (
        <NodeRenderer key={id} nodeId={id} />
      ))}
      
      {/* Render preview entity */}
      <PreviewRenderer />
      
      <SelectionHighlight />
      <HoverTooltip />
      <SnapIndicator />
      <GripHandler />
      <ToolManager />
      <SelectionInfo />
    </>
  );
}

// Main Scene3D component
interface Scene3DProps {
  className?: string;
}

export function Scene3D({ className }: Scene3DProps) {
  return (
    <div className={`w-full h-full ${className || ''}`}>
      <Toolbar />
      <LayerPanel />
      <StatusBar />
      <RoadToolStatus />
      <ViewModeSwitcher />
      <CommandLine />
      <SelectionBox />
      <DirectDistanceInput />
      <Canvas
        shadows
        camera={{ position: [50, 50, 50], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <color attach="background" args={['#1a1a2e']} />
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <div className="text-white font-medium">加载 3D 场景...</div>
            </div>
          </div>
        }>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Scene3D;
