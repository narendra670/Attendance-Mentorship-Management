'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/lib/useFetch';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader, EmptyState } from '@/components/ui';
import Avatar from '@/components/Avatar';
import { ProgressBar } from '@/lib/utils';

export default function MyStudentsPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error } = useFetch('/mentor/students');
  const students = data?.students || [];

  const filtered = students.filter(({ student }) =>
    !search ||
    (student.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (student.rollNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="My Students" subtitle={`${students.length} assigned students`} />

      {error && <EmptyState title="Could not load students" message={error} />}
      {loading && <PageLoader />}

      {!loading && !error && (
        <>
          <div className="card mb-5 max-w-md p-4">
            <input className="input" placeholder="Search by name or roll number…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={students.length === 0 ? 'No students assigned' : 'No matches'}
              message={students.length === 0 ? 'The admin will assign students to you shortly.' : 'Try a different search.'}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(({ student, progress }) => (
                <Link key={student._id} href={`/my-students/${student._id}`} className="card group p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <Avatar name={student.name} src={student.profilePhoto} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-brand-600">{student.name}</h3>
                      <p className="text-xs text-slate-500">{student.rollNumber || '—'} · {student.department || '—'}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">Semester {student.semester || '—'}</span>
                        {student.academicPerformance?.cgpa && <> · CGPA {student.academicPerformance.cgpa}</>}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Overall progress</span>
                      <span className="font-bold text-brand-600">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                    {student.careerGoal && (
                      <p className="mt-3 truncate text-xs text-slate-400">🎯 {student.careerGoal}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}