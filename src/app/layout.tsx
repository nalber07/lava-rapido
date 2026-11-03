import type { Metadata, Viewport } from "next";
import { Geist, Bricolage_Grotesque } from "next/font/google";
import { RegistrarSW } from "@/components/registrar-sw";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Lava Rápido", template: "%s · Lava Rápido" },
  description: "Agenda, clientes, loja e financeiro do seu lava rápido, direto no celular.",
  applicationName: "Lava Rápido",
  appleWebApp: { capable: true, title: "Lava Rápido", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b62c4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
