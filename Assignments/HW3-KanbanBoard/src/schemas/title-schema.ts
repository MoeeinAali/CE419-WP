import { z } from "zod";

export const TitleSchema = z
  .string("Title must be a string.")
  .trim()
  .nonempty("Title cannot be empty.")
  .min(3, "Title must be at least 3 characters.")
  .transform((val) =>
    val
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "),
  );
