import { type ReactNode, useEffect, useMemo, useState } from "react";

import BoardLists from "@/components/Board/components/BoardLists/BoardLists.tsx";
import BoardTaskBar from "@/components/Board/components/BoardTaskBar/BoardTaskBar.tsx";
import BoardToolbar from "@/components/Board/components/BoardToolbar/BoardToolbar.tsx";

import { useTagsStore } from "@/stores/tags-store.ts";

import type { BoardType } from "@/types/board.ts";
import type { TagType } from "@/types/tag.ts";

import { type TaskQuery, applyTaskQuery } from "@/utils/task-query.ts";

import styles from "./Board.module.css";

type Props = {
  board: BoardType;
};

export default function Board({ board }: Props): ReactNode {
  const allTags = useTagsStore((state) => state.tags);
  const [query, setQuery] = useState<TaskQuery>({
    text: "",
    tagIds: [],
    priorities: [],
    sort: { mode: "none", key: "dueDate", direction: "asc" },
  });

  const filteredBoard = useMemo((): BoardType => {
    return {
      ...board,
      lists: board.lists.map((list) => ({
        ...list,
        items: applyTaskQuery(list.items, query),
      })),
    };
  }, [board, query]);

  const usedTagIds = useMemo(() => {
    const ids = new Set<string>();
    for (const list of board.lists) {
      for (const item of list.items) {
        for (const tagId of item.tagIds ?? []) {
          ids.add(tagId);
        }
      }
    }
    return ids;
  }, [board.lists]);

  const boardTags = useMemo((): TagType[] => {
    return allTags.filter((t) => usedTagIds.has(t.id));
  }, [allTags, usedTagIds]);

  useEffect(() => {
    // If the user has selected tags not used on this board, drop them.
    const current = query.tagIds ?? [];
    if (current.length === 0) return;

    const next = current.filter((id) => usedTagIds.has(id));
    if (next.length === current.length) return;

    setQuery((prev) => ({ ...prev, tagIds: next }));
  }, [query.tagIds, usedTagIds]);

  const handleReset = (): void => {
    setQuery({
      text: "",
      tagIds: [],
      priorities: [],
      sort: { mode: "none", key: "dueDate", direction: "asc" },
    });
  };

  return (
    <div className={styles.board}>
      <BoardToolbar board={board} />
      <BoardTaskBar
        query={query}
        onChange={setQuery}
        onReset={handleReset}
        boardTags={boardTags}
      />
      <BoardLists lists={filteredBoard.lists} />
    </div>
  );
}
