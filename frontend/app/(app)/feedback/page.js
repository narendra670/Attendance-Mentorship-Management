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

export default function FeedbackPage() {
  const { user, token } = useAuth();
  const [giveOpen, setGiveOpen] = useState(false);
  const [toast, setToast] = useState('');

  const receivedType = user?.role === 'student' ? 'mentor-to-student' : 'student-to-mentor';
  const { data, loading, error, reload } = useFetch(`/feedback?type=${receivedType}`);
  const studentsQuery = useFetch(user?.role === 'mentor' ? '/mentor/students' : null);

  const feedback = data?.feedback || [];
  const receivedList = feedback.filter((f) => f.type === receivedType);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Feedback"
        subtitle={user?.role === 'student' ? 'Feedback shared with you by your mentor' : 'Feedback shared with you by your students'}
        actions={user?.role === 'student' && (
          <button className="btn-primary" onClick={() => setGiveOpen(true)}>Rate your mentor</button>
        )}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      {error && <EmptyState title="Could not load feedback" message={error} />}
      {loading && <PageLoader />}
      {!loading && !error && receivedList.length === 0 && (
        <EmptyState
          title="No feedback yet"
          message={user?.role === 'student' ? 'Your mentor will share feedback after meetings.' : 'Your students will rate your guidance.'}
        />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {receivedList.map((f) => {
          const giver = user?.role === 'student' ? f.mentor : f.student;
          return (
            <div key={f._id} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={giver?.name} src={giver?.profilePhoto} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{giver?.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{giver?.role} · {timeAgo(f.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-bold text-slate-900">{(f.overallRating || 0).toFixed(1)}</span>
                </div>
              </div>

              {f.feedback && <p className="mt-4 text-sm leading-relaxed text-slate-600">{f.feedback}</p>}
              {f.comment && <p className="mt-4 text-sm leading-relaxed text-slate-600">{f.comment}</p>}

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                {(f.type === 'mentor-to-student'
                  ? [
                      ['Technical', f.technicalSkills],
                      ['Communication', f.communication],
                      ['Consistency', f.consistency],
                      ['Problem solving', f.problemSolving],
                    ]
                  : [
                      ['Communication', f.communication],
                      ['Guidance', f.guidance],
                      ['Availability', f.availability],
                    ]
                ).map(([label, val]) => (
                  <RatingPill key={label} label={label} value={val} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {user?.role === 'mentor' && (
        <div className="mt-6">
          <button className="btn-primary" onClick={() => setGiveOpen(true)}>+ Give feedback to student</button>
        </div>
      )}

      {giveOpen && user?.role === 'student' && (
        <StudentRating onClose={() => setGiveOpen(false)} onSaved={() => { setGiveOpen(false); reload(); notify('Thanks! Your feedback was submitted.'); }} />
      )}
      {giveOpen && user?.role === 'mentor' && (
        <MentorRating students={(studentsQuery.data?.students || []).map((s) => s.student)} onClose={() => setGiveOpen(false)} onSaved={() => { setGiveOpen(false); reload(); notify('Feedback sent to student'); }} />
      )}
    </div>
  );
}

function RatingPill({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
      <div className="text-lg font-bold text-brand-600">{value || 0}/10</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

function StudentRating({ onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ overallRating: 5, communication: 5, guidance: 5, availability: 5, comment: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('/feedback/student', { method: 'POST', token, body: { ...form, overallRating: Number(form.overallRating) } });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Rate your mentor">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <Slider form={form} setForm={setForm} label="Overall experience" field="overallRating" />
        <Slider form={form} setForm={setForm} label="Communication" field="communication" />
        <Slider form={form} setForm={setForm} label="Guidance quality" field="guidance" />
        <Slider form={form} setForm={setForm} label="Availability" field="availability" />
        <div>
          <label className="label">Comment</label>
          <textarea className="input" rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="What has been going well?" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Submitting…' : 'Submit feedback'}</button>
      </form>
    </Modal>
  );
}

function MentorRating({ students, onClose, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ student: '', technicalSkills: 5, communication: 5, consistency: 5, problemSolving: 5, overallRating: 5, feedback: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    if (!form.student) return setError('Select a student');
    try {
      await api('/feedback/mentor', {
        method: 'POST',
        token,
        body: {
          student: form.student,
          technicalSkills: Number(form.technicalSkills),
          communication: Number(form.communication),
          consistency: Number(form.consistency),
          problemSolving: Number(form.problemSolving),
          overallRating: Number(form.overallRating),
          feedback: form.feedback,
        },
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Give feedback to a student" size="lg">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Student</label>
          <select className="input" required value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })}>
            <option value="">Select a student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber || s.email})</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider form={form} setForm={setForm} label="Technical skills" field="technicalSkills" />
          <Slider form={form} setForm={setForm} label="Communication" field="communication" />
          <Slider form={form} setForm={setForm} label="Consistency" field="consistency" />
          <Slider form={form} setForm={setForm} label="Problem solving" field="problemSolving" />
        </div>
        <Slider form={form} setForm={setForm} label="Overall rating" field="overallRating" />
        <div>
          <label className="label">Written feedback</label>
          <textarea className="input" rows={3} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Strengths, improvements, next steps…" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Submitting…' : 'Send feedback'}</button>
      </form>
    </Modal>
  );
}

function Slider({ form, setForm, label, field }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <span className="text-sm font-bold text-brand-600">{Number(form[field]).toFixed(1)} / 10</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        className="w-full accent-brand-600"
        value={form[field]}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
      />
    </div>
  );
}