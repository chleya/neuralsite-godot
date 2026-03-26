// App - Main application with full 4D construction visualization
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { Scene3D } from './viewer';
import { useSceneStore } from './core';
import { AppHeader, EntityHeader, EntityList, AddEntityModal, TimelineBar } from './components/ui';
import { PropertyPanel } from './components/ui/PropertyPanel';
import { CreatePanel } from './components/ui/CreatePanel';
import { ImportPanel } from './components/ui/ImportPanel';
import { ResourceInputPanel } from './components/ui/ResourceInputPanel';
import { ToastContainer } from './components/ui/Toast';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { LoginModal } from './components/ui/LoginModal';
import { isAuthenticated } from './core/api';

const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const GanttChart = lazy(() => import('./components/gantt/GanttChart').then(m => ({ default: m.GanttChart })));
const QuantityPanel = lazy(() => import('./components/quantity/QuantityPanel').then(m => ({ default: m.QuantityPanel })));

type ViewMode = '3d' | 'gantt' | 'quantity' | 'dashboard';

function App() {
  const loadDefaultScene = useSceneStore((s) => s.loadDefaultScene);
  const loadFromAPI = useSceneStore((s) => s.loadFromAPI);
  const currentDay = useSceneStore((s) => s.currentDay);
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const isLoading = useSceneStore((s) => s.isLoading);
  const apiConnected = useSceneStore((s) => s.apiConnected);
  const checkApiConnection = useSceneStore((s) => s.checkApiConnection);
  const setCurrentDay = useSceneStore((s) => s.setCurrentDay);
  const totalDays = useSceneStore((s) => s.totalDays);
  const play = useSceneStore((s) => s.play);
  const pause = useSceneStore((s) => s.pause);
  const clearSelection = useSceneStore((s) => s.clearSelection);
  const selection = useSceneStore((s) => s.selection);

  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('neuralsite_token');
    setLoggedIn(!!token);
    setAuthChecked(true);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setLoggedIn(true);
  }, []);

  if (!authChecked) {
    return (
      <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!loggedIn) {
    return <LoginModal onSuccess={handleLoginSuccess} />;
  }

  useEffect(() => {
    loadDefaultScene();
    checkApiConnection();
  }, [loadDefaultScene, checkApiConnection]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextDay = currentDay + 1;
      if (nextDay > totalDays) {
        setCurrentDay(0);
        pause();
      } else {
        setCurrentDay(nextDay);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentDay, totalDays, setCurrentDay, pause]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case '0':
          setViewMode('dashboard');
          break;
        case '1':
          setViewMode('3d');
          break;
        case '2':
          setViewMode('gantt');
          break;
        case '3':
          setViewMode('quantity');
          break;
        case 'c':
        case 'C':
          const event = new CustomEvent('toggle-create-panel');
          window.dispatchEvent(event);
          break;
        case ' ':
          e.preventDefault();
          if (isPlaying) pause();
          else play();
          break;
        case 'Escape':
          clearSelection();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentDay, totalDays, clearSelection, play, pause, setCurrentDay]);

  const handleLoadDemo = useCallback(() => {
    loadDefaultScene();
  }, [loadDefaultScene]);

  const handleLoadAPI = useCallback(() => {
    loadFromAPI();
  }, [loadFromAPI]);

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col">
      <OfflineBanner />
      <AppHeader
        apiConnected={apiConnected}
        isLoading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onLoadDemo={handleLoadDemo}
        onLoadAPI={handleLoadAPI}
      />

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Main view area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'dashboard' && (
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">加载中...</div>}>
                <Dashboard 
                  onOpenCreate={() => setShowCreatePanel(true)}
                  onOpenImport={() => setShowImportPanel(true)}
                  onOpenProgress={() => setShowResourcePanel(true)}
                  onOpenReport={() => setShowResourcePanel(true)}
                />
              </Suspense>
            </div>
          )}
          
          {viewMode === '3d' && (
            <div className="flex-1">
              <Scene3D />
            </div>
          )}
          
          {viewMode === 'gantt' && (
            <div className="flex-1">
              <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">加载中...</div>}>
                <GanttChart />
              </Suspense>
            </div>
          )}
          
          {viewMode === 'quantity' && (
            <div className="flex-1 overflow-y-auto">
              <Suspense fallback={<div className="flex-1 flex items-center justify-center text-white">加载中...</div>}>
                <QuantityPanel />
              </Suspense>
            </div>
          )}
          
          {viewMode !== '3d' && (
            <div className="absolute bottom-20 right-4 w-64 h-48 rounded-lg overflow-hidden border border-gray-600 shadow-xl opacity-80 hover:opacity-100 transition-opacity">
              <Scene3D />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-72 lg:w-96 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
          {selection.nodeId ? (
            <>
              <EntityHeader nodeId={selection.nodeId} />
              <PropertyPanel nodeId={selection.nodeId} />
            </>
          ) : (
            <EntityList onAddEntity={() => setShowAddModal(true)} />
          )}
        </aside>
      </main>

      {/* Timeline bar */}
      <TimelineBar />
      
      {/* Create Panel */}
      <CreatePanel />
      
      {/* Import Panel */}
      <ImportPanel />
      
      {/* Resource Input Panel */}
      <ResourceInputPanel />
      
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Add Entity Modal */}
      {showAddModal && <AddEntityModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default App;
