'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { PlusCircle, Search, Filter, Clock, CheckCircle2, RefreshCw, XCircle, FileText, Star, ChevronRight } from 'lucide-react';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUserAndComplaints();
  }, [statusFilter]);

  const fetchUserAndComplaints = async () => {
    setLoading(true);
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      let url = '/api/complaints?limit=50';
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

  const filteredComplaints = complaints.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.complaintNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.category.name.toLowerCase().includes(q)
    );
  });

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' || c.status === 'WAITING_FOR_STUDENT').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar user={user} />

        <div className="flex-1 space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Student Portal</h1>
              <p className="text-sm text-slate-500">Welcome back, {user?.name || 'Student'}. Manage and track your complaints.</p>
            </div>
            <Link
              href="/dashboard/student/complaints/new"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Complaint</span>
            </Link>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Complaints</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{total}</div>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 text-amber-900">
              <div className="text-xs font-semibold text-amber-700 uppercase flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> Pending
              </div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">{pending}</div>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200/60 text-sky-900">
              <div className="text-xs font-semibold text-sky-700 uppercase flex items-center">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> In Progress
              </div>
              <div className="text-2xl font-extrabold text-sky-900 mt-1">{inProgress}</div>
            </div>
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 text-emerald-900">
              <div className="text-xs font-semibold text-emerald-700 uppercase flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolved
              </div>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">{resolved}</div>
            </div>
          </div>

          {/* Filter Controls & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                {[
                  { id: '', label: 'All Complaints' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'RESOLVED', label: 'Resolved' },
                  { id: 'REJECTED', label: 'Rejected' },
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

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search complaint ID or title..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Complaints Table */}
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading complaints...</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-700">No complaints found</div>
                <p className="text-xs text-slate-500">Submit a complaint to start tracking resolution.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Complaint ID</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Date Submitted</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.complaintNumber}</td>
                        <td className="py-3 px-4 text-slate-900 font-semibold max-w-xs truncate">{c.title}</td>
                        <td className="py-3 px-4 text-slate-600">{c.category?.name}</td>
                        <td className="py-3 px-4 text-slate-600">{c.department?.name}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/complaints/${c.id}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
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
