export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Freshness Assessment</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Upload product image</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card">
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="text-lg font-medium text-slate-700">Drag and drop a product image here</p>
              <p className="mt-2 text-sm text-slate-500">or click to browse from your device</p>
              <button className="btn-primary mt-6">Select Image</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Product type
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                  <option>Fruit</option>
                  <option>Meat</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                Selected item
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                  <option>Mango</option>
                  <option>Banana</option>
                  <option>Apple</option>
                  <option>Chicken</option>
                  <option>Beef</option>
                </select>
              </label>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900">Prediction</h2>
            <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm text-emerald-700">Classification</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">Fresh</p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Freshness score</span>
                  <span className="font-semibold text-slate-900">92%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200">
                  <div className="h-2.5 w-[92%] rounded-full bg-emerald-500" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Recommendation: <span className="font-semibold text-slate-900">Buy</span>
              </div>

              <button className="btn-primary w-full">Run assessment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
