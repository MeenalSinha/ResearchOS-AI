"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import {
  LayoutGrid,
  Users,
  Share2,
  FileText,
  FolderOpen,
  Bot,
  GraduationCap,
  Star,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  Crown,
  Brain,
  Menu,
  ChevronDown
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Professor Discovery", href: "/professors", icon: Users },
  { label: "Research Graph", href: "/graph", icon: Share2 },
  { label: "Applications", href: "/applications", icon: FileText, badge: 12 },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "AI Agents", href: "/agents", icon: Bot },
  { label: "Interview Coach", href: "/interview", icon: GraduationCap },
  { label: "Opportunities", href: "/opportunities", icon: Star, badge: 8 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; full_name: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <aside className="w-[260px] shrink-0 border-r border-ink-100 bg-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shadow-sm">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-ink-900">ResearchOS AI</span>
        </div>
        <Menu size={18} className="text-ink-400 cursor-pointer hover:text-ink-600" />
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-brand-50 text-brand-600 font-semibold"
                  : "text-ink-500 hover:bg-ink-50 hover:text-ink-700 font-medium"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? "text-brand-600" : "text-ink-400"} />
                {item.label}
              </span>
              {item.badge ? (
                <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${active ? 'bg-brand-100 text-brand-600' : 'bg-brand-50 text-brand-500'}`}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4 mt-4">

        <div className="flex items-center justify-between gap-3 px-2 py-2 cursor-pointer hover:bg-ink-50 rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold overflow-hidden shadow-sm border border-ink-100">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.email?.[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900 truncate">{user?.full_name || "User"}</p>
              <p className="text-xs text-ink-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <ChevronDown size={16} className="text-ink-400" />
        </div>
      </div>
    </aside>
  );
}
