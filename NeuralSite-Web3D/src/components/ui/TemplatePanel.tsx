// TemplatePanel - 模板保存/加载组件
import { useState, useEffect, useCallback } from 'react';
import { useSceneStore } from '../../core/store';

interface Template {
  id: string;
  name: string;
  entity_type: string;
  config: Record<string, any>;
  created_at: string;
}

interface TemplatePanelProps {
  entityType?: string;
  onApply?: (config: Record<string, any>) => void;
  onClose?: () => void;
}

export function TemplatePanel({ entityType, onApply, onClose }: TemplatePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTemplate = async (name: string, config: Record<string, any>) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          entity_type: entityType || 'road',
          config,
        }),
      });
      if (response.ok) {
        fetchTemplates();
        setShowSaveDialog(false);
        setNewTemplateName('');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/templates/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const applyTemplate = (template: Template) => {
    onApply?.(template.config);
    onClose?.();
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, fetchTemplates]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
      >
        <span>📋</span> 模板
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">模板管理</h2>
          <button
            onClick={() => { setIsOpen(false); onClose?.(); }}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Save new template */}
          {showSaveDialog ? (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-white font-medium mb-2">保存为模板</h3>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="输入模板名称"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  取消
                </button>
                <button
                  onClick={() => newTemplateName.trim() && saveTemplate(newTemplateName, {})}
                  disabled={!newTemplateName.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
            >
              + 保存当前配置为模板
            </button>
          )}

          {/* Template list */}
          {isLoading ? (
            <div className="text-center text-gray-400 py-4">加载中...</div>
          ) : templates.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              暂无模板
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-white font-medium">可用模板</h3>
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-medium">{template.name}</div>
                    <div className="text-gray-400 text-xs">
                      {template.entity_type} • {new Date(template.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyTemplate(template)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
                    >
                      应用
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-500"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for using templates
export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTemplate = async (name: string, entityType: string, config: Record<string, any>) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, entity_type: entityType, config }),
      });
      if (response.ok) {
        fetchTemplates();
        return true;
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
    return false;
  };

  const deleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/templates/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchTemplates();
        return true;
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
    return false;
  };

  return { templates, isLoading, fetchTemplates, saveTemplate, deleteTemplate };
}
