import { z } from "zod";

export const festivalSettingsSchema = z.object({
  name: z.string().min(2, "Informe o nome do festival."),
  description: z.string().optional().or(z.literal("")),
  status: z.enum([
    "draft",
    "scheduled",
    "active",
    "paused",
    "closed",
    "tallying",
    "published",
  ]),
  voting_start_at: z.string().optional().or(z.literal("")),
  voting_end_at: z.string().optional().or(z.literal("")),
});

export type FestivalSettingsInput = z.infer<typeof festivalSettingsSchema>;
