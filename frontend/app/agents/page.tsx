import {
  UserSearch, Telescope, BookOpen, Target, FileEdit, PenLine, Mail,
  Kanban, Bell, GraduationCap, Radar, Brain,
} from "lucide-react";

const AGENTS = [
  { icon: UserSearch, name: "Profile Intelligence Agent", desc: "Parses resume, transcript, and projects into a structured academic profile." },
  { icon: Telescope, name: "Professor Discovery Agent", desc: "Searches university and lab pages to find matching professors." },
  { icon: BookOpen, name: "Paper Intelligence Agent", desc: "Reads recent publications and summarizes lab focus and open problems." },
  { icon: Target, name: "Compatibility Scoring Agent", desc: "Matches student profile against professor focus to produce a match score." },
  { icon: FileEdit, name: "Resume Optimizer Agent", desc: "Tailors resume content and keywords for each application." },
  { icon: PenLine, name: "SOP Generator Agent", desc: "Writes personalized statement of purpose sections." },
  { icon: Mail, name: "Cold Email Agent", desc: "Drafts professional outreach emails referencing recent work." },
  { icon: Kanban, name: "Application Tracking Agent", desc: "Tracks pipeline status from draft through accepted or rejected." },
  { icon: Bell, name: "Follow-up Agent", desc: "Recommends follow-up timing and drafts reminder emails." },
  { icon: GraduationCap, name: "Interview Coach Agent", desc: "Generates lab, paper, technical, and HR interview questions." },
  { icon: Radar, name: "Opportunity Watch Agent", desc: "Monitors sources for new internships, fellowships, and openings." },
  { icon: Brain, name: "Career Strategy Agent", desc: "Prioritizes applications and recommends where to invest effort first." },
];

export default function AgentsPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">AI Agents</h1>
        <p className="text-sm text-ink-500 mt-1">
          Twelve specialized agents collaborate continuously to run your research career.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map((agent) => (
          <div key={agent.name} className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
              <agent.icon size={18} className="text-brand-600" />
            </div>
            <p className="text-sm font-semibold text-ink-900 mb-1">{agent.name}</p>
            <p className="text-xs text-ink-500 leading-relaxed">{agent.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
