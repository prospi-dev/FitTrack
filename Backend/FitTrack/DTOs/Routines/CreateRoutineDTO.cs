using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.Routines;

// Just name + description — exercises are added separately
// via POST /api/routines/{id}/exercises
public class CreateRoutineDTO
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public int UserId { get; set; }
}