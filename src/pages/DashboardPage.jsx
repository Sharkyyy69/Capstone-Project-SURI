import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { buildDashboardSummary, exportAssessmentCsv } from '../lib/dashboardUtils';
import useAuthStore from '../store/useAuthStore';

const statusClasses = {
  Fresh: 'bg-emerald-100 text-emerald-700',
  Questionable: 'bg-amber-100 text-amber-700',
  Spoiled: 'bg-rose-100 text-rose-700',
  Overripe: 'bg-orange-100 text-orange-700',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadAssessments() {
      try {
        setLoading(true);
        const response = await api.get('/assessments/history');
        setAssessments(response.data || []);
        setError('');
      } catch (loadError) {
        console.error(loadError);
        setError('Unable to load assessment history right now.');
      } finally {
        setLoading(false);
      }
    }

    loadAssessments();
  }, []);

  const summary = useMemo(() => buildDashboardSummary(assessments), [assessments]);

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assessments.filter((item) => {
      const matchesSearch = !query || `${item.itemName || ''} ${item.productType || ''}`.toLowerCase().includes(query);
      const matchesType = productFilter === 'all' || item.productType === productFilter;
      const matchesStatus = statusFilter === 'all' || String(item.result || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assessments, productFilter, search, statusFilter]);

  const stats = [
    { label: 'Total assessments', value: summary.total },
    { label: 'Fresh items', value: `${Math.round((summary.fresh / Math.max(summary.total, 1)) * 100)}%` },
    { label: 'Average score', value: `${summary.averageScore}%` },
    { label: 'High risk', value: summary.highRisk },
  ];

  const insights = [
    `${summary.topProductType.name} is the most common category in your recent checks.`,
    `${summary.questionable} assessments need a closer review before purchase.`,
    `${summary.spoiled} items were flagged as spoiled and should be avoided.`,
  ];

  const productBreakdown = useMemo(() => {
    const counts = assessments.reduce((acc, item) => {
      const key = item.productType || 'Other';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const total = Math.max(Object.values(counts).reduce((sum, count) => sum + count, 0), 1);

    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [assessments]);

  const handleExportCsv = () => {
    const csv = exportAssessmentCsv(filteredAssessments.length ? filteredAssessments : assessments);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suri-assessment-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back, {user?.name || 'User'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleExportCsv} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700">
              Export CSV
            </button>
            <Link to="/assess" className="btn-primary">
              New assessment
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

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
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Recent assessments</h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search item"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                />
                <select
                  value={productFilter}
                  onChange={(event) => setProductFilter(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="all">All items</option>
                  <option value="fruit">Fruit</option>
                  <option value="meat">Meat</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="all">All statuses</option>
                  <option value="Fresh">Fresh</option>
                  <option value="Questionable">Questionable</option>
                  <option value="Spoiled">Spoiled</option>
                  <option value="Overripe">Overripe</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Loading assessments...
              </div>
            ) : filteredAssessments.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No assessments match your current filters.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredAssessments.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.itemName || 'Unnamed item'}</p>
                      <p className="text-sm text-slate-500">
                        {item.productType || 'fruit'} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[item.result] || 'bg-slate-200 text-slate-700'}`}>
                        {item.result || 'Unknown'}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{item.score || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900">Insights</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              {insights.map((insight) => (
                <li key={insight} className="rounded-xl bg-slate-50 p-3">
                  {insight}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Category mix</h3>
              <div className="mt-4 space-y-4">
                {productBreakdown.map((entry) => (
                  <div key={entry.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                      <span>{entry.label}</span>
                      <span>{entry.count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200">
                      <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${entry.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
