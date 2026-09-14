'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, FileText, Users, FolderKanban, Building2, ShieldAlert, BarChart3 } from 'lucide-react';

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { href: '/dashboard/student', label: 'My Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/student/complaints/new', label: 'Submit Complaint', icon: PlusCircle },
  ];

  const staffLinks = [
    { href: '/dashboard/staff', label: 'Assigned Complaints', icon: FolderKanban },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin?tab=users', label: 'User Management', icon: Users },
    { href: '/dashboard/admin?tab=departments', label: 'Departments & Categories', icon: Building2 },
    { href: '/dashboard/admin?tab=audit', label: 'Audit Logs', icon: ShieldAlert },
    { href: '/dashboard/admin?tab=reports', label: 'Analytics & Reports', icon: BarChart3 },
  ];

  let links = studentLinks;
  if (role === 'STAFF') links = staffLinks;
  if (role === 'ADMIN') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Navigation</h2>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500">
        <div className="font-semibold text-slate-700 mb-1">Support & Help</div>
        <p>If you encounter technical errors, contact IT Administration.</p>
      </div>
    </aside>
  );
}
