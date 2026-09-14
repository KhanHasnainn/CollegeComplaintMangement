import React from 'react';
import { Clock, User, Lock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export interface TimelineEvent {
  id: string;
  updateType: string;
  message: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  isPublic: boolean;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    role: string;
  };
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return <p className="text-slate-500 text-sm italic">No history logged yet.</p>;
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => {
          const isLast = eventIdx === events.length - 1;
          const formattedDate = new Date(event.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div>
                    <span
                      title={event.isPublic ? 'Public Event' : 'Internal Note'}
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        event.isPublic ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {event.isPublic ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {event.actor?.name || 'System'}
                        </span>
                        {event.actor?.role && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {event.actor.role}
                          </span>
                        )}
                        {!event.isPublic && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            Internal Note
                          </span>
                        )}
                      </div>
                      <time className="text-xs text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formattedDate}
                      </time>
                    </div>

                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{event.message}</p>

                    {event.newStatus && (
                      <div className="mt-2 flex items-center space-x-2 text-xs">
                        <span className="text-slate-500">Status updated to:</span>
                        <StatusBadge status={event.newStatus} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
