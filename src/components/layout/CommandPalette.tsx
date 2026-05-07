"use client";

import { Command } from "cmdk";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Briefcase, CreditCard, GitMerge, RotateCcw, FilePen,
  ClipboardList, Settings, Building2, User, ArrowRight, Loader2,
} from "lucide-react";

type Cadastro = {
  id: string;
  cliente: string;
  nomeGrupo: string;
  gerente: string;
  dataEntrada: string | null;
  etapaFunil: string;
  substatus: string;
};

const navItems = [
  { href: "/dashboard/gerentes",             label: "Gerentes",            sub: "Pipeline de captação",      icon: Briefcase },
  { href: "/dashboard/analise-credito",      label: "Análise de Crédito", sub: "Solicitações em avaliação", icon: CreditCard },
  { href: "/dashboard/esteira-credito",      label: "Esteira de Crédito", sub: "Operações em andamento",    icon: GitMerge },
  { href: "/dashboard/reanalise",            label: "Reanálise",           sub: "Casos para revisão",        icon: RotateCcw },
  { href: "/dashboard/alteracao-contratual", label: "Alteração Contratual",sub: "Pedidos de alteração",      icon: FilePen },
  { href: "/dashboard/ficha-pj",             label: "Ficha PF/PJ",         sub: "Cadastros completos",       icon: ClipboardList },
  { href: "/dashboard/configuracoes",        label: "Configurações",       sub: "Integrações",                icon: Settings },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Global keyboard shortcut: Cmd/Ctrl+K + custom open event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("cf:open-command", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("cf:open-command", onOpen);
    };
  }, []);

  // Lazy fetch of cadastros on first open
  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    fetch("/api/gerentes")
      .then((r) => r.json())
      .then((d) => {
        setCadastros(d.cadastros ?? []);
        setFetched(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, fetched]);

  // Reset query on close
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // Unique gerentes derived from cadastros
  const gerentes = useMemo(() => {
    const set = new Set<string>();
    for (const c of cadastros) if (c.gerente) set.add(c.gerente);
    return Array.from(set).sort();
  }, [cadastros]);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/50 backdrop-blur-[2px] animate-fade-in-pure"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-cf-lg ring-1 ring-cf-border overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Busca global" shouldFilter={false}>
          {/* Search input */}
          <div className="flex items-center gap-2.5 px-4 border-b border-cf-border">
            <Search size={16} className="text-cf-text3 shrink-0" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Buscar cliente, gerente ou navegar..."
              className="flex-1 py-3.5 text-sm text-cf-text1 placeholder:text-cf-text3 outline-none bg-transparent"
            />
            {loading && <Loader2 size={14} className="animate-spin text-cf-text3" />}
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-cf-text3 px-1.5 py-0.5 rounded border border-cf-border bg-cf-bg font-mono">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-xs text-cf-text3">
              {loading ? "Carregando dados..." : "Nada encontrado."}
            </Command.Empty>

            {/* Navegação — sempre visível */}
            <Command.Group
              heading="Navegação"
              className="mb-2 [&>[cmdk-group-heading]]:px-2 [&>[cmdk-group-heading]]:py-1.5 [&>[cmdk-group-heading]]:text-[10px] [&>[cmdk-group-heading]]:font-semibold [&>[cmdk-group-heading]]:tracking-[0.14em] [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:text-cf-text3"
            >
              {navItems
                .filter((n) =>
                  query.trim() === "" ||
                  n.label.toLowerCase().includes(query.toLowerCase()) ||
                  n.sub.toLowerCase().includes(query.toLowerCase())
                )
                .map((n) => {
                  const Icon = n.icon;
                  return (
                    <Command.Item
                      key={n.href}
                      value={`nav-${n.label}`}
                      onSelect={() => handleSelect(n.href)}
                      onClick={() => handleSelect(n.href)}
                      className="flex items-center gap-3 px-2.5 py-2 rounded-md text-sm cursor-pointer aria-selected:bg-cf-green-pale aria-selected:text-cf-text1 text-cf-text2"
                    >
                      <Icon size={15} className="text-cf-navy shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium leading-tight truncate">{n.label}</p>
                        <p className="text-[11px] text-cf-text3 leading-tight truncate">{n.sub}</p>
                      </div>
                      <ArrowRight size={12} className="text-cf-text3" />
                    </Command.Item>
                  );
                })}
            </Command.Group>

            {/* Clientes — só com query */}
            {query.trim() !== "" && cadastros.length > 0 && (
              <Command.Group
                heading="Clientes"
                className="mb-2 [&>[cmdk-group-heading]]:px-2 [&>[cmdk-group-heading]]:py-1.5 [&>[cmdk-group-heading]]:text-[10px] [&>[cmdk-group-heading]]:font-semibold [&>[cmdk-group-heading]]:tracking-[0.14em] [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:text-cf-text3"
              >
                {cadastros
                  .filter((c) => {
                    const q = query.toLowerCase();
                    return (
                      c.nomeGrupo.toLowerCase().includes(q) ||
                      c.cliente.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 6)
                  .map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`cad-${c.id}`}
                      onSelect={() => handleSelect("/dashboard/gerentes")}
                      className="flex items-start gap-3 px-2.5 py-2 rounded-md cursor-pointer aria-selected:bg-cf-green-pale text-cf-text2"
                    >
                      <Building2 size={15} className="text-cf-navy shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-cf-text1 leading-tight truncate">
                          {c.nomeGrupo || c.cliente || "—"}
                        </p>
                        <p className="text-[11px] text-cf-text3 leading-tight truncate">
                          {c.gerente} · {c.etapaFunil}
                          {c.substatus ? ` · ${c.substatus}` : ""}
                        </p>
                      </div>
                    </Command.Item>
                  ))}
              </Command.Group>
            )}

            {/* Gerentes — só com query */}
            {query.trim() !== "" && gerentes.length > 0 && (
              <Command.Group
                heading="Gerentes"
                className="[&>[cmdk-group-heading]]:px-2 [&>[cmdk-group-heading]]:py-1.5 [&>[cmdk-group-heading]]:text-[10px] [&>[cmdk-group-heading]]:font-semibold [&>[cmdk-group-heading]]:tracking-[0.14em] [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:text-cf-text3"
              >
                {gerentes
                  .filter((g) => g.toLowerCase().includes(query.toLowerCase()))
                  .slice(0, 5)
                  .map((g) => {
                    const total = cadastros.filter((c) => c.gerente === g).length;
                    return (
                      <Command.Item
                        key={g}
                        value={`ger-${g}`}
                        onSelect={() => handleSelect("/dashboard/gerentes")}
                        onClick={() => handleSelect("/dashboard/gerentes")}
                        className="flex items-center gap-3 px-2.5 py-2 rounded-md cursor-pointer aria-selected:bg-cf-green-pale text-cf-text2"
                      >
                        <User size={15} className="text-cf-green-dark shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-cf-text1 leading-tight truncate">{g}</p>
                          <p className="text-[11px] text-cf-text3 leading-tight">{total} cadastro{total !== 1 ? "s" : ""}</p>
                        </div>
                      </Command.Item>
                    );
                  })}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer hint */}
          <div className="border-t border-cf-border px-3 py-2 flex items-center justify-between text-[10px] text-cf-text3 bg-cf-bg">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-cf-border bg-white font-mono">↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-cf-border bg-white font-mono">↵</kbd>
                abrir
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cf-green" />
              Busca em tempo real
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
