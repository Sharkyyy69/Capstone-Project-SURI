import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  ArrowIcon,
  AuthCardLayout,
  CheckIcon,
  EyeIcon,
  KeyIcon,
  LockIcon,
  MailIcon,
  MIN_PASSWORD_LENGTH,
  fieldClass,
  inputClass,
  linkClass,
  primaryButtonClass,
} from '../components/AuthUI';

const copy = {
  request: {
    title: 'Forgot password?',
    subtitle: "Enter your account's email and we'll send you a 6-digit reset code.",
  },
  reset: {
    title: 'Reset your password',
    subtitle: 'Enter the code from your email and choose a new password.',
  },
  done: {
    title: 'Password updated',
    subtitle: 'Your password has been reset. You can now sign in with your new password.',
  },
};

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      setStage('reset');
      setInfo(
        data.code
          ? `Email isn't set up on this server, so here is your test code: ${data.code}`
          : data.message,
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send a reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (event) => {
    event.preventDefault();
    requestCode();
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your new password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    setInfo('');

    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        password,
      });

      setStage('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setStage('request');
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setInfo('');
  };

  return (
    <AuthCardLayout>
      <div className="mt-4 text-center">
        {stage === 'done' && (
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2f7d52] text-white">
            <CheckIcon className="h-6 w-6" />
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight">{copy[stage].title}</h1>
        <p className="mt-1.5 text-sm text-[#4c5b51]">
          {stage === 'reset' ? (
            <>
              Enter the code sent to <span className="font-semibold text-[#1d2b22]">{email}</span> and
              choose a new password.
            </>
          ) : (
            copy[stage].subtitle
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

      {stage === 'request' && (
        <form onSubmit={handleRequest} className="mt-7 space-y-4">
          <label className={fieldClass}>
            <MailIcon className="h-5 w-5 shrink-0" />
            <span className="sr-only">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              placeholder="Email"
              autoComplete="email"
              className={inputClass}
              required
            />
          </label>

          <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-3`}>
            {loading ? 'Sending code…' : 'Send reset code'}
            {!loading && <ArrowIcon className="h-4 w-4" />}
          </button>
        </form>
      )}

      {stage === 'reset' && (
        <form onSubmit={handleReset} className="mt-7 space-y-4">
          <label className={fieldClass}>
            <KeyIcon className="h-5 w-5 shrink-0" />
            <span className="sr-only">6-digit reset code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              placeholder="6-digit code"
              pattern="\d{6}"
              className={`${inputClass} tracking-[0.3em]`}
              required
            />
          </label>

          <label className={fieldClass}>
            <LockIcon className="h-5 w-5 shrink-0" />
            <span className="sr-only">New password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              placeholder="New password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              className={inputClass}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="shrink-0 rounded-md p-0.5 text-[#66736a] transition hover:text-[#2f8a57]"
              aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
            >
              <EyeIcon off={showPassword} className="h-5 w-5" />
            </button>
          </label>

          <label className={fieldClass}>
            <LockIcon className="h-5 w-5 shrink-0" />
            <span className="sr-only">Confirm new password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError('');
              }}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className={inputClass}
              required
            />
          </label>

          <p className="text-xs text-[#4c5b51]">Use at least {MIN_PASSWORD_LENGTH} characters.</p>

          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={startOver} className={linkClass}>
              Use a different email
            </button>
            <button type="button" onClick={requestCode} disabled={loading} className={linkClass}>
              Resend code
            </button>
          </div>
        </form>
      )}

      {stage === 'done' && (
        <Link to="/login" className={`${primaryButtonClass} mt-7`}>
          Back to sign in
          <ArrowIcon className="h-4 w-4" />
        </Link>
      )}

      {stage !== 'done' && (
        <p className="mt-7 text-center text-sm text-[#4c5b51]">
          Remembered it?{' '}
          <Link to="/login" className={linkClass}>
            Back to sign in
          </Link>
        </p>
      )}
    </AuthCardLayout>
  );
}
