import { type ComponentProps, type ReactNode, useRef } from "react";

import { toast } from "react-toastify";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import ColorInput from "@/components/ColorInput/ColorInput.tsx";
import TextInput from "@/components/TextInput/TextInput.tsx";

import ConfirmModal from "@/modals/ConfirmModal/ConfirmModal.tsx";
import FormModal from "@/modals/FormModal/FormModal.tsx";

import { TagSchema } from "@/schemas/tag-schema.ts";

import { useTagsStore } from "@/stores/tags-store.ts";

import type { BoardColor } from "@/types/board.ts";

type Values = z.infer<typeof TagSchema>;

type Props = Pick<ComponentProps<typeof FormModal>, "modalRef"> & {
  tagId?: string;
  defaultValues?: Values;
};

export default function TagModal({
  modalRef,
  tagId,
  defaultValues,
}: Props): ReactNode {
  const confirmModalRef = useRef<HTMLDialogElement>(null);
  const createTag = useTagsStore((state) => state.createTag);
  const editTag = useTagsStore((state) => state.editTag);
  const removeTag = useTagsStore((state) => state.removeTag);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: defaultValues ?? { color: "blue", label: "" },
    resolver: zodResolver(TagSchema),
  });

  const handleRemoveButtonClick = (): void => {
    if (tagId === undefined) {
      return;
    }
    confirmModalRef.current?.showModal();
  };

  const handleConfirmDelete = (): void => {
    if (tagId === undefined) {
      return;
    }
    removeTag(tagId);
    toast.success("Tag removed successfully.");
    modalRef.current?.close();
  };

  const handleFormSubmit = (values: Values): void => {
    if (tagId !== undefined) {
      const success = editTag(tagId, values);
      if (success) {
        toast.success("Tag edited successfully.");
        modalRef.current?.close();
      } else {
        toast.error("A tag with this label already exists.");
      }
    } else {
      const success = createTag(values);
      if (success) {
        toast.success("Tag created successfully.");
        modalRef.current?.close();
      } else {
        toast.error("A tag with this label already exists.");
      }
    }
  };

  return (
    <>
      <FormModal
        modalRef={modalRef}
        heading={tagId !== undefined ? "Edit Existing Tag" : "Create a New Tag"}
        onClose={() => reset()}
        onRemove={tagId !== undefined && handleRemoveButtonClick}
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <TextInput
          {...register("label")}
          label="Label"
          type="text"
          error={errors.label?.message}
        />
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorInput
              label="Color"
              error={errors.color?.message}
              value={field.value as BoardColor}
              onChange={(color) => field.onChange(color)}
            />
          )}
        />
      </FormModal>
      <ConfirmModal ref={confirmModalRef} onConfirm={handleConfirmDelete} />
    </>
  );
}
