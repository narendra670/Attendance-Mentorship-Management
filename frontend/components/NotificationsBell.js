'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { timeAgo } from '@/lib/utils';

export default function NotificationsBell() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const ref = useRef();

  useEffect(() => {
    if (!token) return;
    api('/notifications', { token })
      .then(setData)
      .catch(() => {});
  }, [token, open]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = data?.unread || 0;

  const markAll = async () => {
    try {
      await api('/notifications/read-all', { method: 'PUT', token });
      setData((d) => d && { ...d, unread: 0, notifications: d.notifications.map((n) => ({ ...n, read: true })) });
    } catch {}
  };

  const markOne = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PUT', token });
      setData((d) => d && { ...d, unread: Math.max(0, d.unread - 1), notifications: d.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)) });
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!data && <div className="px-4 py-8 text-center text-sm text-slate-400">Loading…</div>}
            {data && data.notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">You&apos;re all caught up 🎉</div>
            )}
            {data &&
              data.notifications.slice(0, 12).map((n) => (
                <button
                  key={n._id}
                  onClick={() => markOne(n._id)}
                  className={`block w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${n.read ? '' : 'bg-brand-50/60'}`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-800">{n.title}</div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</p>
                      <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}