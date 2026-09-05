'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState, Spinner } from '@/components/ui';
import Modal from '@/components/Modal';

export default function DepartmentsPage() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const { data, loading, error, reload } = useFetch('/admin/departments');
  const departments = data?.departments || [];

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const del = async (d) => {
    if (!confirm(`Delete department ${d.name}?`)) return;
    await api(`/admin/departments/${d._id}`, { method: 'DELETE', token });
    reload();
    notify('Department deleted');
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments`}
        actions={<button className="btn-primary" onClick={() => { setEditing(null); setOpen(true); }}>+ Add department</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      {error && <EmptyState title="Could not load departments" message={error} />}
      {loading && <PageLoader />}

      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {departments.length === 0 && <div className="sm:col-span-2 xl:col-span-3"><EmptyState title="No departments yet" /></div>}
          {departments.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">🏛️</span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{d.name}</h3>
                    <span className="text-xs uppercase text-slate-400">{d.code || 'N/A'}</span>
                  </div>
                </div>
                <div className="badge bg-slate-100 text-slate-600">{d.courses?.length || 0} courses</div>
              </div>

              {d.courses?.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {d.courses.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <span className="text-xs text-slate-400">{c.semesters} semesters</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => { setEditing(d); setOpen(true); }}>Edit</button>
                <button className="btn-ghost !px-3 text-red-600 hover:bg-red-50" onClick={() => del(d)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <DeptForm dept={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); reload(); notify(editing ? 'Department updated' : 'Department added'); }} />}
    </div>
  );
}

function DeptForm({ dept, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: dept?.name || '',
    code: dept?.code || '',
    courses: (dept?.courses || []).map((c) => `${c.name}|${c.semesters}`).join('\n'),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const courses = form.courses
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, semesters] = line.split('|');
        return { name: (name || '').trim(), semesters: Number(semesters) || 8 };
      });
    const body = { name: form.name, code: form.code, courses };
    try {
      if (dept) {
        await api(`/admin/departments/${dept._id}`, { method: 'PUT', token, body });
      } else {
        await api('/admin/departments', { method: 'POST', token, body });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={dept ? 'Edit department' : 'Add department'}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="label">Code</label>
            <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS" />
          </div>
        </div>
        <div>
          <label className="label">Courses (one per line: Name|semesters)</label>
          <textarea className="input" rows={4} value={form.courses} onChange={(e) => setForm({ ...form, courses: e.target.value })} placeholder={'B.Tech CSE|8\nMCA|4'} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? <Spinner className="h-4 w-4 text-white" /> : 'Save'}</button>
      </form>
    </Modal>
  );
}