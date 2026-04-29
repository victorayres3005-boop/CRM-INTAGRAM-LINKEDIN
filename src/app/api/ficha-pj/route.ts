import { NextResponse } from "next/server";
import { getAllCardsForBoard } from "@/lib/goalfy/api";

const BOARD_ID = "d42e30ae-f9b2-44ad-bb97-574f8828a438";

// Remove número prefix das fases: "1. Entrada - Análise documental" → "Entrada - Análise documental"
function cleanPhaseName(name: string): string {
  return name.replace(/^\d+(\.\d+)?\.\s*/, "");
}

// subtitleFields pode ser objeto único ou array dependendo do board
function getRazaoSocial(card: any): string {
  const sf = card.subtitleFields;
  if (!sf) return card.title ?? "";
  if (Array.isArray(sf)) return sf.find((f: any) => f.title?.toLowerCase().includes("raz"))?.value ?? card.title ?? "";
  return sf.value ?? card.title ?? "";
}

// Gerente vem via tags no board Ficha PF/PJ
function getGerente(card: any): string {
  const tags = card.tags;
  if (!tags) return "—";
  const arr = Array.isArray(tags) ? tags : [tags];
  return arr.find((t: any) => !t.deleted)?.text ?? "—";
}

export interface FichaPJ {
  id: string;
  razaoSocial: string;
  gerente: string;
  fase: string;
  faseOriginal: string;
  dataEntrada: string | null;
  diasNaFase: number;
}

function diasDesde(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export async function GET() {
  try {
    const cards = await getAllCardsForBoard(BOARD_ID);

    const fichas: FichaPJ[] = cards
      .filter((c) => c.title && c.title !== "Rascunho")
      .map((c, i) => ({
        id: c.id ?? String(i),
        razaoSocial: getRazaoSocial(c),
        gerente: getGerente(c),
        fase: cleanPhaseName(c.phaseName),
        faseOriginal: c.phaseName,
        dataEntrada: c.createdAt ? c.createdAt.split("T")[0] : null,
        diasNaFase: diasDesde(c.dateInCurrentPhase),
      }))
      .sort((a, b) => {
        if (!a.dataEntrada) return 1;
        if (!b.dataEntrada) return -1;
        return b.dataEntrada.localeCompare(a.dataEntrada);
      });

    return NextResponse.json({
      fichas,
      meta: {
        fileName: "Goalfy — Ficha PF/PJ V.2",
        total: fichas.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
