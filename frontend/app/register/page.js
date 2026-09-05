'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Spinner } from '@/components/ui';
import { UNSPLASH } from '@/lib/utils';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    course: '',
    department: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <img src={UNSPLASH.learning} alt="Learning" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/50 to-slate-900/30" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="text-3xl font-extrabold text-white">Begin your mentorship journey</h2>
          <p className="mt-3 max-w-md text-brand-100">Connect with a mentor, set goals and grow academically and professionally.</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-slate-500 hover:text-slate-700">
            ← Back home
          </Link>
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-xl text-white">🚀</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
              <p className="text-sm text-slate-500">Join the mentorship program</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full name</label>
                <input className="input" required value={form.name} onChange={set('name')} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={set('role')}>
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" required minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
              </div>
            </div>

            {form.role === 'student' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Roll number</label>
                  <input className="input" value={form.rollNumber} onChange={set('rollNumber')} placeholder="CS2101" />
                </div>
                <div>
                  <label className="label">Semester</label>
                  <input className="input" value={form.semester} onChange={set('semester')} placeholder="e.g. 6" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Course</label>
                  <input className="input" value={form.course} onChange={set('course')} placeholder="e.g. B.Tech CSE" />
                </div>
              </div>
            )}

            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department} onChange={set('department')} placeholder="e.g. Computer Science" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? <Spinner className="h-4 w-4 text-white" /> : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}