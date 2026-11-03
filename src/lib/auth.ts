import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Empresa } from "@/lib/types";

export const getUsuario = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export type Contexto = {
  usuarioId: string;
  email: string;
  papel: "dono" | "funcionario";
  empresa: Empresa;
};

/** Empresa do usuário logado (primeira em que é membro). */
export const getContextoPainel = cache(async (): Promise<Contexto | null> => {
  const user = await getUsuario();
  if (!user) redirect("/entrar?next=/painel");
  const supabase = await createClient();
  const { data } = await supabase
    .from("membros")
    .select("papel, empresas(*)")
    .eq("usuario_id", user.id)
    .order("papel", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data?.empresas) return null;
  return {
    usuarioId: user.id,
    email: user.email ?? "",
    papel: data.papel as Contexto["papel"],
    empresa: data.empresas as unknown as Empresa,
  };
});

export async function exigirPainel() {
  const ctx = await getContextoPainel();
  if (!ctx) redirect("/painel");
  return ctx;
}

export async function exigirDono() {
  const ctx = await exigirPainel();
  if (ctx.papel !== "dono") redirect("/painel");
  return ctx;
}

/** Assinatura vencida bloqueia alterações (só leitura). */
export function assinaturaLiberada(e: Empresa) {
  if (e.status_assinatura === "ativa") return true;
  if (e.status_assinatura === "teste") return new Date(e.teste_ate) > new Date();
  if (e.status_assinatura === "atrasada" && e.assinatura_ate)
    return new Date(e.assinatura_ate).getTime() + 5 * 864e5 > Date.now();
  return false;
}

export function diasDeTeste(e: Empresa) {
  return Math.max(0, Math.ceil((new Date(e.teste_ate).getTime() - Date.now()) / 864e5));
}
