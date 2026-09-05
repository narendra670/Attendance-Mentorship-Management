'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';
import { cn, formatDate, formatDateTime, Badge } from '@/lib/utils';

const TABS = ['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled', 'rescheduled'];

export default function MeetingsPage() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [reschedule, setReschedule] = useState(null);
  const [complete, setComplete] = useState(null);
  const [toast, setToast] = useState('');

  const { data, loading, error, reload } = useFetch(`/meetings${tab !== 'all' ? `?status=${tab}` : ''}`);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const meetingList = data?.meetings || [];

  const isMentor = user?.role === 'mentor';
  const isStudent = user?.role === 'student';

  return (
    <div>
      <PageHeader
        title="Meetings"
        subtitle={isStudent ? 'Schedule time with your mentor' : 'Managing mentorship meetings'}
        actions={isStudent && <button className="btn-primary" onClick={() => setCreateOpen(true)}>+ Request meeting</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              tab === t ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <PageLoader />}
      {error && <EmptyState title="Could not load meetings" message={error} />}

      {!loading && !error && meetingList.length === 0 && (
        <EmptyState title="No meetings here" message="Meetings will show up once scheduled." />
      )}

      <div className="space-y-4">
        {meetingList.map((m) => {
          const peer = isStudent ? m.mentor : m.student;
          return (
            <div key={m._id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3 sm:w-56">
                  <Avatar name={peer?.name} src={peer?.profilePhoto} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{peer?.name}</div>
                    <div className="text-xs capitalize text-slate-500">{peer?.role}</div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {m.purpose || 'Mentorship meeting'}
                    </h3>
                    <Badge value={m.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(m.date)} at {m.time}
                  </p>
                  {m.message && <p className="mt-2 text-sm text-slate-600">{m.message}</p>}
                  {m.notes?.discussion && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Discussion:</span> {m.notes.discussion}
                      {m.notes?.actionItems?.length > 0 && (
                        <ul className="mt-2 list-inside list-disc space-y-1">
                          {m.notes.actionItems.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                  {m.rescheduledTo && m.status === 'rescheduled' && (
                    <div className="mt-3 rounded-lg bg-violet-50 p-3 text-sm text-violet-700">
                      Rescheduled to {formatDate(m.rescheduledTo.date)} at {m.rescheduledTo.time}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  {isMentor && m.status === 'pending' && (
                    <>
                      <button className="btn-primary" onClick={async () => {
                        await api(`/meetings/${m._id}`, { method: 'PUT', token, body: { action: 'accept' } });
                        reload(); notify('Meeting accepted');
                      }}>Accept</button>
                      <button className="btn-secondary" onClick={async () => {
                        await api(`/meetings/${m._id}`, { method: 'PUT', token, body: { action: 'reject' } });
                        reload(); notify('Meeting rejected');
                      }}>Reject</button>
                      <button className="btn-ghost" onClick={() => setReschedule(m)}>Reschedule</button>
                    </>
                  )}
                  {isMentor && (m.status === 'accepted' || m.status === 'rescheduled') && (
                    <button className="btn-secondary" onClick={() => setComplete(m)}>Mark complete</button>
                  )}
                  {(m.status === 'pending' || m.status === 'accepted') && (
                    <button className="btn-ghost text-red-600 hover:bg-red-50" onClick={async () => {
                      if (!confirm('Cancel this meeting?')) return;
                      await api(`/meetings/${m._id}`, { method: 'DELETE', token });
                      reload(); notify('Meeting cancelled');
                    }}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {createOpen && <CreateMeetingModal onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); reload(); notify('Meeting request sent'); }} />}
      {reschedule && <RescheduleModal meeting={reschedule} onClose={() => setReschedule(null)} onSaved={() => { setReschedule(null); reload(); notify('Meeting rescheduled'); }} />}
      {complete && <CompleteMeetingModal meeting={complete} onClose={() => setComplete(null)} onSaved={() => { setComplete(null); reload(); notify('Meeting completed'); }} />}
    </div>
  );
}

function CreateMeetingModal({ onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ date: '', time: '', purpose: '', message: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('/meetings', { method: 'POST', token, body: form });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Request a meeting">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Date</label>
            <input type="date" required className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="label">Time</label>
            <input type="time" required className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Purpose</label>
          <input className="input" placeholder="e.g. Career guidance" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={3} placeholder="What would you like to discuss?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Sending…' : 'Send request'}
        </button>
      </form>
    </Modal>
  );
}

function RescheduleModal({ meeting, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ date: new Date(meeting.date).toISOString().slice(0, 10), time: meeting.time });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api(`/meetings/${meeting._id}`, { method: 'PUT', token, body: { action: 'reschedule', rescheduledTo: { date: form.date, time: form.time } } });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open onClose={onClose} title="Reschedule meeting">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">New date</label>
            <input type="date" required className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="label">New time</label>
            <input type="time" required className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full">Confirm reschedule</button>
      </form>
    </Modal>
  );
}

function CompleteMeetingModal({ meeting, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ discussion: '', actionItems: '', concerns: '' });

  const submit = async (e) => {
    e.preventDefault();
    const notes = {
      discussion: form.discussion,
      actionItems: form.actionItems.split('\n').map((s) => s.trim()).filter(Boolean),
      concerns: form.concerns,
    };
    await api(`/meetings/${meeting._id}`, { method: 'PUT', token, body: { action: 'complete', notes } });
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title="Complete meeting">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Discussion summary</label>
          <textarea className="input" rows={3} value={form.discussion} onChange={(e) => setForm({ ...form, discussion: e.target.value })} />
        </div>
        <div>
          <label className="label">Action items (one per line)</label>
          <textarea className="input" rows={3} value={form.actionItems} onChange={(e) => setForm({ ...form, actionItems: e.target.value })} placeholder={'Read docs\nStart the project'} />
        </div>
        <div>
          <label className="label">Concerns</label>
          <textarea className="input" rows={2} value={form.concerns} onChange={(e) => setForm({ ...form, concerns: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary w-full">Save notes & complete</button>
      </form>
    </Modal>
  );
}