"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";

/**
 * Redirects to /login if no valid session exists. Used on pages that
 * require a real signed-in user (Applications, Career Strategy) rather
 * than the Dashboard and Professor Discovery, which intentionally allow
 * a logged-out demo-preview state per the dashboard's empty-state design.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const id = getCurrentUserId();
    setUserId(id);
    setChecked(true);
    if (!id) {
      router.push("/login");
    }
  }, [router]);

  return { userId, checked };
}
