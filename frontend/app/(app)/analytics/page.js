'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { PageLoader, EmptyState } from '@/components/ui';
import { PageHeader, StatCard } from '@/components/PageHeader';
import Avatar from '@/components/Avatar';
import { ProgressBar, formatDate } from '@/lib/utils';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch('/dashboard/analytics');

  if (loading) return <PageLoader />;
  if (error) return <EmptyState title="Could not load analytics" message={error} />;
  if (!data) return null;

  const d = data.data;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle={
          user?.role === 'student' ? 'Your progress across goals, tasks and meetings' :
            user?.role === 'mentor' ? 'Insights into your students and mentorship activity' :
              'Platform-wide mentorship insights'
        }
      />

      {user?.role === 'student' && <StudentAnalytics d={d} />}
      {user?.role === 'mentor' && <MentorAnalytics d={d} />}
      {user?.role === 'admin' && <AdminAnalytics d={d} />}
    </div>
  );
}

function StudentAnalytics({ d }) {
  const progress = d.progress || { overall: 0, dimensions: {} };
  const goalCount = sum(d.goals);
  const taskCount = sum(d.tasks);
  const completedGoals = count(d.goals, 'Completed');
  const completedTasks = count(d.tasks, 'Completed');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total goals" value={goalCount} icon="🎯" accent="brand" />
        <StatCard label="Goals completed" value={completedGoals} icon="🏆" accent="green" />
        <StatCard label="Total tasks" value={taskCount} icon="✅" accent="violet" />
        <StatCard label="Tasks completed" value={completedTasks} icon="🎉" accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700">Overall progress</h3>
          <div className="mt-3 text-4xl font-extrabold text-brand-600">{progress.overall}%</div>
          <ProgressBar value={progress.overall} className="mt-3 h-3" />
          <div className="mt-5 space-y-3">
            {Object.entries(progress.dimensions || {}).map(([k, v]) => (
              <div key={k}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{k}</span>
                  <span className="text-slate-400">{v}%</span>
                </div>
                <ProgressBar value={v} />
              </div>
            ))}
          </div>
        </div>

        <MeetingChart data={d.meetings} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BarList title="Goals by status" data={d.goals} colorMap={GOAL_COLORS} />
        <BarList title="Goals by category" data={d.goalCategories} />
        <BarList title="Tasks by status" data={d.tasks} colorMap={TASK_COLORS} />
      </div>
    </div>
  );
}

function MentorAnalytics({ d }) {
  const students = d.studentProgress || [];
  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + (s.overall || 0), 0) / students.length)
    : 0;
  const pendingGoals = (d.goals || []).filter((x) => x._id === 'In Progress' || x._id === 'Not Started').reduce((a, x) => a + x.count, 0);
  const pendingTasks = (d.tasks || []).filter((x) => x._id === 'Pending' || x._id === 'In Progress').reduce((a, x) => a + x.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned students" value={students.length} icon="👥" accent="brand" />
        <StatCard label="Avg student progress" value={`${avgProgress}%`} icon="📈" accent="green" />
        <StatCard label="Active goals" value={pendingGoals} icon="🎯" accent="amber" />
        <StatCard label="Tasks to review" value={pendingTasks} icon="📋" accent="violet" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Student progress</h3>
          <Link href="/my-students" className="text-sm font-medium text-brand-600 hover:text-brand-700">View students</Link>
        </div>
        <div className="mt-4 space-y-4">
          {students.length === 0 && <p className="text-sm text-slate-400">No students assigned yet.</p>}
          {students.map(({ student, overall }) => (
            <div key={student._id} className="flex items-center gap-4">
              <Avatar name={student.name} src={student.profilePhoto} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium text-slate-800">
                    {student.name} <span className="text-xs text-slate-400">{student.rollNumber || ''}</span>
                  </span>
                  <span className="font-bold text-brand-600">{overall}%</span>
                </div>
                <ProgressBar value={overall} className="mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MeetingChart data={d.meetings} />
        <div className="grid grid-cols-2 gap-6">
          <BarList title="Goals by status" data={d.goals} colorMap={GOAL_COLORS} compact />
          <BarList title="Tasks by status" data={d.tasks} colorMap={TASK_COLORS} compact />
        </div>
      </div>
    </div>
  );
}

function AdminAnalytics({ d }) {
  const totalGoals = sum(d.goals);
  const totalTasks = sum(d.tasks);
  const goalDone = count(d.goals, 'Completed');
  const taskDone = count(d.tasks, 'Completed');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total goals" value={totalGoals} icon="🎯" accent="brand" />
        <StatCard label="Goals completed" value={goalDone} icon="🏆" accent="green" />
        <StatCard label="Total tasks" value={totalTasks} icon="✅" accent="violet" />
        <StatCard label="Tasks completed" value={taskDone} icon="🎉" accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MeetingChart data={d.meetings} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BarList title="Goals by status" data={d.goals} colorMap={GOAL_COLORS} />
        <BarList title="Goals by category" data={d.goalCategories} />
        <BarList title="Tasks by status" data={d.tasks} colorMap={TASK_COLORS} />
      </div>
    </div>
  );
}

const GOAL_COLORS = {
  Completed: 'bg-emerald-500',
  'In Progress': 'bg-brand-500',
  'Not Started': 'bg-slate-300',
  Overdue: 'bg-red-500',
};

const TASK_COLORS = {
  Completed: 'bg-emerald-500',
  Submitted: 'bg-violet-400',
  'In Progress': 'bg-brand-500',
  Pending: 'bg-slate-300',
  Overdue: 'bg-red-500',
};

function BarList({ title, data = [], colorMap = {}, compact }) {
  const items = [...data].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...items.map((x) => x.count));

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className={`mt-4 space-y-3 ${compact ? '' : ''}`}>
        {items.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
        {items.map((x) => (
          <div key={x._id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className={`capitalize text-slate-600 ${colorMap[x._id] ? 'font-medium' : ''}`}>{x._id}</span>
              <span className="font-semibold text-slate-800">{x.count}</span>
            </div>
            <ProgressBar value={(x.count / max) * 100} className={`!h-2.5 ${compact ? '' : ''}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingChart({ data = [] }) {
  const counts = Array(12).fill(0);
  (data || []).forEach((m) => {
    if (m._id >= 1 && m._id <= 12) counts[m._id - 1] = m.count;
  });
  const max = Math.max(1, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Meetings per month</h3>
        <span className="text-xs text-slate-400">{total} total</span>
      </div>
      <div className="mt-6 flex h-40 items-end justify-around gap-2">
        {counts.map((c, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-600">{c || ''}</span>
            <div
              className="w-full rounded-t-md bg-brand-500 transition-all hover:bg-brand-600"
              style={{ height: `${c ? Math.max(8, (c / max) * 100) : 0}%` }}
            />
            <span className="text-[10px] text-slate-400">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Last 12 months · <span className="capitalize">{formatDate(new Date())}</span>
      </p>
    </div>
  );
}

function sum(arr = []) {
  return arr.reduce((a, x) => a + x.count, 0);
}

function count(arr = [], status) {
  return arr.filter((x) => x._id === status).reduce((a, x) => a + x.count, 0);
}