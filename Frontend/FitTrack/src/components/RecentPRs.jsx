import { useMemo } from 'react'
import { computePRs } from '../utils/prs'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Dashboard strip of the most recent personal records — the achievement surface
// that makes progress feel earned (Hevy-style). Hidden entirely until the user
// has actually set a PR, so it never shows as an empty shell.
export default function RecentPRs({ sessions = [] }) {
  const prs = useMemo(() => computePRs(sessions).slice(0, 6), [sessions])
  if (prs.length === 0) return null

  return (
    <div className="bg-surface-1 border border-line rounded-[var(--radius-card)] shadow-card p-6 mb-10">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-ink">Recent PRs</h2>
        <span className="text-lg">🏆</span>
      </div>
      <div className="flex flex-col gap-2">
        {prs.map((pr, i) => (
          <div
            key={`${pr.exerciseName}-${pr.date}-${i}`}
            className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink text-sm font-bold">
              PR
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{pr.exerciseName}</p>
              <p className="text-xs text-ink-faint">{fmtDate(pr.date)}</p>
            </div>
            <span className="nums shrink-0 text-lg font-bold text-accent-ink">{pr.weightKg} kg</span>
          </div>
        ))}
      </div>
    </div>
  )
}
