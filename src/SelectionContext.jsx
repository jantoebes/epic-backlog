import { createContext, useContext, useState, useCallback } from "react";

const SelectionContext = createContext(null);

export const useSelection = () => useContext(SelectionContext);

export function SelectionProvider({ children }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelectedId, setLastSelectedId] = useState(null);

  const toggleSelect = useCallback((id) => {
    setLastSelectedId(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectRange = useCallback((toId, orderedIds) => {
    setLastSelectedId(toId);
    setSelectedIds((prev) => {
      const fromId = lastSelectedId;
      if (!fromId || !orderedIds.includes(fromId) || !orderedIds.includes(toId)) {
        return new Set([...prev, toId]);
      }
      const fromIndex = orderedIds.indexOf(fromId);
      const toIndex = orderedIds.indexOf(toId);
      const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
      const rangeIds = orderedIds.slice(start, end + 1);
      return new Set([...prev, ...rangeIds]);
    });
  }, [lastSelectedId]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  return (
    <SelectionContext.Provider value={{ selectedIds, toggleSelect, selectRange, clearSelection, isSelected }}>
      {children}
    </SelectionContext.Provider>
  );
}
