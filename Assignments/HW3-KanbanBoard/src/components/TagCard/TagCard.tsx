import { type ReactNode, useRef } from "react";

import clsx from "clsx";

import IconButton from "@/components/IconButton/IconButton.tsx";

import MingcuteEdit2Line from "@/icons/MingcuteEdit2Line.tsx";

import TagModal from "@/modals/TagModal/TagModal.tsx";

import type { TagType } from "@/types/tag.ts";

import styles from "./TagCard.module.css";

type Props = {
  tag: TagType;
};

export default function TagCard({ tag }: Props): ReactNode {
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleEditButtonClick = (): void => {
    modalRef.current?.showModal();
  };

  return (
    <div className={clsx(styles["tag-card"], tag.color)}>
      <span className={styles.label}>{tag.label}</span>
      <IconButton className={clsx(styles.icon)} onClick={handleEditButtonClick}>
        <MingcuteEdit2Line />
      </IconButton>
      <TagModal
        modalRef={modalRef}
        tagId={tag.id}
        defaultValues={{ label: tag.label, color: tag.color }}
      />
    </div>
  );
}
