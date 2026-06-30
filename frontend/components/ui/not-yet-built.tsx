import { LucideIcon } from "lucide-react";

interface NotYetBuiltProps {
  icon: LucideIcon;
  title: string;
  description: string;
  whatExists?: string;
}

/**
 * Used for sections of the product that are not yet real. Per the project's
 * own standard ("if something cannot be implemented properly, remove it
 * instead of pretending it exists"), this renders an honest, clearly
 * labeled "not yet built" state rather than fake charts or static demo
 * content dressed up as live data. This is preferable to both a 404 and a
 * fake dashboard - it never claims something works that doesn't.
 */
export function NotYetBuilt({ icon: Icon, title, description, whatExists }: NotYetBuiltProps) {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
      </div>
      <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-10 text-center max-w-[560px] mx-auto">
        <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center mx-auto mb-4">
          <Icon size={20} className="text-ink-400" />
        </div>
        <p className="text-sm font-medium text-ink-900 mb-2">Not yet built</p>
        <p className="text-sm text-ink-500 mb-3">{description}</p>
        {whatExists && (
          <p className="text-xs text-ink-400 bg-ink-50 rounded-lg px-4 py-3 mt-4">{whatExists}</p>
        )}
      </div>
    </div>
  );
}
