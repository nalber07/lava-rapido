export const TZ = "America/Sao_Paulo";
/** Brasil sem horário de verão desde 2019. */
export const OFFSET = "-03:00";

export function moeda(centavos: number | null | undefined) {
  return ((centavos ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** "49,90" ou "49.90" ou "49" -> 4990 */
export function paraCentavos(valor: FormDataEntryValue | null): number {
  const s = String(valor ?? "").trim().replace(/[^\d,.-]/g, "");
  if (!s) return 0;
  const normal = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normal);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function centavosParaInput(centavos: number) {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export function hojeISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function somarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00${OFFSET}`);
  d.setUTCDate(d.getUTCDate() + dias);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

export function inicioDoDia(iso: string) {
  return `${iso}T00:00:00${OFFSET}`;
}

export function hora(ts: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

export function dataCurta(ts: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "short" }).format(new Date(ts)).replace(".", "");
}

export function primeiraMaiuscula(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function dataLonga(ts: string | Date) {
  return primeiraMaiuscula(
    new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(new Date(ts)),
  );
}

export function dataHora(ts: string | Date) {
  return `${dataCurta(ts)}, ${hora(ts)}`;
}

export function diaSemanaCurto(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short" })
    .format(new Date(`${iso}T12:00:00${OFFSET}`))
    .replace(".", "");
}

export function diaDoMes(iso: string) {
  return Number(iso.slice(8, 10));
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function apenasDigitos(s: string | null | undefined) {
  return (s ?? "").replace(/\D/g, "");
}

/** Link do WhatsApp com mensagem pronta (número brasileiro). */
export function linkWhatsApp(telefone: string | null | undefined, mensagem: string) {
  let n = apenasDigitos(telefone);
  if (n && !n.startsWith("55")) n = `55${n}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(mensagem)}`;
}

export function placaFormatada(p: string) {
  return p.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]{3})(\w{4})$/, "$1-$2");
}
