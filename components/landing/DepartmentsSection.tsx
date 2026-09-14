'use client';

import React from 'react';
import {
  GraduationCap,
  Building,
  BookOpen,
  Utensils,
  Wrench,
  Zap,
  Monitor,
  FileCheck,
  Building2,
  ShieldCheck,
  Bus,
  Sparkles,
} from 'lucide-react';

export function DepartmentsSection() {
  const departments = [
    { name: 'Academics', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { name: 'Hostel Management', icon: Building, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { name: 'Library Services', icon: BookOpen, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { name: 'Canteen & Mess', icon: Utensils, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { name: 'Campus Maintenance', icon: Wrench, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { name: 'Electrical & Power', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { name: 'IT & Computer Lab', icon: Monitor, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { name: 'Examination Cell', icon: FileCheck, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { name: 'General Administration', icon: Building2, color: 'text-slate-700 bg-slate-100 border-slate-300' },
    { name: 'Campus Security', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'Transport & Fleet', icon: Bus, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { name: 'Cleanliness & Sanitation', icon: Sparkles, color: 'text-lime-600 bg-lime-50 border-lime-200' },
  ];

  return (
    <section id="departments" className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1 text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <span>Coverage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Platform. Every Department.
          </h2>
          <p className="text-base text-slate-600 font-normal">
            Direct routing to specialized staff across all campus divisions for swift, accountable resolutions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {departments.map((dept, idx) => {
            const Icon = dept.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:bg-white hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3.5 group cursor-default"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center border flex-shrink-0 ${dept.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                  {dept.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
