export default function OrganizationProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50 font-beiruti">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pt-8 space-y-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse">
          <div className="h-56 md:h-72 bg-slate-200" />
          <div className="-mt-10 md:-mt-14 mx-4 md:mx-8 mb-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-8 shadow-lg">
            <div className="h-5 w-24 rounded bg-slate-200 mb-3" />
            <div className="h-7 w-60 rounded bg-slate-200 mb-3" />
            <div className="h-4 w-full rounded bg-slate-200" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm animate-pulse">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm animate-pulse">
          <div className="h-6 w-40 rounded bg-slate-200 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                  <div className="h-10 w-full rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-100/70 p-6 md:p-8 shadow-sm animate-pulse">
          <div className="h-6 w-40 rounded bg-slate-200 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl bg-white border border-slate-200">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
