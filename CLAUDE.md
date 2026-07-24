# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What FitTrack is

Full-stack training-management app: users create workout routines, log training
sessions, track strength progress. **Personal portfolio / learning project**, not
a production product. Live demo: frontend on Netlify, backend on Render (free
tier — first request after idle can take ~1 min to wake).

## Stack

- **Backend** — ASP.NET Core 9 Web API, EF Core (Code-First), PostgreSQL (Npgsql),
  JWT auth, BCrypt, FluentValidation. Lives in `Backend/FitTrack/`.
- **Frontend** — React 19 + Vite, React Router v7, Tailwind CSS v4, Axios,
  EmailJS. Vitest + React Testing Library for tests. Lives in `Frontend/FitTrack/`.
- **Infra** — Docker (local Postgres), Render (backend), Netlify (frontend).

## Layout

```
Backend/FitTrack/
  Controllers/   Auth, Exercises, ExerciseRequests, Routines, WorkoutSessions, Profile
  Services/      JwtService
  DTOs/          request/response contracts (Auth, Exercises, Routines, WorkoutSessions)
  Validators/    FluentValidation AbstractValidator<T> rules
  Models/        EF entities: User, Exercise, MuscleGroup, ExerciseRequest,
                 Routine, RoutineExercise, WorkoutSession, SessionExercise
  Data/          AppDbContext
  Migrations/    EF Core migrations
  Program.cs     DI, CORS, JWT, auto-migrate + admin seed on startup
Frontend/FitTrack/src/
  api/           one module per resource + axiosInstance + errorMessage helper
  context/       AuthContext (JWT/session state)
  pages/public/  Landing, Login, Register, About, Privacy, Terms, NotFound
  pages/private/ Dashboard, Routines, WorkoutSessions, Exercises, ExerciseRequests,
                 AdminRequests, Profile
  components/ hooks/ constants/ test/
```

## Commands

Backend (from `Backend/FitTrack/`):
- Run: `dotnet run` — `http` profile → `http://localhost:5111`, `https` → `7239`
- Migrations: `dotnet ef migrations add <Name>` then `dotnet ef database update`
  (migrations also auto-apply on startup via `Program.cs`)

Frontend (from `Frontend/FitTrack/`):
- Dev: `npm run dev` → `http://localhost:5173`
- Test: `npm run test` (vitest run) / `npm run test:watch`
- Lint: `npm run lint` (eslint)
- Build: `npm run build`

## Conventions

- Backend flow: **Controller → Validator (FluentValidation) → Service/DbContext →
  DTO**. Never expose EF entities directly; map to/from DTOs.
- Validation is automatic — register an `AbstractValidator<T>`; invalid requests
  short-circuit with RFC7807 `ValidationProblemDetails` (400). Global exception
  handler returns ProblemDetails too.
- Enums serialize as **strings** (`JsonStringEnumConverter`) — keep frontend
  values in sync with enum names, not ints.
- Frontend API calls go through `src/api/axiosInstance.jsx`; surface errors via
  `src/api/errorMessage.js` (don't hand-roll error boxes — see recent commits).
- Auth state lives in `context/AuthContext.jsx`; sessions expire automatically.

## Security & config

- Secrets are **git-ignored**: `appsettings.Development.json`, `.env*`. Copy from
  the `.example` templates. Never commit connection strings or the JWT key.
- Admin user is seeded on startup from `AdminEmail`/`AdminPassword` config.
- See `SECURITY_NOTES.md` — this repo has an ongoing self-run security audit;
  respect its findings when touching auth, validation, or data access.

## Gotchas

- Frontend `VITE_API_URL` **must** match the backend profile/port you ran
  (`http` 5111 vs `https` 7239) or the app renders blank.
- Using the `https` profile requires `dotnet dev-certs https --trust` first, else
  the browser silently blocks API calls.
- `.claude/` holds shared agents + skills (committed); local state is git-ignored.
  See `.claude/README.md`.
