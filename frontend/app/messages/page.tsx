"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2, Search, Filter, Archive, Star, Clock, Mail, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { format, formatDistanceToNow } from "date-fns";

interface EmailMessage {
  id: string;
  application_id: string | null;
  professor_id: string | null;
  professor_name: string;
  professor_image: string | null;
  direction: "inbound" | "outbound";
  subject: string;
  body_text: string;
  is_read: boolean;
  timestamp: string | null;
}

export default function MessagesPage() {
  const { checked } = useRequireAuth();
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState<EmailMessage | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<EmailMessage[]>("/messages")
      .then((data) => {
        if (!cancelled) {
          setMessages(data || []);
          if (data && data.length > 0) setActiveMessage(data[0]);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (!checked) return null;

  return (
    <div className="max-w-[1500px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Messages
        </h1>
        <p className="text-slate-500 mt-1">Track emails and follow-ups with professors.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
          <div className="text-center max-w-sm">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Your inbox is empty</h3>
            <p className="text-slate-500 mt-2 text-sm">When the AI agent drafts follow-up emails or when professors reply, they will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
          {/* Left Pane: Inbox List */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setActiveMessage(msg)}
                  className={`w-full text-left p-4 border-b border-slate-100 hover:bg-white transition-colors relative ${activeMessage?.id === msg.id ? "bg-white border-l-2 border-l-indigo-600 shadow-[inset_0_0_10px_rgba(0,0,0,0.02)]" : ""}`}
                >
                  {!msg.is_read && msg.direction === "inbound" && (
                    <span className="absolute top-4 left-2 w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                  <div className="flex justify-between items-start mb-1 pl-2">
                    <h4 className={`font-medium truncate ${!msg.is_read && msg.direction === "inbound" ? "text-slate-900 font-semibold" : "text-slate-700"}`}>
                      {msg.professor_name}
                    </h4>
                    {msg.timestamp && (
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {format(new Date(msg.timestamp), "MMM d")}
                      </span>
                    )}
                  </div>
                  <div className="pl-2">
                    <p className={`text-sm truncate mb-1 ${!msg.is_read && msg.direction === "inbound" ? "text-slate-800 font-medium" : "text-slate-900"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {msg.direction === "outbound" ? (
                        <span className="inline-flex items-center gap-1 text-slate-400 mr-1">
                          <CheckCircle2 className="w-3 h-3" /> You:
                        </span>
                      ) : null}
                      {msg.body_text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Pane: Message Viewer */}
          <div className="flex-1 flex flex-col bg-white">
            {activeMessage ? (
              <>
                {/* Message Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">{activeMessage.subject}</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {activeMessage.professor_image ? (
                          <img src={activeMessage.professor_image} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          activeMessage.professor_name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {activeMessage.direction === "inbound" ? activeMessage.professor_name : "You"}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          to {activeMessage.direction === "inbound" ? "You" : activeMessage.professor_name}
                          <span className="mx-1">•</span>
                          {activeMessage.timestamp && formatDistanceToNow(new Date(activeMessage.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-yellow-500 hover:bg-slate-50 rounded-lg transition-colors">
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed text-sm text-slate-700 whitespace-pre-wrap">
                    {activeMessage.body_text}
                  </div>
                </div>

                {/* Reply Box Stub */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <textarea 
                      placeholder="Draft a reply... (AI Follow-up Agent will assist you)" 
                      className="w-full p-3 resize-none focus:outline-none text-sm text-slate-700 min-h-[100px]"
                    />
                    <div className="flex justify-between items-center p-3 bg-slate-50/50 border-t border-slate-100">
                      <button className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded hover:bg-indigo-100 transition-colors">
                        Generate with AI
                      </button>
                      <button className="text-sm font-medium text-white bg-slate-900 px-4 py-1.5 rounded hover:bg-slate-800 transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
