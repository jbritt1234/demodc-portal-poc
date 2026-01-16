'use client';

export default function AccessLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Access Logs</h1>
        <p className="text-[var(--muted-foreground)]">
          View access events for your assigned cages and racks.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Coming in Phase 5</h2>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-md mx-auto">
          This page will display a filterable, paginated table of access logs with date range filters,
          asset filters, and export functionality.
        </p>
      </div>
    </div>
  );
}
