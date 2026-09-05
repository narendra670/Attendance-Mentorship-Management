'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import { cn, formatDate, ProgressBar, Badge, PriorityBadge } from '@/lib/utils';

const CATEGORIES = ['Academic', 'Technical', 'Career', 'Personal Development', 'Communication', 'Project', 'Internship'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const GOAL_STATUS = ['Not Started', 'In Progress', 'Completed', 'Overdue'];

export default function GoalsPage() {
  const { user, token } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [progressGoal, setProgressGoal] = useState(null);
  const [toast, setToast] = useState('');

  const { data, loading, error, reload } = useFetch('/goals');
  const studentsQuery = useFetch(user?.role === 'mentor' ? '/mentor/students' : null);

  const goals = data?.goals || [];
  const isMentor = user?.role === 'mentor';
  const isStudent = user?.role === 'student';

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await api(`/goals/${id}`, { method: 'DELETE', token });
    reload();
    notify('Goal deleted');
  };

  const studentOptions = useMemo(() => (studentsQuery.data?.students || []).map((s) => s.student), [studentsQuery.data]);

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle={isStudent ? 'Your mentorship goals' : 'Goals you have set for students'}
        actions={isMentor && (
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Assign goal</button>
        )}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      {error && <EmptyState title="Could not load goals" message={error} />}
      {loading && <PageLoader />}
      {!loading && !error && goals.length === 0 && (
        <EmptyState
          title="No goals yet"
          message={isStudent ? 'Your mentor will assign goals here.' : 'Assign your first goal to a student.'}
        />
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((g) => (
          <div key={g._id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-slate-900">{g.title}</h3>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <Badge value={g.status} />
                  <PriorityBadge value={g.priority} />
                  <span className="badge bg-slate-100 text-slate-600">{g.category}</span>
                </div>
              </div>
            </div>

            {g.description && <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{g.description}</p>}

            {g.milestones?.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-slate-500">
                {g.milestones.slice(0, 4).map((m, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {m}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold text-slate-800">{g.progress}%</span>
              </div>
              <ProgressBar value={g.progress} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <Avatar name={isStudent ? g.mentor?.name : g.student?.name} src={isStudent ? g.mentor?.profilePhoto : g.student?.profilePhoto} size="xs" />
                <span className="truncate">{isStudent ? g.mentor?.name : g.student?.name}</span>
              </span>
              <span>Due {formatDate(g.deadline)}</span>
            </div>

            <div className="mt-3 flex gap-2">
              {isStudent && (
                <button className="btn-secondary flex-1" onClick={() => setProgressGoal(g)}>Update progress</button>
              )}
              {isMentor && (
                <>
                  <button className="btn-secondary flex-1" onClick={() => setEditGoal(g)}>Edit</button>
                  <button className="btn-ghost text-red-600 hover:bg-red-50" onClick={() => deleteGoal(g._id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {createOpen && isMentor && (
        <GoalForm students={studentOptions} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); reload(); notify('Goal assigned'); }} />
      )}
      {editGoal && isMentor && (
        <GoalForm goal={editGoal} students={studentOptions} onClose={() => setEditGoal(null)} onSaved={() => { setEditGoal(null); reload(); notify('Goal updated'); }} />
      )}
      {progressGoal && isStudent && (
        <ProgressForm goal={progressGoal} onClose={() => setProgressGoal(null)} onSaved={() => { setProgressGoal(null); reload(); notify('Progress updated'); }} />
      )}
    </div>
  );
}

function GoalForm({ goal, students, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    student: goal?.student?._id || '',
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'Technical',
    priority: goal?.priority || 'Medium',
    deadline: goal?.deadline ? new Date(goal.deadline).toISOString().slice(0, 10) : '',
    milestones: goal?.milestones?.join('\n') || '',
    progress: goal?.progress || 0,
    status: goal?.status || 'Not Started',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      deadline: form.deadline || undefined,
      milestones: form.milestones.split('\n').map((s) => s.trim()).filter(Boolean),
      progress: Number(form.progress),
      status: form.status,
    };
    try {
      if (goal) {
        await api(`/goals/${goal._id}`, { method: 'PUT', token, body });
      } else {
        await api('/goals', { method: 'POST', token, body: { ...body, student: form.student } });
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
    <Modal open onClose={onClose} title={goal ? 'Edit goal' : 'Assign a goal'}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        {!goal && (
          <div>
            <label className="label">Student</label>
            <select className="input" required value={form.student} onChange={set('student')}>
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.rollNumber || s.email})</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={set('title')} placeholder="e.g. Learn React.js" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={form.deadline} onChange={set('deadline')} />
          </div>
          <div>
            <label className="label">Progress ({form.progress}%)</label>
            <input type="range" min={0} max={100} className="w-full accent-brand-600" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {GOAL_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Milestones (one per line)</label>
            <textarea className="input" rows={2} value={form.milestones} onChange={set('milestones')} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : goal ? 'Save changes' : 'Assign goal'}</button>
      </form>
    </Modal>
  );
}

function ProgressForm({ goal, onClose, onSaved }) {
  const { token } = useAuth();
  const [progress, setProgress] = useState(goal.progress);
  const [status, setStatus] = useState(goal.status);

  const submit = async (e) => {
    e.preventDefault();
    await api(`/goals/${goal._id}`, { method: 'PUT', token, body: { progress: Number(progress), status } });
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={`Update progress · ${goal.title}`}>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0">Progress</label>
            <span className="text-2xl font-bold text-brand-600">{progress}%</span>
          </div>
          <input type="range" min={0} max={100} className="w-full accent-brand-600" value={progress} onChange={(e) => setProgress(e.target.value)} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['Not Started', 'In Progress', 'Completed'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Save progress</button>
      </form>
    </Modal>
  );
}