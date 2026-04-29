const BASE_URL = "https://api.goalfy.com.br/api";
const TOKEN = process.env.GOALFY_TOKEN!;

function headers() {
  return { Authorization: `Token ${TOKEN}`, "Content-Type": "application/json" };
}

export interface GoalfyBoard {
  id: string;
  title: string;
  cardsCount: number;
  color: string;
  icon: string;
}

export interface GoalfyPhase {
  id: string;
  title: string;
  archived: boolean;
  index: number;
}

export interface GoalfyTag {
  id: string;
  text: string;
  color: string;
  deleted: boolean;
}

export interface GoalfyCard {
  id: string;
  title: string;
  phaseId: string;
  formId: string;
  createdAt: string;
  updatedAt: string;
  dateInCurrentPhase: string;
  subtitleFields: { id: string; title: string; fieldType: string; value: string }[];
  tags: GoalfyTag[];
  responsibles: { id: string; name: string; email?: string }[];
  form?: { fields: { title: string; value: string; fieldType?: string }[] };
}

export interface GerenteProfile {
  userId: string;
  nome: string;
  email: string;
  telefone: string;
}

export async function listBoards(): Promise<GoalfyBoard[]> {
  const res = await fetch(`${BASE_URL}/boards`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Goalfy /boards: ${res.status}`);
  const data = await res.json();
  return data.boards ?? data;
}

export async function getBoard(boardId: string): Promise<GoalfyBoard> {
  const res = await fetch(`${BASE_URL}/boards/${boardId}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Goalfy /boards/${boardId}: ${res.status}`);
  return res.json();
}

export async function listPhases(boardId: string): Promise<GoalfyPhase[]> {
  const res = await fetch(`${BASE_URL}/phases/board/${boardId}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Goalfy /phases/board/${boardId}: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.phases ?? [];
}

export async function listCardsInPhase(phaseId: string): Promise<GoalfyCard[]> {
  const res = await fetch(`${BASE_URL}/cards/phase/${phaseId}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getCard(cardId: string): Promise<GoalfyCard> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Goalfy /cards/${cardId}: ${res.status}`);
  return res.json();
}

export async function getAllCardsForBoard(boardId: string): Promise<(GoalfyCard & { phaseName: string })[]> {
  const phases = await listPhases(boardId);
  const results: (GoalfyCard & { phaseName: string })[] = [];

  await Promise.all(
    phases
      .filter((p) => !p.archived)
      .map(async (phase) => {
        const cards = await listCardsInPhase(phase.id);
        for (const card of cards) {
          results.push({ ...card, phaseName: phase.title });
        }
      })
  );

  return results;
}

async function fetchCardFormFields(cardId: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BASE_URL}/cards/${cardId}`, { headers: headers(), cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    const out: Record<string, string> = {};
    if (Array.isArray(data.form?.fields)) {
      for (const f of data.form.fields) {
        if (f.title && f.value != null && typeof f.value === "string") {
          out[f.title] = f.value.trim();
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

function formatBRPhone(raw: string): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  const local = d.startsWith("55") && d.length >= 12 ? d.slice(2) : d;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return raw;
}

/**
 * Busca 1 card por gerente único (via responsibles[0].id) e extrai
 * nome, email e telefone dos form fields. Muito mais rápido que buscar
 * todos os cards — faz apenas G chamadas paralelas (G = nº de gerentes únicos).
 */
export async function buildGerenteProfiles(
  cards: GoalfyCard[]
): Promise<Map<string, GerenteProfile>> {
  const byUserId = new Map<string, GoalfyCard>();
  for (const card of cards) {
    const resp = card.responsibles?.[0];
    if (resp?.id && !byUserId.has(resp.id)) byUserId.set(resp.id, card);
  }

  const profiles = new Map<string, GerenteProfile>();

  await Promise.all(
    Array.from(byUserId.entries()).map(async ([userId, card]) => {
      const resp = card.responsibles[0];
      const fields = await fetchCardFormFields(card.id);
      const nome     = fields["Gerente Comercial Responsável"] || resp.name;
      const email    = fields["E-mail do Gerente"]   || resp.email || "";
      const telefone = formatBRPhone(fields["Telefone do Gerente"] || "");
      profiles.set(userId, { userId, nome, email, telefone });
    })
  );

  return profiles;
}
