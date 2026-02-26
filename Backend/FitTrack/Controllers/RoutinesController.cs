using System.Security.Claims;
using FitTrack.Data;
using FitTrack.DTOs.Routines;
using FitTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints required a valid token - no anonymous
public class RoutinesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RoutinesController(AppDbContext db)
    {
        _db = db;
    }

    // Helper: reads the "nameidentifier" claim from the JWT and parses it as int.
    // This is the UserId we stored in the token during login/register.
    // Every endpoint calls this to know whose data to work with.
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/routines 
    // Returns all routines belonging to the logged-in user.
    // We use Include + ThenInclude to eagerly load the RoutineExercises
    // and the Exercise inside each one — so we can build the full DTO
    // with exercise names in a single DB query.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();

        var routines = await _db.Routines
            .AsNoTracking()
            .Where(r => r.UserId == userId) // only this user's routines
            .Include(r => r.RoutineExercises)
                .ThenInclude(re => re.Exercise) // include Exercise for each RoutineExercise
            .Select(r => new RoutineDTO
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                CreatedAt = r.CreatedAt,
                Exercises = r.RoutineExercises
                    .OrderBy(re => re.Order) // respect the defined order
                    .Select(re => new RoutineExerciseDTO
                    {
                        Id = re.Id,
                        ExerciseId = re.ExerciseId,
                        ExerciseName = re.Exercise.Name,
                        MuscleGroup = re.Exercise.MuscleGroup.ToString(),
                        Order = re.Order,
                        Sets = re.Sets,
                        Reps = re.Reps,
                        WeightKg = re.WeightKg
                    }).ToList()
            })
            .ToListAsync();

        return Ok(routines);
    }

    // GET api/routines/{id}
    // Get a single routine — but only if it belongs to the logged-in user.
    // If it exists but belongs to someone else, we still return 404.
    // This is intentional: we don't want to leak that the routine exists at all.
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var routine = await _db.Routines
            .AsNoTracking()
            .Where(r => r.Id == id && r.UserId == userId) // must match both id and user
            .Include(r => r.RoutineExercises)
                .ThenInclude(re => re.Exercise)
            .Select(r => new RoutineDTO
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                CreatedAt = r.CreatedAt,
                Exercises = r.RoutineExercises
                    .OrderBy(re => re.Order)
                    .Select(re => new RoutineExerciseDTO
                    {
                        Id = re.Id,
                        ExerciseId = re.ExerciseId,
                        ExerciseName = re.Exercise.Name,
                        MuscleGroup = re.Exercise.MuscleGroup.ToString(),
                        Order = re.Order,
                        Sets = re.Sets,
                        Reps = re.Reps,
                        WeightKg = re.WeightKg
                    }).ToList()
            })
            .FirstOrDefaultAsync();
        if (routine is null)
            return NotFound($"Routine with ID {id} not found.");

        return Ok(routine);
    }

    // POST api/routines
    // Create a new routine. UserId is taken from the JWT — the client
    // never sends it, which means a user can never create a routine
    // for someone else even if they try.
    [HttpPost]
    public async Task<IActionResult> Create(CreateRoutineDTO dto)
    {
        var userId = GetUserId();

        var routine = new Routine
        {
            Name = dto.Name,
            Description = dto.Description,
            UserId = userId, // always set from token, never from body
            CreatedAt = DateTime.UtcNow
        };

        _db.Routines.Add(routine);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = routine.Id }, new RoutineDTO
        {
            Id = routine.Id,
            Name = routine.Name,
            Description = routine.Description,
            CreatedAt = routine.CreatedAt,
            Exercises = new()
        });
    }

    // PUT api/routines/{id}
    // Update name/description. Ownership check: we filter by both Id AND UserId.
    // If the routine doesn't exist OR belongs to someone else → 404.
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateRoutineDTO dto)
    {
        var userId = GetUserId();

        var routine = await _db.Routines
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (routine is null)
            return NotFound($"Routine with ID {id} not found.");

        if (dto.Name is not null) routine.Name = dto.Name;
        if (dto.Description is not null) routine.Description = dto.Description;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/routines/{id}
    // Delete a routine. Same ownership check pattern.
    // RoutineExercises will cascade delete because we configured
    // DeleteBehavior.Cascade on that relationship in AppDbContext.
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var routine = await _db.Routines
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (routine is null)
            return NotFound($"Routine with ID {id} not found.");

        _db.Routines.Remove(routine);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ROUTINE EXERCISES — nested routes under /api/routines/{routineId}/exercises
    // These manage the exercises inside a routine (the RoutineExercise join rows).
    // ══════════════════════════════════════════════════════════════════════════

    // POST api/routines/{routineId}/exercises
    // Add an exercise to a routine. First we verify the routine belongs to this
    // user, then we check the exercise actually exists, then we create the entry.
    [HttpPost("{routineId}/exercises")]
    public async Task<IActionResult> AddExercise(int routineId, AddExerciseToRoutineDTO dto)
    {
        var userId = GetUserId();

        var routine = await _db.Routines
            .FirstOrDefaultAsync(r => r.Id == routineId && r.UserId == userId);

        if (routine is null)
            return NotFound($"Routine with ID {routineId} not found.");

        var exerciseExists = await _db.Exercises.AnyAsync(e => e.Id == dto.ExerciseId);
        if(!exerciseExists)
            return NotFound($"Exercise with ID {dto.ExerciseId} not found.");

        var routineExercise = new RoutineExercise
        {
            RoutineId = routineId,
            ExerciseId = dto.ExerciseId,
            Order = dto.Order,
            Sets = dto.Sets,
            Reps = dto.Reps,
            WeightKg = dto.WeightKg
        };

        _db.RoutineExercises.Add(routineExercise);
        await _db.SaveChangesAsync();

        return StatusCode(201); // Created
    }

    // PUT api/routines/{routineId}/exercises/{exerciseEntryId} 
    // Update sets/reps/weight/order for a specific exercise entry in a routine.
    // exerciseEntryId is the RoutineExercise.Id (the join table row),
    // NOT the Exercise.Id — important distinction.
    [HttpPut("{routineId}/exercises/{exerciseEntryId}")]
    public async Task<IActionResult> UpdateExercise(
        int routineId, int exerciseEntryId, UpdateRoutineExerciseDTO dto)
    {
        var userId = GetUserId();

        // We join RoutineExercise with its Routine to verify ownership in one query
        var entry = await _db.RoutineExercises
            .Include(re => re.Routine)
            .FirstOrDefaultAsync(re =>
                re.Id == exerciseEntryId &&
                re.RoutineId == routineId &&
                re.Routine.UserId == userId); // ownership check via navigation

        if (entry is null)
            return NotFound($"Exercise entry with ID {exerciseEntryId} not found.");

        if (dto.Order is not null) entry.Order = dto.Order.Value;
        if (dto.Sets is not null) entry.Sets = dto.Sets.Value;
        if (dto.Reps is not null) entry.Reps = dto.Reps.Value;
        if (dto.WeightKg is not null) entry.WeightKg = dto.WeightKg.Value;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/routines/{routineId}/exercises/{exerciseEntryId}
    // Remove an exercise from a routine. Same ownership check as above.
    [HttpDelete("{routineId}/exercises/{exerciseEntryId}")]
    public async Task<IActionResult> RemoveExercise(int routineId, int exerciseEntryId)
    {
        var userId = GetUserId();

        var entry = await _db.RoutineExercises
            .Include(re => re.Routine)
            .FirstOrDefaultAsync(re =>
                re.Id == exerciseEntryId &&
                re.RoutineId == routineId &&
                re.Routine.UserId == userId);

        if (entry is null)
            return NotFound($"Exercise entry with ID {exerciseEntryId} not found.");

        _db.RoutineExercises.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

