import { NextResponse } from "next/server";
import { getAllCardsForBoard, buildGerenteProfiles } from "@/lib/goalfy/api";
import staticProfiles from "@/data/gerentes-profiles.json";

const BOARD_ID = "9583bd08-77ad-4821-b19f-c35148f6439a"; // Solicitação de Cadastro

const STATUS_TAGS = new Set([
  "Prospectar", "Em Análise", "Aguardando", "Revisão", "Urgente",
  "Reanálise", "Pendencias", "Pendências", "Põe Na Tela",
  "Em Análise Jurídica", "Jurídico", "Escalado",
  "Conferido", "Pendencia", "Pendente", "Questionamentos",
  "Alfred", "Grupo", "Mari", "Vitori", "Vitória", "Vitoria",
]);

// Mapeamento fase Goalfy → SubStatus exibido na plataforma
const FASE_PARA_SUBSTATUS: Record<string, string> = {
  // Positivos finais
  "Liberado":  "Liberado",
  "Ativado":   "Ativado",
  // Negativos
  "Negado":       "Negado",
  "Negado (pré)": "Negado (pré)",
  "Cancelado":    "Cancelado",
  // Aprovado (crédito aprovado, pendente de formalização/assinatura)
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
  // Em análise (análise de crédito e etapas iniciais)
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

function gerenteIdFromCard(responsibles: { id?: string }[]): string {
  return responsibles?.[0]?.id ?? "";
}

function normalizeEtapa(phaseName: string): string {
  return FASE_PARA_SUBSTATUS[phaseName] ?? "Em análise";
}

function extractCnpj(card: { subtitleFields: { title: string; value: string }[] }): string {
  const field = card.subtitleFields.find((f) => f.title === "CNPJ");
  return field?.value ?? "";
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

// Índice do JSON estático: nome normalizado → perfil
const staticIndex = new Map<string, Omit<GerenteInfo, "nome">>();
for (const p of staticProfiles as GerenteInfo[]) {
  const key = normalize(p.nome);
  staticIndex.set(key, p);
  const first = key.split(" ")[0];
  if (first !== key) staticIndex.set(first, p);
}

function lookupStatic(nome: string): Omit<GerenteInfo, "nome"> {
  const key = normalize(nome);
  return staticIndex.get(key)
    ?? staticIndex.get(key.split(" ")[0])
    ?? { exclusividade: "", supervisor: "", telefone: "", email: "" };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const cards = await getAllCardsForBoard(BOARD_ID);

    // 1 chamada por gerente único → nome, email e telefone do Goalfy
    const gerenteProfiles = await buildGerenteProfiles(cards);

    const cadastros: Cadastro[] = cards
      .filter((c) => c.title && c.title !== "Rascunho")
      .map((c, i) => {
        const userId = gerenteIdFromCard(c.responsibles ?? []);
        const profile = gerenteProfiles.get(userId);
        return {
          id: c.id ?? String(i),
          cliente: extractCnpj(c),
          nomeGrupo: c.title,
          gerente: profile?.nome ?? "Sem Gerente",
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

    // Mesclar Goalfy (nome/email/telefone) + JSON estático (supervisor/exclusividade)
    const gerentesMap = new Map<string, GerenteInfo>();
    for (const [, profile] of gerenteProfiles) {
      if (!profile.nome || profile.nome === "Sem Gerente") continue;
      const static_ = lookupStatic(profile.nome);
      gerentesMap.set(profile.nome, {
        nome:          profile.nome,
        email:         profile.email    || static_.email,
        telefone:      profile.telefone || static_.telefone,
        supervisor:    static_.supervisor,
        exclusividade: static_.exclusividade,
      });
    }

    const gerentes = Array.from(gerentesMap.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

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
