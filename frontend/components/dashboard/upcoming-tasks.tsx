import { MoreHorizontal, Mail, FileText, Calendar } from "lucide-react";

const ICONS: Record<string, any> = { mail: Mail, file: FileText, calendar: Calendar };

interface Task {
  icon: keyof typeof ICONS;
  title: string;
  due: string;
}

interface UpcomingTasksProps {
  tasks: Task[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-ink-900">Upcoming Tasks</h3>
        <MoreHorizontal size={20} className="text-ink-400 cursor-pointer" />
      </div>
      <div className="space-y-4 mb-6">
        {tasks.map((task, i) => {
          const Icon = ICONS[task.icon];
          return (
            <div key={i} className="flex items-start gap-4 hover:bg-ink-50 p-2 -mx-2 rounded-lg transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-ink-50 border border-ink-100 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-ink-600" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between mt-0.5">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{task.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{task.due}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
      <a href="/calendar" className="block text-sm text-brand-600 font-semibold">
        View All Tasks &rarr;
      </a>
    </div>
  );
}
