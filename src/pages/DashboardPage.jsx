const stats = [
  { label: 'Total Assessments', value: '1,284' },
  { label: 'Fresh Items', value: '72%' },
  { label: 'Average Score', value: '88.4' },
  { label: 'Flagged Reviews', value: '94' },
];

const recentAssessments = [
  { id: 1, item: 'Mango', status: 'Fresh', score: '91%', date: '2026-10-27' },
  { id: 2, item: 'Chicken Breast', status: 'Questionable', score: '62%', date: '2026-10-26' },
  { id: 3, item: 'Banana', status: 'Overripe', score: '48%', date: '2026-10-25' },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Assessment overview</h1>
          </div>
          <button className="btn-primary">New assessment</button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900">Recent assessments</h2>
            <div className="mt-6 space-y-4">
              {recentAssessments.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.item}</p>
                    <p className="text-sm text-slate-500">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {item.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{item.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900">Insights</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              <li className="rounded-xl bg-emerald-50 p-3">Fruit freshness is consistently strongest in morning market batches.</li>
              <li className="rounded-xl bg-amber-50 p-3">Meat samples with bruising show higher risk classification.</li>
              <li className="rounded-xl bg-sky-50 p-3">Image quality remains the primary factor affecting confidence scores.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
