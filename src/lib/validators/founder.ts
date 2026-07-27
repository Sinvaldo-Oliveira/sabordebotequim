import { z } from "zod";

export const founderSectionSchema = z.object({
  eyebrow: z.string().min(1, "Informe o texto de destaque.").max(80),
  title: z.string().min(1, "Informe o título.").max(120),
  body: z.string().min(1, "Informe o texto.").max(1000),
});

export type FounderSectionInput = z.input<typeof founderSectionSchema>;
