import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lava Rápido",
    short_name: "Lava Rápido",
    description: "Agenda, clientes, loja e financeiro do seu lava rápido.",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    background_color: "#f3f6f9",
    theme_color: "#0b62c4",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
