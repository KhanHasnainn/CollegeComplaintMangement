'use client';

import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, RefreshCw, Paperclip, ChevronRight } from 'lucide-react';

export function ComplaintPreview() {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT SIDE TEXT */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Real-Time Student Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Always Know What's Happening
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              No more standing in long queues or repeatedly visiting administrative offices to check on an issue. Track every status change, staff assignment, and resolution message directly from your phone or laptop.
            </p>

            <ul className="space-y-3 text-xs text-slate-300 font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant notifications on department status updates</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Transparent public history timeline</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Direct 1-click rating and feedback submission</span>
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE REALISTIC MOCKUP */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-md">
              {/* Top Banner */}
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-700 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                      CMP-2026-001245
                    </span>
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> In Progress
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">Broken Classroom Fan in Room B-302</h3>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>Category: <span className="text-slate-200 font-semibold">Maintenance</span></div>
                  <div>Priority: <span className="text-amber-400 font-bold">Medium</span></div>
                </div>
              </div>

              {/* Steps Progress */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complaint Timeline</h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center space-x-3 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">Complaint Submitted</span>
                    <span className="text-[10px] text-slate-500 font-mono">Yesterday 4:15 PM</span>
                  </div>
                  <div className="flex items-center space-x-3 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">Under Review by Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">Yesterday 5:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-3 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">Assigned to Maintenance & Facilities</span>
                    <span className="text-[10px] text-slate-500 font-mono">Today 9:00 AM</span>
                  </div>
                  <div className="flex items-center space-x-3 text-blue-400 font-bold bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                    <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
                    <span className="flex-1">In Progress - Staff Dispatched</span>
                    <span className="text-[10px] text-blue-300 font-mono">Today 10:30 AM</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-500 opacity-60">
                    <div className="h-4 w-4 rounded-full border-2 border-slate-500 flex-shrink-0" />
                    <span className="flex-1">Resolved</span>
                    <span className="text-[10px] font-mono">Pending</span>
                  </div>
                </div>
              </div>

              {/* Bottom timestamp pill */}
              <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-700/60">
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Last updated 2 hours ago
                </span>
                <span className="text-blue-400 font-semibold flex items-center">
                  Live Sync Active <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
