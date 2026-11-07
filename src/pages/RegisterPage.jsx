import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import AuthSplitLayout from '../components/AuthSplitLayout';
import {
  ArrowIcon,
  EyeIcon,
  KeyIcon,
  LockIcon,
  MailIcon,
  MIN_PASSWORD_LENGTH,
  UserIcon,
  fieldClass,
  inputClass,
  linkClass,
  primaryButtonClass,
} from '../components/AuthUI';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [stage, setStage] = useState('form');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const sendCode = async () => {
    const { data } = await api.post('/auth/register', {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    setPendingEmail(data.email);
    return data;
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const data = await sendCode();
      setStage('verification');
      setInfo(
        data.code
          ? `Email isn't set up on this server, so here is your test code: ${data.code}`
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
      const data = await sendCode();
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

  const editDetails = () => {
    setStage('form');
    setVerificationCode('');
    setError('');
    setInfo('');
  };

  const isVerification = stage === 'verification';

  return (
    <AuthSplitLayout>
      <div className="mt-4 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">
          {isVerification ? 'Verify your email' : 'Create account'}
        </h2>
        <p className="mt-1.5 text-sm text-[#4c5b51]">
          {isVerification ? (
            <>
              Enter the 6-digit code sent to <span className="font-semibold text-[#1d2b22]">{pendingEmail}</span>.
            </>
          ) : (
            'Join SURI and start checking freshness.'
          )}
        </p>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {info && (
        <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {info}
        </div>
      )}

      {!isVerification ? (
        <form onSubmit={handleRegister} className="mt-7 space-y-4">
          <label className={fieldClass}>
            <UserIcon className="h-5 w-5 shrink-0" />
            <span className="sr-only">Full name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              autoComplete="name"
              className={inputClass}
              required
            />
          </label>

          <label className={fieldClass}>
            <MailIcon className="h-5 w-5 shrink-0" />
            <span className="sr-only">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              className={inputClass}
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
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className={inputClass}
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

          <p className="text-xs text-[#4c5b51]">Use at least {MIN_PASSWORD_LENGTH} characters.</p>

          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Sending code…' : 'Continue'}
            {!loading && <ArrowIcon className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-7 space-y-4">
          <label className={fieldClass}>
            <KeyIcon className="h-5 w-5 shrink-0" />
            <span className="sr-only">6-digit verification code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={verificationCode}
              onChange={(event) => {
                setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              placeholder="6-digit code"
              pattern="\d{6}"
              className={`${inputClass} tracking-[0.3em]`}
              required
            />
          </label>

          <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-3`}>
            {loading ? 'Verifying…' : 'Verify & create account'}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={editDetails} className={linkClass}>
              Change details
            </button>
            <button type="button" onClick={handleResend} disabled={loading} className={linkClass}>
              Resend code
            </button>
          </div>
        </form>
      )}

      <p className="mt-7 text-center text-sm text-[#4c5b51]">
        Already have an account?{' '}
        <Link to="/login" className={linkClass}>
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
