'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Avatar from '@/components/Avatar';
import AdminUserForm from '@/components/AdminUserForm';

export default function StudentsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const { data: deptData } = useFetch('/admin/departments');
  const query = `/admin/users?role=student${department ? `&department=${encodeURIComponent(department)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  const { data, loading, error, reload } = useFetch(query);

  const students = data?.users || [];
  const departments = deptData?.departments || [];

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleActive = async (s) => {
    await api(`/admin/users/${s._id}`, { method: 'PUT', token, body: { isActive: !s.isActive } });
    reload();
    notify(`${s.name} ${s.isActive ? 'deactivated' : 'activated'}`);
  };

  const del = async (s) => {
    if (!confirm(`Delete student ${s.name}? This also removes mentorship records.`)) return;
    await api(`/admin/users/${s._id}`, { method: 'DELETE', token });
    reload();
    notify('Student deleted');
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${data?.count || 0} students`}
        actions={<button className="btn-primary" onClick={() => { setEditing(null); setOpen(true); }}>+ Add student</button>}
      />

      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{toast}</div>}

      <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search name, email, roll number…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:max-w-xs" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d._id} value={d.name}>{d.name}</option>)}
        </select>
      </div>

      {error && <EmptyState title="Could not load students" message={error} />}
      {loading && <PageLoader />}

      {!loading && !error && (
        <div className="card overflow-hidden">
          {students.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Roll No</th>
                    <th className="hidden px-5 py-3 md:table-cell">Department</th>
                    <th className="hidden px-5 py-3 lg:table-cell">Semester</th>
                    <th className="hidden px-5 py-3 lg:table-cell">CGPA</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} src={s.profilePhoto} size="sm" />
                          <div>
                            <div className="font-semibold text-slate-800">{s.name}</div>
                            <div className="text-xs text-slate-500">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{s.rollNumber || '—'}</td>
                      <td className="hidden px-5 py-3 text-slate-600 md:table-cell">{s.department || '—'}</td>
                      <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{s.semester || '—'}</td>
                      <td className="hidden px-5 py-3 text-slate-600 lg:table-cell">{s.academicPerformance?.cgpa || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => { setEditing(s); setOpen(true); }}>Edit</button>
                          <button className="btn-secondary !px-3 !py-1.5 !text-xs" onClick={() => toggleActive(s)}>{s.isActive ? 'Deactivate' : 'Activate'}</button>
                          <button className="btn-ghost !px-3 !py-1.5 !text-xs text-red-600 hover:bg-red-50" onClick={() => del(s)}>Delete</button>
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

      {open && <AdminUserForm user={editing} role="student" departments={departments} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); reload(); notify(editing ? 'Student updated' : 'Student added'); }} />}
    </div>
  );
}