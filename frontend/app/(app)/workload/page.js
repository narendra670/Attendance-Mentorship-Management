'use client';

import { useAuth } from '@/components/AuthContext';
import { useFetch } from '@/lib/useFetch';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Avatar from '@/components/Avatar';
import { ProgressBar } from '@/lib/utils';

export default function WorkloadPage() {
  const { data, loading, error } = useFetch('/admin/mentor-workload');
  const workloads = data?.workloads || [];
  const total = workloads.reduce((sum, m) => sum + (m.assignedStudents || 0), 0);
  const max = Math.max(1, ...workloads.map((m) => m.assignedStudents || 0));

  return (
    <div>
      <PageHeader
        title="Mentor Workload"
        subtitle={`${workloads.length} mentors managing ${total} active student assignments`}
      />

      {error && <EmptyState title="Could not load workload" message={error} />}
      {loading && <PageLoader />}

      {!loading && !error && workloads.length === 0 && (
        <EmptyState title="No mentors found" message="Add mentors to see workload distribution." />
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {workloads.map((m, idx) => (
          <div key={m._id} className="card p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={m.name} src={m.profilePhoto} size="lg" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-900">{m.name}</h3>
                <p className="truncate text-sm text-slate-500">{m.designation || 'Mentor'}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-500">Assigned students</span>
                <span className="text-2xl font-bold text-brand-600">{m.assignedStudents}</span>
              </div>
              <ProgressBar value={(m.assignedStudents / max) * 100} />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.specialization &&
                m.specialization.split(',').map((s, i) => (
                  <span key={i} className="badge bg-brand-50 text-brand-700">{s.trim()}</span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}