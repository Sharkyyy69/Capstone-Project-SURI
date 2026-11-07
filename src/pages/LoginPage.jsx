import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

/* ---------- Small inline icons (no extra dependencies) ---------- */

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ off, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function LeafIcon(props) {
  return (
    <svg viewBox="0 0 40 40" {...props}>
      <path d="M4 36C4 16 16 4 36 4c0 20-12 32-32 32Z" fill="currentColor" />
      <path d="M6 34 30 10" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
    </svg>
  );
}

/* Scanner-frame corners used on the logo, phone screen and product cards */
function ScanCorners({ className = 'border-[#3f9a6a]' }) {
  const base = `absolute h-4 w-4 ${className}`;
  return (
    <>
      <span className={`${base} left-0 top-0 rounded-tl-lg border-l-[3px] border-t-[3px]`} />
      <span className={`${base} right-0 top-0 rounded-tr-lg border-r-[3px] border-t-[3px]`} />
      <span className={`${base} bottom-0 left-0 rounded-bl-lg border-b-[3px] border-l-[3px]`} />
      <span className={`${base} bottom-0 right-0 rounded-br-lg border-b-[3px] border-r-[3px]`} />
    </>
  );
}

function FreshLensLogo() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <ScanCorners className="border-[#2f8a57]" />
        <span className="text-2xl leading-none" aria-hidden="true">🍅</span>
      </div>
      <span className="mt-1 text-xl font-extrabold tracking-tight">
        <span className="text-[#2f8a57]">Fresh</span>
        <span className="text-[#e0533d]">Lens</span>
      </span>
    </div>
  );
}

/* ---------- Left-hand hero illustration ---------- */

const floatingCards = [
  { icon: '🍊', className: 'right-[14%] top-[2%] rotate-[8deg]' },
  { icon: '🍌', className: 'right-[2%] top-[30%] -rotate-[6deg]' },
  { icon: '🥩', className: 'right-[6%] top-[58%] rotate-[6deg]' },
];

