import { Link } from 'react-router-dom';

export default function BackButton({ to = '/dashboard', label = 'Back to dashboard', className = '' }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 ${className}`}
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
