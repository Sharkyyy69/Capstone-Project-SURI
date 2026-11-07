import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { token, setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [stage, setStage] = useState('form');

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setPendingEmail(data.email);
      setStage('verification');
      setInfo(
        data.code
          ? `Verification code sent for testing: ${data.code}. Use it below.`
          : 'A 6-digit verification code has been sent to your email.',
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/verify-registration', {
        email: pendingEmail,
        code: verificationCode.trim(),
      });

      setAuth(data.user, data.token, true);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to verify your account.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setPendingEmail(data.email);
      setInfo(
        data.code
          ? `A new test code has been generated: ${data.code}`
          : 'A new verification code has been sent to your email.',
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#edf3ee] px-4 py-10">
      <div className="w-full max-w-[500px] rounded-[2rem] border border-[#dfe7df] bg-[#f7f9f7] p-7 shadow-[0_15px_45px_rgba(32,61,44,0.08)] sm:p-8 lg:p-10">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-[#cfe1d2] bg-[#f0f5f0] px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2e8b5d] text-xl font-black text-white">
              <span>🍊</span>
            </div>
            <span className="text-3xl font-black tracking-[-0.06em] text-[#1d3f2f]">SURI</span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#1e2b22]">
            {stage === 'verification' ? 'Verify your email' : 'Create account'}
          </h1>
          <p className="mt-3 text-base text-[#5e6f63]">
            {stage === 'verification'
              ? `Enter the 6-digit code sent to ${pendingEmail}.`
              : 'Join SURI and start checking freshness.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </div>
        )}

        {stage === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
              <span className="text-xl">👤</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
              <span className="text-xl">✉️</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-[#a4c8a8] px-5 py-4 text-xl font-semibold text-[#152d24] shadow-[0_12px_28px_rgba(116,158,112,0.35)] transition hover:bg-[#8ab491] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending code...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
              <span className="text-xl">🔐</span>
              <input
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full border-0 bg-transparent text-center text-2xl font-bold tracking-[0.5rem] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-[#a4c8a8] px-5 py-4 text-xl font-semibold text-[#152d24] shadow-[0_12px_28px_rgba(116,158,112,0.35)] transition hover:bg-[#8ab491] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              className="w-full text-center text-sm font-medium text-[#2c8f62] transition hover:text-[#206b4d]"
            >
              Resend code
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-base text-[#405744]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#2c8f62] transition hover:text-[#206b4d]">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
