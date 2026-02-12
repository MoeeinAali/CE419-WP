import type { ListItemType } from "@/types/list-item.ts";
import type { ListItemPriority } from "@/types/priority.ts";

export type TaskSortKey = "dueDate" | "priority" | "title";
export type TaskSortDirection = "asc" | "desc";

export type TaskQuery = {
  text?: string;
  tagIds?: string[];
  priorities?: ListItemPriority[];
  sort?: {
    mode?: "none" | "active";
    key: TaskSortKey;
    direction: TaskSortDirection;
  };
};

const PRIORITY_ORDER: Record<ListItemPriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
};

const normalizeText = (value: string): string => value.trim().toLowerCase();

const includesNormalized = (haystack: string, needle: string): boolean => {
  if (!needle) return true;
  return normalizeText(haystack).includes(needle);
};

const compare = (a: number | string, b: number | string): number =>
  a < b ? -1 : a > b ? 1 : 0;

const parseDateMs = (value: string): number => {
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
};

export function filterTasks(
  tasks: ListItemType[],
  query: TaskQuery,
): ListItemType[] {
  const text = normalizeText(query.text ?? "");
  const selectedTags = query.tagIds ?? [];
  const priorities = query.priorities ?? [];

  return tasks.filter((task) => {
    const matchesText =
      includesNormalized(task.title, text) ||
      includesNormalized(task.description ?? "", text);

    const matchesPriority =
      priorities.length === 0 || priorities.includes(task.priority);

    const taskTags = task.tagIds ?? [];
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((t) => taskTags.includes(t));

    return matchesText && matchesPriority && matchesTags;
  });
}

export function sortTasks(
  tasks: ListItemType[],
  sort: TaskQuery["sort"],
): ListItemType[] {
  if (!sort) return tasks;
  if (sort.mode === "none") return tasks;

  const dir = sort.direction === "desc" ? -1 : 1;

  const sorted = [...tasks].sort((a, b) => {
    if (sort.key === "dueDate") {
      return dir * compare(parseDateMs(a.dueDate), parseDateMs(b.dueDate));
    }

    if (sort.key === "priority") {
      return (
        dir * compare(PRIORITY_ORDER[a.priority], PRIORITY_ORDER[b.priority])
      );
    }

    // title
    return dir * compare(normalizeText(a.title), normalizeText(b.title));
  });

  return sorted;
}

export function applyTaskQuery(
  tasks: ListItemType[],
  query: TaskQuery,
): ListItemType[] {
  const filtered = filterTasks(tasks, query);
  return sortTasks(filtered, query.sort);
}
