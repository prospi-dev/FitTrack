import { useMemo, useState } from 'react'

// Progress-over-time chart for a single exercise.
// Given the user's workout sessions, it plots one metric per session date:
//   • "Top set"  — the heaviest weight logged for that exercise in the session
//   • "Volume"   — total weight moved (Σ weight × reps) for that exercise
// Single series → no legend; the title + selector name what's shown.
// Hand-rolled inline SVG so it stays dependency-free and matches the lean stack.

const VB_W = 640
const VB_H = 260
const PAD = { top: 16, right: 18, bottom: 30, left: 46 }

// Accent (app blue-400) for the line; recessive grays for grid/axis/ink.
const LINE = '#60a5fa'
const AREA = 'rgba(96, 165, 250, 0.12)'
const GRID = '#1f2937' // gray-800
const AXIS_INK = '#6b7280' // gray-500
const LABEL_INK = '#9ca3af' // gray-400

const METRICS = {
  weight: { label: 'Top set', unit: 'kg' },
  volume: { label: 'Volume', unit: 'kg' },
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

// Build { exercises: [names], series: { [name]: [{ date, weight, volume }] } }
// from the raw sessions payload, sorted oldest→newest per exercise.
function buildSeries(sessions) {
  const byExercise = new Map()

  const ordered = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date))

  for (const session of ordered) {
    // Collapse a session's sets of the same exercise into one data point.
    const perExercise = new Map()
    for (const set of session.exercises ?? []) {
      const w = set.weightKg ?? 0
      const reps = set.repsCompleted ?? 0
      const acc = perExercise.get(set.exerciseName) ?? { top: 0, volume: 0 }
      acc.top = Math.max(acc.top, w)
      acc.volume += w * reps
      perExercise.set(set.exerciseName, acc)
    }
    for (const [name, acc] of perExercise) {
      if (!byExercise.has(name)) byExercise.set(name, [])
      byExercise.get(name).push({ date: session.date, weight: acc.top, volume: acc.volume })
    }
  }

  // Order exercises by how many data points they have (most-tracked first).
  const exercises = [...byExercise.keys()].sort(
    (a, b) => byExercise.get(b).length - byExercise.get(a).length
  )
  return { exercises, series: Object.fromEntries(byExercise) }
}

// Nice-ish rounded axis bounds so gridlines land on readable numbers.
function niceBounds(values) {
  const max = Math.max(...values)
  if (max <= 0) return { min: 0, max: 10, ticks: [0, 5, 10] }
  const step = Math.pow(10, Math.floor(Math.log10(max)))
  const niceMax = Math.ceil(max / (step / 2)) * (step / 2)
  const ticks = [0, niceMax / 2, niceMax]
  return { min: 0, max: niceMax, ticks }
}

export default function ProgressChart({ sessions = [] }) {
  const { exercises, series } = useMemo(() => buildSeries(sessions), [sessions])
  const [exercise, setExercise] = useState(null)
  const [metric, setMetric] = useState('weight')

  // Default to the most-tracked exercise once data is available.
  const selected = exercise && series[exercise] ? exercise : exercises[0] ?? null
  const points = selected ? series[selected] : []

  if (exercises.length === 0) {
    return (
      <Frame>
        <EmptyState
          title="No progress to chart yet"
          body="Log a workout with weights and your strength progress will show up here."
        />
      </Frame>
    )
  }

  const values = points.map((p) => p[metric])
  const { min, max, ticks } = niceBounds(values.length ? values : [0])
  const plotW = VB_W - PAD.left - PAD.right
  const plotH = VB_H - PAD.top - PAD.bottom

  const x = (i) =>
    points.length <= 1
      ? PAD.left + plotW / 2
      : PAD.left + (i * plotW) / (points.length - 1)
  const y = (v) => PAD.top + (1 - (v - min) / (max - min || 1)) * plotH

  const coords = points.map((p, i) => ({ ...p, cx: x(i), cy: y(p[metric]) }))
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.cx} ${c.cy}`).join(' ')
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].cx} ${PAD.top + plotH} L ${coords[0].cx} ${PAD.top + plotH} Z`
      : ''

  // X labels: first / middle / last only, to avoid crowding.
  const labelIdx = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])
  const unit = METRICS[metric].unit
  const enough = points.length >= 2

  return (
    <Frame>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Progress</h2>
          <p className="text-gray-400 text-sm">{METRICS[metric].label} per session</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-700 overflow-hidden text-sm">
            {Object.entries(METRICS).map(([key, m]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                aria-pressed={metric === key}
                className={`px-3 py-1.5 transition ${
                  metric === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <select
            value={selected ?? ''}
            onChange={(e) => setExercise(e.target.value)}
            aria-label="Choose exercise to chart"
            className="bg-gray-800 border border-gray-700 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            {exercises.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {enough ? (
        <ChartBody
          coords={coords}
          linePath={linePath}
          areaPath={areaPath}
          ticks={ticks}
          y={y}
          labelIdx={labelIdx}
          unit={unit}
          metricLabel={METRICS[metric].label}
          exercise={selected}
        />
      ) : (
        <EmptyState
          title="Not enough data yet"
          body={`Log at least 2 sessions with "${selected}" to see a trend.`}
        />
      )}
    </Frame>
  )
}

function ChartBody({ coords, linePath, areaPath, ticks, y, labelIdx, unit, metricLabel, exercise }) {
  const [hover, setHover] = useState(null)
  const firstVal = Math.round(valueAt(coords[0], metricLabel))
  const lastVal = Math.round(valueAt(coords[coords.length - 1], metricLabel))

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${metricLabel} for ${exercise} over ${coords.length} sessions: from ${firstVal} to ${lastVal} ${unit}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gridlines + y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={VB_W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke={GRID}
              strokeWidth="1"
            />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_INK}>
              {Math.round(t)}
            </text>
          </g>
        ))}

        {/* Area + line */}
        {areaPath && <path d={areaPath} fill={AREA} />}
        <path d={linePath} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* X labels */}
        {coords.map((c, i) =>
          labelIdx.has(i) ? (
            <text key={i} x={c.cx} y={VB_H - 10} textAnchor="middle" fontSize="11" fill={LABEL_INK}>
              {fmtDate(c.date)}
            </text>
          ) : null
        )}

        {/* Points + hit targets */}
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.cx} cy={c.cy} r="3.5" fill={LINE} stroke="#0b1220" strokeWidth="1.5" />
            <circle
              cx={c.cx}
              cy={c.cy}
              r="14"
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            />
          </g>
        ))}
      </svg>

      {/* Tooltip — positioned by fractional coords so it tracks the scaled SVG */}
      {hover !== null && (
        <div
          className="absolute pointer-events-none bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-lg -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{
            left: `${(coords[hover].cx / VB_W) * 100}%`,
            top: `${(coords[hover].cy / VB_H) * 100}%`,
            marginTop: '-8px',
          }}
        >
          <div className="text-gray-400">{fmtDate(coords[hover].date)}</div>
          <div className="text-white font-semibold">
            {Math.round(valueAt(coords[hover], metricLabel))} {unit}
          </div>
        </div>
      )}
    </div>
  )
}

// The coords carry both `weight` and `volume`; the tooltip needs the active one.
// metricLabel is "Top set" (weight) or "Volume".
function valueAt(coord, metricLabel) {
  return metricLabel === 'Volume' ? coord.volume : coord.weight
}

function Frame({ children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10">{children}</div>
  )
}

function EmptyState({ title, body }) {
  return (
    <div className="text-center py-10">
      <p className="text-3xl mb-3">📈</p>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm max-w-sm mx-auto">{body}</p>
    </div>
  )
}
