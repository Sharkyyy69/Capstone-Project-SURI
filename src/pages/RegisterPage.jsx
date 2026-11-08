import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import FormField, { PasswordToggle } from '../components/FormField';
import {
  NAME_CHARS_ERROR,
  NAME_MAX,
  PASSWORD_HINT,
  PASSWORD_MAX,
  normalizeEmail,
  normalizeName,
  stripInvalidNameChars,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from '../../shared/validation.js';

const FIELDS = ['name', 'email', 'password', 'confirmPassword'];

const validators = {
  name: (form) => validateName(form.name),
  email: (form) => validateEmail(form.email),
  password: (form) => validatePassword(form.password),
  confirmPassword: (form) => validateConfirmPassword(form.password, form.confirmPassword),
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { token, setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [stage, setStage] = useState('form');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (event) => {
    const { name, value: raw } = event.target;
    const value = name === 'name' ? stripInvalidNameChars(raw) : raw;
    const nextForm = { ...form, [name]: value };

    setForm(nextForm);
    setError('');
    setFieldErrors((current) => {
      const next = { ...current };
      if (value !== raw) {
        next.name = NAME_CHARS_ERROR;
      } else if (current[name]) {
        // Re-check live once a field has shown an error, so it clears as soon as it's fixed.
        next[name] = validators[name](nextForm);
      }
      if (name === 'password' && current.confirmPassword) {
        next.confirmPassword = validators.confirmPassword(nextForm);
      }
      return next;
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    if (!form[name]) return; // don't nag about empty fields until submit
    setFieldErrors((current) => ({ ...current, [name]: validators[name](form) }));
  };

  // Used by both "Continue" and "Resend code".
  const requestVerificationCode = async (fallbackMessage) => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { data } = await api.post('/auth/register', {
        name: normalizeName(form.name),
        email: normalizeEmail(form.email),
        password: form.password,
      });
      setPendingEmail(data.email);
      return data;
    } catch (err) {
      // Show server-side problems next to the field they belong to; fall back to the banner.
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && stage === 'form') {
        setFieldErrors((current) => ({ ...current, ...serverErrors }));
      } else {
        setError(err.response?.data?.message || fallbackMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const errors = Object.fromEntries(FIELDS.map((field) => [field, validators[field](form)]));
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    const data = await requestVerificationCode('Unable to create account.');
    if (data) {
      setStage('verification');
      setInfo(
        data.code
          ? `Verification code sent for testing: ${data.code}. Use it below.`
          : 'A 6-digit verification code has been sent to your email.',
      );
    }
  };

  const handleResend = async () => {
    const data = await requestVerificationCode('Unable to resend verification code.');
    if (data) {
      setInfo(
        data.code
          ? `A new test code has been generated: ${data.code}`
          : 'A new verification code has been sent to your email.',
      );
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

  const passwordType = showPassword ? 'text' : 'password';

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
          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            <FormField
              icon="👤"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Full name"
              autoComplete="name"
              maxLength={NAME_MAX}
              error={fieldErrors.name}
            />

            <FormField
              icon="✉️"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Email address"
              autoComplete="email"
              error={fieldErrors.email}
            />

            <FormField
              icon="🔒"
              type={passwordType}
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX}
              error={fieldErrors.password}
              hint={PASSWORD_HINT}
              trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
            />

            <FormField
              icon="🔒"
              type={passwordType}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm password"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX}
              error={fieldErrors.confirmPassword}
            />

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
            <FormField
              icon="🔐"
              type="text"
              name="verificationCode"
              inputMode="numeric"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              inputClassName="text-center text-2xl font-bold tracking-[0.5rem]"
              required
            />

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
