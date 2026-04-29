import { createClient } from "@/lib/supabase/server";
import { InstagramTokenForm } from "@/components/dashboard/InstagramTokenForm";
import { Instagram, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: tokenData } = await supabase
    .from("instagram_tokens")
    .select("account_id, expires_at, last_refreshed_at, accounts(username, display_name, avatar_url, last_sync_at)")
    .limit(1)
    .maybeSingle();

  const isConnected = !!tokenData;
  const account = tokenData?.accounts as {
    username: string;
    display_name: string;
    avatar_url?: string;
    last_sync_at?: string;
  } | null;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cf-navy">Configurações</h1>
        <p className="text-sm text-cf-navy/50 mt-1">
          Gerencie as integrações da plataforma
        </p>
      </div>

      {params.success === "connected" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle2 size={16} />
          Instagram conectado com sucesso!
        </div>
      )}
      {params.error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          Erro na autenticação. Tente novamente.
        </div>
      )}

      {/* Card Instagram */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-cf-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#833ab4] flex items-center justify-center">
            <Instagram size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-cf-navy text-sm">Instagram</h2>
            <p className="text-xs text-cf-navy/40">
              Importe posts e métricas da sua conta Business
            </p>
          </div>
          <div className="ml-auto">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Desconectado
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {isConnected && account && (
            <>
              <div className="flex items-center gap-3">
                {account.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={account.avatar_url}
                    alt={account.display_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cf-navy/10 flex items-center justify-center text-cf-navy font-bold text-sm">
                    {account.display_name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-cf-navy">{account.display_name}</p>
                  <p className="text-xs text-cf-navy/40">@{account.username}</p>
                </div>
              </div>

              {account.last_sync_at && (
                <div className="flex items-center gap-2 text-xs text-cf-navy/40">
                  <Clock size={13} />
                  Última sincronização:{" "}
                  {format(new Date(account.last_sync_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              )}

              {tokenData.expires_at && (
                <p className="text-xs text-cf-navy/30">
                  Token válido até{" "}
                  {format(new Date(tokenData.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </>
          )}

          <InstagramTokenForm isConnected={isConnected} />
        </div>
      </div>

      {/* Instruções para pegar o token */}
      {!isConnected && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-cf-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-cf-navy">Como gerar o token</h3>
          </div>
          <div className="px-6 py-5 space-y-4">
            <ol className="space-y-4">
              {[
                {
                  n: "1",
                  title: "Crie uma conta no Meta for Developers",
                  desc: "Acesse developers.facebook.com e clique em Começar (pode usar conta pessoal do Facebook).",
                },
                {
                  n: "2",
                  title: "Crie um App do tipo Business",
                  desc: 'Clique em "Criar App" → selecione "Empresa" → dê qualquer nome → adicione o produto Instagram Graph API.',
                },
                {
                  n: "3",
                  title: "Abra o Graph API Explorer",
                  desc: 'No menu superior clique em "Ferramentas" → "Graph API Explorer". Selecione seu App no topo.',
                },
                {
                  n: "4",
                  title: "Gere o token com as permissões certas",
                  desc: 'Clique em "Gerar token de acesso" → marque: instagram_business_basic e instagram_business_manage_insights → confirme.',
                },
                {
                  n: "5",
                  title: "Cole o token aqui",
                  desc: "Copie o token gerado e cole no campo acima. A plataforma vai validar e salvar automaticamente.",
                },
              ].map(({ n, title, desc }) => (
                <li key={n} className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-cf-navy text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-cf-navy">{title}</p>
                    <p className="text-xs text-cf-navy/50 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
              O token gerado dura 60 dias. Após esse período, basta gerar um novo e colar aqui novamente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
