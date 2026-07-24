import { useMemo } from 'react'

// Front/back body map that shades each muscle region by how many sets have
// targeted it — the "what have I actually trained?" view that JEFIT/Fitbod/Strava
// popularised. Volume comes straight from the sessions payload (each logged set
// carries its exercise's muscle groups), so no new data is needed.
// The figure is a stylised, dependency-free hand-built SVG.

const BASE = '#242835' // untrained muscle (neutral slate)
const RAMP = ['rgba(109,123,255,0.34)', 'rgba(109,123,255,0.60)', '#6d7bff']
const NEUTRAL = '#1a1d27' // head / connective, never data-bearing

// Region definitions: each has the muscle group(s) it represents and the SVG
// shapes that draw it. Kept as data (not inline JSX components) so the render
// stays a simple map.
const FRONT = [
  { name: 'Shoulders', muscles: ['Shoulder', 'FrontDelts', 'SideDelts'], shapes: [
    { t: 'ellipse', cx: 40, cy: 45, rx: 10, ry: 8 }, { t: 'ellipse', cx: 80, cy: 45, rx: 10, ry: 8 } ] },
  { name: 'Chest', muscles: ['Chest'], shapes: [
    { t: 'ellipse', cx: 51, cy: 55, rx: 9, ry: 7 }, { t: 'ellipse', cx: 69, cy: 55, rx: 9, ry: 7 } ] },
  { name: 'Biceps', muscles: ['Biceps'], shapes: [
    { t: 'ellipse', cx: 33, cy: 66, rx: 6, ry: 13 }, { t: 'ellipse', cx: 87, cy: 66, rx: 6, ry: 13 } ] },
  { name: 'Forearms', muscles: ['Forearms'], shapes: [
    { t: 'ellipse', cx: 29, cy: 90, rx: 5.5, ry: 14 }, { t: 'ellipse', cx: 91, cy: 90, rx: 5.5, ry: 14 } ] },
  { name: 'Abs', muscles: ['Abs'], shapes: [{ t: 'rect', x: 53, y: 65, w: 14, h: 27, rx: 4 }] },
  { name: 'Obliques', muscles: ['Obliques'], shapes: [
    { t: 'ellipse', cx: 47, cy: 78, rx: 4, ry: 12 }, { t: 'ellipse', cx: 73, cy: 78, rx: 4, ry: 12 } ] },
  { name: 'Quads', muscles: ['Quads'], shapes: [
    { t: 'ellipse', cx: 52, cy: 135, rx: 9, ry: 30 }, { t: 'ellipse', cx: 68, cy: 135, rx: 9, ry: 30 } ] },
  { name: 'Calves', muscles: ['Calves'], shapes: [
    { t: 'ellipse', cx: 52, cy: 198, rx: 6, ry: 22 }, { t: 'ellipse', cx: 68, cy: 198, rx: 6, ry: 22 } ] },
]

const BACK = [
  { name: 'Rear delts', muscles: ['RearDelts', 'Shoulder'], shapes: [
    { t: 'ellipse', cx: 40, cy: 45, rx: 10, ry: 8 }, { t: 'ellipse', cx: 80, cy: 45, rx: 10, ry: 8 } ] },
  { name: 'Upper back', muscles: ['Back'], shapes: [{ t: 'path', d: 'M50 48 H70 L66 66 H54 Z' }] },
  { name: 'Lats', muscles: ['Lats'], shapes: [
    { t: 'path', d: 'M48 60 Q44 78 52 90 L58 66 Z' }, { t: 'path', d: 'M72 60 Q76 78 68 90 L62 66 Z' } ] },
  { name: 'Triceps', muscles: ['Triceps'], shapes: [
    { t: 'ellipse', cx: 33, cy: 66, rx: 6, ry: 13 }, { t: 'ellipse', cx: 87, cy: 66, rx: 6, ry: 13 } ] },
  { name: 'Forearms', muscles: ['Forearms'], shapes: [
    { t: 'ellipse', cx: 29, cy: 90, rx: 5.5, ry: 14 }, { t: 'ellipse', cx: 91, cy: 90, rx: 5.5, ry: 14 } ] },
  { name: 'Lower back', muscles: ['LowerBack'], shapes: [{ t: 'rect', x: 54, y: 90, w: 12, h: 12, rx: 3 }] },
  { name: 'Glutes', muscles: ['Glutes'], shapes: [
    { t: 'ellipse', cx: 52, cy: 114, rx: 9, ry: 11 }, { t: 'ellipse', cx: 68, cy: 114, rx: 9, ry: 11 } ] },
  { name: 'Hamstrings', muscles: ['Hamstrings'], shapes: [
    { t: 'ellipse', cx: 52, cy: 152, rx: 9, ry: 26 }, { t: 'ellipse', cx: 68, cy: 152, rx: 9, ry: 26 } ] },
  { name: 'Calves', muscles: ['Calves'], shapes: [
    { t: 'ellipse', cx: 52, cy: 200, rx: 6, ry: 22 }, { t: 'ellipse', cx: 68, cy: 200, rx: 6, ry: 22 } ] },
]

