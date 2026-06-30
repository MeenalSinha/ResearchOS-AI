"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

export interface DashboardSummary {
  applications_sent: number;
  responses: number;
  response_rate: number;
  interviews: number;
  acceptance_rate: number;
  average_match_score: number;
}

export interface PipelineSummary {
  draft: number;
  ready: number;
  submitted: number;
  under_review: number;
  viewed: number;
  replied: number;
  interview: number;
  accepted: number;
  rejected: number;
}

export interface Recommendation {
  university: string;
  professor: string;
  field: string;
  match: number;
  imageSrc?: string;
}

export interface Task {
  icon: "mail" | "file" | "calendar";
  title: string;
  due: string;
}

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Real data fetching for the dashboard - replaces the previously hardcoded
 * arrays in app/page.tsx. Exposes loading/error/empty states explicitly so
 * the page can render a skeleton, an error banner, or a genuine empty
 * state instead of always showing the same static numbers regardless of
 * whether the user has any real data yet.
 */
export function useDashboardData() {
  const [summary, setSummary] = useState<FetchState<DashboardSummary>>({ data: null, loading: true, error: null });
  const [pipeline, setPipeline] = useState<FetchState<PipelineSummary>>({ data: null, loading: true, error: null });
  const [recommendations, setRecommendations] = useState<FetchState<Recommendation[]>>({ data: null, loading: true, error: null });
  const [tasks, setTasks] = useState<FetchState<Task[]>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    apiFetch<DashboardSummary>("/dashboard/summary")
      .then((data) => !cancelled && setSummary({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setSummary({ data: null, loading: false, error: err.message }));

    apiFetch<PipelineSummary>("/applications/pipeline-summary")
      .then((data) => !cancelled && setPipeline({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setPipeline({ data: null, loading: false, error: err.message }));

    apiFetch<Recommendation[]>("/dashboard/recommendations")
      .then((data) => !cancelled && setRecommendations({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setRecommendations({ data: null, loading: false, error: err.message }));

    apiFetch<Task[]>("/dashboard/tasks")
      .then((data) => !cancelled && setTasks({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setTasks({ data: null, loading: false, error: err.message }));

    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, pipeline, recommendations, tasks };
}
