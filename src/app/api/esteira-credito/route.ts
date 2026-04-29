import { NextResponse } from "next/server";
import { getAllCardsForBoard } from "@/lib/goalfy/api";

const BOARD_ID = "cb3732ce-d5d0-4268-889c-a08e3854eb13";

const JUNK_GERENTE = new Set([
  "outro", "prospectar", "poe na tela", "poe na tela", "credtem", "",
]);

export interface CardEsteira {
  id: string;
  razaoSocial: string;
  cnpj: string;
  gerente: string;
  fase: string;
  dataEntrada: string | null;
  diasNaFase: number;
}

function extractField(fields: { title: string; value: string }[], name: string): string {
  return fields.find((f) => f.title === name)?.value ?? "";
}

function getGerente(card: any): string {
  const sf = card.subtitleFields;
  if (Array.isArray(sf)) {
    const raw = extractField(sf, "Gerente Comercial Responsável").trim();
    if (raw && !JUNK_GERENTE.has(raw.toLowerCase())) return raw;
  }
  const tags = card.tags;
  if (tags) {
    const arr = Array.isArray(tags) ? tags : [tags];
    const active = arr.filter((t: any) => !t.deleted);
    const match = active.find((t: any) => t.text && !JUNK_GERENTE.has(t.text.toLowerCase()));
    if (match) return match.text;
  }
  return "—";
}

function diasDesde(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export async function GET() {
  try {
    const cards = await getAllCardsForBoard(BOARD_ID);

    const esteira: CardEsteira[] = cards
      .filter((c) => c.title && c.title !== "Rascunho")
      .map((c, i) => ({
        id: c.id ?? String(i),
        razaoSocial: c.title,
        cnpj: Array.isArray(c.subtitleFields) ? extractField(c.subtitleFields, "CNPJ") : "",
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
      esteira,
      meta: {
        fileName: "Goalfy — Esteira de Crédito",
        total: esteira.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