function Shape({ s }) {
  if (s.t === 'ellipse') return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />
  if (s.t === 'rect') return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />
  return <path d={s.d} />
}

function Region({ region, color, label }) {
  return (
    <g fill={color}>
      <title>{label}</title>
      {region.shapes.map((s, i) => <Shape key={i} s={s} />)}
    </g>
  )
}

function aggregate(sessions) {
  const sets = {}
  for (const s of sessions) {
    for (const e of s.exercises ?? []) {
      const groups = (e.muscleGroup || '').split(',').map((g) => g.trim()).filter(Boolean)
      for (const g of groups) sets[g] = (sets[g] || 0) + 1
    }
  }
  const max = Math.max(1, ...Object.values(sets))
  return { sets, max }
}

export default function MuscleMap({ sessions = [] }) {
  const { sets, max } = useMemo(() => aggregate(sessions), [sessions])

  const colorFor = (muscles) => {
    const t = Math.max(0, ...muscles.map((m) => (sets[m] || 0) / max))
    if (t <= 0) return BASE
    return t <= 0.34 ? RAMP[0] : t <= 0.67 ? RAMP[1] : RAMP[2]
  }
  const labelFor = (name, muscles) =>
    `${name} — ${muscles.reduce((n, m) => n + (sets[m] || 0), 0)} sets`

  const trained = Object.keys(sets).length

  return (
    <div className="bg-surface-1 border border-line rounded-[var(--radius-card)] shadow-card p-6 mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Muscles trained</h2>
          <p className="text-ink-muted text-sm">Set volume by muscle group, all time</p>
        </div>
        <span className="text-ink-muted text-sm">{trained} groups hit</span>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 300 280" className="w-full max-w-md h-auto" role="img"
          aria-label={`Body map: ${trained} muscle groups trained`}>
          <g transform="translate(20,8)">
            <circle cx="60" cy="18" r="13" fill={NEUTRAL} />
            <rect x="54" y="30" width="12" height="7" rx="3" fill={NEUTRAL} />
            <rect x="49" y="93" width="22" height="9" rx="4" fill={NEUTRAL} />
            {FRONT.map((r) => (
              <Region key={r.name} region={r} color={colorFor(r.muscles)} label={labelFor(r.name, r.muscles)} />
            ))}
            <text x="60" y="250" textAnchor="middle" fontSize="9" fill="#868ca1">Front</text>
          </g>

          <g transform="translate(180,8)">
            <circle cx="60" cy="18" r="13" fill={NEUTRAL} />
            <rect x="54" y="30" width="12" height="7" rx="3" fill={NEUTRAL} />
            {BACK.map((r) => (
              <Region key={r.name} region={r} color={colorFor(r.muscles)} label={labelFor(r.name, r.muscles)} />
            ))}
            <text x="60" y="250" textAnchor="middle" fontSize="9" fill="#868ca1">Back</text>
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-ink-faint">
        <span>Less</span>
        <div className="w-[11px] h-[11px] rounded-[3px]" style={{ backgroundColor: BASE }} />
        {RAMP.map((c, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-[3px]" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
