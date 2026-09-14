'use client';

import React from 'react';
import { Send, Hash, Building2, Bell, Clock, Star } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Send,
      title: '1. Easy Complaint Submission',
      desc: 'Submit issues with detailed description, category selection, priority request, and secure file attachments.',
      accent: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      icon: Hash,
      title: '2. Unique Complaint ID',
      desc: 'Every complaint receives a server-generated CMP-2026-XXXXXX ID for instant tracking without revealing DB keys.',
      accent: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      icon: Building2,
      title: '3. Department Routing',
      desc: 'Complaints are automatically routed to assigned staff members in Maintenance, Academics, Hostel, or IT.',
      accent: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      icon: Bell,
      title: '4. Real-Time Notifications',
      desc: 'Receive immediate status notifications whenever staff update your complaint or request additional details.',
      accent: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      icon: Clock,
      title: '5. Transparent History',
      desc: 'View step-by-step public timeline history from submission to initial review, staff action, and final fix.',
      accent: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      icon: Star,
      title: '6. Feedback & Rating System',
      desc: 'Rate the resolution quality (1–5 stars) and submit comments to hold departments accountable.',
      accent: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1 text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <span>Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Raise & Resolve an Issue
          </h2>
          <p className="text-base text-slate-600 font-normal">
            One unified platform to submit, track, assign, and resolve campus complaints with complete transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 group"
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${item.accent} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
