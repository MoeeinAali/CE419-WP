export const PRIORITIES = ["P0", "P1", "P2"] as const;

export type Priority = (typeof PRIORITIES)[number];

export type ListItemPriority = Priority;
