'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <Logo size="md" />
            <p className="text-slate-500 leading-relaxed text-xs">
              A centralized digital platform for college issue resolution, department routing, and transparent feedback.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#departments" className="hover:text-blue-600 transition-colors">Departments</a>
              </li>
              <li>
                <a href="#security" className="hover:text-blue-600 transition-colors">Security Architecture</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Support & Help</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <span className="text-slate-500 cursor-default">College IT Helpdesk</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Campus Administration</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Student & Staff Portal */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Quick Portals</h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-600 transition-colors">Student Registration</Link>
              </li>
              <li>
                <Link href="/dashboard/student" className="hover:text-blue-600 transition-colors">Student Portal</Link>
              </li>
              <li>
                <Link href="/dashboard/staff" className="hover:text-blue-600 transition-colors">Staff Dashboard</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 font-medium gap-2">
          <div>© {currentYear} ComplainTrack Complaint Management System. All rights reserved.</div>
          <div>Designed for Higher Education Institutions</div>
        </div>
      </div>
    </footer>
  );
}
