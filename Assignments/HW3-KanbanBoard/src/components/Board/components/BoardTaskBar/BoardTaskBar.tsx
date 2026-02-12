import { type ReactNode, useState } from "react";

import Button from "@/components/Button/Button.tsx";
import IconButton from "@/components/IconButton/IconButton.tsx";
import TagSelect from "@/components/TagSelect/TagSelect.tsx";
import TextInput from "@/components/TextInput/TextInput.tsx";

import MingcuteArrowsRightLine from "@/icons/MingcuteArrowsRightLine.tsx";
import MingcuteCloseLine from "@/icons/MingcuteCloseLine.tsx";

import { PRIORITIES } from "@/types/priority.ts";
import type { TagType } from "@/types/tag.ts";

import type {
  TaskQuery,
  TaskSortDirection,
  TaskSortKey,
} from "@/utils/task-query.ts";

import styles from "./BoardTaskBar.module.css";

type Props = {
  query: TaskQuery;
  onChange: (next: TaskQuery) => void;
  onReset: () => void;
  boardTags: TagType[];
};

const SORT_OPTIONS: Array<{
  value: "none" | `${TaskSortKey}:${TaskSortDirection}`;
  label: string;
}> = [
  { value: "none", label: "None (manual order)" },
  { value: "dueDate:asc", label: "Due date (soonest)" },
  { value: "dueDate:desc", label: "Due date (latest)" },
  { value: "priority:asc", label: "Priority (P0 → P2)" },
  { value: "priority:desc", label: "Priority (P2 → P0)" },
  { value: "title:asc", label: "Title (A → Z)" },
  { value: "title:desc", label: "Title (Z → A)" },
];

export default function BoardTaskBar({
  query,
  onChange,
  onReset,
  boardTags,
}: Props): ReactNode {
  const [collapsed, setCollapsed] = useState(true);

  const selectedSort =
    query.sort?.mode === "none"
      ? ("none" as const)
      : query.sort
        ? (`${query.sort.key}:${query.sort.direction}` as const)
        : ("dueDate:asc" as const);

  const handleSortChange = (value: string): void => {
    if (value === "none") {
      onChange({
        ...query,
        sort: {
          mode: "none",
          key: "dueDate",
          direction: "asc",
        },
      });
      return;
    }

    const [key, direction] = value.split(":") as [
      TaskSortKey,
      TaskSortDirection,
    ];
    onChange({
      ...query,
      sort: { key, direction },
    });
  };

  const selectedPriorities = query.priorities ?? [];

  const handlePriorityToggle = (p: (typeof PRIORITIES)[number]): void => {
    const isSelected = selectedPriorities.includes(p);
    const next = isSelected
      ? selectedPriorities.filter((x) => x !== p)
      : [...selectedPriorities, p];
    onChange({ ...query, priorities: next });
  };

  return (
    <div className={styles["task-bar"]}>
      <div className={styles.row + " " + styles.row1}>
        <TextInput
          className={styles.search}
          label="Search"
          placeholder="Search by title or description..."
          value={query.text ?? ""}
          onChange={(e) => onChange({ ...query, text: e.target.value })}
        />

        <div className={styles.rowActions}>
          <Button variant="outlined" type="button" onClick={onReset}>
            Reset
          </Button>
          <IconButton
            className={styles.toggle}
            type="button"
            aria-label={collapsed ? "Show filters" : "Hide filters"}
            title={collapsed ? "Show filters" : "Hide filters"}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <MingcuteArrowsRightLine /> : <MingcuteCloseLine />}
          </IconButton>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className={styles.row + " " + styles.row2}>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label>Priority</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PRIORITIES.map((p) => {
                    const isSelected = selectedPriorities.includes(p);
                    return (
                      <Button
                        key={p}
                        type="button"
                        variant={isSelected ? "solid" : "outlined"}
                        onClick={() => handlePriorityToggle(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.sort}>
              <label>Sort</label>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row + " " + styles.row3}>
            <TagSelect
              label="Tags"
              tags={boardTags}
              value={query.tagIds ?? []}
              onChange={(tagIds) => onChange({ ...query, tagIds })}
            />
          </div>
        </>
      )}
    </div>
  );
}
