import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
            S
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">SURI</p>
            <p className="text-xs text-slate-500">Freshness Intelligence</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link to="/login" className="btn-secondary">
            Login
          </Link>
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              AI-Assisted Image-Based Assessment
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Visible freshness insights for fruits and meat before purchase.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              SURI analyzes images of selected fruits and meat to estimate visible freshness,
              classify condition, and support safer buying decisions using visual cues.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/assess" className="btn-primary">
                Try Assessment
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                View Dashboard
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Fresh', 'fresh, vibrant, and visually sound'],
                ['Questionable', 'needs review before purchase'],
                ['Spoiled', 'high-risk or visually unacceptable'],
              ].map(([label, description]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="mt-2 text-xs text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card shadow-glow">
            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Assessment Preview</p>
              <div className="mt-6 rounded-2xl bg-slate-800 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Apple sample</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                    Fresh
                  </span>
                </div>
                <div className="mt-4 h-48 rounded-xl bg-gradient-to-br from-emerald-300 via-lime-200 to-yellow-100" />
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-700 p-3">
                    <p className="text-slate-300">Freshness Score</p>
                    <p className="mt-2 text-xl font-semibold text-white">92%</p>
                  </div>
                  <div className="rounded-xl bg-slate-700 p-3">
                    <p className="text-slate-300">Recommendation</p>
                    <p className="mt-2 text-xl font-semibold text-white">Buy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
