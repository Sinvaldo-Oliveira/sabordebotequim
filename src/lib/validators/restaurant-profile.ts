import { z } from "zod";

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: z.string(),
  close: z.string(),
});

const openingHoursSchema = z.object({
  mon: dayHoursSchema,
  tue: dayHoursSchema,
  wed: dayHoursSchema,
  thu: dayHoursSchema,
  fri: dayHoursSchema,
  sat: dayHoursSchema,
  sun: dayHoursSchema,
});

// Campos que o PRÓPRIO restaurante pode editar. Status, categoria,
// destaque e slug continuam exclusivos da administração.
export const restaurantProfileSchema = z.object({
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
  postal_code: z.string().optional().or(z.literal("")),
  logo_url: z.string().nullable().optional(),
  banner_url: z.string().nullable().optional(),
  opening_hours: openingHoursSchema,
  dish_name: z.string().max(120).optional().or(z.literal("")),
  dish_description: z.string().optional().or(z.literal("")),
  dish_ingredients: z.string().optional().or(z.literal("")),
  dish_dietary_information: z.string().optional().or(z.literal("")),
  dish_price: z.coerce.number().nonnegative().optional().nullable(),
  dish_main_image_url: z.string().nullable().optional(),
});

export type RestaurantProfileInput = z.input<typeof restaurantProfileSchema>;
