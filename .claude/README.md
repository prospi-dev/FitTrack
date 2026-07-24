# .claude — Project AI config

Shared Claude Code configuration for FitTrack. Checked into git so the whole
team gets the same agents and skills.

## agents/
Specialized subagent definitions (one `.md` each). Grouped by prefix:
- `engineering-*` — backend, frontend, database, devops, security, architecture, code review
- `design-*` — UI, UX, brand, visual, whimsy
- `security-*` — AI-generated code auditing
- `product-manager`, `project-manager-senior`, `agents-orchestrator`, `agentic-identity-trust`, `testing-test-automation-engineer`

## skills/
Reusable task instructions, tuned to the stack:
- `modern-csharp-coding-standards` — C# 12+ idioms for the ASP.NET Core backend
- `csharp-concurrency-patterns` — async/await, Channels, Akka.NET guidance
- `code-testing-agent` — unit test generation

## Local state (git-ignored)
`settings.local.json`, `scratchpad/`, `memory/`, `projects/`, `todos/` stay
local — see the root `.gitignore`.
