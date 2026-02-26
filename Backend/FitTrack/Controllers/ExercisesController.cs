using FitTrack.Data;
using FitTrack.DTOs.Exercises;
using FitTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Validation;

namespace FitTrack.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExercisesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ExercisesController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/exercises 
    // Public — anyone can browse exercises, even unauthenticated users. => Changing it to authorized, every user must be authenticated to acess the app.
    // We project directly to ExerciseDto using LINQ Select to avoid
    // loading the navigation collections from the DB entirely.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var exercises = await _db.Exercises
            .AsNoTracking() // read-only query — faster, no change tracking overhead
            .Select(e => new ExerciseDTO
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                MuscleGroup = e.MuscleGroup.ToString(),
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();
        return Ok(exercises);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var exercise = await _db.Exercises
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new ExerciseDTO
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                MuscleGroup = e.MuscleGroup.ToString(),
                CreatedAt = e.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (exercise is null)
            return NotFound($"Exercise with ID {id} not found.");

        return Ok(exercise);
    }

    // POST api/exercises
    // Admin only — only admins can add exercises to the catalogue.
    // If the token is missing or the role isn't Admin → 401/403 automatically.
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateExerciseDTO dto)
    {
        var exercise = new Exercise
        {
            Name = dto.Name,
            Description = dto.Description,
            MuscleGroup = dto.MuscleGroup,
            CreatedAt = DateTime.UtcNow
        };

        _db.Exercises.Add(exercise);
        await _db.SaveChangesAsync();

        // 201 Created with a Location header pointing to the new resource
        return CreatedAtAction(nameof(GetById), new { id = exercise.Id }, new ExerciseDTO
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Description = exercise.Description,
            MuscleGroup = exercise.MuscleGroup.ToString(),
            CreatedAt = exercise.CreatedAt
        });
    }

    // ─── PUT api/exercises/{id} ─────────────────────────────────────────────
    // Admin only — update an exercise.
    // We only update fields that were actually sent (not null).
    // This is a partial update pattern — simpler than implementing PATCH.
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdateExerciseDTO dto)
    {
        var exercise = await _db.Exercises.FindAsync(id);

        if (exercise is null)
            return NotFound($"Exercise with ID {id} not found.");

        // Update only the fields that were provided (not null)
        if (dto.Name is not null)
            exercise.Name = dto.Name;
        if (dto.Description is not null)
            exercise.Description = dto.Description;
        if (dto.MuscleGroup is not null)
            exercise.MuscleGroup = (MuscleGroup)dto.MuscleGroup;

        await _db.SaveChangesAsync();

        return NoContent(); // 204 No Content — Nothing to return
    }

    // ─── DELETE api/exercises/{id} ──────────────────────────────────────────
    // Admin only — delete an exercise.
    // Note: because RoutineExercise and SessionExercise use DeleteBehavior.Restrict,
    // this will FAIL if the exercise is referenced by any routine or session.
    // That's intentional — you can't delete an exercise that's in use.
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var exercise = await _db.Exercises.FindAsync(id);

        if (exercise is null)
            return NotFound($"Exercise with ID {id} not found.");

        _db.Exercises.Remove(exercise);
        await _db.SaveChangesAsync();

        return NoContent(); // 204 nothing to return
    }
}