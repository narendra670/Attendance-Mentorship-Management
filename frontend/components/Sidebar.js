'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Avatar from '@/components/Avatar';
import { cn } from '@/lib/utils';

const NAV = {
  student: [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/meetings', label: 'Meetings', icon: '📅' },
    { href: '/goals', label: 'Goals', icon: '🎯' },
    { href: '/tasks', label: 'Tasks', icon: '✅' },
    { href: '/resources', label: 'Resources', icon: '📚' },
    { href: '/announcements', label: 'Announcements', icon: '📢' },
    { href: '/messages', label: 'Messages', icon: '💬' },
    { href: '/feedback', label: 'Feedback', icon: '⭐' },
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
  ],
  mentor: [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/my-students', label: 'My Students', icon: '👥' },
    { href: '/meetings', label: 'Meetings', icon: '📅' },
    { href: '/goals', label: 'Goals', icon: '🎯' },
    { href: '/tasks', label: 'Tasks', icon: '✅' },
    { href: '/resources', label: 'Resources', icon: '📚' },
    { href: '/announcements', label: 'Announcements', icon: '📢' },
    { href: '/messages', label: 'Messages', icon: '💬' },
    { href: '/feedback', label: 'Feedback', icon: '⭐' },
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/students', label: 'Students', icon: '🎓' },
    { href: '/mentors', label: 'Mentors', icon: '🧑‍🏫' },
    { href: '/assignments', label: 'Assignments', icon: '🤝' },
    { href: '/departments', label: 'Departments', icon: '🏛️' },
    { href: '/workload', label: 'Mentor Workload', icon: '⚖️' },
    { href: '/announcements', label: 'Announcements', icon: '📢' },
    { href: '/messages', label: 'Messages', icon: '💬' },
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
  ],
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const items = NAV[user?.role] || [];

  const active = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 transition-transform duration-200 lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">🎓</span>
        <span className="text-lg font-bold text-white">
          Mentor<span className="text-brand-400">Sphere</span>
        </span>
        <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white lg:hidden">✕</button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active(item.href)
                ? 'bg-brand-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        {user && (
          <>
            <Link href="/profile" onClick={onClose} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-800">
              <Avatar name={user.name} src={user.profilePhoto} size="sm" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs capitalize text-slate-400">{user.role}</div>
              </div>
            </Link>
            <button
              onClick={() => { onClose(); logout(); }}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span>🚪</span> Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}