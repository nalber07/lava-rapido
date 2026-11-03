"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { destinoSeguro, urlDoSite } from "@/lib/site";
import { erro, mensagemErro, sucesso, type Resultado } from "@/lib/resultado";
import { slugify } from "@/lib/format";

export async function entrar(_: Resultado, fd: FormData): Promise<Resultado> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("senha") ?? ""),
  });
  if (error) return erro(mensagemErro(error));
  redirect(destinoSeguro(fd.get("next")));
}

export async function criarConta(_: Resultado, fd: FormData): Promise<Resultado> {
  const nome = String(fd.get("nome") ?? "").trim();
  const telefone = String(fd.get("telefone") ?? "").trim();
  const next = destinoSeguro(fd.get("next"));
  if (nome.length < 2) return erro("Informe seu nome.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("senha") ?? ""),
    options: {
      data: { nome, telefone },
      emailRedirectTo: `${await urlDoSite()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return erro(mensagemErro(error));
  if (!data.session) return sucesso("Quase lá! Enviamos um link de confirmação para o seu e-mail.");
  redirect(next);
}

export async function cadastrarDono(_: Resultado, fd: FormData): Promise<Resultado> {
  const nome = String(fd.get("nome") ?? "").trim();
  const telefone = String(fd.get("telefone") ?? "").trim();
  const empresaNome = String(fd.get("empresa") ?? "").trim();
  const slug = slugify(String(fd.get("slug") || empresaNome));
  if (nome.length < 2) return erro("Informe seu nome.");
  if (empresaNome.length < 2) return erro("Informe o nome do lava rápido.");
  if (slug.length < 3) return erro("O endereço da página precisa ter pelo menos 3 letras.");

  const supabase = await createClient();
  const { data: existente } = await supabase.from("empresas").select("id").eq("slug", slug).maybeSingle();
  if (existente) return erro("Esse endereço de página já está em uso. Escolha outro.");

  const { data, error } = await supabase.auth.signUp({
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("senha") ?? ""),
    options: {
      data: { nome, telefone, empresa_nome: empresaNome, empresa_slug: slug },
      emailRedirectTo: `${await urlDoSite()}/auth/callback?next=/painel`,
    },
  });
  if (error) return erro(mensagemErro(error));
  if (!data.session) return sucesso("Conta criada! Confirme pelo link que enviamos ao seu e-mail para acessar o painel.");

  const { error: e2 } = await supabase.rpc("criar_empresa", { p_nome: empresaNome, p_slug: slug, p_telefone: telefone });
  if (e2) return erro(mensagemErro(e2));
  redirect("/painel");
}
