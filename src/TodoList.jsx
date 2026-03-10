import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSettings } from "./SettingsContext";
import { useBoard } from "./BoardContext";
import TodoItem from "./TodoItem";
import { useState, useRef, useEffect } from "react";

const GroupDropdown = ({ list, onClose }) => {
  const { lists, setListGroup } = useBoard();
  const [newGroup, setNewGroup] = useState("");
  const ref = useRef(null);

  const existingGroups = Object.values(
    lists.reduce((acc, l) => {
      if (!l.group) return acc;
      const key = l.group.toLowerCase();
      return key in acc ? acc : { ...acc, [key]: l.group };
    }, {})
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const select = (group) => {
    setListGroup(list.id, group);
    onClose();
  };

  const submitNew = (e) => {
    e.preventDefault();
    if (newGroup.trim()) select(newGroup.trim());
  };

  return (
    <div className="group-dropdown" ref={ref}>
      <div className="group-dropdown-section">
        <div
          className={`group-dropdown-option ${!list.group ? "active" : ""}`}
          onClick={() => select("")}
        >
          Geen group
        </div>
        {existingGroups.map((g) => (
          <div
            key={g}
            className={`group-dropdown-option ${list.group?.toLowerCase() === g.toLowerCase() ? "active" : ""}`}
            onClick={() => select(g)}
          >
            {g}
          </div>
        ))}
      </div>
      <form className="group-dropdown-new" onSubmit={submitNew}>
        <input
          autoFocus
          placeholder="Nieuwe group..."
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
        />
        <button type="submit">+</button>
      </form>
    </div>
  );
};

export default function TodoList({ list, isFirst, isLast, rowCount = 1 }) {
  const { columnWidth } = useSettings();
  const { moveList } = useBoard();
  const { setNodeRef } = useDroppable({ id: list.id });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const itemIds = list.items.map((i) => i.id);
  const heightStyle = rowCount > 1 ? { height: `${100 / rowCount}vh` } : { height: "100%" };

  return (
    <div className="list" style={{ minWidth: columnWidth, maxWidth: columnWidth, ...heightStyle }}>
      <div className="list-header" style={{ background: list.color }}>
        {!isFirst && (
          <button className="list-move-btn" onClick={() => moveList(list.id, "left")}>◀</button>
        )}
        <span
          className="list-header-name"
          onClick={() => setDropdownOpen((o) => !o)}
          title="Klik om group in te stellen"
        >
          {list.name}
        </span>
        {!isLast && (
          <button className="list-move-btn" onClick={() => moveList(list.id, "right")}>▶</button>
        )}
        {dropdownOpen && (
          <GroupDropdown list={list} onClose={() => setDropdownOpen(false)} />
        )}
      </div>
      <div className="list-items" ref={setNodeRef}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {list.items.map((item, index) => (
            <TodoItem key={item.id} item={item} num={index + 1} orderedIds={itemIds} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
