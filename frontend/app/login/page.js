'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Spinner } from '@/components/ui';
import { UNSPLASH } from '@/lib/utils';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.replace(user.role === 'student' ? '/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left visual */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={UNSPLASH.study} alt="Student studying" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/50 to-slate-900/30" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="text-3xl font-extrabold text-white">Welcome back to MentorSphere</h2>
          <p className="mt-3 max-w-md text-brand-100">Your mentorship journey continues. Sign in to check goals, meetings and messages.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-slate-500 hover:text-slate-700">
            ← Back home
          </Link>
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-xl text-white">🎓</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
              <p className="text-sm text-slate-500">Access your dashboard</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <Spinner className="h-4 w-4 text-white" /> : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo accounts</p>
            <div className="mt-2 grid gap-2 text-sm">
              {[
                { label: 'Student', email: 'narendra@mentorhub.com', pw: 'student123' },
                { label: 'Mentor', email: 'mentor@mentorhub.com', pw: 'mentor123' },
                { label: 'Admin', email: 'admin@mentorhub.com', pw: 'admin123' },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => quickFill(d.email, d.pw)}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-slate-700 ring-1 ring-slate-200 hover:ring-brand-400"
                >
                  <span className="font-medium">{d.label}</span>
                  <span className="text-xs text-slate-400">{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{' '}
            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}