import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSettings } from "./SettingsContext";
import { useBoard } from "./BoardContext";
import { useSelection } from "./SelectionContext";
import ItemModal from "./ItemModal";

const CLICK_DELAY = 200;

export default function TodoItem({ item, num, orderedIds }) {
  const { showNumbers, compactMode } = useSettings();
  const { editItem } = useBoard();
  const { toggleSelect, selectRange, isSelected } = useSelection();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const inputRef = useRef(null);
  const dragTimer = useRef(null);
  const clickTimer = useRef(null);

  const selected = isSelected(item.id);
  const hasDescription = !!item.description;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.label) editItem(item.id, { label: trimmed });
    else setDraft(item.label);
    setEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setDraft(item.label);
      setEditing(false);
    }
  };

  const handlePointerDown = (e) => {
    dragTimer.current = setTimeout(() => { dragTimer.current = null; }, 100);
    listeners.onPointerDown(e);
  };

  const handleClick = (e) => {
    if (e.ctrlKey || e.metaKey) {
      clearTimeout(dragTimer.current);
      dragTimer.current = null;
      toggleSelect(item.id);
      return;
    }
    if (e.shiftKey) {
      clearTimeout(dragTimer.current);
      dragTimer.current = null;
      selectRange(item.id, orderedIds);
      return;
    }
    if (dragTimer.current === null) return; // was a drag
    clearTimeout(dragTimer.current);
    dragTimer.current = null;

    // single vs double click distinction
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setModalOpen(true);
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      setDraft(item.label);
      setEditing(true);
    }, CLICK_DELAY);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const className = [
    "item",
    compactMode ? "item--compact" : "",
    isDragging ? "item--ghost" : "",
    selected ? "item--selected" : "",
    expanded ? "item--expanded" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <div
        ref={setNodeRef}
        className={className}
        style={style}
        {...attributes}
        {...listeners}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="item-row">
          {showNumbers && <span className="item-num">{num}</span>}
          {editing ? (
            <input
              ref={inputRef}
              className="item-edit"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleEditKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="item-label" title={item.label}>{item.label}</span>
          )}
          <button
            className={`item-expand-btn${hasDescription ? " item-expand-btn--has-desc" : ""}`}
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            title={expanded ? "Inklappen" : "Uitklappen"}
          >
            {expanded ? "▴" : "▾"}
          </button>
        </div>
        {expanded && (
          <div className="item-description">
            {item.description || <span className="item-description--empty">Geen beschrijving</span>}
          </div>
        )}
      </div>
      {modalOpen && <ItemModal item={item} onClose={() => setModalOpen(false)} />}
    </>
  );
}