function HeroIllustration() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[480px]">
      {/* sparkle accents */}
      <span className="absolute left-[38%] top-[4%] text-2xl text-[#7cb98f]" aria-hidden="true">✳</span>
      <span className="absolute left-[44%] top-[56%] text-xl text-[#9ccaa9]" aria-hidden="true">✳</span>

      {/* floating product cards */}
      {floatingCards.map((card) => (
        <div
          key={card.icon}
          className={`absolute flex h-24 w-24 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-5xl shadow-[0_14px_30px_rgba(40,80,55,0.14)] backdrop-blur sm:h-28 sm:w-28 sm:text-6xl ${card.className}`}
          aria-hidden="true"
        >
          <div className="absolute inset-2">
            <ScanCorners className="border-[#cfe3d4]" />
          </div>
          {card.icon}
        </div>
      ))}

      {/* phone */}
      <div className="absolute left-[30%] top-[10%] h-[330px] w-[175px] -rotate-[8deg] rounded-[2.2rem] bg-[#1f2a24] p-2 shadow-[0_25px_45px_rgba(20,40,28,0.3)] sm:h-[370px] sm:w-[195px]">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-[#f3f8f3] to-[#e3efe4]">
          <div className="mx-auto mt-2 h-4 w-16 rounded-full bg-[#1f2a24]" />
          <div className="relative mx-5 mt-10 flex flex-1 items-center justify-center">
            <ScanCorners className="border-[#3f9a6a]" />
            <span className="text-7xl" aria-hidden="true">🥩</span>
          </div>
          <div className="mx-auto my-4 flex items-center gap-2 rounded-full bg-[#3f9a6a] px-4 py-1.5 text-sm font-semibold text-white shadow-md">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#3f9a6a]">
              <CheckIcon className="h-3 w-3" />
            </span>
            Fresh
          </div>
          <div className="flex items-center justify-around border-t border-[#d7e4d9] bg-white/70 py-2 text-[#6d8a77]">
            <span className="text-sm" aria-hidden="true">⌂</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#3f9a6a] text-xs">◎</span>
            <span className="text-sm" aria-hidden="true">▤</span>
          </div>
        </div>
      </div>

      {/* produce pile in the foreground */}
      <div className="absolute -bottom-2 left-0 flex items-end text-[4.5rem] leading-none drop-shadow-lg sm:text-[5.5rem]" aria-hidden="true">
        <LeafIcon className="-mr-6 mb-10 h-16 w-16 -rotate-12 text-[#4f9b5f]" />
        <span className="-mr-4">🍊</span>
        <span className="-mr-3 mb-6">🍌</span>
        <span className="-mr-2">🍊</span>
        <span>🥩</span>
      </div>
      <div className="absolute bottom-0 left-2 text-3xl" aria-hidden="true">🫐🫐</div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
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

  const fieldClass =
    'flex items-center gap-3 rounded-xl border border-[#e6e9e4] bg-[#f6f7f4] px-4 py-3.5 text-[#66736a] transition focus-within:border-[#7fb894] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#7fb894]/15';

  return (
    <div className="min-h-screen bg-white text-[#1d2b22]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* ---------- Left: hero ---------- */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f4f9f3] via-[#eef6ee] to-[#e2efe1] px-6 pb-10 pt-10 sm:pb-6 sm:px-12 lg:px-14 lg:pt-14">
          {/* soft organic background shapes */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/60" />
          <div className="pointer-events-none absolute -left-20 bottom-24 h-72 w-72 rounded-full bg-[#d9ebd8]/70" />
          <LeafIcon className="pointer-events-none absolute right-[8%] top-[6%] h-8 w-8 rotate-45 text-[#8cc49a]/70" />

          <div className="relative z-10 flex h-full flex-col">
            <h1 className="text-[2.6rem] font-black leading-[1.02] tracking-tight sm:text-6xl">
              See
              <br />
              Freshness.
              <br />
              <span className="text-[#2f8a57]">Choose Better.</span>
            </h1>
            <p className="mt-4 max-w-xs text-lg font-medium leading-snug text-[#3d4f43]">
              AI-powered freshness check for fruits and meat.
            </p>
            <div className="mt-5 h-1.5 w-16 rounded-full bg-[#3f9a6a]" />

            <div className="mt-6 hidden flex-1 sm:block lg:mt-2">
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* ---------- Right: login card ---------- */}
        <section className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#eef6ee]" />
          <div className="pointer-events-none absolute -left-24 bottom-[-60px] h-64 w-64 rounded-full border border-[#e5efe5]" />
          <LeafIcon className="pointer-events-none absolute right-[10%] top-[30%] h-7 w-7 -rotate-12 text-[#b9dcc1]" />
          <div
            className="pointer-events-none absolute bottom-10 right-10 grid grid-cols-3 gap-2"
            aria-hidden="true"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#cfe3d4]" />
            ))}
          </div>

          <div className="relative w-full max-w-[420px] rounded-3xl border border-[#edf0ec] bg-white p-7 shadow-[0_20px_50px_rgba(30,60,40,0.08)] sm:p-9">
            <FreshLensLogo />

            <div className="mt-4 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight">Welcome!</h2>
              <p className="mt-1.5 text-sm text-[#4c5b51]">Sign in to your account to continue.</p>
            </div>

            {error && (
              <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className={fieldClass}>
                <UserIcon className="h-5 w-5 shrink-0" />
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full border-0 bg-transparent text-base text-[#1d2b22] placeholder:text-[#66736a] focus:outline-none"
                  required
                />
              </label>

              <label className={fieldClass}>
                <LockIcon className="h-5 w-5 shrink-0" />
                <span className="sr-only">Password</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full border-0 bg-transparent text-base text-[#1d2b22] placeholder:text-[#66736a] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="shrink-0 rounded-md p-0.5 text-[#66736a] transition hover:text-[#2f8a57]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon off={showPassword} className="h-5 w-5" />
                </button>
              </label>

              <div className="flex items-center justify-between pt-1 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[#4c5b51]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-5 w-5 rounded border-[#c5cfc8] accent-[#2f8a57]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setError('Password reset is not available yet. Please contact support.')}
                  className="font-semibold text-[#24724a] hover:text-[#1b5838]"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f7d52] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(63,154,106,0.25)] transition hover:bg-[#256743] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Logging in…' : 'Login'}
                {!loading && <ArrowIcon className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#4c5b51]">
              New to FreshLens?{' '}
              <Link to="/register" className="font-semibold text-[#24724a] hover:text-[#1b5838]">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
