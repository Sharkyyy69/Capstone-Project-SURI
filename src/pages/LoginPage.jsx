import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

const productCards = [
  { icon: '🍊', className: 'left-10 top-4 rotate-[-14deg]' },
  { icon: '🍋', className: 'right-16 top-14 rotate-[10deg]' },
  { icon: '🍌', className: 'right-20 top-56 rotate-[-8deg]' },
  { icon: '🥩', className: 'left-16 bottom-6 rotate-[8deg]' },
  { icon: '🍏', className: 'right-14 bottom-14 rotate-[-12deg]' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { token, setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setAuth(data.user, data.token, rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3ee] text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="relative flex-1 overflow-hidden border-b border-[#dfe6df] bg-[#edf4ee] lg:w-[55%] lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(226,236,221,0.2)_30%,_transparent_55%)]" />
          <div className="absolute -left-32 top-8 h-[420px] w-[420px] rounded-full border border-[#d2dfcd] bg-[#dfe9d9]/80" />
          <div className="absolute right-[-80px] top-0 h-[300px] w-[300px] rounded-full border border-[#d2dfcd] bg-[#dfe9d9]/80" />
          <div className="absolute bottom-[-90px] left-[-70px] h-[260px] w-[260px] rounded-full border border-[#d2dfcd] bg-[#dfe9d9]/80" />

          <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
            <div className="flex items-center justify-start pt-4">
              <div className="h-7 w-7 rounded-full bg-[#2a8a5a] shadow-sm" />
            </div>

            <div className="pt-3 lg:pt-4">
              <h1 className="max-w-[540px] text-[4.25rem] font-black leading-[0.88] tracking-[-0.08em] text-[#1f2d27] sm:text-[5rem] lg:text-[6.2rem]">
                <span className="block">See</span>
                <span className="block text-[#0b6a4b]">Freshness.</span>
                <span className="block">Choose Better.</span>
              </h1>

              <p className="mt-6 max-w-[420px] text-[1.1rem] leading-8 text-[#415947] sm:text-[1.5rem]">
                AI-powered freshness check for fruits and meat.
              </p>

              <div className="mt-8 h-1.5 w-24 rounded-full bg-[#5e9a7d]" />
            </div>

            <div className="relative mt-8 h-[420px] w-full max-w-[620px] lg:mt-12">
              {productCards.map((card) => (
                <div
                  key={card.className}
                  className={`fruit-card absolute ${card.className}`}
                  aria-hidden="true"
                >
                  <span>{card.icon}</span>
                </div>
              ))}

              <div className="absolute inset-x-0 bottom-0 mx-auto h-28 w-[74%] rounded-[18%] border border-[#d1d9d1] bg-[#ebf4eb] shadow-[inset_0_10px_0_rgba(255,255,255,0.85)]" />

              <div className="absolute left-1/2 top-[58%] h-[335px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[34px] border-[10px] border-[#e8ede9] bg-gradient-to-b from-[#f6f7f6] via-[#e3e8e3] to-[#f6f7f5] shadow-[0_20px_35px_rgba(18,35,27,0.14)]">
                <div className="mx-auto mt-4 h-2.5 w-20 rounded-full bg-[#1d2b1e] opacity-80" />
                <div className="mx-auto mt-5 flex h-[246px] w-[176px] items-center justify-center rounded-[22px] bg-[#f1f5f1] shadow-inner">
                  <div className="relative flex h-[206px] w-[160px] items-center justify-center rounded-[18px] bg-[radial-gradient(circle_at_35%_25%,_#fff7f1,_#f6eee4_38%,_#e9efe0_100%)]">
                    <div className="absolute inset-3 rounded-[16px] border border-[#d8e0d8]" />
                    <div className="absolute rounded-full bg-[#f9f0ed] px-4 py-2 text-5xl shadow-sm">🥩</div>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#5abd7a] px-4 py-2 text-sm font-semibold text-white shadow-md">
                      <span>✓</span>
                      <span>Fresh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-[#edf3ee] px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[520px] rounded-[2rem] border border-[#dfe7df] bg-[#f5f7f5]/90 p-6 shadow-[0_15px_45px_rgba(32,61,44,0.08)] sm:p-8 lg:p-10">
            <div className="mb-7 flex justify-center">
              <div className="flex items-center gap-3 rounded-[1.25rem] border border-[#cfe1d2] bg-[#f0f5f0] px-4 py-3 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2e8b5d] text-xl font-black text-white">
                  <span>🍊</span>
                </div>
                <span className="text-[2.1rem] font-black tracking-[-0.06em] text-[#1d3f2f]">FreshLens</span>
              </div>
            </div>

            <div className="mb-8 text-center">
              <h2 className="text-[3.2rem] font-black tracking-[-0.05em] text-[#1e2b22]">Welcome!</h2>
              <p className="mt-3 text-base text-[#5e6f63]">Sign in to your account to continue.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
                <span className="text-xl">👤</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Username"
                  autoComplete="email"
                  className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
                <span className="text-xl">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-lg text-[#7a857d] transition hover:text-[#2d4e3d]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '◉' : '◌'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-[#536a5a]">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#b9c7be] accent-[#2c8f62]"
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/register" className="font-medium text-[#2c8f62] transition hover:text-[#206b4d]">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#a4c8a8] px-5 py-4 text-xl font-semibold text-[#152d24] shadow-[0_12px_28px_rgba(116,158,112,0.35)] transition hover:bg-[#8ab491] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Logging in...' : 'Login →'}
              </button>
            </form>

            <p className="mt-7 text-center text-base text-[#405744]">
              New to FreshLens?{' '}
              <Link to="/register" className="font-bold text-[#2c8f62] transition hover:text-[#206b4d]">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
