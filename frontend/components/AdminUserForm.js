'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import { Spinner } from '@/components/ui';

export default function AdminUserForm({ user, role, departments, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || role,
    isActive: user?.isActive !== false,
    rollNumber: user?.rollNumber || '',
    department: user?.department || '',
    course: user?.course || '',
    semester: user?.semester || '',
    designation: user?.designation || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, isActive: form.isActive };
      if (user) {
        const { password, ...rest } = payload;
        await api(`/admin/users/${user._id}`, { method: 'PUT', token, body: rest });
      } else {
        await api('/admin/users', { method: 'POST', token, body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Modal open onClose={onClose} title={user ? `Edit ${role}` : `Add ${role}`}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={set('email')} />
          </div>
        </div>
        {!user && (
          <div>
            <label className="label">Password (default: password123)</label>
            <input type="password" className="input" value={form.password} onChange={set('password')} placeholder="Defaults to password123" />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Department</label>
            <input className="input" list="dept-list" value={form.department} onChange={set('department')} />
            <datalist id="dept-list">
              {departments.map((d) => <option key={d._id} value={d.name} />)}
            </datalist>
          </div>
          {role === 'student' ? (
            <>
              <div>
                <label className="label">Semester</label>
                <input className="input" value={form.semester} onChange={set('semester')} />
              </div>
              <div>
                <label className="label">Roll number</label>
                <input className="input" value={form.rollNumber} onChange={set('rollNumber')} />
              </div>
              <div>
                <label className="label">Course</label>
                <input className="input" value={form.course} onChange={set('course')} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label">Designation</label>
                <input className="input" value={form.designation} onChange={set('designation')} />
              </div>
              <div>
                <label className="label">Specialization</label>
                <input className="input" value={form.specialization} onChange={set('specialization')} />
              </div>
              <div>
                <label className="label">Experience (years)</label>
                <input className="input" type="number" min="0" value={form.experience} onChange={set('experience')} />
              </div>
            </>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
          Account active
        </label>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Spinner className="h-4 w-4 text-white" /> : user ? 'Save changes' : 'Create account'}
        </button>
      </form>
    </Modal>
  );
}