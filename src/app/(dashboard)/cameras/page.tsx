'use client';

export default function CamerasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Camera Feeds</h1>
        <p className="text-[var(--muted-foreground)]">
          Monitor live video feeds from your assigned areas.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Coming in Phase 5</h2>
        <p className="text-[var(--muted-foreground)] mt-2 max-w-md mx-auto">
          This page will display a grid of camera feeds with live video streams,
          status indicators, and fullscreen viewing capability.
        </p>
      </div>
    </div>
  );
}
