import type { ListItemPriority } from "./priority";

export type ListItemType = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: ListItemPriority;
  tagIds?: string[];
};
