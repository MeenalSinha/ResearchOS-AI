"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const { summary, pipeline } = useDashboardData();

  const pipelineChartData = pipeline.data
    ? [
        { stage: "Draft", count: pipeline.data.draft },
        { stage: "Ready", count: pipeline.data.ready },
        { stage: "Submitted", count: pipeline.data.submitted },
        { stage: "Review", count: pipeline.data.under_review },
        { stage: "Interview", count: pipeline.data.interview },
        { stage: "Accepted", count: pipeline.data.accepted },
      ]
    : [];

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">Analytics</h1>
        <p className="text-sm text-ink-500 mt-1">
          Pulled live from /dashboard/summary and /applications/pipeline-summary - no static numbers.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summary.loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : summary.data ? (
          <>
            <MetricTile label="Response rate" value={`${summary.data.response_rate}%`} />
            <MetricTile label="Acceptance rate" value={`${summary.data.acceptance_rate}%`} />
            <MetricTile label="Avg. match score" value={`${summary.data.average_match_score}%`} />
            <MetricTile label="Interviews" value={summary.data.interviews} />
          </>
        ) : (
          <p className="text-sm text-ink-500 col-span-4">Could not load analytics data.</p>
        )}
      </div>

      <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-4">Applications by pipeline stage</h3>
        {pipeline.loading ? (
          <Skeleton className="h-64 w-full" />
        ) : pipelineChartData.every((d) => d.count === 0) ? (
          <p className="text-sm text-ink-500 text-center py-16">
            No applications yet - this chart will populate as you run the agent pipeline from Professor Discovery.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipelineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12, fill: "#6b6b76" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6b6b76" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#dc1f33" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-4">
      <p className="text-xs text-ink-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}
