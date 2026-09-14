'use client';

import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, CheckCircle2, Star, Building2 } from 'lucide-react';

export function StatisticsSection() {
  const [stats, setStats] = useState<any>({
    totalComplaints: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    departmentCount: 5,
    avgRating: 4.8,
  });

  useEffect(() => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">
            Institutional Impact
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Transparent Campus Resolution Performance
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm space-y-1">
            <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl sm:text-4xl font-black text-white">{stats.totalComplaints}</div>
            <div className="text-xs text-slate-400 font-medium">Total Complaints</div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm space-y-1">
            <RefreshCw className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <div className="text-3xl sm:text-4xl font-black text-sky-400">{stats.inProgressCount}</div>
            <div className="text-xs text-slate-400 font-medium">Active In Progress</div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">{stats.resolvedCount}</div>
            <div className="text-xs text-slate-400 font-medium">Resolved Total</div>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm space-y-1">
            <Star className="w-6 h-6 text-amber-400 mx-auto mb-2 fill-amber-400" />
            <div className="text-3xl sm:text-4xl font-black text-amber-400">{stats.avgRating} / 5</div>
            <div className="text-xs text-slate-400 font-medium">Student Rating</div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 backdrop-blur-sm space-y-1">
            <Building2 className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <div className="text-3xl sm:text-4xl font-black text-indigo-400">{stats.departmentCount}</div>
            <div className="text-xs text-slate-400 font-medium">Active Departments</div>
          </div>
        </div>
      </div>
    </section>
  );
}
