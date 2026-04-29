import { ContentCharts } from "@/components/dashboard/charts/ContentCharts";
import { getContentTypePerformance } from "@/lib/supabase/queries";

export default async function ConteudoPage() {
  const data = await getContentTypePerformance();

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400">Nenhum dado de conteúdo disponível ainda.</p>
        <p className="text-sm text-gray-400 mt-1">Adicione posts e métricas no banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContentCharts data={data} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Ranking de formatos</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Formato</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Alcance médio</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Engajamento</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Leads gerados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...data].sort((a, b) => b.leads - a.leads).map((row, i) => (
              <tr key={row.tipo} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">
                  <span className="text-gray-400 mr-2">#{i + 1}</span>
                  {row.tipo}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {row.alcance.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right text-blue-600 font-medium">
                  {row.engajamento}%
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">
                  {row.leads}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
