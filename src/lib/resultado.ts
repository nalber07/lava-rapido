export type Resultado = { ok: boolean; mensagem?: string } | null;

export function erro(mensagem: string): Resultado {
  return { ok: false, mensagem };
}

export function sucesso(mensagem?: string): Resultado {
  return { ok: true, mensagem };
}

/** Traduz erros comuns do Supabase/Postgres. */
export function mensagemErro(e: { message?: string; code?: string } | null | undefined) {
  if (!e) return "Algo deu errado. Tente de novo.";
  if (e.code === "23505") return "Já existe um cadastro com esses dados.";
  if (e.code === "42501") return "Você não tem permissão para isso.";
  if (e.code === "23503") return "Esse item está em uso e não pode ser removido.";
  const m = e.message ?? "";
  if (m.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("User already registered")) return "Esse e-mail já tem conta. Faça login.";
  if (m.includes("Password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  return m || "Algo deu errado. Tente de novo.";
}
