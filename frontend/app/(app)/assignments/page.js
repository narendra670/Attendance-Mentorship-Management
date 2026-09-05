'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState, Spinner } from '@/components/ui';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import { formatDate, Badge } from '@/lib/utils';

export default function AssignmentsPage() {
  const { token } = useAuth();
  const [assignOpen, setAssignOpen] = useState(false);
  const [changing, setChanging] = useState(null);
  const [toast, setToast] = useState('');

  const { data, loading, error, reload } = useFetch('/admin/assignments');
  const studentsQ = useFetch('/admin/users?role=student');
  const mentorsQ = useFetch('/admin/users?role=mentor');

  const assignments = data?.assignments || [];
  const students = studentsQ.data?.users || [];
  const mentors = mentorsQ.data?.users || [];

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const remove = async (a) => {
    if (!confirm(`End mentorship between ${a.student?.name} and ${a.mentor?.name}?`)) return;
    await api(`/admin/assignments/${a._id}/remove`, { method: 'PUT', token });
    reload();
    notify('Mentorship ended');
  };

  return (
    <div>
      <PageHeader
        title="Mentor Assignments"
        subtitle={`${data?.count || 0} active or historical assignments`}
        actions={<button className="btn-primary" onClick={() => setAssignOpen(true)}>+ Assign mentor</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      {error && <EmptyState title="Could not load assignments" message={error} />}
      {loading && <PageLoader />}

      {!loading && !error && assignments.length === 0 && (
        <EmptyState title="No assignments yet" message="Assign a mentor to your first student." />
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {assignments.map((a) => (
          <div key={a._id} className="card p-5">
            <div className="flex items-center justify-between">
              <Badge value={a.status} />
              <span className="text-xs text-slate-400">Since {formatDate(a.assignedDate)}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={a.student?.name} src={a.student?.profilePhoto} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{a.student?.name}</div>
                  <div className="text-xs text-slate-500">{a.student?.rollNumber || ''} · {a.student?.semester || ''}</div>
                </div>
              </div>
              <span className="text-xl text-slate-300">🤝</span>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={a.mentor?.name} src={a.mentor?.profilePhoto} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{a.mentor?.name}</div>
                  <div className="truncate text-xs text-slate-500">{a.mentor?.designation || a.department}</div>
                </div>
              </div>
            </div>

            {a.status === 'active' && (
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <button className="btn-secondary flex-1" onClick={() => setChanging(a)}>Change mentor</button>
                <button className="btn-ghost !px-3 text-red-600 hover:bg-red-50" onClick={() => remove(a)}>End</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {assignOpen && (
        <AssignForm
          students={students}
          mentors={mentors}
          onClose={() => setAssignOpen(false)}
          onSaved={() => { setAssignOpen(false); reload(); notify('Mentor assigned'); }}
        />
      )}
      {changing && (
        <ChangeForm
          assignment={changing}
          mentors={mentors}
          onClose={() => setChanging(null)}
          onSaved={() => { setChanging(null); reload(); notify('Mentor changed'); }}
        />
      )}
    </div>
  );
}

function AssignForm({ students, mentors, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ studentId: '', mentorId: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const student = students.find((s) => s._id === form.studentId);
      await api('/admin/assignments', {
        method: 'POST',
        token,
        body: { studentId: form.studentId, mentorId: form.mentorId, department: student?.department || '' },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Assign mentor to student">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Student</label>
          <select className="input" required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber || s.email})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Mentor</label>
          <select className="input" required value={form.mentorId} onChange={(e) => setForm({ ...form, mentorId: e.target.value })}>
            <option value="">Select mentor</option>
            {mentors.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.designation || 'Mentor'})</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? <Spinner className="h-4 w-4 text-white" /> : 'Assign mentor'}</button>
      </form>
    </Modal>
  );
}

function ChangeForm({ assignment, mentors, onClose, onSaved }) {
  const { token } = useAuth();
  const [mentorId, setMentorId] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(`/admin/assignments/${assignment._id}`, { method: 'PUT', token, body: { mentorId } });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Change mentor · ${assignment.student?.name}`}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">New mentor</label>
          <select className="input" required value={mentorId} onChange={(e) => setMentorId(e.target.value)}>
            <option value="">Select mentor</option>
            {mentors.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.designation || 'Mentor'})</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Change mentor</button>
      </form>
    </Modal>
  );
}