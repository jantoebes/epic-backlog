import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSettings } from "./SettingsContext";
import { useBoard } from "./BoardContext";
import TodoItem from "./TodoItem";

export default function TodoList({ list, isFirst, isLast }) {
  const { columnWidth, rowCount } = useSettings();
  const { moveList } = useBoard();
  const { setNodeRef } = useDroppable({ id: list.id });

  const itemIds = list.items.map((i) => i.id);
  const height = `calc(100vh / ${rowCount})`;

  return (
    <div className="list" style={{ minWidth: columnWidth, maxWidth: columnWidth, height }}>
      <div className="list-header" style={{ background: list.color }}>
        {!isFirst && (
          <button className="list-move-btn" onClick={() => moveList(list.id, "left")}>◀</button>
        )}
        <span className="list-header-name">{list.name}</span>
        {!isLast && (
          <button className="list-move-btn" onClick={() => moveList(list.id, "right")}>▶</button>
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
