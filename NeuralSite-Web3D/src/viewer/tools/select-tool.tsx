// SelectTool - CAD-style selection with multi-select support
import { useCallback } from 'react';
import { useEditorStore } from '../../core/editor-store';
import { useSceneStore } from '../../core';

export function useSelectHandler() {
  const setSelection = useSceneStore((s) => s.setSelection);
  const setSelectedIds = useEditorStore((s) => s.setSelectedIds);
  const addToSelection = useEditorStore((s) => s.addToSelection);
  const removeFromSelection = useEditorStore((s) => s.removeFromSelection);
  const selectedIds = useEditorStore((s) => s.selectedIds);

  return useCallback((
    nodeId: string,
    nodeType: string,
    position: { x: number; y: number; z: number },
    event?: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }
  ) => {
    const isMultiSelect = event?.metaKey || event?.ctrlKey;

    if (isMultiSelect) {
      if (selectedIds.includes(nodeId)) {
        removeFromSelection(nodeId);
      } else {
        addToSelection(nodeId);
      }
    } else {
      setSelectedIds([nodeId]);
    }

    setSelection({ nodeId, nodeType, position });
  }, [selectedIds, setSelectedIds, setSelection, addToSelection, removeFromSelection]);
}
