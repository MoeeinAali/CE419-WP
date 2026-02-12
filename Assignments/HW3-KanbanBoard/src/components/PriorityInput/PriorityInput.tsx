import { type ComponentProps, type ReactNode, useId, useState } from "react";

import clsx from "clsx";

import MingcuteCheckFill from "@/icons/MingcuteCheckFill.tsx";

import { PRIORITIES, type Priority } from "@/types/priority.ts";

import styles from "./PriorityInput.module.css";

type Props = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  label: string;
  value?: Priority;
  defaultValue?: Priority;
  error?: string | null;
  onChange?: (value: Priority) => void;
};

export default function PriorityInput({
  className,
  label,
  value: controlledValue,
  defaultValue,
  error,
  onChange,
  ...otherProps
}: Props): ReactNode {
  const [uncontrolledValue, setUncontrolledValue] = useState<Priority>(
    defaultValue ?? "P0",
  );

  const value = controlledValue ?? uncontrolledValue;

  const id = useId();

  const handleClick = (priority: Priority): void => {
    setUncontrolledValue(priority);
    onChange?.(priority);
  };

  return (
    <div
      className={clsx(
        styles["priority-input"],
        !!error && styles.error,
        className,
      )}
    >
      <label htmlFor={id}>{label}</label>

      <div className={styles.priorities}>
        {PRIORITIES.map((priority) => (
          <button
            key={priority}
            type="button"
            className={clsx(
              styles.item,
              styles[priority.toLowerCase()],
              priority === value && styles.active,
            )}
            onClick={() => handleClick(priority)}
          >
            {priority}
            {priority === value && <MingcuteCheckFill />}
          </button>
        ))}
      </div>

      <input id={id} type="hidden" value={value} {...otherProps} />

      <span className={styles.error}>{error || "\u00A0"}</span>
    </div>
  );
}
