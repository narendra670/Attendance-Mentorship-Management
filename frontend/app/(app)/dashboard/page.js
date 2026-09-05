'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { PageLoader, EmptyState } from '@/components/ui';
import { PageHeader, StatCard } from '@/components/PageHeader';
import Avatar from '@/components/Avatar';
import { ProgressBar, formatDate, Badge } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch('/dashboard');

  if (loading) return <PageLoader />;
  if (error) return <EmptyState title="Could not load dashboard" message={error} />;
  if (!data) return null;

  const d = data.data;
  return (
    <div>
      <PageHeader title={d.welcome || 'Dashboard'} subtitle={roleSubtitle(user?.role)} />
      {user?.role === 'student' && <StudentDashboard d={d} />}
      {user?.role === 'mentor' && <MentorDashboard d={d} />}
      {user?.role === 'admin' && <AdminDashboard d={d} />}
    </div>
  );
}

const roleSubtitle = (role) =>
  role === 'student' ? 'Track your goals, tasks and mentorship progress' : role === 'mentor' ? 'Manage your students and their progress' : 'Overview of the entire mentorship program';

function StudentDashboard({ d }) {
  const s = d.stats;
  const mentor = d.mentor;
  const progress = d.overallProgress || { overall: 0, dimensions: {} };

  return (
    <div className="space-y-6">
      {/* Mentor card + progress */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          {mentor ? (
            <div className="flex items-start gap-4">
              <Avatar name={mentor.name} src={mentor.profilePhoto} size="lg" />
              <div className="min-w-0 flex-1">
                <span className="badge bg-emerald-100 text-emerald-700">Assigned Mentor</span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{mentor.name}</h2>
                <p className="text-sm text-slate-500">
                  {mentor.designation}
                  {mentor.specialization && <> · {mentor.specialization}</>}
                </p>
                {mentor.bio && <p className="mt-3 text-sm leading-relaxed text-slate-600">{mentor.bio}</p>}
                <div className="mt-4">
                  <Link href="/messages" className="btn-primary">Message mentor</Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-900">No mentor assigned yet</h2>
              <p className="mt-2 text-sm text-slate-500">Your admin will assign a mentor shortly. You can still browse resources and announcements.</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700">Overall Progress</h3>
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Meetings held" value={s.meetings} icon="📅" accent="violet" />
        <StatCard label="Active goals" value={s.activeGoals} icon="🎯" accent="brand" />
        <StatCard label="Goals completed" value={s.completedGoals} icon="🏆" accent="green" />
        <StatCard label="Pending tasks" value={s.pendingTasks} icon="✅" accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingMeetingCard meeting={d.upcomingMeeting} />
        <RecentMeetings meetings={d.recentMeetings} />
      </div>
    </div>
  );
}

function UpcomingMeetingCard({ meeting }) {
  if (!meeting) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-700">Upcoming meeting</h3>
        <p className="mt-3 text-sm text-slate-500">No upcoming meeting scheduled.</p>
        <Link href="/meetings" className="btn-primary mt-4">Request a meeting</Link>
      </div>
    );
  }
  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-slate-700">Upcoming meeting</h3>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <span className="text-lg font-extrabold leading-none">{new Date(meeting.date).getDate()}</span>
          <span className="text-[10px] uppercase">{new Date(meeting.date).toLocaleString('en', { month: 'short' })}</span>
        </span>
        <div>
          <div className="font-semibold text-slate-900">{meeting.purpose || 'Mentorship meeting'}</div>
          <div className="text-sm text-slate-500">
            {formatDate(meeting.date)} · {meeting.time}
          </div>
          {meeting.message && <div className="mt-1 text-sm text-slate-600">{meeting.message}</div>}
        </div>
      </div>
    </div>
  );
}

