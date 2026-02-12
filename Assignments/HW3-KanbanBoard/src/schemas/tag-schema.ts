import { z } from "zod";

import { ColorSchema } from "@/schemas/color-schema.ts";

const LabelSchema = z
  .string("Label must be a string.")
  .trim()
  .nonempty("Label cannot be empty.")
  .min(3, "Label must be at least 3 characters.")
  .transform((val) =>
    val
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "),
  );

export const TagSchema = z.object({
  label: LabelSchema,
  color: ColorSchema,
});
