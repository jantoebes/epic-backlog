import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { useBoard } from "./BoardContext";
import { useSettings } from "./SettingsContext";
import TodoList from "./TodoList";

const DRAG_DELAY_MS = 100;

const findItem = (lists, id) => {
  for (const list of lists) {
    const item = list.items.find((i) => i.id === id);
    if (item) return item;
  }
  return null;
};

const chunkArray = (arr, count) => {
  const size = Math.ceil(arr.length / count);
  return Array.from({ length: count }, (_, i) => arr.slice(i * size, i * size + size));
};

export default function TodoBoard() {
  const { lists, reorderItem, moveItem } = useBoard();
  const { rowCount } = useSettings();
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: DRAG_DELAY_MS, tolerance: 5 },
    })
  );

  const handleDragStart = ({ active }) => {
    setActiveItem(findItem(lists, active.id));
  };

  const handleDragOver = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const activeList = lists.find((l) => l.items.some((i) => i.id === active.id));
    const overList =
      lists.find((l) => l.items.some((i) => i.id === over.id)) ??
      lists.find((l) => l.id === over.id);

    if (!activeList || !overList) return;
    if (activeList.id !== overList.id) {
      moveItem(active.id, over.id);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveItem(null);
    if (!over || active.id === over.id) return;

    const activeList = lists.find((l) => l.items.some((i) => i.id === active.id));
    const overList = lists.find((l) => l.items.some((i) => i.id === over.id));

    if (activeList && overList && activeList.id === overList.id) {
      reorderItem(active.id, over.id);
    }
  };

  const rows = chunkArray(lists, rowCount);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div id="app">
        {rows.map((row, i) => (
          <div key={i} className="board-row">
            {row.map((list, index) => (
              <TodoList key={list.id} list={list} isFirst={index === 0} isLast={index === row.length - 1} />
            ))}
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeItem && (
          <div className="item item--dragging">
            {activeItem.label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
