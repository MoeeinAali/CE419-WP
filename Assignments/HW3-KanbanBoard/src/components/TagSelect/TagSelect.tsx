import { type ReactNode, useId } from "react";

import clsx from "clsx";

import MingcuteCheckFill from "@/icons/MingcuteCheckFill.tsx";

import { useTagsStore } from "@/stores/tags-store.ts";

import type { TagType } from "@/types/tag.ts";

import styles from "./TagSelect.module.css";

type Props = {
  label: string;
  tags?: TagType[];
  value?: string[];
  defaultValue?: string[];
  error?: string | null;
  onChange?: (tagIds: string[]) => void;
};

export default function TagSelect({
  label,
  tags: providedTags,
  value: controlledValue,
  defaultValue,
  error,
  onChange,
}: Props): ReactNode {
  const storeTags = useTagsStore((state) => state.tags);
  const tags = providedTags ?? storeTags;
  const value = controlledValue ?? defaultValue ?? [];
  const id = useId();

  const handleTagClick = (tagId: string): void => {
    const isSelected = value.includes(tagId);
    const newValue = isSelected
      ? value.filter((id) => id !== tagId)
      : [...value, tagId];
    onChange?.(newValue);
  };

  return (
    <div className={clsx(styles["tag-select"], !!error && styles.error)}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.tags}>
        {tags.length === 0 ? (
          <span className={styles.empty}>
            No tags available. Create tags first.
          </span>
        ) : (
          tags.map((tag) => {
            const isSelected = value.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                className={clsx(
                  styles.tag,
                  tag.color,
                  isSelected && styles.selected,
                )}
                onClick={() => handleTagClick(tag.id)}
              >
                {tag.label}
                {isSelected && <MingcuteCheckFill />}
              </button>
            );
          })
        )}
      </div>
      <span className={styles.error}>{error || "\u00A0"}</span>
    </div>
  );
}
