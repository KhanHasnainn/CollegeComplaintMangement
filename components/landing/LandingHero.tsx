'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

/* ─── animated counter hook ─── */
function useCounter(end: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const ease = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(ease * end));
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { value, ref };
}

/* ─── timeline data ─── */
const timeline = [
  { label: 'Complaint Filed', time: 'Today, 9:12 AM', done: true },
  { label: 'Assigned to Maintenance', time: 'Today, 9:45 AM', done: true },
  { label: 'Work In Progress', time: 'Today, 11:20 AM', done: true },
  { label: 'Resolution & Feedback', time: 'Pending', done: false },
];

export function LandingHero({ user }: { user: any }) {
  const submitTarget = user
    ? user.role === 'STUDENT'
      ? '/dashboard/student/complaints/new'
      : `/dashboard/${user.role.toLowerCase()}`
    : '/login';

  const trackTarget = user
    ? user.role === 'STUDENT'
      ? '/dashboard/student'
      : `/dashboard/${user.role.toLowerCase()}`
    : '/login';

  const resolved = useCounter(1240);
  const satisfaction = useCounter(97);
  const avgHours = useCounter(18);

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-slate-50"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full border border-blue-100/60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -right-48 w-[720px] h-[720px] rounded-full border border-blue-50/40"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* ── LEFT: Copy ── */}
          <div className="space-y-7 pt-4">
            {/* eyebrow */}
            <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">
              Campus Complaint Portal
            </p>

            <h1 className="text-[2.6rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] tracking-tight text-slate-900">
              Raise it. <br className="hidden sm:block" />
              Track it. <br className="hidden sm:block" />
              <span className="text-blue-600">Get it resolved.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-slate-500 max-w-lg">
              One place to report campus issues, follow every status update,
              and hold departments accountable - from submission to resolution.
            </p>

            {/* CTA pair */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href={submitTarget}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.97]"
              >
                {user ? 'New Complaint' : 'Submit a Complaint'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href={trackTarget}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-700 text-sm font-bold border border-slate-200 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]"
              >
                {user ? 'My Dashboard' : 'Track Status'}
              </Link>
            </div>

            {/* inline trust metrics */}
            <div className="flex items-center gap-5 pt-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                End-to-end encrypted
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Role-based access
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Real-time updates
              </span>
            </div>
          </div>

          {/* ── RIGHT: Dashboard preview ── */}
          <div className="space-y-5">
            {/* stat cards row */}
            <div className="grid grid-cols-3 gap-3">
              <div
                ref={resolved.ref}
                className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {resolved.value.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Resolved
                </p>
              </div>

              <div
                ref={satisfaction.ref}
                className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {satisfaction.value}%
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Satisfaction
                </p>
              </div>

              <div
                ref={avgHours.ref}
                className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {avgHours.value}h
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Avg. Resolve
                </p>
              </div>
            </div>

            {/* complaint timeline card */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5">
              {/* card header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      CMP-2026-0842
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Library A/C Unit - Maintenance
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-md">
                  In Progress
                </span>
              </div>

              {/* vertical timeline */}
              <ol className="relative ml-3 border-l-2 border-slate-100 space-y-4 pl-5">
                {timeline.map((step, i) => (
                  <li key={i} className="relative">
                    {/* dot */}
                    <span
                      className={`absolute -left-[1.65rem] top-0.5 w-3 h-3 rounded-full border-2 ${
                        step.done
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-slate-300'
                      }`}
                    />
                    <p
                      className={`text-xs font-semibold ${
                        step.done ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-slate-400">{step.time}</p>
                  </li>
                ))}
              </ol>

              {/* card footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Last updated <span className="font-semibold text-slate-500">32 min ago</span>
                </p>
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5 cursor-default">
                  View Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
