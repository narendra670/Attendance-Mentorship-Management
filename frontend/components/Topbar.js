'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import Avatar from '@/components/Avatar';
import NotificationsBell from '@/components/NotificationsBell';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
        <span className="capitalize">{user?.role}</span>
        <span>/</span>
        <span className="font-medium text-slate-800">{user?.department || 'Portal'}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsBell />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100"
          >
            <Avatar name={user?.name} src={user?.profilePhoto} size="sm" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="truncate text-sm font-semibold text-slate-800">{user?.name}</div>
                  <div className="truncate text-xs text-slate-500">{user?.email}</div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Edit profile
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Messages
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Notifications
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}