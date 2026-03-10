import { createContext, useContext, useState, useEffect, useRef } from "react";
import { arrayMove } from "@dnd-kit/sortable";

const API = "http://localhost:3001/api/board";

const BoardContext = createContext(null);

export const useBoard = () => useContext(BoardContext);

const findListByItemId = (lists, itemId) =>
  lists.find((list) => list.items.some((item) => item.id === itemId));

const moveItemBetweenLists = (lists, activeId, overId) => {
  const sourceList = findListByItemId(lists, activeId);
  const targetList =
    findListByItemId(lists, overId) ??
    lists.find((list) => list.id === overId);

  if (!sourceList || !targetList) return lists;
  if (sourceList.id === targetList.id) return lists;

  const activeIndex = sourceList.items.findIndex((i) => i.id === activeId);
  const overIndex = targetList.items.findIndex((i) => i.id === overId);
  const [movedItem] = sourceList.items.slice(activeIndex, activeIndex + 1);

  const insertAt = overIndex >= 0 ? overIndex : targetList.items.length;

  return lists.map((list) => {
    if (list.id === sourceList.id) {
      return { ...list, items: list.items.filter((i) => i.id !== activeId) };
    }
    if (list.id === targetList.id) {
      const newItems = [...list.items];
      newItems.splice(insertAt, 0, movedItem);
      return { ...list, items: newItems };
    }
    return list;
  });
};

const reorderItemInList = (lists, activeId, overId) => {
  const list = findListByItemId(lists, activeId);
  if (!list) return lists;

  const oldIndex = list.items.findIndex((i) => i.id === activeId);
  const newIndex = list.items.findIndex((i) => i.id === overId);
  if (oldIndex === newIndex) return lists;

  return lists.map((l) =>
    l.id === list.id
      ? { ...l, items: arrayMove(l.items, oldIndex, newIndex) }
      : l
  );
};

const sortLists = (lists) => {
  const grouped = lists.reduce((acc, list) => {
    const key = list.group?.toLowerCase() ?? null;
    return { ...acc, [key]: [...(acc[key] ?? []), list] };
  }, {});

  const { null: ungrouped = [], ...rest } = grouped;
  return [
    ...ungrouped,
    ...Object.values(rest).flat(),
  ];
};

const moveMultipleItems = (lists, itemIds, targetListId) => {
  const idSet = new Set(itemIds);
  const movedItems = [];

  const listsWithoutItems = lists.map((list) => {
    const remaining = list.items.filter((item) => {
      if (idSet.has(item.id)) {
        movedItems.push(item);
        return false;
      }
      return true;
    });
    return { ...list, items: remaining };
  });

  return listsWithoutItems.map((list) =>
    list.id === targetListId
      ? { ...list, items: [...list.items, ...movedItems] }
      : list
  );
};

export function BoardProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data) => setLists(sortLists(data.lists)))
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, []);

  const persist = (updater) => {
    setLists((prev) => {
      const next = updater(prev);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(API, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lists: next }),
        });
      }, 300);
      return next;
    });
  };

  const reorderItem = (activeId, overId) =>
    persist((prev) => reorderItemInList(prev, activeId, overId));

  const moveItem = (activeId, overId) =>
    persist((prev) => moveItemBetweenLists(prev, activeId, overId));

  const editItem = (itemId, fields) =>
    persist((prev) =>
      prev.map((list) => ({
        ...list,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, ...fields } : item
        ),
      }))
    );

  const moveItems = (itemIds, targetListId) =>
    persist((prev) => moveMultipleItems(prev, itemIds, targetListId));

  const setListGroup = (listId, group) =>
    persist((prev) =>
      sortLists(
        prev.map((l) => {
          if (l.id !== listId) return l;
          const { group: _g, ...rest } = l;
          return group ? { ...rest, group } : rest;
        })
      )
    );

  const moveList = (listId, direction) =>
    persist((prev) => {
      const index = prev.findIndex((l) => l.id === listId);
      const swapIndex = direction === "left" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= prev.length) return prev;
      return arrayMove(prev, index, swapIndex);
    });

  return (
    <BoardContext.Provider value={{ lists, loading, reorderItem, moveItem, moveItems, moveList, editItem, setListGroup }}>
      {children}
    </BoardContext.Provider>
  );
}
