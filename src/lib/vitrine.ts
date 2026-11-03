import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Empresa } from "@/lib/types";

export const getEmpresaPorSlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("empresas").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  return data as Empresa;
});

/** Cadastro do usuário logado como cliente desta empresa. */
export const getClienteAtual = cache(async (empresaId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, cliente: null };
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, telefone, selos")
    .eq("empresa_id", empresaId)
    .eq("usuario_id", user.id)
    .maybeSingle();
  return { user, cliente };
});
