"use client";

import { useEffect, useState } from "react";
import { FileText, Mail, Calendar, AlertCircle, Star, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { MatchScoreRing } from "@/components/dashboard/match-score-ring";
import { LiveAgentFeed } from "@/components/dashboard/live-agent-feed";
import { PipelineList } from "@/components/dashboard/pipeline-list";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";

// Removed hardcoded mock data

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const { summary, pipeline, recommendations, tasks } = useDashboardData();

  useEffect(() => {
    setUserId(getCurrentUserId());
    const user = getCurrentUser();
    if (user && user.full_name) {
      setUserName(user.full_name.split(" ")[0]);
    }
  }, []);

  const pipelineStages = pipeline.data
    ? [
        { label: "Draft", count: pipeline.data.draft },
        { label: "Ready", count: pipeline.data.ready },
        { label: "Submitted", count: pipeline.data.submitted },
        { label: "Under Review", count: pipeline.data.under_review },
        { label: "Interview", count: pipeline.data.interview },
        { label: "Accepted", count: pipeline.data.accepted },
      ]
    : [];

  const hasNoApplicationsYet = summary.data && summary.data.applications_sent === 0;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-ink-900 tracking-tight flex items-center gap-2">
          {userId ? `Good morning, ${userName}` : "Welcome to ResearchOS AI"} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-base text-ink-500 mt-1">Your AI research career operator is working for you.</p>
      </div>

      {!userId && (
        <div className="mb-6 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          <AlertCircle size={16} />
          You are viewing a demo preview. Sign in to see your real applications and live agent activity.
        </div>
      )}

      {summary.error && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle size={16} />
          Could not load your dashboard data: {summary.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {summary.loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : summary.data ? (
              <>
                <StatCard label="Applications" value={summary.data.applications_sent} icon={FileText} delta="12 this week" />
                <StatCard label="Responses" value={summary.data.responses} icon={Mail} delta="3 this week" />
                <StatCard label="Interviews" value={summary.data.interviews} icon={Calendar} delta="1 this week" />
                <MatchScoreRing label="Average Match" value={summary.data.average_match_score} />
              </>
            ) : null}
          </div>

          {hasNoApplicationsYet && (
            <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-8 text-center">
              <p className="text-sm font-medium text-ink-900 mb-1">No applications yet</p>
              <p className="text-sm text-ink-500 mb-4">
                Run Professor Discovery to find your first matches and let the agents get to work.
              </p>
              <a
                href="/professors"
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                Discover Professors
              </a>
            </div>
          )}

          <LiveAgentFeed userId={userId} />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star size={20} className="text-brand-600" />
              <h3 className="text-lg font-bold text-ink-900">Recommended for you</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-ink-100 p-5 h-[200px] animate-pulse" />
                ))
              ) : recommendations.data && recommendations.data.length > 0 ? (
                recommendations.data.map((rec) => (
                  <RecommendationCard key={rec.professor} {...rec} />
                ))
              ) : (
                <div className="col-span-3 py-10 text-center text-ink-500 bg-white rounded-xl border border-ink-100">
                  <p>Update your profile to get personalized recommendations</p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-6">
              <a href="/professors" className="text-[13px] font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700 transition-colors">
                View More Recommendations <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {pipeline.loading ? (
            <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 bg-ink-50 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          ) : pipeline.data ? (
            <PipelineList stages={pipelineStages} />
          ) : null}
          {tasks.loading ? (
            <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5 animate-pulse h-48" />
          ) : (
            <UpcomingTasks tasks={tasks.data || []} />
          )}
        </div>
      </div>
    </div>
  );
}
