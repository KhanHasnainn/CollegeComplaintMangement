'use client';

import React from 'react';
import { Lock, ShieldAlert, EyeOff, FileCheck, UserCheck, HardDrive } from 'lucide-react';

export function SecuritySection() {
  const securityItems = [
    {
      icon: Lock,
      title: 'Secure Session Authentication',
      desc: 'Industry-standard bcrypt password hashing (12 salt rounds) and HTTP-only, SameSite secure cookies.',
    },
    {
      icon: ShieldAlert,
      title: 'Role-Based Access Control',
      desc: 'Strict server-side permission checks for Students, Department Staff, and System Administrators.',
    },
    {
      icon: EyeOff,
      title: 'Private Complaint Scoping',
      desc: 'IDOR & BOLA protection ensures student complaint data and attachments remain strictly private.',
    },
    {
      icon: HardDrive,
      title: 'Protected File Storage',
      desc: 'Attachments stored outside web root with magic-byte validation and authorized streaming endpoints.',
    },
    {
      icon: FileCheck,
      title: 'Immutable Audit History',
      desc: 'All security-sensitive operations, status changes, and user management events logged permanently.',
    },
    {
      icon: UserCheck,
      title: 'Internal Note Confidentiality',
      desc: 'Staff internal notes and administrative evaluations are strictly isolated at database query level.',
    },
  ];

  return (
    <section id="security" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1 text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span>Security Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Complaint. Your Privacy. Our Responsibility.
          </h2>
          <p className="text-base text-slate-600 font-normal">
            Built with defense-in-depth security principles to protect student identities and institutional integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityItems.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{sec.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
