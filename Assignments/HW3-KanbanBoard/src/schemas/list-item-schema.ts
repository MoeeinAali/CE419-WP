import { z } from "zod";

import { DescriptionSchema } from "@/schemas/description-schema.ts";
import { TitleSchema } from "@/schemas/title-schema.ts";

import { PRIORITIES } from "@/types/priority";

export const ListItemSchema = z.object({
  title: TitleSchema,
  description: DescriptionSchema,
  dueDate: z.string(),
  priority: z.enum(PRIORITIES).default(PRIORITIES[2]),
  tagIds: z.array(z.string()).default([]),
});
