// SearchBar - Search and filter for entities
import { useState, useCallback, useEffect } from 'react';
import { useSceneStore } from '../../core/store';

interface SearchFilters {
  query: string;
  entityType: string | null;
  phase: string | null;
  status: string | null;
}

interface EntityListProps {
  onSelectEntity: (entityId: string) => void;
  selectedEntityId: string | null;
}

export function SearchBar() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    entityType: null,
    phase: null,
    status: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          placeholder="搜索名称或桩号..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded ${
            showFilters ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          筛选
        </button>
      </div>

      {/* Filter Chips */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-700/50 rounded-lg">
          {/* Entity Type */}
          <select
            value={filters.entityType || ''}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value || null })}
            className="px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
          >
            <option value="">全类型</option>
            <option value="road">道路</option>
            <option value="bridge">桥梁</option>
            <option value="culvert">涵洞</option>
            <option value="fence">围挡</option>
            <option value="sign">标识</option>
          </select>

          {/* Phase */}
          <select
            value={filters.phase || ''}
            onChange={(e) => setFilters({ ...filters, phase: e.target.value || null })}
            className="px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
          >
            <option value="">全阶段</option>
            <option value="planning">规划</option>
            <option value="clearing">清表</option>
            <option value="earthwork">土方</option>
            <option value="pavement">路面</option>
            <option value="finishing">收尾</option>
            <option value="completed">完成</option>
          </select>

          {/* Status */}
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
            className="px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
          >
            <option value="">全状态</option>
            <option value="active">进行中</option>
            <option value="paused">暂停</option>
            <option value="completed">已完成</option>
          </select>

          {/* Clear */}
          <button
            onClick={() => setFilters({ query: '', entityType: null, phase: null, status: null })}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm"
          >
            清除
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.entityType || filters.phase || filters.status) && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>筛选:</span>
          {filters.entityType && (
            <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded">
              {filters.entityType}
            </span>
          )}
          {filters.phase && (
            <span className="px-2 py-0.5 bg-green-900/50 text-green-300 rounded">
              {filters.phase}
            </span>
          )}
          {filters.status && (
            <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">
              {filters.status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for filtered entities
export function useFilteredEntities() {
  const nodes = useSceneStore((s) => s.nodes);
  const rootNodeIds = useSceneStore((s) => s.rootNodeIds);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    entityType: null,
    phase: null,
    status: null,
  });

  const filteredIds = useCallback(() => {
    return rootNodeIds.filter((id) => {
      const node = nodes[id];
      if (!node) return false;

      // Query filter
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchName = node.name?.toLowerCase().includes(q);
        const matchStation = 'stationRange' in node && (
          node.stationRange?.start?.formatted?.toLowerCase().includes(q) ||
          node.stationRange?.end?.formatted?.toLowerCase().includes(q)
        );
        if (!matchName && !matchStation) return false;
      }

      // Entity type filter
      if (filters.entityType && node.type !== filters.entityType) return false;

      // Phase filter
      if (filters.phase && node.phase !== filters.phase) return false;

      return true;
    });
  }, [rootNodeIds, nodes, filters]);

  return { filters, setFilters, filteredIds: filteredIds() };
}
