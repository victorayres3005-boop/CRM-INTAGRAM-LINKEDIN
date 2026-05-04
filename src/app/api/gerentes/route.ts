import { NextResponse } from "next/server";
import { getAllCardsForBoard, buildGerenteProfiles } from "@/lib/goalfy/api";
import staticProfiles from "@/data/gerentes-profiles.json";

const BOARD_ID = "9583bd08-77ad-4821-b19f-c35148f6439a"; // Solicitação de Cadastro

// Tags que NÃO representam gerente — devem ser ignoradas mesmo quando aparecem
// junto a uma tag de gerente real (ex: card com tags ["Mari", "Cecilia Guedes"]).
const NON_GERENTE_TAGS = new Set(
  [
    "Mari",
    "Pendencia", "Pendência", "Pendências", "Pendencias",
    "Pendente", "Pendente ",
    "Conferido", "Questionamentos",
    "Grupo", "COOPEROESTE",
    "Alfred",
    "Vitori", "Vitória", "Vitoria",
  ].map(normalize)
);

// Responsáveis do back-office (não são gerentes). Quando aparecem como
// responsável de um card, a regra cai pra tag de gerente do próprio card.
const BACK_OFFICE_RESPONSIBLES = new Set(
  ["Debora", "wilson", "gabriela.oliveira", "r10gestaoenegocios"].map(normalize)
);

// Mapeamento fase Goalfy → SubStatus exibido na plataforma
const FASE_PARA_SUBSTATUS: Record<string, string> = {
  "Liberado":  "Liberado",
  "Ativado":   "Ativado",
  "Negado":       "Negado",
  "Negado (pré)": "Negado (pré)",
  "Cancelado":    "Cancelado",
  "Formalização":                    "Aprovado",
  "Pendência de Formalização":       "Aprovado",
  "Pendência de formalização":       "Aprovado",
  "Pendencias de Formalização":      "Aprovado",
  "Pendências de Formalização":      "Aprovado",
  "Pendências de formalização":      "Aprovado",
  "Pendências Formalização":         "Aprovado",
  "Aguardando assinatura":           "Aprovado",
  "Assinatura":                      "Aprovado",
  "Pendente Gestor":                 "Aprovado",
  "Analise QI":                      "Aprovado",
  "Analise Qi (Pendencias cedente)": "Aprovado",
  "Analise Gestora":                 "Aprovado",
  "Analise gestor":                  "Aprovado",
  "Entrada":                                "Em análise",
  "Pré Análise":                            "Em análise",
  "Pendencias Iniciais":                    "Em análise",
  "Pendências Iniciais":                    "Em análise",
  "Pendências iniciais":                    "Em análise",
  "Pendências Iniciais (relatorio de visita)": "Em análise",
  "Conferência Interna":                    "Em análise",
  "Análise de Crédito":                     "Em análise",
  "Analise de Crédito":                     "Em análise",
  "Análise de Crédito (pendências)":        "Em análise",
  "Analise de Crédito (Questionamentos)":   "Em análise",
  "Questionamentos":                        "Em análise",
  "Pendências Comitê De Crédito":           "Em análise",
};

export interface Cadastro {
  id: string;
  cliente: string;
  nomeGrupo: string;
  gerente: string;
  dataEntrada: string | null;
  etapaFunil: string;
  substatus: string;
}

export interface GerenteInfo {
  nome: string;
  exclusividade: string;
  supervisor: string;
  telefone: string;
  email: string;
}

