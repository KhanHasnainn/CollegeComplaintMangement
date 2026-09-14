'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { Timeline } from '@/components/complaints/Timeline';
import { getAllowedNextStatuses, isValidStateTransition, ComplaintStatus } from '@/lib/state-machine';
import {
  ArrowLeft,
  Paperclip,
  Download,
  Send,
  Lock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Star,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action state
  const [updateMessage, setUpdateMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const uRes = await fetch('/api/auth/me');
      if (uRes.ok) {
        const u = await uRes.json();
        setUser(u.user);
      }

      const res = await fetch(`/api/complaints/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load complaint details');
        setLoading(false);
        return;
      }

      setComplaint(data.complaint);
      setNewStatus(data.complaint.status);
      setNewPriority(data.complaint.priority);
    } catch (err: any) {
      setError('An error occurred while fetching complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/complaints/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: updateMessage,
          updateType: isInternalNote ? 'INTERNAL_NOTE' : 'PUBLIC_UPDATE',
          isPublic: !isInternalNote,
        }),
      });

      if (res.ok) {
        setUpdateMessage('');
        fetchComplaintDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateComplaintStatus = async (targetStatus?: string) => {
    setActionLoading(true);
    try {
      const statusToApply = targetStatus || newStatus;
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusToApply,
          priority: newPriority,
          resolutionMessage: statusToApply === 'RESOLVED' ? resolutionMessage : undefined,
          rejectionReason: statusToApply === 'REJECTED' ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update status');
      } else {
        fetchComplaintDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/complaints/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: feedbackComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackSuccess(true);
        fetchComplaintDetails();
      } else {
        alert(data.error || 'Feedback submission failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar user={user} />
          <div className="flex-1 p-12 text-center text-slate-500 text-sm">Loading complaint details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar user={user} />
          <div className="flex-1 p-12 text-center space-y-4">
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl max-w-md mx-auto text-sm font-semibold">{error}</div>
            <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isStudent = user?.role === 'STUDENT';
  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const allStatuses: ComplaintStatus[] = [
    'PENDING',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING_FOR_STUDENT',
    'RESOLVED',
    'REOPENED',
    'REJECTED',
  ];

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar user={user} />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          </div>

          {/* Complaint Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    {complaint.complaintNumber}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                    Priority: {complaint.priority}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{complaint.title}</h1>
              </div>

              {/* Attachment Button */}
              {complaint.attachmentPath && (
                <a
                  href={`/api/complaints/${complaint.id}/attachment`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>View Attachment ({complaint.attachmentOriginalName || 'File'})</span>
                </a>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-slate-400 font-semibold uppercase">Category</div>
                <div className="font-bold text-slate-800 mt-0.5">{complaint.category?.name}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-slate-400 font-semibold uppercase">Department</div>
                <div className="font-bold text-slate-800 mt-0.5">{complaint.department?.name}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-slate-400 font-semibold uppercase">Submitted By</div>
                <div className="font-bold text-slate-800 mt-0.5">{complaint.student?.name} ({complaint.student?.studentRollNumber})</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-slate-400 font-semibold uppercase">Date Created</div>
                <div className="font-bold text-slate-800 mt-0.5">{new Date(complaint.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap">
                {complaint.description}
              </div>
            </div>
          </div>

          {/* STAFF / ADMIN ACTION CONTROLS */}
          {isStaffOrAdmin && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Department Action & Status Controls
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Update Status (Current: <span className="text-blue-600">{complaint.status}</span>)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 font-semibold text-xs"
                    >
                      {allStatuses.map((st) => {
                        const isValid = isValidStateTransition(complaint.status as ComplaintStatus, st);
                        return (
                          <option key={st} value={st} disabled={!isValid}>
                            {st} {st === complaint.status ? '(Current)' : !isValid ? '(Invalid Transition)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() => handleUpdateComplaintStatus()}
                      disabled={actionLoading || !isValidStateTransition(complaint.status as ComplaintStatus, newStatus as ComplaintStatus)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-40 transition-all"
                    >
                      Apply Status
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Update Priority</label>
                  <div className="flex gap-2">
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 font-semibold text-xs"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                    <button
                      onClick={() => handleUpdateComplaintStatus()}
                      disabled={actionLoading}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
                    >
                      Apply Priority
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Resolution or Rejection Message Fields */}
              {newStatus === 'RESOLVED' && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <label className="font-bold text-emerald-900 block">Resolution Message for Student *</label>
                  <textarea
                    rows={2}
                    value={resolutionMessage}
                    onChange={(e) => setResolutionMessage(e.target.value)}
                    placeholder="Explain how the issue was fixed..."
                    className="w-full p-3 rounded-xl border border-emerald-300 text-xs"
                  />
                </div>
              )}

              {newStatus === 'REJECTED' && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2 text-xs">
                  <label className="font-bold text-rose-900 block">Rejection Reason *</label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide explicit reason for rejecting..."
                    className="w-full p-3 rounded-xl border border-rose-300 text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK MODULE FOR RESOLVED COMPLAINTS */}
          {complaint.status === 'RESOLVED' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" />
                Resolution Feedback & Rating
              </h2>

              {complaint.feedback ? (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center space-x-1 font-bold text-amber-900 text-sm">
                    <span>Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= complaint.feedback.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  {complaint.feedback.comment && (
                    <p className="text-slate-700 italic">"{complaint.feedback.comment}"</p>
                  )}
                </div>
              ) : isStudent ? (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Select Star Rating (1 to 5)</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-xl border transition-all ${
                            star <= rating
                              ? 'bg-amber-50 border-amber-300 text-amber-500'
                              : 'bg-slate-50 border-slate-200 text-slate-300'
                          }`}
                        >
                          <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-500' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Optional Feedback Comment</label>
                    <textarea
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Provide your experience with the resolution..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Submit Rating & Feedback
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-500 italic">Awaiting student feedback.</p>
              )}
            </div>
          )}

          {/* POST UPDATE / RESPONSE FORM */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Add Update / Response</h2>

            <form onSubmit={handlePostUpdate} className="space-y-3">
              <textarea
                required
                rows={3}
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder={
                  isStaffOrAdmin
                    ? isInternalNote
                      ? 'Write internal staff note (Hidden from student)...'
                      : 'Write public update visible to student...'
                    : 'Respond or provide additional requested details...'
                }
                className="w-full p-4 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* Internal Note Switch for Staff/Admin */}
                {isStaffOrAdmin ? (
                  <label className="flex items-center space-x-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mark as Internal Note (Staff Only)</span>
                  </label>
                ) : (
                  <div className="text-xs text-slate-500">Your message will be visible to department staff.</div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading || !updateMessage.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Post Message</span>
                </button>
              </div>
            </form>
          </div>

          {/* TIMELINE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Complaint History & Timeline</h2>
            <Timeline events={complaint.updates} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
