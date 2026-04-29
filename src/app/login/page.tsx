"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail, Lock, UserPlus, TrendingUp, Users, BarChart2,
  Shield, ArrowRight, Loader2,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { LogoFull } from "@/components/layout/LogoFull";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup" | "recover";

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials":                          "Email ou senha incorretos.",
  "Email not confirmed":                                "Confirme seu email antes de entrar.",
  "User already registered":                            "Este email já está cadastrado.",
  "Password should be at least 6 characters":           "A senha deve ter pelo menos 6 caracteres.",
  "Unable to validate email address: invalid format":   "Formato de email inválido.",
  "For security purposes":                              "Aguarde alguns instantes antes de tentar novamente.",
};

function mapError(msg: string): string {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return val;
  }
  return "Ocorreu um erro. Tente novamente.";
}

const features = [
  {
    icon: TrendingUp,
    title: "Crescimento rastreado",
    desc: "Monitore seguidores, alcance e engajamento em tempo real.",
  },
  {
    icon: Users,
    title: "Gestão de leads",
    desc: "Capture e gerencie relacionamentos com sua audiência orgânica.",
  },
  {
    icon: BarChart2,
    title: "Análise de campanhas",
    desc: "Métricas detalhadas de posts, stories e desempenho de conteúdo.",
  },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const message = params.get("message");
  const nextUrl = params.get("next") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const start = Date.now();
    const minDelay = () =>
      new Promise((r) => setTimeout(r, Math.max(0, 500 - (Date.now() - start))));

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        await minDelay();
        if (error) { toast.error(mapError(error.message)); return; }
        toast.success("Bem-vindo de volta!");
        router.push(nextUrl);
        router.refresh();

      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        await minDelay();
        if (error) { toast.error(mapError(error.message)); return; }
        toast.success("Conta criada! Verifique seu email para confirmar.");

      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard/configuracoes`,
        });
        await minDelay();
        if (error) { toast.error(mapError(error.message)); return; }
        toast.success("Email de recuperação enviado. Verifique sua caixa de entrada.");
        setMode("login");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[384px]">
      {/* Success banner */}
      {message && (
        <div className="mb-5 flex items-center gap-2.5 rounded-md bg-[#f3fae6] border border-[#73b815]/30 px-4 py-3 text-[13px] text-[#16a34a] font-medium">
          <span>✓</span>
          {decodeURIComponent(message)}
        </div>
      )}

      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[22px] font-semibold text-cf-navy tracking-tight">
          {mode === "login"   && "Entrar na plataforma"}
          {mode === "signup"  && "Criar uma conta"}
          {mode === "recover" && "Recuperar senha"}
        </h2>
        <p className="text-cf-text3 text-[13px] mt-1">
          {mode === "login"   && "Bem-vindo de volta à Capital Finanças."}
          {mode === "signup"  && "Preencha os dados para criar sua conta."}
          {mode === "recover" && "Enviaremos um link para redefinir sua senha."}
        </p>
      </div>

      {/* Tabs login ↔ signup */}
      {mode !== "recover" && (
        <div className="mb-6 flex rounded-lg bg-cf-surface p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[13px] font-medium transition-all",
                mode === m
                  ? "bg-white text-cf-navy shadow-cf-sm"
                  : "text-cf-text3 hover:text-cf-text2"
              )}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name — signup only */}
        {mode === "signup" && (
          <div>
            <label className="block text-[12px] font-medium text-cf-text2 mb-1.5">
              Nome completo
            </label>
            <div className="relative">
              <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cf-text3 pointer-events-none" />
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-[12px] font-medium text-cf-text2 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cf-text3 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="input-field"
            />
          </div>
        </div>

        {/* Password — login & signup */}
        {mode !== "recover" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-medium text-cf-text2">Senha</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("recover")}
                  className="text-[12px] text-cf-navy hover:text-cf-navy-dark transition-colors"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cf-text3 pointer-events-none" />
              <input
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <Loader2 size={14} className="animate-spin" />
            : <ArrowRight size={14} />
          }
          {mode === "login"   && (loading ? "Entrando…"        : "Entrar na plataforma")}
          {mode === "signup"  && (loading ? "Criando conta…"   : "Criar minha conta")}
          {mode === "recover" && (loading ? "Enviando…"        : "Enviar email de recuperação")}
        </button>

        {/* Back link — recover mode */}
        {mode === "recover" && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full text-center text-[13px] text-cf-text3 hover:text-cf-text2 transition-colors"
          >
            ← Voltar para o login
          </button>
        )}
      </form>

      {/* Security footer */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-cf-text3 text-[11px]">
        <Shield size={11} className="shrink-0" />
        <span>Seus dados estão protegidos com criptografia</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Toaster position="top-right" richColors />

      <div className="min-h-screen flex">
        {/* ── Left panel (desktop only) ─────────────── */}
        <div
          className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f1f5c 0%, #203b88 60%, #1a4fa8 100%)" }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Decorative circles */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10" />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/8" />
          <div className="absolute bottom-24 -left-24 w-72 h-72 rounded-full border border-white/8" />
          <div className="absolute bottom-48 left-12 w-32 h-32 rounded-full border border-white/6" />

          {/* Logo */}
          <div className="relative px-10 pt-10">
            <LogoFull />
            <p className="text-[10px] text-white/30 mt-1.5 tracking-widest uppercase">CRM Orgânico</p>
          </div>

          {/* Hero content */}
          <div className="relative flex-1 flex flex-col justify-center px-10">
            <h1 className="text-[28px] font-semibold text-white leading-snug mb-3">
              Gerencie seu Instagram<br />
              <span style={{ color: "#a8d96b" }}>com inteligência</span>
            </h1>
            <p className="text-white/55 text-[14px] leading-relaxed mb-10 max-w-sm">
              Plataforma completa de CRM orgânico para equipes de marketing da Capital Finanças.
            </p>

            <ul className="space-y-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                    <Icon size={15} style={{ color: "#a8d96b" }} />
                  </span>
                  <div>
                    <p className="text-white text-[13px] font-semibold">{title}</p>
                    <p className="text-white/45 text-[12px] leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="relative px-10 pb-8">
            <p className="text-white/20 text-[11px]">© 2026 Capital Finanças. Todos os direitos reservados.</p>
          </div>
        </div>

        {/* ── Right panel ──────────────────────────── */}
        <div className="flex-1 flex flex-col bg-cf-bg">
          {/* Mobile header */}
          <div
            className="lg:hidden px-6 pt-6 pb-5"
            style={{ background: "linear-gradient(135deg, #0f1f5c 0%, #203b88 100%)" }}
          >
            <LogoFull />
            <p className="text-[10px] text-white/30 mt-1.5 tracking-widest uppercase">CRM Orgânico</p>
          </div>

          {/* Centered form */}
          <div className="flex-1 flex items-center justify-center px-6 py-10">
            <Suspense fallback={<div className="w-full max-w-[384px] animate-pulse" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
