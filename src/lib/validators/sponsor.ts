import { z } from "zod";

export const sponsorSchema = z.object({
  name: z.string().min(2, "Informe o nome do patrocinador."),
  logo_url: z.string().min(1, "Envie a logomarca."),
  website_url: z.string().max(300).optional().or(z.literal("")),
  sponsorship_level: z.string().max(60).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "pending", "suspended"]).default("active"),
});

export type SponsorInput = z.input<typeof sponsorSchema>;

export const sponsorsCarouselSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  speed_seconds: z.coerce.number().int().min(10).max(120).default(30),
  zoom_scale: z.coerce.number().min(1).max(3).default(1.25),
  background_url: z.string().optional().or(z.literal("")),
});

export type SponsorsCarouselSettingsInput = z.input<typeof sponsorsCarouselSettingsSchema>;
