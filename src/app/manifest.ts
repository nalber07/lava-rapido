import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pista · Gestão de lava rápido",
    short_name: "Pista · Gestão de lava rápido",
    description: "Agenda, clientes, loja e financeiro do seu lava rápido.",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    background_color: "#eff3f8",
    theme_color: "#0f1f52",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
