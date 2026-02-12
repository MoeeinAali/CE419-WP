import { create } from "zustand";
import { persist } from "zustand/middleware";

import { tagsData } from "@/data/tags-data.ts";

import type { TagType } from "@/types/tag.ts";

type TagsState = {
  tags: TagType[];
  createTag: (tag: Omit<TagType, "id">) => boolean;
  editTag: (tagId: string, tag: Partial<Omit<TagType, "id">>) => boolean;
  removeTag: (tagId: string) => void;
  hasTagWithLabel: (label: string, excludeId?: string) => boolean;
};

function normalizeLabel(label: string): string {
  return label
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const useTagsStore = create<TagsState>()(
  persist(
    (set, get) => ({
      tags: tagsData,

      createTag: (tag) => {
        const normalizedLabel = normalizeLabel(tag.label);

        if (get().hasTagWithLabel(normalizedLabel)) {
          return false;
        }

        set((state) => ({
          tags: [
            ...state.tags,
            {
              id: globalThis.crypto.randomUUID(),
              label: normalizedLabel,
              color: tag.color,
            },
          ],
        }));
        return true;
      },

      editTag: (tagId, tag) => {
        const existingTag = get().tags.find((t) => t.id === tagId);
        if (!existingTag) return false;

        const updates: Partial<Omit<TagType, "id">> = {};

        if (tag.label !== undefined) {
          const normalizedLabel = normalizeLabel(tag.label);

          if (get().hasTagWithLabel(normalizedLabel, tagId)) {
            return false;
          }
          updates.label = normalizedLabel;
        }

        if (tag.color !== undefined) {
          updates.color = tag.color;
        }

        if (Object.keys(updates).length === 0) return true;

        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === tagId ? { ...t, ...updates } : t,
          ),
        }));
        return true;
      },

      removeTag: (tagId) =>
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== tagId),
        })),

      hasTagWithLabel: (label, excludeId) => {
        const normalizedLabel = normalizeLabel(label);
        return get().tags.some(
          (t) => t.label === normalizedLabel && t.id !== excludeId,
        );
      },
    }),
    { name: "tags" },
  ),
);
