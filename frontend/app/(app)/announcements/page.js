'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Modal from '@/components/Modal';
import { cn, formatDate, timeAgo } from '@/lib/utils';

const TARGET_ICONS = { all: '🌐', department: '🏛️', course: '📘', semester: '🎓', mentor_group: '🧑‍🏫' };

export default function AnnouncementsPage() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const { data, loading, error, reload } = useFetch('/announcements');
  const announcements = data?.announcements || [];
  const isAdmin = user?.role === 'admin';

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const del = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await api(`/announcements/${id}`, { method: 'DELETE', token });
    reload();
    notify('Announcement deleted');
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Updates from the program administration"
        actions={isAdmin && <button className="btn-primary" onClick={() => setOpen(true)}>+ New announcement</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      {error && <EmptyState title="Could not load announcements" message={error} />}
      {loading && <PageLoader />}
      {!loading && !error && announcements.length === 0 && (
        <EmptyState title="No announcements" message="Stay tuned for updates." />
      )}

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a._id} className="card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">
                {TARGET_ICONS[a.target?.type] || '📢'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{a.title}</h3>
                  <span className="badge bg-slate-100 capitalize text-slate-600">
                    {a.target?.type === 'all' ? 'Everyone' : a.target?.type?.replace('_', ' ')}
                  </span>
                  {a.eventDate && <span className="badge bg-amber-50 text-amber-700">📆 {formatDate(a.eventDate)}</span>}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.message}</p>
                <div className="mt-3 text-xs text-slate-400">
                  Posted by <span className="font-medium text-slate-500">{a.admin?.name || 'Admin'}</span> · {timeAgo(a.createdAt)}
                </div>
              </div>
              {isAdmin && (
                <button className="btn-ghost shrink-0 !px-3 !py-1.5 text-red-600 hover:bg-red-50" onClick={() => del(a._id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {open && isAdmin && <CreateAnnouncement onClose={() => setOpen(false)} onSaved={() => { setOpen(false); reload(); notify('Announcement published'); }} />}
    </div>
  );
}

function CreateAnnouncement({ onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ title: '', message: '', targetType: 'all', eventDate: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/announcements', {
        method: 'POST',
        token,
        body: {
          title: form.title,
          message: form.message,
          target: { type: form.targetType },
          eventDate: form.eventDate || undefined,
        },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open onClose={onClose} title="New announcement">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Audience</label>
            <select className="input" value={form.targetType} onChange={(e) => setForm({ ...form, targetType: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="department">Department</option>
              <option value="course">Course</option>
              <option value="semester">Semester</option>
              <option value="mentor_group">Mentor group</option>
            </select>
          </div>
          <div>
            <label className="label">Event date (optional)</label>
            <input type="date" className="input" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">Publish</button>
      </form>
    </Modal>
  );
}