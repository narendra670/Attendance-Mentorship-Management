'use client';

import { useState } from 'react';

import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import { timeAgo } from '@/lib/utils';

const TYPES = ['PDF', 'Document', 'Video', 'Link', 'Tutorial', 'Course', 'Notes'];
const TYPE_ICONS = { PDF: '📄', Document: '📝', Video: '🎬', Link: '🔗', Tutorial: '🧭', Course: '🎓', Notes: '📌' };

export default function ResourcesPage() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const { data, loading, error, reload } = useFetch('/resources');
  const resources = data?.resources || [];
  const isMentor = user?.role === 'mentor' || user?.role === 'admin';

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const del = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await api(`/resources/${id}`, { method: 'DELETE', token });
    reload();
    notify('Resource deleted');
  };

  return (
    <div>
      <PageHeader
        title="Learning Resources"
        subtitle="Hand-picked resources shared by mentors"
        actions={isMentor && <button className="btn-primary" onClick={() => { setEditing(null); setOpen(true); }}>+ Share resource</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      {error && <EmptyState title="Could not load resources" message={error} />}
      {loading && <PageLoader />}
      {!loading && !error && resources.length === 0 && (
        <EmptyState title="No resources yet" message="Mentors will share useful learning material here." />
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map((r) => (
          <div key={r._id} className="card group flex flex-col p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{TYPE_ICONS[r.type] || '📚'}</span>
              <span className="badge bg-slate-100 text-slate-600">{r.type}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{r.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{r.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge bg-brand-50 text-brand-700">{r.category}</span>
              <span className="text-slate-400">{timeAgo(r.createdAt)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Avatar name={r.mentor?.name} src={r.mentor?.profilePhoto} size="xs" />
                {r.mentor?.name}
              </span>
              <div className="flex items-center gap-2">
                {r.url && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="btn-primary !px-3 !py-1.5 !text-xs">Open</a>
                )}
                {isMentor && (user?.role === 'admin' || r.mentor?._id === user?._id) && (
                  <>
                    <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => { setEditing(r); setOpen(true); }}>Edit</button>
                    <button className="btn-ghost !px-3 !py-1.5 !text-xs text-red-600 hover:bg-red-50" onClick={() => del(r._id)}>×</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <ResourceForm
          resource={editing}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); reload(); notify(editing ? 'Resource updated' : 'Resource shared'); }}
        />
      )}
    </div>
  );
}

function ResourceForm({ resource, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: resource?.title || '',
    description: resource?.description || '',
    type: resource?.type || 'Link',
    url: resource?.url || '',
    category: resource?.category || 'General',
  });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (resource) {
        await api(`/resources/${resource._id}`, { method: 'PUT', token, body: form });
      } else {
        await api('/resources', { method: 'POST', token, body: form });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open onClose={onClose} title={resource ? 'Edit resource' : 'Share a resource'}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Technical / Career…" />
          </div>
        </div>
        <div>
          <label className="label">URL</label>
          <input className="input" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
        </div>
        <button type="submit" className="btn-primary w-full">{resource ? 'Save changes' : 'Share resource'}</button>
      </form>
    </Modal>
  );
}