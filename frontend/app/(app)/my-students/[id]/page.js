'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFetch } from '@/lib/useFetch';
import { PageLoader, EmptyState } from '@/components/ui';
import Avatar from '@/components/Avatar';
import { ProgressBar, formatDate, Badge, PriorityBadge } from '@/lib/utils';

export default function StudentDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/mentor/students/${id}`);

  if (loading) return <PageLoader />;
  if (error) return <EmptyState title="Could not load student" message={error} />;
  if (!data) return null;

  const { student, goals, tasks, meetings, progress } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={student.name} src={student.profilePhoto} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
            <span className="badge bg-emerald-100 text-emerald-700">{student.status === 'online' ? 'Online' : 'Offline'}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {student.rollNumber} · {student.course || '—'} · Semester {student.semester} · {student.department}
          </p>
          {student.careerGoal && (
            <p className="mt-1 text-sm text-brand-600">🎯 {student.careerGoal}</p>
          )}
          {student.bio && <p className="mt-2 max-w-2xl text-sm text-slate-600">{student.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {student.skills?.map((s) => <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>)}
          </div>
        </div>
        <div className="card !border-brand-100 p-4 text-center">
          <div className="text-3xl font-extrabold text-brand-600">{progress.overall}%</div>
          <div className="text-xs font-medium text-slate-500">Overall progress</div>
        </div>
      </div>

      {/* Dimension progress */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-700">Progress breakdown</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(progress.dimensions || {}).map(([k, v]) => (
            <div key={k}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{k}</span>
                <span>{v}%</span>
              </div>
              <ProgressBar value={v} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Goals */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Goals</h3>
            <Link href="/goals" className="text-sm font-medium text-brand-600 hover:text-brand-700">Assign goal</Link>
          </div>
          <div className="mt-4 space-y-3">
            {goals.length === 0 && <p className="text-sm text-slate-400">No goals yet.</p>}
            {goals.map((g) => (
              <div key={g._id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{g.title}</span>
                  <Badge value={g.status} />
                  <PriorityBadge value={g.priority} />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar value={g.progress} className="flex-1" />
                  <span className="text-xs font-semibold text-slate-600">{g.progress}%</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">Due {formatDate(g.deadline)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Tasks</h3>
            <Link href="/tasks" className="text-sm font-medium text-brand-600 hover:text-brand-700">Assign task</Link>
          </div>
          <div className="mt-4 space-y-3">
            {tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
            {tasks.map((t) => (
              <div key={t._id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex-1 text-sm font-semibold text-slate-800">{t.title}</span>
                  <Badge value={t.status} />
                </div>
                <div className="mt-1 text-xs text-slate-400">Due {formatDate(t.deadline)}</div>
                {t.feedback && (
                  <div className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-semibold">Feedback:</span> {t.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meetings */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-700">Meeting history</h3>
        <div className="mt-4 space-y-3">
          {meetings.length === 0 && <p className="text-sm text-slate-400">No meetings yet.</p>}
          {meetings.map((m) => (
            <div key={m._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-800">{m.purpose || 'Meeting'}</div>
                <div className="text-xs text-slate-500">{formatDate(m.date)} at {m.time}</div>
              </div>
              <Badge value={m.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}