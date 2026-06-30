export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-ink-100 rounded-md ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl2 border border-ink-100 shadow-card p-5 flex-1 min-w-[170px]">
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}
