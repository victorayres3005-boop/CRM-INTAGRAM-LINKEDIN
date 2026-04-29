import { NextResponse } from "next/server";
import { getAllCardsForBoard } from "@/lib/goalfy/api";

const BOARD_ID = "1b6f9b8c-97eb-4e47-9798-03a70f364ca3";

const JUNK_GERENTE = new Set(["prospectar", "outro", ""]);

export interface CardReanalise {
  id: string;
  razaoSocial: string;
  gerente: string;
  fase: string;
  dataEntrada: string | null;
  diasNaFase: number;
}

function extractField(fields: { title: string; value: string }[], name: string): string {
  return fields.find((f) => f.title === name)?.value?.trim() ?? "";
}

function getGerente(card: any): string {
  const sf = card.subtitleFields;
  if (!Array.isArray(sf)) return "—";
  const raw = extractField(sf, "Gerente");
  return raw && !JUNK_GERENTE.has(raw.toLowerCase()) ? raw : "—";
}

function getRazaoSocial(card: any): string {
  const sf = card.subtitleFields;
  if (!Array.isArray(sf)) return card.title ?? "";
  return extractField(sf, "Razão Social") || (card.title ?? "");
}

function diasDesde(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export async function GET() {
  try {
    const cards = await getAllCardsForBoard(BOARD_ID);

    const reanalise: CardReanalise[] = cards
      .filter((c) => c.title)
      .map((c, i) => ({
        id: c.id ?? String(i),
        razaoSocial: getRazaoSocial(c),
        gerente: getGerente(c),
        fase: c.phaseName,
        dataEntrada: c.createdAt ? c.createdAt.split("T")[0] : null,
        diasNaFase: diasDesde(c.dateInCurrentPhase),
      }))
      .sort((a, b) => {
        if (!a.dataEntrada) return 1;
        if (!b.dataEntrada) return -1;
        return b.dataEntrada.localeCompare(a.dataEntrada);
      });

    return NextResponse.json({
      reanalise,
      meta: {
        fileName: "Goalfy — Reanálise",
        total: reanalise.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
