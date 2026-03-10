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

const buildRowItems = (lists) =>
  lists.reduce((acc, list, i) => {
    const prev = lists[i - 1];
    if (list.group && list.group !== prev?.group) {
      acc.push({ type: "divider", name: list.group, key: `divider-${i}` });
    }
    acc.push({ type: "list", list });
    return acc;
  }, []);

export default function TodoBoard() {
  const { lists, reorderItem, moveItem } = useBoard();
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
    if (activeList.id !== overList.id) moveItem(active.id, over.id);
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

  const items = buildRowItems(lists);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div id="app">
        <div className="board-row">
          {items.map((entry) =>
            entry.type === "divider" ? (
              <div key={entry.key} className="board-group-divider">
                <span>{entry.name}</span>
              </div>
            ) : (
              <TodoList
                key={entry.list.id}
                list={entry.list}
                isFirst={false}
                isLast={false}
              />
            )
          )}
        </div>
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
