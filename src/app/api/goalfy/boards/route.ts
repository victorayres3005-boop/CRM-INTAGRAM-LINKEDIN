import { NextResponse } from "next/server";
import { listBoards, listPhases, listCardsInPhase } from "@/lib/goalfy/api";

export async function GET() {
  try {
    const boards = await listBoards();
    return NextResponse.json({ boards });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
