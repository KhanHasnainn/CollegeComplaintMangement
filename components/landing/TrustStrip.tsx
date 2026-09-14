'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Eye, Award } from 'lucide-react';

export function TrustStrip() {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Secure & Reliable',
      desc: 'Student data strictly protected',
    },
    {
      icon: RefreshCw,
      title: 'Real-Time Updates',
      desc: 'Track live status transitions',
    },
    {
      icon: Eye,
      title: 'Transparent Process',
      desc: 'Clear department accountability',
    },
    {
      icon: Award,
      title: 'Quality Resolution',
      desc: 'Verified student feedback loop',
    },
  ];

  return (
    <section className="py-8 bg-white border-y border-slate-200/80 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
