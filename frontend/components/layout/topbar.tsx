"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import { clearAuthToken, getCurrentUserId, getCurrentUser } from "@/lib/auth";

export function Topbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<{ avatar_url?: string, email?: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserId(getCurrentUserId());
    setUser(getCurrentUser() as any);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-[72px] border-b border-ink-100 bg-white flex items-center justify-between px-8 shrink-0">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-[360px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search"
            placeholder="Search anything..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-ink-100 bg-white text-sm text-ink-700 placeholder:text-ink-300 outline-none focus:ring-2 focus:ring-brand-200 shadow-sm"
          />
        </div>

        <button aria-label="Notifications" className="relative w-10 h-10 rounded-full border border-ink-100 bg-white flex items-center justify-center hover:bg-ink-50 transition-colors shadow-sm">
          <Bell size={18} className="text-ink-600" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-brand-600 border border-white" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            aria-label="Account menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold overflow-hidden shadow-sm border border-ink-100">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.email?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-ink-100 rounded-xl shadow-card overflow-hidden z-10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
              >
                <LogOut size={16} className="text-ink-400" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
