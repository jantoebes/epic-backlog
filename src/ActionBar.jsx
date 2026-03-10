import { useState, useEffect } from "react";
import { useSelection } from "./SelectionContext";
import { useBoard } from "./BoardContext";

export default function ActionBar() {
  const { selectedIds, clearSelection } = useSelection();
  const { lists, moveItems } = useBoard();
  const [targetListId, setTargetListId] = useState("");

  useEffect(() => {
    if (lists.length > 0 && !targetListId) {
      setTargetListId(lists[0].id);
    }
  }, [lists, targetListId]);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") clearSelection(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection]);

  if (selectedIds.size === 0) return null;

  const handleMove = () => {
    if (!targetListId) return;
    moveItems([...selectedIds], targetListId);
    clearSelection();
  };

  return (
    <div id="action-bar">
      <span className="action-bar-count">
        {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} geselecteerd
      </span>
      <select
        value={targetListId}
        onChange={(e) => setTargetListId(e.target.value)}
        className="action-bar-select"
      >
        {lists.map((list) => (
          <option key={list.id} value={list.id}>{list.name}</option>
        ))}
      </select>
      <button className="action-bar-btn" onClick={handleMove}>
        Verplaats
      </button>
      <button className="action-bar-cancel" onClick={clearSelection}>
        ✕
      </button>
    </div>
  );
}
