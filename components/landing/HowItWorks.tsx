'use client';

import React from 'react';
import { Send, ShieldAlert, Wrench, CheckCircle2, Star } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit Complaint',
      desc: 'Describe your issue, select category and requested priority, and upload optional photos or documents.',
      icon: Send,
    },
    {
      num: '02',
      title: 'Review & Assign',
      desc: 'Admin or system assigns your complaint to the dedicated department staff (Maintenance, IT, Academic).',
      icon: ShieldAlert,
    },
    {
      num: '03',
      title: 'Department Action',
      desc: 'Assigned staff investigates the problem, posts public updates or requests additional info if needed.',
      icon: Wrench,
    },
    {
      num: '04',
      title: 'Resolution',
      desc: 'Once fixed, staff marks the complaint as RESOLVED with an official resolution message.',
      icon: CheckCircle2,
    },
    {
      num: '05',
      title: 'Feedback',
      desc: 'Student provides 1–5 star rating and comment to ensure high service standards.',
      icon: Star,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1 text-xs font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            <span>Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From Complaint to Resolution
          </h2>
          <p className="text-base text-slate-600 font-normal">
            A clear, 5-step transparent workflow designed to make campus governance accountable and efficient.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={idx} className="relative flex flex-col items-center text-center space-y-4 group">
                {/* Connecting Line for Desktop */}
                {!isLast && (
                  <div className="hidden md:block absolute top-7 left-1/2 w-full h-0.5 bg-slate-200 -z-0" />
                )}

                {/* Step Circle */}
                <div className="h-14 w-14 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center font-extrabold text-lg shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 z-10">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider block">
                    Step {step.num}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
