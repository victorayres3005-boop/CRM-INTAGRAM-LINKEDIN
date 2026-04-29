import { NextResponse } from "next/server";
import { getAllCardsForBoard } from "@/lib/goalfy/api";

const BOARD_ID = "f17063b2-b47b-4446-bd8a-678a1fced766";

export interface CardAlteracao {
  id: string;
  razaoSocial: string;
  tipoAlteracao: string;
  dataAlerta: string | null;
  fase: string;
  dataEntrada: string | null;
  diasNaFase: number;
}

function extractField(fields: { title: string; value: string }[], name: string): string {
  return fields.find((f) => f.title === name)?.value?.trim() ?? "";
}

function diasDesde(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export async function GET() {
  try {
    const cards = await getAllCardsForBoard(BOARD_ID);

    const alteracoes: CardAlteracao[] = cards
      .filter((c) => c.title && c.title !== "Rascunho")
      .map((c, i) => {
        const sf = Array.isArray(c.subtitleFields) ? c.subtitleFields : [];
        return {
          id: c.id ?? String(i),
          razaoSocial: c.title,
          tipoAlteracao: extractField(sf, "Tipo de Alteração"),
          dataAlerta: extractField(sf, "Data do alerta") || null,
          fase: c.phaseName,
          dataEntrada: c.createdAt ? c.createdAt.split("T")[0] : null,
          diasNaFase: diasDesde(c.dateInCurrentPhase),
        };
      })
      .sort((a, b) => {
        if (!a.dataEntrada) return 1;
        if (!b.dataEntrada) return -1;
        return b.dataEntrada.localeCompare(a.dataEntrada);
      });

    return NextResponse.json({
      alteracoes,
      meta: {
        fileName: "Goalfy — Alteração Contratual",
        total: alteracoes.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
