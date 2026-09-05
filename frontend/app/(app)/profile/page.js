'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import Avatar from '@/components/Avatar';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profilePhoto: user?.profilePhoto || '',
    bio: user?.bio || '',
    rollNumber: user?.rollNumber || '',
    course: user?.course || '',
    department: user?.department || '',
    semester: user?.semester || '',
    skills: (user?.skills || []).join(', '),
    interests: (user?.interests || []).join(', '),
    careerGoal: user?.careerGoal || '',
    designation: user?.designation || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    cgpa: user?.academicPerformance?.cgpa || '',
    percentage: user?.academicPerformance?.percentage || '',
  });

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name,
        phone: form.phone,
        profilePhoto: form.profilePhoto,
        bio: form.bio,
        rollNumber: form.rollNumber,
        course: form.course,
        department: form.department,
        semester: form.semester,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
        careerGoal: form.careerGoal,
        designation: form.designation,
        specialization: form.specialization,
        experience: Number(form.experience) || 0,
        academicPerformance: {
          cgpa: Number(form.cgpa) || 0,
          percentage: Number(form.percentage) || 0,
        },
      };
      const res = await api('/auth/profile', { method: 'PUT', token, body });
      updateUser(res.user);
      notify('Profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Profile" subtitle="Manage your personal and academic information" />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('profile')} className={cn('rounded-full px-4 py-1.5 text-sm font-medium', tab === 'profile' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600')}>Profile</button>
        <button onClick={() => setTab('password')} className={cn('rounded-full px-4 py-1.5 text-sm font-medium', tab === 'password' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600')}>Change password</button>
      </div>

      {tab === 'profile' ? (
        <form onSubmit={save} className="card space-y-5 p-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <Avatar name={user?.name} src={form.profilePhoto || user?.profilePhoto} size="xl" />
            <div>
              <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500 capitalize">{user?.role} · {user?.email}</p>
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 …" />
            </div>
          </div>

          <div>
            <label className="label">Profile photo URL</label>
            <input className="input" value={form.profilePhoto} onChange={set('profilePhoto')} placeholder="https://images.unsplash.com/…" />
            <p className="mt-1 text-xs text-slate-400">Paste an image URL (e.g. from Unsplash).</p>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea className="input" rows={3} value={form.bio} onChange={set('bio')} placeholder="Tell us about yourself" />
          </div>

          {user?.role === 'student' ? (
            <>
              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <label className="label">Roll number</label>
                  <input className="input" value={form.rollNumber} onChange={set('rollNumber')} />
                </div>
                <div>
                  <label className="label">Semester</label>
                  <input className="input" value={form.semester} onChange={set('semester')} />
                </div>
                <div>
                  <label className="label">Course</label>
                  <input className="input" value={form.course} onChange={set('course')} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input" value={form.department} onChange={set('department')} />
                </div>
                <div>
                  <label className="label">CGPA</label>
                  <input className="input" type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={set('cgpa')} />
                </div>
                <div>
                  <label className="label">Percentage</label>
                  <input className="input" type="number" step="0.1" min="0" max="100" value={form.percentage} onChange={set('percentage')} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Skills (comma separated)</label>
                  <input className="input" value={form.skills} onChange={set('skills')} placeholder="React, Node.js, Python" />
                </div>
                <div>
                  <label className="label">Interests (comma separated)</label>
                  <input className="input" value={form.interests} onChange={set('interests')} placeholder="AI, Web Dev" />
                </div>
              </div>
              <div>
                <label className="label">Career goal</label>
                <input className="input" value={form.careerGoal} onChange={set('careerGoal')} placeholder="Become a full stack developer" />
              </div>
            </>
          ) : (
            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <label className="label">Designation</label>
                <input className="input" value={form.designation} onChange={set('designation')} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Specialization</label>
                <input className="input" value={form.specialization} onChange={set('specialization')} />
              </div>
              <div>
                <label className="label">Experience (years)</label>
                <input className="input" type="number" min="0" value={form.experience} onChange={set('experience')} />
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      ) : (
        <ChangePassword />
      )}
    </div>
  );
}

function ChangePassword() {
  const { token } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.newPassword !== form.confirm) return setError('Passwords do not match');
    if (form.newPassword.length < 6) return setError('Password must be at least 6 characters');
    setSaving(true);
    try {
      await api('/auth/change-password', {
        method: 'PUT',
        token,
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setSuccess('Password changed successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card max-w-md p-6">
      <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
      {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="label">Current password</label>
          <input type="password" className="input" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" className="input" required minLength={6} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input type="password" className="input" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Updating…' : 'Update password'}</button>
      </form>
    </div>
  );
}