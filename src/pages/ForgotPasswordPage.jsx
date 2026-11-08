import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import FormField from '../components/FormField';
import {
  PASSWORD_HINT,
  PASSWORD_MAX,
  collectErrors,
  normalizeEmail,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from '../../shared/validation.js';

const initialForm = {
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [step, setStep] = useState('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setFieldErrors((current) => ({ ...current, [name]: '' }));
  };

  // Validates locally first; returns false (and shows the errors) if anything is wrong.
  const checkFields = (checks) => {
    const errors = collectErrors(checks);
    setFieldErrors(errors || {});
    return !errors;
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!checkFields({ email: validateEmail(form.email) })) return;

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: normalizeEmail(form.email),
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
    setError('');
    setMessage('');
    const valid = checkFields({
      code: form.code.trim() ? '' : 'Enter the reset code from your email.',
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    });
    if (!valid) return;

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: normalizeEmail(form.email),
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
            <span className="text-[1.5rem] font-black tracking-[-0.05em] text-[#1d3f2f]">SURI</span>
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
          <form onSubmit={handleRequestCode} className="space-y-5" noValidate>
            <FormField
              icon="✉️"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              autoComplete="email"
              error={fieldErrors.email}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-[#a4c8a8] px-5 py-4 text-lg font-semibold text-[#152d24] shadow-[0_12px_28px_rgba(116,158,112,0.35)] transition hover:bg-[#8ab491] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Sending...' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
            <FormField
              icon="🔑"
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Reset code"
              autoComplete="one-time-code"
              error={fieldErrors.code}
            />

            <FormField
              icon="🔒"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="New password"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX}
              error={fieldErrors.password}
              hint={PASSWORD_HINT}
            />

            <FormField
              icon="🔒"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX}
              error={fieldErrors.confirmPassword}
            />

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
