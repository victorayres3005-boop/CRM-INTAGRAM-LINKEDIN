"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  CreditCard,
  GitMerge,
  RotateCcw,
  ClipboardList,
  FilePen,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoFull } from "./LogoFull";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Briefcase;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Operação",
    items: [
      { href: "/dashboard/gerentes",        label: "Gerentes",            icon: Briefcase },
      { href: "/dashboard/analise-credito", label: "Análise de Crédito", icon: CreditCard },
      { href: "/dashboard/esteira-credito", label: "Esteira de Crédito", icon: GitMerge },
      { href: "/dashboard/reanalise",       label: "Reanálise",           icon: RotateCcw },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { href: "/dashboard/alteracao-contratual", label: "Alt. Contratual", icon: FilePen },
      { href: "/dashboard/ficha-pj",             label: "Ficha PF/PJ",      icon: ClipboardList },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

function getInitials(email: string | null | undefined) {
  if (!email) return "CF";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="relative w-60 h-screen sticky top-0 bg-cf-hero flex flex-col shrink-0 overflow-hidden border-r border-white/5">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cf-green/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

      {/* Logo block */}
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <LogoFull />
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 backdrop-blur-sm ring-1 ring-white/10">
          <Sparkles size={10} className="text-cf-green-light" />
          <span className="text-[10px] font-medium tracking-wider uppercase text-white/70">
            Plataforma de Crédito
          </span>
        </div>
      </div>

      {/* Subtle separator */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-white/35">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "group relative flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-white/15 to-white/5 text-white shadow-sm shadow-cf-navy-deep/40"
                          : "text-white/55 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      {/* Active accent bar */}
                      <span
                        className={cn(
                          "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full transition-all duration-200",
                          active
                            ? "bg-cf-green shadow-[0_0_10px_rgba(115,184,21,0.6)]"
                            : "bg-transparent group-hover:bg-white/25"
                        )}
                      />
                      <Icon
                        size={15}
                        strokeWidth={active ? 2.2 : 1.8}
                        className={cn(
                          "transition-colors shrink-0",
                          active
                            ? "text-cf-green-light"
                            : "text-white/50 group-hover:text-white/85"
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — user card */}
      <div className="relative px-3 pb-4 pt-3 border-t border-white/8">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/6 ring-1 ring-white/10 px-2.5 py-2 backdrop-blur-sm">
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cf-green to-cf-green-dark flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              {getInitials(email)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-cf-green border-2 border-cf-navy-deep" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate leading-tight">
              {email ? email.split("@")[0] : "Usuário"}
            </p>
            <p className="text-[10px] text-white/45 truncate leading-tight">
              {email ?? "carregando..."}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            aria-label="Sair da conta"
            className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={13} />
          </button>
        </div>
        <p className="mt-3 text-[9px] text-white/25 px-1 tracking-wider uppercase text-center">
          © 2026 Capital Finanças
        </p>
      </div>
    </aside>
  );
}
