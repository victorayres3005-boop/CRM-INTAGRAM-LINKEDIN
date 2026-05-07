export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPI cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 fade-stagger">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="cf-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded cf-shimmer" />
              <div className="h-3 w-20 rounded cf-shimmer" />
            </div>
            <div className="h-7 w-24 rounded cf-shimmer" />
            <div className="h-2 w-16 rounded cf-shimmer" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="cf-card px-4 py-3 flex items-center gap-3 animate-stagger-5">
        <div className="h-8 w-64 rounded-md cf-shimmer" />
        <div className="h-8 w-24 rounded-md cf-shimmer" />
        <div className="h-8 w-24 rounded-md cf-shimmer" />
        <div className="ml-auto h-8 w-32 rounded-md cf-shimmer" />
      </div>

      {/* Content block — list/table */}
      <div className="cf-card overflow-hidden animate-stagger-6">
        <div className="px-4 py-3 border-b border-cf-border flex items-center justify-between">
          <div className="h-4 w-40 rounded cf-shimmer" />
          <div className="h-3 w-16 rounded cf-shimmer" />
        </div>
        <div className="divide-y divide-cf-border/60">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full cf-shimmer shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 rounded cf-shimmer" />
                <div className="h-2.5 w-1/2 rounded cf-shimmer opacity-70" />
              </div>
              <div className="hidden md:flex gap-2">
                <div className="h-6 w-20 rounded-md cf-shimmer" />
                <div className="h-6 w-16 rounded-md cf-shimmer" />
              </div>
              <div className="h-3 w-12 rounded cf-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
