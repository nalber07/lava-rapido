import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { RegistrarSW } from "@/components/registrar-sw";
import "./globals.css";

const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const barlowCond = Barlow_Condensed({
  variable: "--font-barlow-cond",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: "Pista · Agenda e gestão para lava rápido", template: "%s · Pista" },
  description: "Agenda, clientes, loja e financeiro do seu lava rápido, direto no celular.",
  applicationName: "Pista",
  appleWebApp: { capable: true, title: "Pista", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0f1f52",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} ${barlowCond.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
