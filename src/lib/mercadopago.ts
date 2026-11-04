import "server-only";

const API = "https://api.mercadopago.com";

async function mp<T>(token: string, caminho: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!r.ok) {
    const corpo = await r.text().catch(() => "");
    console.error("Mercado Pago", r.status, caminho, corpo);
    throw new Error("Não foi possível falar com o Mercado Pago. Tente de novo em instantes.");
  }
  return r.json() as Promise<T>;
}

export type Referencia =
  | { tipo: "agendamento"; id: string }
  | { tipo: "pedido"; id: string }
  | { tipo: "assinatura_cliente"; id: string };

const PREFIXO = { agendamento: "ag", pedido: "pd", assinatura_cliente: "ac" } as const;

export function codificarReferencia(r: Referencia) {
  return `${PREFIXO[r.tipo]}:${r.id}`;
}

export function decodificarReferencia(s: string | null | undefined): Referencia | null {
  const [p, id] = String(s ?? "").split(":");
  const tipo = (Object.keys(PREFIXO) as (keyof typeof PREFIXO)[]).find((k) => PREFIXO[k] === p);
  return tipo && id ? ({ tipo, id } as Referencia) : null;
}

/** Checkout Pro (Pix e cartão) cobrado na conta do lava rápido. */
export async function criarCheckout(opts: {
  tokenEmpresa: string;
  empresaId: string;
  referencia: Referencia;
  titulo: string;
  valorCentavos: number;
  email?: string | null;
  site: string;
  voltarPara: string;
}) {
  const pref = await mp<{ init_point: string }>(opts.tokenEmpresa, "/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [{ title: opts.titulo, quantity: 1, unit_price: opts.valorCentavos / 100, currency_id: "BRL" }],
      external_reference: codificarReferencia(opts.referencia),
      payer: opts.email ? { email: opts.email } : undefined,
      notification_url: `${opts.site}/api/mercadopago/webhook?empresa=${opts.empresaId}`,
      back_urls: { success: opts.voltarPara, pending: opts.voltarPara, failure: opts.voltarPara },
      auto_return: "approved",
      statement_descriptor: "LAVARAPIDO",
    }),
  });
  return pref.init_point;
}

export async function buscarPagamento(token: string, id: string) {
  return mp<{ id: number; status: string; external_reference: string | null; payment_type_id?: string }>(
    token,
    `/v1/payments/${encodeURIComponent(id)}`,
  );
}

/** Assinatura mensal do dono (cobrada na conta da plataforma). */
export async function criarAssinaturaPlataforma(opts: {
  empresaId: string;
  planoId: string;
  nomePlano: string;
  valorCentavos: number;
  email: string;
  voltarPara: string;
}) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Pagamento da assinatura ainda não configurado (MP_ACCESS_TOKEN).");
  const r = await mp<{ init_point: string }>(token, "/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: `Pista · Plano ${opts.nomePlano}`,
      external_reference: `emp:${opts.empresaId}:${opts.planoId}`,
      payer_email: opts.email,
      back_url: opts.voltarPara,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: opts.valorCentavos / 100,
        currency_id: "BRL",
      },
      status: "pending",
    }),
  });
  return r.init_point;
}

export async function buscarAssinatura(id: string) {
  const token = process.env.MP_ACCESS_TOKEN!;
  return mp<{ id: string; status: string; external_reference: string; next_payment_date?: string }>(
    token,
    `/preapproval/${encodeURIComponent(id)}`,
  );
}
