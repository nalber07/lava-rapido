import type { Metadata, Viewport } from "next";
import { Manrope, Michroma } from "next/font/google";
import Script from "next/script";
import { RegistrarSW } from "@/components/registrar-sw";
import { SCRIPT_TEMA } from "@/components/tema";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: "Pista · Agenda e gestão para lava rápido", template: "%s · Pista" },
  description: "Agenda, clientes, loja e financeiro do seu lava rápido, direto no celular.",
  applicationName: "Pista",
  appleWebApp: { capable: true, title: "Pista", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e5e5e5" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${manrope.variable} ${michroma.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Script id="tema" strategy="beforeInteractive">
          {SCRIPT_TEMA}
        </Script>
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
