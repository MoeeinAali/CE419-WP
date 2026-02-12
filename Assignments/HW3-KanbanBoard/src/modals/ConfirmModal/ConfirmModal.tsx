import { type ReactNode, type RefObject } from "react";

import Button from "@/components/Button/Button.tsx";

import Modal from "@/modals/Modal/Modal.tsx";

import styles from "./ConfirmModal.module.css";

type Props = {
  ref: RefObject<HTMLDialogElement | null>;
  message?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function ConfirmModal({
  ref: modalRef,
  message = "Are you sure you want to delete this item?",
  onConfirm,
  onCancel,
}: Props): ReactNode {
  const handleConfirmClick = (): void => {
    onConfirm();
    modalRef.current?.close();
  };

  const handleCancelClick = (): void => {
    onCancel?.();
    modalRef.current?.close();
  };

  return (
    <Modal
      ref={modalRef}
      contentClassName={styles.content}
      heading="Delete Confirmation"
    >
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button type="button" variant="outlined" onClick={handleCancelClick}>
          Cancel
        </Button>
        <Button type="button" color="danger" onClick={handleConfirmClick}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
