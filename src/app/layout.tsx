import type { Metadata } from "next";
import { Alfa_Slab_One, Archivo } from "next/font/google";
import "./globals.css";

const alfaSlab = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alfa",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sabor de Botequim — Festival Gastronômico de Ribeirão das Neves",
    template: "%s | Sabor de Botequim",
  },
  description:
    "Festival Gastronômico e Cultural de Ribeirão das Neves. Conheça os botequins participantes e vote no seu favorito.",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`scroll-smooth ${alfaSlab.variable} ${archivo.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
