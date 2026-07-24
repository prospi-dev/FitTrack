// Personal-record detection from workout history.
// A "PR" is a set that beats the previous all-time best weight for that exercise.
// The first time an exercise is ever logged sets a baseline — it is not counted
// as a PR (there's nothing to beat yet), so PRs read as genuine progress.

// Highest weight logged per exercise across a set of sessions.
function bestByExercise(sessions) {
  const best = {}
  for (const s of sessions) {
    for (const e of s.exercises ?? []) {
      const w = e.weightKg ?? 0
      if (w <= 0) continue
      if (!(e.exerciseName in best) || w > best[e.exerciseName]) best[e.exerciseName] = w
    }
  }
  return best
}

// Top weight per exercise within a single session.
function topInSession(session) {
  const top = {}
  for (const e of session.exercises ?? []) {
    const w = e.weightKg ?? 0
    if (w <= 0) continue
    if (!(e.exerciseName in top) || w > top[e.exerciseName]) top[e.exerciseName] = w
  }
  return top
}

// Every PR event in history, most recent first: { exerciseName, weightKg, date }.
export function computePRs(sessions) {
  const ordered = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date))
  const best = {}
  const prs = []
  for (const s of ordered) {
    for (const [name, w] of Object.entries(topInSession(s))) {
      if (name in best && w > best[name]) prs.push({ exerciseName: name, weightKg: w, date: s.date })
      if (!(name in best) || w > best[name]) best[name] = w
    }
  }
  return prs.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// PRs set by a freshly logged session versus prior history:
// [{ exerciseName, weightKg }]. Used to celebrate on save.
export function detectNewPRs(priorSessions, newSession) {
  const best = bestByExercise(priorSessions)
  const prs = []
  for (const [name, w] of Object.entries(topInSession(newSession))) {
    if (name in best && w > best[name]) prs.push({ exerciseName: name, weightKg: w })
  }
  return prs
}
