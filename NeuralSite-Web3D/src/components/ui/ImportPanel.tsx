// ImportPanel - CSV 批量导入组件
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../../core/api';

interface ImportResult {
  import_id: string;
  filename: string;
  success_count: number;
  failed_count: number;
  errors: Array<{ row: number; data: Record<string, string>; error: string }>;
}

export function ImportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [templateCSV, setTemplateCSV] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'i' && e.altKey) {
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('只支持 CSV 文件');
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await apiService.importEntitiesCSV(file);
      setResult({
        import_id: '',
        filename: file.name,
        success_count: importResult.imported || 0,
        failed_count: 0,
        errors: [],
      });
    } catch (error) {
      alert('导入失败: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `entity_type,name,start_station,end_station,width,lanes,progress,construction_phase,planned_start_date,planned_end_date,cost_budget,quality_status,safety_level,notes
road,K1+000-K1+500段,K1+000.000,K1+500.000,12,4,0,planning,2026-04-01,2026-10-01,5000000,pending,normal,
bridge,K2+000桥,K2+000.000,K2+080.000,12,2,0,planning,2026-05-01,2026-12-01,8000000,pending,normal,
road,K3+000-K4+000段,K3+000.000,K4+000.000,12,4,0,planning,2026-06-01,2027-01-01,10000000,pending,normal,`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neuralsite_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <span className="text-lg">📥</span>
        <span>批量导入</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">批量导入实体</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Instructions */}
          <div className="bg-gray-700/50 rounded-lg p-3">
            <h3 className="text-white font-medium mb-2">导入说明</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 支持 CSV 格式文件</li>
              <li>• 可拖拽文件到下方区域</li>
              <li>• 或点击选择文件</li>
              <li>• 支持字段: entity_type, name, start_station, end_station, width, lanes, progress, construction_phase, planned_start_date, planned_end_date, cost_budget, quality_status, safety_level, notes</li>
            </ul>
          </div>

          {/* Template Download */}
          <button
            onClick={downloadTemplate}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            下载导入模板 CSV
          </button>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-green-500 bg-green-900/20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {isImporting ? (
              <div className="text-white">导入中...</div>
            ) : (
              <>
                <div className="text-4xl mb-2">📁</div>
                <div className="text-white">
                  拖拽 CSV 文件到这里，或点击选择
                </div>
              </>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-lg p-4 ${result.failed_count > 0 ? 'bg-red-900/20' : 'bg-green-900/20'}`}>
              <h3 className="text-white font-medium mb-2">导入结果</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>文件名: {result.filename}</p>
                <p className="text-green-400">成功: {result.success_count} 个</p>
                {result.failed_count > 0 && (
                  <p className="text-red-400">失败: {result.failed_count} 个</p>
                )}
              </div>
              
              {result.errors.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto">
                  <h4 className="text-red-400 text-sm mb-1">错误详情:</h4>
                  {result.errors.slice(0, 5).map((err, i) => (
                    <div key={i} className="text-xs text-red-300">
                      行 {err.row}: {err.error}
                    </div>
                  ))}
                  {result.errors.length > 5 && (
                    <div className="text-xs text-gray-400">
                      还有 {result.errors.length - 5} 个错误...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
