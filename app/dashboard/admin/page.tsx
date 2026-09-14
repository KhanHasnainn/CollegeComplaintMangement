'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldAlert,
  BarChart3,
  Download,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  ChevronRight,
  UserCheck,
  UserX,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'overview';

  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User modal state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newUserRole, setNewUserRole] = useState<'STUDENT' | 'STAFF' | 'ADMIN'>('STAFF');
  const [newUserDept, setNewUserDept] = useState('');

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDept, setNewCatDept] = useState('');
  const [catError, setCatError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }

      if (activeTab === 'overview' || activeTab === 'reports') {
        const rRes = await fetch('/api/admin/reports');
        if (rRes.ok) setReports(await rRes.json());

        const cRes = await fetch('/api/complaints?limit=50');
        if (cRes.ok) {
          const cData = await cRes.json();
          setComplaints(cData.complaints || []);
        }
      }

      if (activeTab === 'users') {
        const uListRes = await fetch('/api/admin/users');
        if (uListRes.ok) {
          const uListData = await uListRes.json();
          setUsersList(uListData.users || []);
        }
      }

      if (activeTab === 'departments' || activeTab === 'overview') {
        const dRes = await fetch('/api/admin/departments');
        if (dRes.ok) {
          const dData = await dRes.json();
          setDepartments(dData.departments || []);
        }
        const catRes = await fetch('/api/admin/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      }

      if (activeTab === 'audit') {
        const aRes = await fetch('/api/admin/audit-logs?limit=50');
        if (aRes.ok) {
          const aData = await aRes.json();
          setAuditLogs(aData.logs || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    window.open('/api/admin/reports?format=csv', '_blank');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          departmentId: newUserDept || null,
        }),
      });
      if (res.ok) {
        setShowCreateUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentActive }),
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, departmentId: newCatDept }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCategoryModal(false);
        setNewCatName('');
        setCatError('');
        fetchAdminData();
      } else {
        setCatError(data.error || 'Failed to create category');
      }
    } catch (err) {
      setCatError('An unexpected error occurred');
      console.error(err);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar user={user} />

        <div className="flex-1 space-y-6">
          {/* Header Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Administrator Command Center</h1>
              <p className="text-sm text-slate-500">System-wide monitoring, user governance, and analytics.</p>
            </div>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'users', label: 'User Governance', icon: Users },
              { id: 'departments', label: 'Departments & Categories', icon: Building2 },
              { id: 'audit', label: 'Security Audit Logs', icon: ShieldAlert },
              { id: 'reports', label: 'Analytics Reports', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(`/dashboard/admin?tab=${tab.id}`)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Total Complaints</div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1">{reports?.summary?.total || 0}</div>
                </div>
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-amber-900">
                  <div className="text-xs font-semibold text-amber-700 uppercase">Pending Review</div>
                  <div className="text-3xl font-extrabold text-amber-900 mt-1">{reports?.summary?.pending || 0}</div>
                </div>
                <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200 text-sky-900">
                  <div className="text-xs font-semibold text-sky-700 uppercase">In Progress</div>
                  <div className="text-3xl font-extrabold text-sky-900 mt-1">{reports?.summary?.inProgress || 0}</div>
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-emerald-900">
                  <div className="text-xs font-semibold text-emerald-700 uppercase">Resolved Total</div>
                  <div className="text-3xl font-extrabold text-emerald-900 mt-1">{reports?.summary?.resolved || 0}</div>
                </div>
              </div>

              {/* Department Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Complaints by Department
                  </h3>
                  <div className="space-y-3">
                    {reports?.byDepartment?.map((dept: any) => (
                      <div key={dept.department} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{dept.department}</span>
                          <span>{dept.count} complaints</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{
                              width: `${Math.min(100, (dept.count / (reports?.summary?.total || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Student Rating Average
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-extrabold text-amber-500">
                      ★ {reports?.summary?.averageRating || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Based on {reports?.summary?.feedbackCount || 0} verified student feedback submissions upon complaint resolution.
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Complaints Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Complaints</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Complaint ID</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {complaints.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.complaintNumber}</td>
                          <td className="py-3 px-4 text-slate-900 font-semibold">{c.student?.name}</td>
                          <td className="py-3 px-4 text-slate-600">{c.department?.name}</td>
                          <td className="py-3 px-4 text-slate-900 max-w-xs truncate">{c.title}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => router.push(`/complaints/${c.id}`)}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                  <p className="text-xs text-slate-500">Manage student accounts, staff members, and department assignments</p>
                </div>

                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Staff Account</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department / Roll #</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-900 font-bold">{u.name}</td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.role === 'STUDENT' ? u.studentRollNumber : u.department?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {u.isActive ? (
                            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              <UserCheck className="w-3 h-3 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              <UserX className="w-3 h-3 mr-1" /> Deactivated
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserActive(u.id, u.isActive)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                              u.isActive
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENTS & CATEGORIES */}
          {activeTab === 'departments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Departments list */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900">College Departments</h2>
                <div className="space-y-3">
                  {departments.map((d) => (
                    <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
                        <span>{d.name} ({d.code})</span>
                        <span className="text-xs font-normal text-slate-500">{d._count?.users || 0} Staff assigned</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{d.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories list */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900">Complaint Categories</h2>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-xl"
                  >
                    + Add Category
                  </button>
                </div>

                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                      <div className="text-xs text-blue-600 font-semibold mt-0.5">
                        Department: {cat.department?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Security Audit Logs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-sans font-semibold">
                          {log.actor?.name || 'System/Guest'}
                        </td>
                        <td className="py-3 px-4 text-blue-700 font-bold">{log.action}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.resourceType}:{log.resourceId}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* CREATE USER MODAL */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Create Staff / User Account</h3>
              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showNewUserPassword ? 'text' : 'password'}
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      title={showNewUserPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl mt-1"
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="STUDENT">STUDENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Department</label>
                    <select
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl mt-1"
                    >
                      <option value="">None</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserModal(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE CATEGORY MODAL */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Add Complaint Category</h3>
              {catError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {catError}
                </div>
              )}
              <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Department</label>
                  <select
                    required
                    value={newCatDept}
                    onChange={(e) => setNewCatDept(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl mt-1"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Admin Dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