function normalize(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// ── Catálogo canônico de gerentes (do JSON estático, alinhado ao Excel) ──────
//
// O JSON contém 30 entradas com aliases (ex.: "Keyla" + "Keyla Costa"). Para
// cada entrada construímos um índice no nome normalizado e também no primeiro
// nome, permitindo casar tags/responsáveis em variações comuns.
const PROFILES = staticProfiles as GerenteInfo[];

// Aliases conhecidos vindos do Goalfy (responsáveis com nomes "feios" como
// usuários internos) → nome canônico que aparece na lista de gerentes.
const RESPONSIBLE_ALIASES: Record<string, string> = {
  "alexander.ciarlo":         "Alexsander Ciarlo",
  "alexsandro slongo":        "Alexsandro Slongo",
  "cecilia guedes":           "Cecilia Guedes",
  "dalvinha1972":             "Dalva",
  "douglasbeelwolf":          "Douglas Medeiros",
  "everton.schmidt":          "Everton",
  "gleyson":                  "Gleyson Azevedo",
  "guilherme":                "Guilherme (Nexus)",
  "hernani raga":             "Hernani",
  "joao.michelazzo":          "João Michelazzo",
  "keyla":                    "Keyla",
  "keyla costa":              "Keyla",
  "luiz":                     "Luiz Carlos",
  "lukinhaamorim":            "Lucas Amorim",
  "magnoduke99":              "Magno",
  "marcio.ciappina":          "Marcio Ciappina",
  "nex negocios e empresas":  "Nex",
  "rogerio":                  "Rogério",
  "rogerio rabelo":           "Rogério",
  "rolan.marino":             "Rolan",
  "washingtonsav":            "Washington",
};

// Índice normalizado → nome canônico (preferencial). Quando há múltiplos
// aliases para o mesmo gerente (ex.: "Rogério" e "Rogério Rabelo"), o
// `RESPONSIBLE_ALIASES` acima decide quem ganha.
function buildCanonicalIndex(): Map<string, string> {
  const idx = new Map<string, string>();
  for (const p of PROFILES) {
    const key = normalize(p.nome);
    if (!idx.has(key)) idx.set(key, p.nome);
  }
  for (const [alias, canonical] of Object.entries(RESPONSIBLE_ALIASES)) {
    idx.set(normalize(alias), canonical);
  }
  return idx;
}

const CANONICAL_INDEX = buildCanonicalIndex();
const PROFILE_BY_NAME = new Map(PROFILES.map((p) => [p.nome, p] as const));

function resolveGerenteName(raw: string): string | null {
  if (!raw) return null;
  const key = normalize(raw);
  if (NON_GERENTE_TAGS.has(key)) return null;
  return CANONICAL_INDEX.get(key) ?? null;
}

// Escolhe o gerente do card seguindo a regra acordada com o time:
//   1. responsibles[0] que case com um gerente conhecido (resolvendo aliases)
//   2. senão, primeira tag que case com um gerente conhecido (ignorando "Mari"
//      e demais tags de status/categoria)
//   3. senão, primeiro nome "novo" — responsável ou tag não blacklistado —
//      auto-detectado para que gerentes novos no Goalfy apareçam sem código novo
//   4. senão, "Sem Gerente"
function escolherGerente(card: {
  responsibles?: { id?: string; name?: string }[];
  tags?: { text: string; deleted?: boolean }[];
}): { nome: string; userId: string; auto: boolean } {
  const resp = card.responsibles?.[0];
  const respIsBackOffice = resp?.name
    ? BACK_OFFICE_RESPONSIBLES.has(normalize(resp.name))
    : false;

  if (resp?.name && !respIsBackOffice) {
    const canon = resolveGerenteName(resp.name);
    if (canon) return { nome: canon, userId: resp.id ?? "", auto: false };
  }

  const tags = (card.tags ?? []).filter((t) => !t.deleted);

  for (const t of tags) {
    const canon = resolveGerenteName(t.text);
    if (canon) return { nome: canon, userId: "", auto: false };
  }

  // Auto-detecção: tag fora da blacklist e sem match canônico
  for (const t of tags) {
    if (!NON_GERENTE_TAGS.has(normalize(t.text))) {
      return { nome: t.text.trim(), userId: "", auto: true };
    }
  }

  // Responsável fora do catálogo e fora do back-office → auto-detectado
  if (resp?.name && !respIsBackOffice) {
    return { nome: resp.name.trim(), userId: resp.id ?? "", auto: true };
  }

  return { nome: "Sem Gerente", userId: "", auto: false };
}

function normalizeEtapa(phaseName: string): string {
  return FASE_PARA_SUBSTATUS[phaseName] ?? "Em análise";
}

function extractCnpj(card: { subtitleFields: { title: string; value: string }[] }): string {
  const field = card.subtitleFields.find((f) => f.title === "CNPJ");
  return field?.value ?? "";
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const cards = await getAllCardsForBoard(BOARD_ID);

    const gerenteProfiles = await buildGerenteProfiles(cards);

    const cadastros: Cadastro[] = cards
      .filter((c) => c.title && c.title !== "Rascunho")
      .map((c, i) => {
        const escolha = escolherGerente(c);
        return {
          id: c.id ?? String(i),
          cliente: extractCnpj(c),
          nomeGrupo: c.title,
          gerente: escolha.nome,
          dataEntrada: c.createdAt ? c.createdAt.split("T")[0] : null,
          etapaFunil: normalizeEtapa(c.phaseName),
          substatus: "",
        };
      })
      .sort((a, b) => {
        if (!a.dataEntrada) return 1;
        if (!b.dataEntrada) return -1;
        return b.dataEntrada.localeCompare(a.dataEntrada);
      });

    // Mapa userId Goalfy → nome canônico (pra puxar email/telefone do Goalfy)
    const goalfyByCanonical = new Map<string, { email: string; telefone: string }>();
    for (const [, profile] of gerenteProfiles) {
      const canon = resolveGerenteName(profile.nome);
      if (canon && !goalfyByCanonical.has(canon)) {
        goalfyByCanonical.set(canon, {
          email: profile.email ?? "",
          telefone: profile.telefone ?? "",
        });
      }
    }

    // Gerentes a exibir = catálogo canônico + qualquer auto-detectado nos cards.
    // Garante que TODOS os gerentes do Excel apareçam (mesmo zerados) e que
    // gerentes novos no Goalfy apareçam automaticamente sem mexer em código.
    const equipe = new Map<string, GerenteInfo>();

    // Catálogo (Excel/JSON), eliminando aliases duplicados — mantém só o nome
    // canônico definido pelo CANONICAL_INDEX.
    const seen = new Set<string>();
    for (const p of PROFILES) {
      const canon = CANONICAL_INDEX.get(normalize(p.nome)) ?? p.nome;
      if (seen.has(canon)) continue;
      seen.add(canon);
      const profile = PROFILE_BY_NAME.get(canon) ?? p;
      const goalfy = goalfyByCanonical.get(canon);
      equipe.set(canon, {
        nome:          canon,
        exclusividade: profile.exclusividade,
        supervisor:    profile.supervisor,
        telefone:      goalfy?.telefone || profile.telefone,
        email:         goalfy?.email    || profile.email,
      });
    }

    // Auto-detectados (qualquer gerente que apareceu em card mas não está no JSON)
    for (const c of cadastros) {
      if (!c.gerente || c.gerente === "Sem Gerente") continue;
      if (equipe.has(c.gerente)) continue;
      equipe.set(c.gerente, {
        nome:          c.gerente,
        exclusividade: "",
        supervisor:    "",
        telefone:      "",
        email:         "",
      });
    }

    // Card "Sem Gerente" sempre presente na equipe — captura cards que sobem
    // no Goalfy sem responsável e sem tag de gerente.
    equipe.set("Sem Gerente", {
      nome:          "Sem Gerente",
      exclusividade: "Pendente atribuição",
      supervisor:    "",
      telefone:      "",
      email:         "",
    });

    // Mantém "Sem Gerente" sempre no fim da lista, demais ordenados A→Z.
    const gerentes = Array.from(equipe.values()).sort((a, b) => {
      if (a.nome === "Sem Gerente") return 1;
      if (b.nome === "Sem Gerente") return -1;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });

    return NextResponse.json({
      cadastros,
      gerentes,
      meta: {
        fileName: "Goalfy — Solicitação de Cadastro",
        totalCadastros: cadastros.length,
        updatedAt: new Date().toISOString(),
        source: "goalfy",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
