import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buscarAssinatura, buscarPagamento, decodificarReferencia } from "@/lib/mercadopago";

/**
 * Notificações do Mercado Pago.
 * Nunca confiamos no corpo: buscamos o pagamento/assinatura na API com o nosso token.
 * - Pagamentos de clientes: ?empresa=<id> (token da empresa)
 * - Assinatura da plataforma: type=subscription_preapproval (token da plataforma)
 */
export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const corpo = (await request.json().catch(() => ({}))) as { type?: string; topic?: string; action?: string; data?: { id?: string } };
  const tipo = corpo.type ?? corpo.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = corpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
  if (!id || !tipo) return NextResponse.json({ ok: true });

  const admin = createAdminClient();

  try {
    if (tipo === "payment") {
      const empresaId = url.searchParams.get("empresa");
      if (!empresaId) return NextResponse.json({ ok: true });
      const { data: seg } = await admin.from("empresa_segredos").select("mp_access_token").eq("empresa_id", empresaId).maybeSingle();
      if (!seg?.mp_access_token) return NextResponse.json({ ok: true });

      const pag = await buscarPagamento(seg.mp_access_token, String(id));
      const ref = decodificarReferencia(pag.external_reference);
      if (!ref || pag.status !== "approved") return NextResponse.json({ ok: true });
      const forma = pag.payment_type_id === "bank_transfer" ? "pix" : "cartao";

      if (ref.tipo === "agendamento") {
        await admin
          .from("agendamentos")
          .update({ status_pagamento: "pago", forma_pagamento: forma, mp_pagamento_id: String(pag.id) })
          .eq("id", ref.id)
          .eq("empresa_id", empresaId)
          .neq("status_pagamento", "pago");
      } else if (ref.tipo === "pedido") {
        await admin
          .from("pedidos")
          .update({ status_pagamento: "pago", forma_pagamento: forma, mp_pagamento_id: String(pag.id) })
          .eq("id", ref.id)
          .eq("empresa_id", empresaId)
          .neq("status_pagamento", "pago");
      } else if (ref.tipo === "assinatura_cliente") {
        const { data: a } = await admin.from("assinaturas_cliente").select("status, empresa_id").eq("id", ref.id).maybeSingle();
        if (a && a.empresa_id === empresaId && a.status === "pendente") {
          await admin.rpc("ativar_assinatura_cliente", { p_id: ref.id });
        }
      }
    } else if (tipo === "subscription_preapproval" || tipo === "preapproval") {
      const sub = await buscarAssinatura(String(id));
      const [prefixo, empresaId, planoId] = String(sub.external_reference ?? "").split(":");
      if (prefixo !== "emp" || !empresaId) return NextResponse.json({ ok: true });

      if (sub.status === "authorized") {
        const ate = sub.next_payment_date ? new Date(sub.next_payment_date) : new Date(Date.now() + 31 * 864e5);
        await admin
          .from("empresas")
          .update({
            status_assinatura: "ativa",
            plano_id: ["basico", "profissional", "premium"].includes(planoId) ? planoId : "profissional",
            mp_assinatura_id: sub.id,
            assinatura_ate: ate.toISOString(),
          })
          .eq("id", empresaId);
      } else if (sub.status === "cancelled") {
        await admin.from("empresas").update({ status_assinatura: "cancelada" }).eq("id", empresaId).eq("mp_assinatura_id", sub.id);
      } else if (sub.status === "paused") {
        await admin.from("empresas").update({ status_assinatura: "atrasada" }).eq("id", empresaId).eq("mp_assinatura_id", sub.id);
      }
    }
  } catch (e) {
    console.error("webhook mercado pago", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
