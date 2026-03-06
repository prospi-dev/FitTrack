using System.Security.Claims;
using FitTrack.Data;
using FitTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExerciseRequestsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExerciseRequestsController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/exerciserequests
    // User: returns their own requests
    // Admin: returns ALL requests
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin");

        var query = _db.ExerciseRequests
            .AsNoTracking()
            .Include(er => er.User)
            .Include(er => er.ReviewedByAdmin)
            .OrderByDescending(er => er.SubmittedAt);

        var requests = isAdmin
            ? await query.ToListAsync()
            : await query.Where(er => er.UserId == userId).ToListAsync();

        var result = requests.Select(er => new ExerciseRequestDTO
        {
            Id = er.Id,
            Name = er.Name,
            Description = er.Description,
            MuscleGroup = er.MuscleGroup,
            Status = er.Status,
            SubmittedAt = er.SubmittedAt,
            ReviewedAt = er.ReviewedAt,
            SubmittedBy = er.User.Name,
            ReviewedBy = er.ReviewedByAdmin?.Name
        });

        return Ok(result);
    }

    // POST api/exerciserequests
    // Any authenticated user can submit a request
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateExerciseRequestDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Exercise name is required.");

        if (string.IsNullOrWhiteSpace(dto.MuscleGroup))
            return BadRequest("Muscle group is required.");

        var request = new ExerciseRequest
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            MuscleGroup = dto.MuscleGroup.Trim(),
            UserId = GetUserId(),
            SubmittedAt = DateTime.UtcNow
        };

        _db.ExerciseRequests.Add(request);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = request.Id }, new { request.Id, request.Name, request.Status });
    }

    // DELETE api/exerciserequests/{id}
    // User can delete their own pending request
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var request = await _db.ExerciseRequests.FindAsync(id);

        if (request is null) return NotFound();

        if (request.UserId != userId)
            return Forbid();

        if (request.Status != "Pending")
            return BadRequest("Only pending requests can be deleted.");

        _db.ExerciseRequests.Remove(request);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // PUT api/exerciserequests/{id}/review
    // Admin only — approve or reject a request
    [HttpPut("{id}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Review(int id, [FromBody] ReviewExerciseRequestDTO dto)
    {
        if (dto.Status != "Approved" && dto.Status != "Rejected")
            return BadRequest("Status must be 'Approved' or 'Rejected'.");

        var request = await _db.ExerciseRequests.FindAsync(id);
        if (request is null) return NotFound();

        if (request.Status != "Pending")
            return BadRequest("Request has already been reviewed.");

        request.Status = dto.Status;
        request.ReviewedByAdminId = GetUserId();
        request.ReviewedAt = DateTime.UtcNow;

        // If approved, automatically add it to the exercise catalogue
        if (dto.Status == "Approved")
        {
            // Parse MuscleGroup string — fall back to FullBody if unrecognized
            var muscleGroups = new List<MuscleGroup>();
            foreach (var mg in request.MuscleGroup.Split(',', StringSplitOptions.TrimEntries))
            {
                if (Enum.TryParse<MuscleGroup>(mg, out var parsed))
                    muscleGroups.Add(parsed);
            }
            if (muscleGroups.Count == 0)
                muscleGroups.Add(MuscleGroup.FullBody);

            _db.Exercises.Add(new Exercise
            {
                Name = request.Name,
                Description = request.Description,
                MuscleGroups = muscleGroups,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { request.Id, request.Status, request.ReviewedAt });
    }
}

// DTOs
public class ExerciseRequestDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string MuscleGroup { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string SubmittedBy { get; set; } = string.Empty;
    public string? ReviewedBy { get; set; }
}

public record CreateExerciseRequestDTO(string Name, string? Description, string MuscleGroup);
public record ReviewExerciseRequestDTO(string Status);