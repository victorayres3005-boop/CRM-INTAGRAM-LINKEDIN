import { CampaignCharts } from "@/components/dashboard/charts/CampaignCharts";
import { getCampaignsWithMetrics } from "@/lib/supabase/queries";

export default async function CampanhasPage() {
  const campaigns = await getCampaignsWithMetrics();

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400">Nenhuma campanha cadastrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(c.start_date).toLocaleDateString("pt-BR")}
                  {c.end_date ? ` – ${new Date(c.end_date).toLocaleDateString("pt-BR")}` : " – em andamento"}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  !c.end_date ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {!c.end_date ? "Ativo" : "Encerrado"}
              </span>
            </div>
            {c.goal && <p className="text-sm text-gray-500">{c.goal}</p>}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xl font-bold text-gray-900">{c.totalReach.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-gray-400 mt-0.5">Alcance total</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xl font-bold text-green-600">{c.totalLeads}</p>
                <p className="text-xs text-gray-400 mt-0.5">Leads gerados</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xl font-bold text-blue-600">{c.avgEngagement}%</p>
                <p className="text-xs text-gray-400 mt-0.5">Engajamento médio</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xl font-bold text-gray-900">{c.posts}</p>
                <p className="text-xs text-gray-400 mt-0.5">Posts</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CampaignCharts data={campaigns} />
    </div>
  );
}