function RecentMeetings({ meetings }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Recent meetings</h3>
        <Link href="/meetings" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>
      </div>
      {(!meetings || meetings.length === 0) ? (
        <p className="mt-4 text-sm text-slate-500">No completed meetings yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {meetings.map((m) => (
            <div key={m._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-800">{m.purpose || 'Meeting'}</div>
                <div className="text-xs text-slate-500">with {m.mentor?.name} · {formatDate(m.date)}</div>
              </div>
              <Badge value="completed" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MentorDashboard({ d }) {
  const s = d.stats;
  const meetings = d.upcomingMeetings || [];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned students" value={s.assignedStudents} icon="👥" accent="brand" />
        <StatCard label="Pending requests" value={s.pendingRequests} icon="⏳" accent="amber" />
        <StatCard label="Meetings met" value={s.completedMeetings} icon="✅" accent="green" />
        <StatCard label="Tasks to review" value={s.pendingTasks} icon="📋" accent="violet" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming meetings" value={s.upcomingMeetings} icon="📅" accent="red" />
        <StatCard label="Active goals" value={s.activeGoals} icon="🎯" accent="brand" />
        <StatCard label="Goals completed" value={s.completedGoals} icon="🏆" accent="green" />
        <StatCard label="Unread messages" value={s.unreadMessages} icon="💬" accent="slate" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Upcoming meetings</h3>
          <Link href="/meetings" className="text-sm font-medium text-brand-600 hover:text-brand-700">Manage</Link>
        </div>
        {meetings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No upcoming meetings scheduled.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((m) => (
              <div key={m._id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <Avatar name={m.student?.name} src={m.student?.profilePhoto} size="md" />
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-800">{m.student?.name}</div>
                  <div className="truncate text-xs text-slate-500">{m.student?.department}</div>
                  <div className="mt-1 text-xs text-brand-600">{formatDate(m.date)} · {m.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700">Quick actions</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/my-students" className="btn-secondary justify-center">View students</Link>
            <Link href="/goals" className="btn-secondary justify-center">Assign a goal</Link>
            <Link href="/tasks" className="btn-secondary justify-center">Assign a task</Link>
            <Link href="/resources" className="btn-secondary justify-center">Share resource</Link>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700">Unread messages</h3>
          <p className="mt-3 text-3xl font-bold text-slate-900">{s.unreadMessages}</p>
          <p className="text-sm text-slate-500">from your students</p>
          <Link href="/messages" className="btn-primary mt-4">Open messages</Link>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ d }) {
  const s = d.stats;
  const charts = d.charts || {};
  const maxDept = Math.max(1, ...(charts.deptWise || []).map((x) => x.count));
  const maxSem = Math.max(1, ...(charts.semesterWise || []).map((x) => x.count));
  const maxMonth = Math.max(1, ...(charts.meetingsPerMonth || []).map((x) => x.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={s.totalStudents} icon="🎓" accent="brand" />
        <StatCard label="Mentors" value={s.totalMentors} icon="🧑‍🏫" accent="violet" />
        <StatCard label="Departments" value={s.totalDepartments} icon="🏛️" accent="green" />
        <StatCard label="Active mentorships" value={s.activeMentorships} icon="🤝" accent="amber" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming meetings" value={s.upcomingMeetings} icon="📅" accent="red" />
        <StatCard label="Pending requests" value={s.pendingRequests} icon="⏳" accent="amber" />
        <StatCard label="Goal completion" value={`${s.goalCompletionRate}%`} icon="🎯" accent="green" />
        <StatCard label="Task completion" value={`${s.taskCompletionRate}%`} icon="✅" accent="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BarChart title="Students by department" data={charts.deptWise || []} max={maxDept} valueKey="count" labelKey="_id" />
        <BarChart title="Students by semester" data={charts.semesterWise || []} max={maxSem} valueKey="count" labelKey="_id" vertical />
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-700">Meetings per month</h3>
          <div className="mt-6 flex h-40 items-end justify-around gap-2">
            {(charts.meetingsPerMonth || []).map((m) => (
              <div key={m._id} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate-600">{m.count}</span>
                <div className="w-full rounded-t-md bg-brand-500" style={{ height: `${Math.max(6, (m.count / maxMonth) * 100)}%` }} />
                <span className="text-[10px] text-slate-400">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][m._id - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart({ title, data, max, valueKey, labelKey, vertical }) {
  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-5 space-y-4">
        {data.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
        {data.map((x) => (
          <div key={x[labelKey] || x._id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="capitalize text-slate-600">{x[labelKey]}</span>
              <span className="font-semibold text-slate-800">{x[valueKey]}</span>
            </div>
            <ProgressBar value={(x[valueKey] / max) * 100} />
          </div>
        ))}
      </div>
    </div>
  );
}