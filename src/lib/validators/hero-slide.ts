import { z } from "zod";

export const heroSlideSchema = z.object({
  image_url: z.string().min(1, "Envie uma imagem para o slide."),
  title: z.string().max(120).optional().or(z.literal("")),
  subtitle: z.string().max(240).optional().or(z.literal("")),
  cta_label: z.string().max(40).optional().or(z.literal("")),
  cta_href: z.string().max(300).optional().or(z.literal("")),
  overlay_opacity: z.coerce.number().int().min(0).max(90).default(35),
  is_active: z.boolean().default(true),
});

export type HeroSlideInput = z.input<typeof heroSlideSchema>;

export const heroCarouselSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  autoplay_seconds: z.coerce.number().int().min(0).max(30).default(6),
});

export type HeroCarouselSettingsInput = z.input<typeof heroCarouselSettingsSchema>;
