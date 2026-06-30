"use client";

import { Bot, Telescope, FileText, Target, Mail, Bell } from "lucide-react";
import { useAgentFeed } from "@/hooks/use-agent-feed";

interface LiveAgentFeedProps {
  userId: string | null;
}

export function LiveAgentFeed({ userId }: LiveAgentFeedProps) {
  const { events, connected } = useAgentFeed(userId);

  // Use dummy events if empty just for visual match with mockup
  const displayEvents = events.length > 0 ? events : [
    { agent_name: "Professor Discovery Agent", status: "Scanning", message: "Finding relevant professors for Computer Vision", icon: Telescope },
    { agent_name: "Paper Intelligence Agent", status: "Reading", message: "Analyzing 12 new papers from Prof. Li's lab", icon: FileText },
    { agent_name: "Compatibility Agent", status: "Processing", message: "Matching your profile with 23 professors", icon: Target },
    { agent_name: "Email Drafting Agent", status: "Drafting", message: "Creating personalized emails (5 in queue)", icon: Mail },
    { agent_name: "Follow-up Agent", status: "Scheduled", message: "2 follow-ups scheduled for tomorrow", icon: Bell },
  ];

  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-6 flex flex-col lg:flex-row gap-8">
      <div className="flex-1 lg:max-w-[55%]">
        <div className="flex items-center gap-2 mb-6">
          <Bot size={20} className="text-brand-600" />
          <h3 className="text-lg font-bold text-ink-900">AI Agents at Work</h3>
        </div>

        <div className="space-y-4">
          {displayEvents.map((event: any, i) => {
            const Icon = event.icon || Bot;
            return (
              <div key={i} className="flex items-center gap-4 py-1">
                <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center border border-ink-100 shrink-0">
                  <Icon size={18} className="text-ink-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink-900 text-sm">{event.agent_name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{event.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                  <span className="text-xs font-semibold text-ink-500">{event.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="bg-ink-900 text-white rounded-lg px-4 py-2 mt-6 text-sm font-semibold hover:bg-ink-800 transition-colors">
          View All Agents
        </button>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center -my-2 -mr-2">
        <img src="/images/ai_agents_illustration.png" alt="AI Agents at work" className="w-full h-full object-contain object-right" />
      </div>
    </div>
  );
}
