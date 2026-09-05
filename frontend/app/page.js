'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { UNSPLASH } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: '1-on-1 Mentorship',
    desc: 'Every student is paired with an experienced mentor for personalized academic and career guidance.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Track Goals & Tasks',
    desc: 'Set measurable goals, assign tasks with deadlines, and watch progress happen in real time.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Meet & Discuss',
    desc: 'Request meetings, get them scheduled, take notes and action items from every session.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Learn Together',
    desc: 'Unlock curated resources, announcements and instant messaging with your mentor.',
  },
];

const stats = [
  { value: '3+', label: 'Departments' },
  { value: '6', label: 'Active Mentors' },
  { value: '50+', label: 'Students Guided' },
  { value: '100%', label: 'Progress Tracking' },
];

const steps = [
  {
    num: '01',
    title: 'Create your profile',
    desc: 'Students and mentors sign up with their department, semester, skills and interests.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Get matched',
    desc: 'Admins assign a mentor whose expertise matches each student&apos;s goals.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Grow together',
    desc: 'Set goals, complete tasks, attend meetings and review progress every step of the way.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

const socials = [
  {
    label: 'Twitter',
    path: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.852.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
  },
  {
    label: 'GitHub',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  },
  {
    label: 'LinkedIn',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'How it works', 'Pricing', 'FAQs'],
  },
  {
    title: 'Company',
    links: ['About us', 'Careers', 'Blog', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Mentorship Guide', 'Help Center', 'Privacy Policy', 'Terms of Service'],
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-slate-200/60 bg-white/80 shadow-lg shadow-slate-900/5 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <span className={`text-lg font-bold transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              Mentor<span className="text-brand-400">Sphere</span>
            </span>
          </div>
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Impact', href: '#stats' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  scrolled ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`hidden sm:inline-flex btn ${
                scrolled ? 'btn-ghost' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn inline-flex items-center gap-1.5 bg-white text-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-50 hover:shadow-brand-500/30"
            >
              Get Started
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] overflow-hidden bg-slate-950">
        <img src={UNSPLASH.community} alt="Students collaborating" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-brand-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600/20 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-200 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                </span>
                Attendance &amp; Mentorship Platform
              </span>

              <h1 className="mt-8 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Attendance{' '}
                <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-indigo-300 bg-clip-text text-transparent">
                  Mentorship
                </span>{' '}
                Management System
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300/90">
                Empowering students and mentors with real-time attendance tracking, goal management,
                and seamless collaboration — all in one beautiful platform.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.02] hover:from-brand-600 hover:to-brand-700 hover:shadow-brand-600/40 active:scale-[0.98]"
                >
                  Get Started Free
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Sign in
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['bg-brand-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'].map((bg, i) => (
                    <div
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-900 ${bg} text-xs font-bold text-white`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-300">
                  <span className="font-semibold text-white">50+</span> students already mentoring
                </div>
              </div>
            </div>

            <div className="relative hidden h-[420px] lg:mt-4 lg:block">
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl" />

              <div className="absolute left-0 top-16 z-10 w-56 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-400">Attendance</div>
                    <div className="text-sm font-bold text-white">94.2% Average</div>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-56 z-10 w-56 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-400">Goals</div>
                    <div className="text-sm font-bold text-white">28 Completed</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-16 z-10 w-56 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-400">Meetings</div>
                    <div className="text-sm font-bold text-white">12 This Month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Stats */}
      <section id="stats" className="relative bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50 md:grid-cols-4 md:gap-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`text-center ${i < stats.length - 1 ? 'md:border-r md:border-slate-200' : ''}`}
              >
                <div className="bg-gradient-to-br from-brand-600 to-brand-800 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1.5 text-sm font-medium text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge bg-brand-100 text-brand-700">Features</span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Everything mentorship needs, built in
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            From the first hello to the final progress review — MentorSphere keeps it organized.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-100/50"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-brand-100/60" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative overflow-hidden bg-slate-950 py-24">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge bg-brand-500/20 text-brand-300">How it works</span>
            <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Three simple steps</h2>
            <p className="mt-4 text-lg text-slate-300/80">Start your mentorship journey in minutes.</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.num} className="group relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+40px)] top-10 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-brand-500/40 to-transparent md:block" />
                )}
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-brand-500/30 hover:bg-white/[0.08]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-bold text-white shadow-lg shadow-brand-500/30">
                    Step {s.num}
                  </div>
                  <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                    {s.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-3 text-sm text-slate-300/70">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-indigo-50" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-brand-200 bg-white p-12 shadow-2xl shadow-brand-200/30 sm:p-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Ready to start your journey?
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Join the mentorship program today and get a mentor who has been where you are.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-500/25 transition-all hover:scale-[1.02] hover:from-brand-600 hover:to-brand-700 hover:shadow-brand-600/30 active:scale-[0.98]"
              >
                Create account
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-all hover:scale-[1.02] hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <span className="text-lg font-bold text-white">
                  Mentor<span className="text-brand-400">Sphere</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Attendance &amp; Mentorship Management System — empowering students and mentors to
                achieve more together.
              </p>
              <div className="mt-6 flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-brand-500 hover:bg-brand-600 hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {footerLinks.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-400 transition-colors hover:text-brand-400">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-slate-800 pt-8 text-sm text-slate-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
              </svg>
              <span>
                &copy; {new Date().getFullYear()} MentorSphere &middot; Student Mentorship Program. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span>Built with Next.js + Tailwind CSS</span>
              <span className="hidden text-slate-700 sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}