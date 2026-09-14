'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function LandingCTA({ user }: { user: any }) {
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

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl space-y-6">
          {/* Subtle Decorative Circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-blue-100 border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>Ready to Make Your Campus Better?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Have an Issue on Campus?
          </h2>

          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto font-normal">
            Raise your concern transparently and let the authorized department staff take action promptly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={submitTarget}
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-sm rounded-2xl shadow-lg transition-all hover:scale-[1.02]"
            >
              {user ? 'Submit New Complaint' : 'Submit a Complaint'}
            </Link>

            <Link
              href={trackTarget}
              className="w-full sm:w-auto px-8 py-4 bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all"
            >
              {user ? 'View Dashboard' : 'Track Existing Complaint'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
