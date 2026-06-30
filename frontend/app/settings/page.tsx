"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCurrentUserId, clearAuthToken } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getCurrentUserId());
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">Settings</h1>
      </div>

      <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5 mb-4">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Account</h3>
        {userId ? (
          <>
            <p className="text-sm text-ink-700 mb-1">Signed in</p>
            <p className="text-xs text-ink-400 mb-4">User ID: {userId}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </>
        ) : (
          <p className="text-sm text-ink-500">
            You are not signed in. <a href="/login" className="text-brand-600 font-medium">Sign in</a>
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
        <h3 className="text-sm font-semibold text-ink-900 mb-3">Connected providers</h3>
        <p className="text-sm text-ink-500">
          Google and GitHub sign-in are not yet implemented on the backend (the routes exist as 501 stubs). Email/password
          authentication above is fully functional.
        </p>
      </div>
    </div>
  );
}
