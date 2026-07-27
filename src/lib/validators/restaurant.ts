import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(2, "Informe o nome do restaurante."),
  slug: z
    .string()
    .min(2, "Informe o endereço (slug).")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen."),
  category_id: z.string().uuid("Selecione uma categoria.").nullable().optional(),
  logo_url: z.string().nullable().optional(),
  card_image_url: z.string().nullable().optional(),
  banner_url: z.string().nullable().optional(),
  short_description: z.string().max(160).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  story: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.email("E-mail inválido.").optional().or(z.literal("")),
  website: z.url("URL inválida.").optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "Informe a cidade.").default("Ribeirão das Neves"),
  state: z.string().min(2).max(2).default("MG"),
  postal_code: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "pending", "suspended"]),
  is_featured: z.boolean().default(false),
});

// z.input (não z.infer/z.output): react-hook-form precisa do formato ANTES
// de aplicar defaults/coerção; o Server Action revalida com safeParse e usa
// o output (já com defaults aplicados).
export type RestaurantInput = z.input<typeof restaurantSchema>;
