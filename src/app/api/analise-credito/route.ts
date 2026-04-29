import { NextResponse } from "next/server";
import { getAllCardsForBoard } from "@/lib/goalfy/api";

const BOARD_ID = "38e78384-2a7d-49a2-9127-3b65ecb4e97f";

const GERENTES_CONHECIDOS = new Set([
  "antecipa", "caio", "celio", "célio", "dalva", "gleyson",
  "hernani", "keyla", "luiz carlos", "magno", "nex",
  "rogério", "rogerio", "rolan", "guilherme",
]);

export interface CardCredito {
  id: string;
  razaoSocial: string;
  cnpj: string;
  pleito: string;
  gerente: string;
  fase: string;
  dataEntrada: string | null;
  diasNaFase: number;
}

function extractField(fields: { title: string; value: string }[], name: string): string {
  return fields.find((f) => f.title === name)?.value ?? "";
}

function getGerente(card: any): string {
  const tags = card.tags;
  if (!tags) return "—";
  const arr = Array.isArray(tags) ? tags : [tags];
  const active = arr.filter((t: any) => !t.deleted);
  const match = active.find((t: any) => GERENTES_CONHECIDOS.has(t.text?.toLowerCase()));
  return match?.text ?? "—";
}

function diasDesde(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export async function GET() {
  try {
    const cards = await getAllCardsForBoard(BOARD_ID);

    const pleitos: CardCredito[] = cards
      .filter((c) => c.title && c.title !== "Rascunho")
      .map((c, i) => ({
        id: c.id ?? String(i),
        razaoSocial: c.title,
        cnpj: extractField(c.subtitleFields, "CNPJ"),
        pleito: extractField(c.subtitleFields, "Pleito"),
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
      pleitos,
      meta: {
        fileName: "Goalfy — Análise de Crédito",
        totalPleitos: pleitos.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
