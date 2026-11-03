import "server-only";
import { headers } from "next/headers";

export async function urlDoSite() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Evita redirecionamento para fora do site. */
export function destinoSeguro(next: FormDataEntryValue | string | null | undefined, padrao = "/painel") {
  const s = String(next ?? "");
  return s.startsWith("/") && !s.startsWith("//") ? s : padrao;
}
