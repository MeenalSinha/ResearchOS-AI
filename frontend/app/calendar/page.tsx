"use client";

import { useEffect, useState } from "react";
import { Calendar, Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";

interface CalendarEvent {
  id: string;
  application_id: string;
  title: string;
  date: string;
  event_type: "deadline" | "follow_up";
  status: string;
}

export default function CalendarPage() {
  const { checked } = useRequireAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch<CalendarEvent[]>("/calendar/events")
      .then((data) => {
        if (!cancelled) {
          setEvents(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;

  const getStatusColor = (status: string) => {
    if (status === "accepted") return "text-emerald-500 bg-emerald-50 border-emerald-200";
    if (status === "rejected") return "text-rose-500 bg-rose-50 border-rose-200";
    if (status === "submitted" || status === "under_review") return "text-violet-500 bg-violet-50 border-violet-200";
    return "text-ink-600 bg-ink-50 border-ink-200";
  };

  const getEventIcon = (type: string, dateStr: string) => {
    const date = parseISO(dateStr);
    if (isPast(date) && !isToday(date)) return <CheckCircle2 className="w-5 h-5 text-ink-300" />;
    if (type === "deadline") return <AlertCircle className="w-5 h-5 text-rose-500" />;
    return <Clock className="w-5 h-5 text-brand-500" />;
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink-900 flex items-center gap-2">
          <Calendar size={24} className="text-brand-500" />
          Timeline & Deadlines
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Keep track of your application deadlines and follow-up reminders.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-ink-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-ink-100 shadow-sm">
          <Calendar className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink-900">No Events Scheduled</h3>
          <p className="text-ink-500 mt-1">Start an application to see deadlines and follow-ups here.</p>
        </div>
      ) : (
        <div className="relative border-l border-ink-200 ml-4 space-y-8 pb-8">
          {events.map((event) => {
            const date = parseISO(event.date);
            const past = isPast(date) && !isToday(date);
            
            let relativeDate = format(date, "MMM d, yyyy");
            if (isToday(date)) relativeDate = "Today";
            else if (isTomorrow(date)) relativeDate = "Tomorrow";

            return (
              <div key={event.id} className="relative pl-8">
                <div className={`absolute -left-[11px] top-1 bg-white rounded-full ${past ? "opacity-50" : ""}`}>
                  {getEventIcon(event.event_type, event.date)}
                </div>
                
                <div className={`bg-white rounded-xl border border-ink-100 shadow-sm p-4 ${past ? "opacity-60 bg-ink-50" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-ink-900">{relativeDate}</span>
                        <span className="text-sm text-ink-400">• {format(date, "h:mm a")}</span>
                      </div>
                      <h3 className="text-lg font-medium text-ink-900">{event.title}</h3>
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${getStatusColor(event.status)}`}>
                      {event.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
