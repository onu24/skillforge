'use client';

import { cn } from '@/lib/utils';

// ─── Base shimmer block ───────────────────────────────────────────────────────
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-[#1e2d42]',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_1.5s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-[#2A3F5F]/60 before:to-transparent',
        className,
      )}
    />
  );
}

// ─── 1. Course Card Skeleton ──────────────────────────────────────────────────
export function CourseCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* thumbnail */}
      <Shimmer className="w-full h-40" />

      {/* body */}
      <div className="p-4 space-y-3">
        {/* title lines */}
        <div className="space-y-2">
          <Shimmer className="h-4 w-4/5" />
          <Shimmer className="h-4 w-3/5" />
        </div>

        {/* instructor */}
        <Shimmer className="h-3 w-2/5" />

        {/* meta row */}
        <div className="flex items-center gap-3">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-16" />
        </div>

        {/* stars */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-4 w-4 rounded-sm" />
          ))}
          <Shimmer className="h-3 w-8 ml-1" />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-5 w-12" />
        </div>
      </div>
    </div>
  );
}

// Grid of N course card skeletons
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── 2. Dashboard Stat Card Skeleton ─────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card/50 p-4 space-y-3">
      <Shimmer className="h-3 w-3/5" />
      <Shimmer className="h-7 w-2/5" />
      <div className="flex items-center justify-between pt-1">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── 3. Dashboard Enrolled Course Row Skeleton ────────────────────────────────
export function EnrolledCourseRowSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card/50 p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Shimmer className="size-12 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-3/5" />
          <Shimmer className="h-3 w-2/5" />
          <div className="flex gap-2 mt-2">
            <Shimmer className="h-5 w-20 rounded-full" />
            <Shimmer className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Shimmer className="h-8 w-20 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-3 w-8" />
        </div>
        <Shimmer className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Shimmer className="h-3 w-28" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>
      <Shimmer className="h-10 w-full rounded-md" />
    </div>
  );
}

// ─── 4. Full Dashboard Page Skeleton ─────────────────────────────────────────
export function DashboardPageSkeleton() {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-b from-background via-background to-secondary/10',
        'animate-in fade-in duration-300',
      )}
    >
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar skeleton */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 space-y-4 lg:block">
          {/* profile card */}
          <div className="rounded-xl border border-border/70 bg-card/50 p-4">
            <div className="flex items-center gap-3">
              <Shimmer className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-3/4" />
                <Shimmer className="h-3 w-1/2" />
                <Shimmer className="h-3 w-1/3" />
              </div>
            </div>
          </div>
          {/* quick stats */}
          <div className="rounded-xl border border-border/70 bg-card/50 p-4 space-y-3">
            <Shimmer className="h-4 w-1/3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center rounded-lg bg-secondary/50 px-3 py-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-3 w-12" />
              </div>
            ))}
          </div>
          {/* nav */}
          <div className="rounded-xl border border-border/70 bg-card/50 p-4 space-y-2">
            <Shimmer className="h-4 w-1/4 mb-2" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* header bar */}
          <div className="rounded-2xl border border-border/70 bg-background/85 px-4 py-3">
            <div className="flex items-center gap-3">
              <Shimmer className="h-8 w-24" />
              <Shimmer className="h-9 flex-1 max-w-xs rounded-md" />
              <div className="ml-auto flex gap-2">
                <Shimmer className="h-9 w-9 rounded-md" />
                <Shimmer className="h-9 w-9 rounded-md" />
                <Shimmer className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </div>

          {/* welcome */}
          <div className="rounded-2xl border border-border/70 bg-card/50 p-5 sm:p-6 space-y-3">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-8 w-72" />
            <Shimmer className="h-3 w-48" />
            <div className="flex gap-2 pt-1">
              <Shimmer className="h-9 w-36 rounded-md" />
              <Shimmer className="h-9 w-40 rounded-md" />
              <Shimmer className="h-9 w-32 rounded-md" />
            </div>
          </div>

          {/* stats grid */}
          <StatsGridSkeleton />

          {/* continue learning */}
          <div className="space-y-3">
            <Shimmer className="h-6 w-48" />
            {Array.from({ length: 3 }).map((_, i) => (
              <EnrolledCourseRowSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── 5. Filter / Course-Grid Spinner ─────────────────────────────────────────
export function FilterSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-3', className)}>
      <svg
        className="animate-spin h-8 w-8 text-cyan-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm text-cyan-400/80 animate-pulse">Filtering courses…</p>
    </div>
  );
}
