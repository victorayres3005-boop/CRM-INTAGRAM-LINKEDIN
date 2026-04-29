"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase, CreditCard, GitMerge, RotateCcw, ClipboardList, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoFull } from "./LogoFull";

const navItems = [
  { href: "/dashboard/gerentes",        label: "Gerentes",           icon: Briefcase },
  { href: "/dashboard/analise-credito", label: "Análise de Crédito", icon: CreditCard },
  { href: "/dashboard/esteira-credito", label: "Esteira de Crédito", icon: GitMerge },
  { href: "/dashboard/reanalise",       label: "Reanálise",          icon: RotateCcw },
  { href: "/dashboard/ficha-pj",        label: "Ficha PF/PJ",        icon: ClipboardList },
  { href: "/dashboard/configuracoes",   label: "Configurações",      icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen sticky top-0 bg-cf-hero flex flex-col shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/8">
        <LogoFull />
        <p className="text-[10px] text-white/30 mt-1.5 tracking-widest uppercase">CRM Orgânico</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                active
                  ? "bg-white/12 text-white"
                  : "text-white/45 hover:bg-white/7 hover:text-white/80"
              )}
            >
              <Icon size={14} className={active ? "text-cf-green-light" : "opacity-60"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/8">
        <p className="text-[10px] text-white/20">© 2026 Capital Finanças</p>
      </div>
    </aside>
  );
}
