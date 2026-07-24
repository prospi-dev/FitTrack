import { useMemo } from 'react'

// GitHub / Hevy-style training calendar: a grid of the last ~17 weeks where each
// cell is a day shaded by how many sessions were logged, plus a current
// week-streak counter. Turns a sparse sessions list into a dense, motivating
// surface — and fills the dashboard's dead vertical space. Dependency-free.

const WEEKS = 17
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Iris accent ramped by session count; empty days sit on surface-2.
const LEVELS = ['#1c1f29', 'rgba(109,123,255,0.35)', 'rgba(109,123,255,0.62)', '#6d7bff']
const levelOf = (n) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3)

const ymd = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`
}
const startOfWeek = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - x.getDay()) // back to Sunday
  return x
}

function build(sessions) {
  const counts = new Map()
  for (const s of sessions) {
    const k = ymd(new Date(s.date))
    counts.set(k, (counts.get(k) || 0) + 1)
  }

  // Build a WEEKS-wide grid ending on the current week (columns = weeks,
  // 7 rows Sun→Sat), aligned so the last column contains today.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = startOfWeek(today)
  start.setDate(start.getDate() - (WEEKS - 1) * 7)

  const weeks = []
  for (let w = 0; w < WEEKS; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      const future = date > today
      days.push({ date, count: future ? -1 : counts.get(ymd(date)) || 0, future })
    }
    weeks.push(days)
  }

  // Current streak = consecutive weeks (ending this week) with ≥1 session.
  const weeksWith = new Set([...sessions].map((s) => ymd(startOfWeek(new Date(s.date)))))
  let streak = 0
  const cursor = startOfWeek(today)
  while (weeksWith.has(ymd(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 7)
  }

  const activeDays = [...counts.keys()].length
  return { weeks, streak, activeDays }
}

export default function ActivityHeatmap({ sessions = [] }) {
  const { weeks, streak, activeDays } = useMemo(() => build(sessions), [sessions])

  // Month labels: mark a column when its first day flips to a new month, but
  // keep at least 3 columns between labels so short partial months at the edges
  // don't render overlapping text.
  const monthLabels = []
  let lastLabel = -3
  for (let i = 0; i < weeks.length; i++) {
    const m = weeks[i][0].date.getMonth()
    const prev = i > 0 ? weeks[i - 1][0].date.getMonth() : -1
    if (m !== prev && i - lastLabel >= 3) {
      lastLabel = i
      monthLabels.push(MONTHS[m])
    } else {
      monthLabels.push('')
    }
  }

  return (
    <div className="bg-surface-1 border border-line rounded-[var(--radius-card)] shadow-card p-6 mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Activity</h2>
          <p className="text-ink-muted text-sm">{activeDays} training days logged</p>
        </div>
        <div className="flex items-baseline gap-1.5 rounded-lg bg-accent-soft px-3 py-1.5">
          <span className="nums text-xl font-bold text-accent-ink">{streak}</span>
          <span className="text-sm text-ink-muted">week streak</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 ml-0 text-[10px] text-ink-faint">
            {monthLabels.map((label, i) => (
              <div key={i} className="w-[13px]">{label}</div>
            ))}
          </div>
          {/* Week columns */}
          <div className="flex gap-[3px]">
            {weeks.map((wk, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {wk.map((day, j) =>
                  day.future ? (
                    <div key={j} className="w-[13px] h-[13px]" />
                  ) : (
                    <div
                      key={j}
                      className="w-[13px] h-[13px] rounded-[3px]"
                      style={{ backgroundColor: LEVELS[levelOf(day.count)] }}
                      title={`${day.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — ${day.count} session${day.count === 1 ? '' : 's'}`}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-ink-faint">
        <span>Less</span>
        {LEVELS.map((c, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-[3px]" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
