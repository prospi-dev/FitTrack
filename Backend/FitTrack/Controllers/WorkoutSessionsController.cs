using System.Security.Claims;
using FitTrack.Data;
using FitTrack.DTOs.WorkoutSessions;
using FitTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutSessionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkoutSessionsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/workoutsessions 
    // Returns all sessions for the logged-in user, newest first.
    // Each session includes the full list of exercise sets logged.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();

        var sessions = await _db.WorkoutSessions
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .Include(s => s.Routine)
            .Include(s => s.SessionExercises)
                .ThenInclude(se => se.Exercise)
            .OrderByDescending(s => s.Date)
            .ToListAsync();

        var result = sessions.Select(s => new WorkoutSessionDTO
        {
            Id = s.Id,
            Date = s.Date,
            RoutineId = s.RoutineId,
            RoutineName = s.Routine?.Name ?? "Free workout",
            Exercises = s.SessionExercises
                .OrderBy(se => se.ExerciseId)
                .ThenBy(se => se.SetNumber)
                .Select(se => new SessionExerciseDTO
                {
                    Id = se.Id,
                    ExerciseId = se.ExerciseId,
                    ExerciseName = se.Exercise.Name,
                    MuscleGroup = string.Join(", ", se.Exercise.MuscleGroups.Select(m => m.ToString())),
                    SetNumber = se.SetNumber,
                    RepsCompleted = se.RepsCompleted,
                    WeightKg = se.WeightKg
                }).ToList()
        });

        return Ok(result);
    }

    // GET api/workoutsessions/{id}
    // Get a single session by ID — ownership check as always.
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();

        var session = await _db.WorkoutSessions
            .AsNoTracking()
            .Where(s => s.Id == id && s.UserId == userId)
            .Include(s => s.Routine)
            .Include(s => s.SessionExercises)
                .ThenInclude(se => se.Exercise)
            .FirstOrDefaultAsync(); 

        if (session is null)
            return NotFound($"Session with ID {id} not found.");

        var result = new WorkoutSessionDTO
        {
            Id = session.Id,
            Date = session.Date,
            RoutineId = session.RoutineId,
            RoutineName = session.Routine?.Name ?? "Free workout",
            Exercises = session.SessionExercises
                .OrderBy(se => se.ExerciseId)
                .ThenBy(se => se.SetNumber)
                .Select(se => new SessionExerciseDTO
                {
                    Id = se.Id,
                    ExerciseId = se.ExerciseId,
                    ExerciseName = se.Exercise.Name,
                    MuscleGroup = string.Join(", ", se.Exercise.MuscleGroups.Select(m => m.ToString())),
                    SetNumber = se.SetNumber,
                    RepsCompleted = se.RepsCompleted,
                    WeightKg = se.WeightKg
                }).ToList()
        };

        return Ok(result);
    }

    // POST api/workoutsessions
    // Log a completed workout session.
    // The user sends the routine they followed + all sets they performed.
    // We validate:
    //      1. The routine exists AND belongs to this user
    //      2. All exercises referenced exist in the DB
    // Then we create the session and all SessionExercise rows in one SaveChanges.
    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkoutSessionDTO dto)
    {
        var userId = GetUserId();

        // Ownership check — only when a routine is given, a session can be routine-less
        // (a "free workout"). A null RoutineId must not run the ownership query, or the
        // `r.Id == null` comparison never matches and every free workout is rejected 404.
        if (dto.RoutineId is not null)
        {
            var routineExists = await _db.Routines
                .AnyAsync(r => r.Id == dto.RoutineId && r.UserId == userId);

            if (!routineExists)
                return NotFound($"The routine with ID {dto.RoutineId} was not found.");
        }

        // Validate exercises IDs exist
        var exerciseIds = dto.Exercises.Select(e => e.ExerciseId).Distinct().ToList();
        var foundCount = await _db.Exercises
            .CountAsync(e => exerciseIds.Contains(e.Id));

        if (foundCount != exerciseIds.Count)
            return BadRequest("One or more exercise IDs are invalid.");

        // Build session
        var session = new WorkoutSession
        {
            UserId = userId,
            RoutineId = dto.RoutineId,
            Date = dto.Date ?? DateTime.UtcNow,
            SessionExercises = dto.Exercises.Select(e => new SessionExercise
            {
                ExerciseId = e.ExerciseId,
                SetNumber = e.SetNumber,
                RepsCompleted = e.RepsCompleted,
                WeightKg = e.WeightKg
            }).ToList()
        };

        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync(); // saves session + all SessionExercises in one go

        return CreatedAtAction(nameof(GetById), new { id = session.Id }, new { id = session.Id });
    }

    // PUT api/workoutsessions/{id}
    // Correct an already logged session. Same validation as Create, then the old
    // SessionExercise rows are dropped and rebuilt from the payload — mistyping
    // one set used to mean deleting the whole session and logging it again.
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateWorkoutSessionDTO dto)
    {
        var userId = GetUserId();

        var session = await _db.WorkoutSessions
            .Include(s => s.SessionExercises)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (session is null)
            return NotFound($"Session with ID {id} not found.");

        // Ownership check — only when a routine is given, a session can be routine-less.
        if (dto.RoutineId is not null)
        {
            var routineExists = await _db.Routines
                .AnyAsync(r => r.Id == dto.RoutineId && r.UserId == userId);

            if (!routineExists)
                return NotFound($"The routine with ID {dto.RoutineId} was not found.");
        }

        // Validate exercise IDs exist
        var exerciseIds = dto.Exercises.Select(e => e.ExerciseId).Distinct().ToList();
        var foundCount = await _db.Exercises
            .CountAsync(e => exerciseIds.Contains(e.Id));

        if (foundCount != exerciseIds.Count)
            return BadRequest("One or more exercise IDs are invalid.");

        session.RoutineId = dto.RoutineId;
        session.Date = dto.Date ?? session.Date;

        _db.SessionExercises.RemoveRange(session.SessionExercises);
        session.SessionExercises = dto.Exercises.Select(e => new SessionExercise
        {
            ExerciseId = e.ExerciseId,
            SetNumber = e.SetNumber,
            RepsCompleted = e.RepsCompleted,
            WeightKg = e.WeightKg
        }).ToList();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ─── DELETE api/workoutsessions/{id} ─────────────────────────────────────
    // Delete a session. SessionExercises cascade delete automatically.
    // Useful if the user logged a session by mistake.
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var session = await _db.WorkoutSessions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (session is null)
            return NotFound($"Session with ID {id} not found.");

        _db.WorkoutSessions.Remove(session);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}