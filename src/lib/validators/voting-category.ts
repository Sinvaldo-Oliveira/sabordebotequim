import { z } from "zod";

export const votingCategorySchema = z
  .object({
    name: z.string().min(2, "Informe o nome da categoria."),
    slug: z
      .string()
      .min(2, "Informe o endereço (slug).")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen."),
    description: z.string().optional().or(z.literal("")),
    voting_rule: z.enum([
      "one_per_festival",
      "one_per_category",
      "one_per_restaurant",
      "one_per_period",
      "custom",
      "one_vote_per_whatsapp_per_festival",
    ]),
    period_hours: z.coerce.number().int().positive().optional().nullable(),
    status: z.enum(["active", "inactive", "pending", "suspended"]),
    display_order: z.coerce.number().int().default(0),
  })
  .refine((data) => data.voting_rule !== "one_per_period" || Boolean(data.period_hours), {
    message: "Informe o período (em horas) para esta regra.",
    path: ["period_hours"],
  });

// z.input (não z.infer/z.output): ver comentário equivalente em restaurant.ts.
export type VotingCategoryInput = z.input<typeof votingCategorySchema>;
