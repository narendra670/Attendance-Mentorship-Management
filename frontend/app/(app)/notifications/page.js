'use client';

import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import { timeAgo } from '@/lib/utils';

export default function NotificationsPage() {
  const { token } = useAuth();
  const { data, loading, error, reload } = useFetch('/notifications');
  const notifications = data?.notifications || [];

  const readAll = async () => {
    await api('/notifications/read-all', { method: 'PUT', token });
    reload();
  };

  const markRead = async (id) => {
    await api(`/notifications/${id}/read`, { method: 'PUT', token });
    reload();
  };

  const del = async (id) => {
    await api(`/notifications/${id}`, { method: 'DELETE', token });
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${data?.unread || 0} unread`}
        actions={data?.unread > 0 && (
          <button className="btn-secondary" onClick={readAll}>Mark all as read</button>
        )}
      />

      {loading && <PageLoader />}
      {error && <EmptyState title="Could not load notifications" message={error} />}
      {!loading && !error && notifications.length === 0 && (
        <EmptyState title="No notifications" message="You're all caught up." />
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n._id} className={`card flex items-start gap-4 p-4 ${!n.read ? 'border-l-4 border-l-brand-500 bg-brand-50/40' : ''}`}>
            <span className="mt-1 text-xl">{iconFor(n.type)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
                {!n.read && <span className="badge bg-brand-600 text-white">New</span>}
              </div>
              <p className="mt-1 text-sm text-slate-600">{n.message}</p>
              <span className="mt-1 block text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!n.read && (
                <button onClick={() => markRead(n._id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="Mark read">
                  ✔
                </button>
              )}
              <button onClick={() => del(n._id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const iconFor = (type) =>
  ({
    mentor_assigned: '🤝',
    meeting_request: '📅',
    meeting_accepted: '✅',
    meeting_rejected: '❌',
    meeting_rescheduled: '🔄',
    meeting_cancelled: '🚫',
    meeting_completed: '🎉',
    upcoming_meeting: '⏰',
    new_task: '📋',
    task_deadline: '⏳',
    goal_assigned: '🎯',
    goal_completed: '🏆',
    new_feedback: '⭐',
    new_message: '💬',
    new_announcement: '📢',
  }[type] || '🔔');