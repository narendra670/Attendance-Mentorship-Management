'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import { cn, formatDate, timeAgo, Badge, PriorityBadge } from '@/lib/utils';

const TABS = ['all', 'Pending', 'In Progress', 'Submitted', 'Completed', 'Overdue'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function TasksPage() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [submitTask, setSubmitTask] = useState(null);
  const [reviewTask, setReviewTask] = useState(null);
  const [toast, setToast] = useState('');

  const { data, loading, error, reload } = useFetch(`/tasks${tab !== 'all' ? `?status=${tab}` : ''}`);
  const studentsQuery = useFetch(user?.role === 'mentor' ? '/mentor/students' : null);

  const tasks = data?.tasks || [];
  const isMentor = user?.role === 'mentor';
  const isStudent = user?.role === 'student';
  const studentOptions = useMemo(() => (studentsQuery.data?.students || []).map((s) => s.student), [studentsQuery.data]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api(`/tasks/${id}`, { method: 'DELETE', token });
    reload();
    notify('Task deleted');
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={isStudent ? 'Tasks assigned by your mentor' : 'Assign tasks and review submissions'}
        actions={isMentor && <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Assign task</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <EmptyState title="Could not load tasks" message={error} />}
      {loading && <PageLoader />}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState title="No tasks here" message={isStudent ? 'Your mentor will assign tasks here.' : 'Assign your first task.'} />
      )}

      <div className="space-y-4">
        {tasks.map((t) => {
          const peer = isStudent ? t.mentor : t.student;
          return (
            <div key={t._id} className="card p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Avatar name={peer?.name} src={peer?.profilePhoto} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-slate-900">{t.title}</h3>
                      <Badge value={t.status} />
                      <PriorityBadge value={t.priority} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {peer?.name} · Due {formatDate(t.deadline)} · {timeAgo(t.createdAt)}
                    </div>
                    {t.description && <p className="mt-2 text-sm text-slate-600">{t.description}</p>}

                    {t.submission?.link && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                        <span className="font-semibold text-slate-700">Submission:</span>{' '}
                        <a href={t.submission.link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                          {t.submission.link}
                        </a>
                        {t.submission.note && <p className="mt-1 text-slate-500">{t.submission.note}</p>}
                        {t.submission.submittedAt && (
                          <p className="mt-1 text-xs text-slate-400">Submitted {timeAgo(t.submission.submittedAt)}</p>
                        )}
                      </div>
                    )}

                    {t.feedback && (
                      <div className="mt-3 rounded-lg border-l-4 border-brand-500 bg-brand-50 p-3 text-sm text-slate-700">
                        <span className="font-semibold">Feedback:</span> {t.feedback}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {isStudent && ['Pending', 'In Progress', 'Overdue'].includes(t.status) && (
                    <button className="btn-primary" onClick={() => setSubmitTask(t)}>Submit</button>
                  )}
                  {isMentor && (
                    <>
                      <button className="btn-secondary" onClick={() => setReviewTask(t)}>Review / feedback</button>
                      <button className="btn-ghost text-red-600 hover:bg-red-50" onClick={() => deleteTask(t._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {createOpen && isMentor && <TaskForm students={studentOptions} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); reload(); notify('Task assigned'); }} />}
      {submitTask && isStudent && <SubmitForm task={submitTask} onClose={() => setSubmitTask(null)} onSaved={() => { setSubmitTask(null); reload(); notify('Task submitted for review'); }} />}
      {reviewTask && isMentor && <ReviewForm task={reviewTask} onClose={() => setReviewTask(null)} onSaved={() => { setReviewTask(null); reload(); notify('Task reviewed'); }} />}
    </div>
  );
}

function TaskForm({ students, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ student: '', title: '', description: '', deadline: '', priority: 'Medium' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('/tasks', { method: 'POST', token, body: { ...form, deadline: form.deadline || undefined } });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Assign a task">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Student</label>
          <select className="input" required value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })}>
            <option value="">Select a student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber || s.email})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Build a REST API" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Deadline</label>
            <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Assign task'}</button>
      </form>
    </Modal>
  );
}

function SubmitForm({ task, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ link: '', note: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(`/tasks/${task._id}`, { method: 'PUT', token, body: { status: 'Submitted', submission: { link: form.link, note: form.note } } });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Submit · ${task.title}`}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Submission link</label>
          <input className="input" type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://github.com/you/project" />
        </div>
        <div>
          <label className="label">Note for mentor</label>
          <textarea className="input" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you build and how?" />
        </div>
        <button type="submit" className="btn-primary w-full">Submit task</button>
      </form>
    </Modal>
  );
}

function ReviewForm({ task, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ feedback: task.feedback || '', status: task.status });

  const submit = async (e) => {
    e.preventDefault();
    await api(`/tasks/${task._id}`, { method: 'PUT', token, body: { feedback: form.feedback, status: form.status } });
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={`Review · ${task.title}`}>
      {task.submission?.link && (
        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
          <span className="font-semibold">Submitted:</span>{' '}
          <a href={task.submission.link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{task.submission.link}</a>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Feedback</label>
          <textarea className="input" rows={4} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Share your thoughts on the submission…" />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['Pending', 'In Progress', 'Submitted', 'Completed'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Save review</button>
      </form>
    </Modal>
  );
}