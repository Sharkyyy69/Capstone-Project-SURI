import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

const initialForm = {
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: form.email.trim().toLowerCase(),
      });

      setMessage(
        data.code ? `${data.message} Use code ${data.code} to continue.` : data.message,
      );
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send the reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/reset-password', {
        email: form.email.trim().toLowerCase(),
        code: form.code.trim(),
        password: form.password,
      });

      setMessage(data.message);
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const showRequestForm = step === 'request';

  return (
    <div className="min-h-screen bg-[#eef3ee] px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#dfe7df] bg-[#f5f7f5]/90 p-6 shadow-[0_15px_45px_rgba(32,61,44,0.08)] sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-[#cfe1d2] bg-[#f0f5f0] px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2e8b5d] text-lg font-black text-white">
              🍊
            </div>
            <span className="text-[1.5rem] font-black tracking-[-0.05em] text-[#1d3f2f]">FreshLens</span>
          </div>

          <Link to="/login" className="text-sm font-medium text-[#2c8f62] transition hover:text-[#206b4d]">
            Back to sign in
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-[2.4rem] font-black tracking-[-0.05em] text-[#1e2b22]">
            {showRequestForm ? 'Reset your password' : 'Verify your account'}
          </h1>
          <p className="mt-3 text-base text-[#5e6f63]">
            {showRequestForm
              ? 'Enter your email and we will send a reset code.'
              : 'Enter the code we sent and choose a new password.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {showRequestForm ? (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
              <span className="text-xl">✉️</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                autoComplete="email"
                className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-[#a4c8a8] px-5 py-4 text-lg font-semibold text-[#152d24] shadow-[0_12px_28px_rgba(116,158,112,0.35)] transition hover:bg-[#8ab491] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Sending...' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
              <span className="text-xl">🔑</span>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Reset code"
                className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
              <span className="text-xl">🔒</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#dfe4de] bg-[#f9f9f8] px-4 py-3 text-[#7a857d] shadow-inner">
              <span className="text-xl">🔒</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full border-0 bg-transparent text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-[#a4c8a8] px-5 py-4 text-lg font-semibold text-[#152d24] shadow-[0_12px_28px_rgba(116,158,112,0.35)] transition hover:bg-[#8ab491] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
