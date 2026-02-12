import type { ComponentProps, ReactNode } from "react";

import clsx from "clsx";

import { type BoardColor } from "@/types/board";

import styles from "./IconButton.module.css";

type Props = ComponentProps<"button">;

export default function IconButton({
  className,
  children,
  ...otherProps
}: Props): ReactNode {
  return (
    <button
      className={clsx(styles["icon-button"], "gray" as BoardColor, className)}
      {...otherProps}
    >
      {children}
    </button>
  );
}
