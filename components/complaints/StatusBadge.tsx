import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ArrowRightCircle, RefreshCw, XCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'PENDING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />,
          label: 'Pending Review',
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />,
          label: 'Under Review',
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <ArrowRightCircle className="w-3.5 h-3.5 mr-1" />,
          label: 'Assigned',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <RefreshCw className="w-3.5 h-3.5 mr-1" />,
          label: 'In Progress',
        };
      case 'WAITING_FOR_STUDENT':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1" />,
          label: 'Info Requested',
        };
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
          label: 'Resolved',
        };
      case 'REOPENED':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <RefreshCw className="w-3.5 h-3.5 mr-1" />,
          label: 'Reopened',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
          label: 'Rejected',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: null,
          label: st,
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg}`}
    >
      {style.icon}
      {style.label}
    </span>
  );
}
