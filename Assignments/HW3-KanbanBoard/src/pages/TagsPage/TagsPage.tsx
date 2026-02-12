import { type ReactNode, useRef } from "react";

import Button from "@/components/Button/Button.tsx";
import TagCard from "@/components/TagCard/TagCard.tsx";

import TagModal from "@/modals/TagModal/TagModal.tsx";

import { useTagsStore } from "@/stores/tags-store.ts";

import styles from "./TagsPage.module.css";

export default function TagsPage(): ReactNode {
  const tags = useTagsStore((state) => state.tags);

  const modalRef = useRef<HTMLDialogElement>(null);

  const handleCreateButtonClick = (): void => {
    modalRef.current?.showModal();
  };

  return (
    <div className={styles["tags-page"]}>
      <div className={styles.header}>
        <h1>Tags</h1>
        <Button color="primary" onClick={handleCreateButtonClick}>
          Create
        </Button>
      </div>
      <ul className={styles.tags}>
        {tags.map((tag) => (
          <li key={tag.id}>
            <TagCard tag={tag} />
          </li>
        ))}
      </ul>
      <TagModal modalRef={modalRef} />
    </div>
  );
}
