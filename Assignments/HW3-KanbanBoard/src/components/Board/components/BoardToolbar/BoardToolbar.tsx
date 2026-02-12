import { type ReactNode, useRef } from "react";

import clsx from "clsx";

import IconButton from "@/components/IconButton/IconButton.tsx";

import MingcuteAddLine from "@/icons/MingcuteAddLine.tsx";
import MingcuteEdit2Line from "@/icons/MingcuteEdit2Line.tsx";

import BoardModal from "@/modals/BoardModal/BoardModal.tsx";
import ListModal from "@/modals/ListModal/ListModal.tsx";

import type { BoardType } from "@/types/board.ts";

import styles from "./BoardToolbar.module.css";

type Props = {
  board: BoardType;
};

export default function BoardToolbar({ board }: Props): ReactNode {
  const boardModalRef = useRef<HTMLDialogElement>(null);
  const listModalRef = useRef<HTMLDialogElement>(null);

  const handleEditBoardButtonClick = (): void => {
    boardModalRef.current?.showModal();
  };

  const handleCreateListButtonClick = (): void => {
    listModalRef.current?.showModal();
  };

  return (
    <div className={styles["board-toolbar"]}>
      <span className={clsx(styles.badge, board.color)}></span>
      <div className={styles.title}>{board.title}</div>
      <div className={styles.actions}>
        <IconButton
          onClick={handleEditBoardButtonClick}
          className={board.color}
        >
          <MingcuteEdit2Line />
        </IconButton>
        <IconButton
          onClick={handleCreateListButtonClick}
          className={board.color}
        >
          <MingcuteAddLine />
        </IconButton>
      </div>
      <BoardModal
        modalRef={boardModalRef}
        boardId={board.id}
        defaultValues={board}
      />
      <ListModal modalRef={listModalRef} />
    </div>
  );
}
