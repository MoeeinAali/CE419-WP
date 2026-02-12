import { type ComponentProps, type ReactNode, useRef } from "react";

import { useParams } from "react-router";

import { toast } from "react-toastify";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import PriorityInput from "@/components/PriorityInput/PriorityInput.tsx";
import TagSelect from "@/components/TagSelect/TagSelect.tsx";
import TextArea from "@/components/TextArea/TextArea.tsx";
import TextInput from "@/components/TextInput/TextInput.tsx";

import ConfirmModal from "@/modals/ConfirmModal/ConfirmModal.tsx";
import FormModal from "@/modals/FormModal/FormModal.tsx";

import { ListItemSchema } from "@/schemas/list-item-schema.ts";

import { useKanbanStore } from "@/stores/kanban-store.ts";

type Values = z.output<typeof ListItemSchema>;

type Props = Pick<ComponentProps<typeof FormModal>, "modalRef"> & {
  listIndex: number;
  itemIndex?: number;
  defaultValues?: Partial<Values> &
    Pick<Values, "title" | "description" | "dueDate">;
};

export default function ListItemModal({
  modalRef,
  listIndex,
  itemIndex,
  defaultValues,
}: Props): ReactNode {
  const confirmModalRef = useRef<HTMLDialogElement>(null);
  const { boardId } = useParams();

  const createItem = useKanbanStore((state) => state.createItem);
  const editItem = useKanbanStore((state) => state.editItem);
  const removeItem = useKanbanStore((state) => state.removeItem);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Values>({
    defaultValues: (defaultValues
      ? { ...defaultValues, tagIds: defaultValues.tagIds ?? [] }
      : {
          title: "",
          description: "",
          dueDate: "",
          priority: "P2",
          tagIds: [],
        }) as Values,
    resolver: zodResolver(ListItemSchema) as Resolver<Values>,
  });

  const handleRemoveButtonClick = (): void => {
    if (itemIndex === undefined) {
      return;
    }
    confirmModalRef.current?.showModal();
  };

  const handleConfirmDelete = (): void => {
    if (itemIndex === undefined) {
      return;
    }
    removeItem(boardId, listIndex, itemIndex);
    toast.success("Item removed successfully.");
    modalRef.current?.close();
  };

  const handleFormSubmit = (values: Values): void => {
    if (itemIndex !== undefined) {
      editItem(boardId, listIndex, itemIndex, values);
      toast.success("Item edited successfully.");
    } else {
      createItem(boardId, listIndex, values);
      toast.success("Item created successfully.");
    }

    modalRef.current?.close();
  };

  return (
    <>
      <FormModal
        modalRef={modalRef}
        heading={
          itemIndex !== undefined ? `Edit Exising Item` : "Create a New Item"
        }
        onClose={() => reset()}
        onRemove={itemIndex !== undefined && handleRemoveButtonClick}
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <TextInput
          {...register("title")}
          label="Title"
          type="text"
          error={errors.title?.message}
        />
        <TextArea
          {...register("description")}
          label="Description"
          error={errors.description?.message}
        />
        <TextInput
          {...register("dueDate")}
          label="Due Date"
          type="date"
          error={errors.dueDate?.message}
        />
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <PriorityInput
              label="Priority"
              value={field.value}
              onChange={field.onChange}
              error={errors.priority?.message}
            />
          )}
        />
        <Controller
          name="tagIds"
          control={control}
          render={({ field }) => (
            <TagSelect
              label="Tags"
              value={field.value}
              onChange={field.onChange}
              error={errors.tagIds?.message}
            />
          )}
        />
      </FormModal>
      <ConfirmModal ref={confirmModalRef} onConfirm={handleConfirmDelete} />
    </>
  );
}
