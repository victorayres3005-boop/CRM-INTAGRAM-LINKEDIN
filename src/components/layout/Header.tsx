"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/dashboard":               { title: "Visão Geral",              sub: "Performance orgânica consolidada" },
  "/dashboard/posts":         { title: "Posts",                    sub: "Histórico de publicações" },
  "/dashboard/conteudo":      { title: "Desempenho de Conteúdo",   sub: "Análise por formato" },
  "/dashboard/leads":         { title: "Leads",                    sub: "Captações do conteúdo orgânico" },
  "/dashboard/crescimento":   { title: "Crescimento",              sub: "Seguidores e alcance" },
  "/dashboard/campanhas":     { title: "Campanhas",                sub: "Performance por campanha" },
  "/dashboard/gerentes":      { title: "Gerentes",                 sub: "Pipeline de captação" },
  "/dashboard/configuracoes": { title: "Configurações",            sub: "Integrações e conexões" },
};

export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: "CRM", sub: "" };

  return (
    <header className="bg-white border-b border-cf-border px-6 h-12 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-cf-text1">{page.title}</h2>
        <span className="text-cf-border">·</span>
        <p className="text-xs text-cf-text3">{page.sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cf-green" />
          <span className="text-[11px] text-cf-text3">Capital Finanças</span>
        </div>
      </div>
    </header>
  );
}
