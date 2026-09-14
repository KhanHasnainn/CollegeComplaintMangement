'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { FolderKanban, Search, Clock, RefreshCw, CheckCircle2, AlertTriangle, ChevronRight, User } from 'lucide-react';

export default function StaffDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }

      let url = '/api/complaints?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.complaintNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.student?.name?.toLowerCase().includes(q)
    );
  });

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'PENDING' || c.status === 'ASSIGNED' || c.status === 'UNDER_REVIEW').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'WAITING_FOR_STUDENT').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
  const highPriority = complaints.filter((c) => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar user={user} />

        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">Department Action Portal</h1>
                {user?.department && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                    {user.department.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">Welcome, {user?.name}. Manage department issues and take action.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Assigned Complaints</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{total}</div>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 text-amber-900">
              <div className="text-xs font-semibold text-amber-700 uppercase flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> Pending Action
              </div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">{pending}</div>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200/60 text-sky-900">
              <div className="text-xs font-semibold text-sky-700 uppercase flex items-center">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Active In Progress
              </div>
              <div className="text-2xl font-extrabold text-sky-900 mt-1">{inProgress}</div>
            </div>
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/60 text-rose-900">
              <div className="text-xs font-semibold text-rose-700 uppercase flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> High / Critical Priority
              </div>
              <div className="text-2xl font-extrabold text-rose-900 mt-1">{highPriority}</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                {[
                  { id: '', label: 'All Complaints' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'ASSIGNED', label: 'Assigned' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'RESOLVED', label: 'Resolved' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl transition-all ${
                      statusFilter === tab.id
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, title, student..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading department queue...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No complaints in queue</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Complaint ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.complaintNumber}</td>
                        <td className="py-3 px-4 text-slate-900 font-semibold">
                          <div>{c.student?.name}</div>
                          <div className="text-[10px] text-slate-400">{c.student?.studentRollNumber}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{c.category?.name}</td>
                        <td className="py-3 px-4 text-slate-900 max-w-xs truncate">{c.title}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              c.priority === 'CRITICAL' || c.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/complaints/${c.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold transition-colors"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
