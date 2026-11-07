import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import AuthSplitLayout from '../components/AuthSplitLayout';
import { ArrowIcon, EyeIcon, LockIcon, UserIcon, fieldClass, linkClass, primaryButtonClass } from '../components/AuthUI';

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

  return (
    <AuthSplitLayout>
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
          <Link to="/forgot-password" className={linkClass}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${primaryButtonClass} mt-3`}
        >
          {loading ? 'Logging in…' : 'Login'}
          {!loading && <ArrowIcon className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#4c5b51]">
        New to SURI?{' '}
        <Link to="/register" className={linkClass}>
          Create an account
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
