import { GrowthCharts } from "@/components/dashboard/charts/GrowthCharts";
import { getGrowthData } from "@/lib/supabase/queries";
import { formatNumber } from "@/lib/utils";

export default async function CrescimentoPage() {
  const g = await getGrowthData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Seguidores Instagram</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(g.igNow)}</p>
          {g.igGrowthTotal > 0 && (
            <p className="text-xs text-green-600 font-medium mt-1">
              +{g.igGrowthTotal} ({g.igGrowthPct}%) em 6 semanas
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Seguidores LinkedIn</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(g.liNow)}</p>
          {g.liGrowthTotal > 0 && (
            <p className="text-xs text-green-600 font-medium mt-1">
              +{g.liGrowthTotal} ({g.liGrowthPct}%) em 6 semanas
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Média ganho/semana IG</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">+{g.igAvgPerWeek}</p>
          <p className="text-xs text-gray-400 mt-1">seguidores por semana</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Média ganho/semana LI</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">+{g.liAvgPerWeek}</p>
          <p className="text-xs text-gray-400 mt-1">seguidores por semana</p>
        </div>
      </div>

      <GrowthCharts weekSeries={g.weekSeries} reachSeries={g.reachSeries} />
    </div>
  );
}
