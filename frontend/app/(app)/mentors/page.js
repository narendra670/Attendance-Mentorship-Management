'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import AdminUserForm from '@/components/AdminUserForm';
import Avatar from '@/components/Avatar';

export default function MentorsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const { data: deptData } = useFetch('/admin/departments');
  const query = `/admin/users?role=mentor${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  const { data, loading, error, reload } = useFetch(query);

  const mentors = data?.users || [];
  const departments = deptData?.departments || [];

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleActive = async (m) => {
    await api(`/admin/users/${m._id}`, { method: 'PUT', token, body: { isActive: !m.isActive } });
    reload();
    notify(`${m.name} ${m.isActive ? 'deactivated' : 'activated'}`);
  };

  const del = async (m) => {
    if (!confirm(`Delete mentor ${m.name}?`)) return;
    await api(`/admin/users/${m._id}`, { method: 'DELETE', token });
    reload();
    notify('Mentor deleted');
  };

  return (
    <div>
      <PageHeader
        title="Mentors"
        subtitle={`${data?.count || 0} mentors`}
        actions={<button className="btn-primary" onClick={() => { setEditing(null); setOpen(true); }}>+ Add mentor</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      <div className="card mb-5 p-4">
        <input className="input sm:max-w-xs" placeholder="Search mentors…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <EmptyState title="Could not load mentors" message={error} />}
      {loading && <PageLoader />}

      {!loading && !error && (
        <div className="card overflow-hidden">
          {mentors.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No mentors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Mentor</th>
                    <th className="hidden px-5 py-3 lg:table-cell">Designation</th>
                    <th className="hidden px-5 py-3 lg:table-cell">Specialization</th>
                    <th className="hidden px-5 py-3 md:table-cell">Experience</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mentors.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} src={m.profilePhoto} size="sm" />
                          <div>
                            <div className="font-semibold text-slate-800">{m.name}</div>
                            <div className="text-xs text-slate-500">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{m.designation || '—'}</td>
                      <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{m.specialization || '—'}</td>
                      <td className="hidden px-5 py-3 text-slate-600 md:table-cell">{m.experience ? `${m.experience} yrs` : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${m.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => { setEditing(m); setOpen(true); }}>Edit</button>
                          <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => toggleActive(m)}>{m.isActive ? 'Deactivate' : 'Activate'}</button>
                          <button className="btn-ghost !px-3 !py-1.5 !text-xs text-red-600 hover:bg-red-50" onClick={() => del(m)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {open && <AdminUserForm user={editing} role="mentor" departments={departments} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); reload(); notify(editing ? 'Mentor updated' : 'Mentor added'); }} />}
    </div>
  );
}