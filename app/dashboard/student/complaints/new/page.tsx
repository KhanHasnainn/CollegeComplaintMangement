'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { ArrowLeft, Send, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewComplaintPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u.user);
      }

      const catRes = await fetch('/api/admin/categories?activeOnly=true');
      if (catRes.ok) {
        const catData = await catRes.json();
        const rawCats: any[] = catData.categories || [];
        // Deduplicate defensively
        const seen = new Set<string>();
        const uniqueCats = rawCats.filter((c) => {
          const key = `${c.departmentId || c.department?.id || ''}::${(c.name || '').trim().toLowerCase()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setCategories(uniqueCats);
        if (uniqueCats.length > 0) {
          setCategoryId(uniqueCats[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categoriesByDepartment = React.useMemo(() => {
    const map = new Map<string, { departmentName: string; items: any[] }>();
    for (const cat of categories) {
      const deptName = cat.department?.name || 'General';
      if (!map.has(deptName)) {
        map.set(deptName, { departmentName: deptName, items: [] });
      }
      map.get(deptName)!.items.push(cat);
    }
    return Array.from(map.values());
  }, [categories]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }
    if (description.length < 15) {
      setError('Description must be at least 15 characters long');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      if (file) {
        formData.append('attachment', file);
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit complaint');
        setLoading(false);
        return;
      }

      router.push(`/complaints/${data.complaint.id}`);
      router.refresh();
    } catch (err: any) {
      setError('An error occurred while submitting complaint.');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar user={user} />

        <div className="flex-1 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/student"
              className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Submit New Complaint</h1>
              <p className="text-sm text-slate-500">Provide complete details to help staff investigate promptly</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded-xl flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Complaint Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                >
                  {categories.length === 0 ? (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  ) : (
                    categoriesByDepartment.map((group) => (
                      <optgroup key={group.departmentName} label={`📍 ${group.departmentName}`}>
                        {group.items.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
                {selectedCategory?.description && (
                  <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-blue-600 shrink-0">Handles:</span>
                    <span>{selectedCategory.description}</span>
                  </p>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the issue (e.g. Electrical fault in Room B-302)"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem in detail including room numbers, specific times, or equipment details..."
                  className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Priority Request */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Requested Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    <option value="LOW">Low - Standard inquiry</option>
                    <option value="MEDIUM">Medium - Normal resolution time</option>
                    <option value="HIGH">High - Urgent attention required</option>
                  </select>
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Optional Attachment (JPG, PNG, PDF, DOCX)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting Complaint...' : 'Submit & Generate Complaint ID'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
