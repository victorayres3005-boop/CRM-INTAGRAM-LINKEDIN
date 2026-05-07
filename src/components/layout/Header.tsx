"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/dashboard/gerentes":            { title: "Gerentes",            sub: "Pipeline de captação" },
  "/dashboard/analise-credito":     { title: "Análise de Crédito",  sub: "Solicitações em avaliação" },
  "/dashboard/esteira-credito":     { title: "Esteira de Crédito",  sub: "Operações em andamento" },
  "/dashboard/reanalise":           { title: "Reanálise",           sub: "Casos para revisão" },
  "/dashboard/alteracao-contratual":{ title: "Alteração Contratual",sub: "Pedidos de alteração" },
  "/dashboard/ficha-pj":            { title: "Ficha PF/PJ",         sub: "Cadastros completos" },
  "/dashboard/configuracoes":       { title: "Configurações",       sub: "Integrações e conexões" },
};

function openCommandPalette() {
  document.dispatchEvent(new CustomEvent("cf:open-command"));
}

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
        <button
          onClick={openCommandPalette}
          className="group flex items-center gap-2 h-7 pl-2.5 pr-1.5 rounded-md border border-cf-border bg-cf-bg hover:bg-white hover:border-cf-navy/20 transition-colors"
          aria-label="Abrir busca global"
        >
          <Search size={12} className="text-cf-text3 group-hover:text-cf-navy" />
          <span className="text-[11px] text-cf-text3 group-hover:text-cf-text2">Buscar...</span>
          <kbd className="text-[9px] font-mono text-cf-text3 px-1 py-0.5 rounded border border-cf-border bg-white">
            ⌘K
          </kbd>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cf-green" />
          <span className="text-[11px] text-cf-text3">Capital Finanças</span>
        </div>
      </div>
    </header>
  );
}
