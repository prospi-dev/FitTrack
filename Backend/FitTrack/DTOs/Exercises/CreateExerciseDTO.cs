using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.Exercises;

// This is what the client SENDS to create an exercise
// DataAnnotations give us automatic validation — if Name is missing,
// ASP.NET returns a 400 Bad Request before the controller even runs
public class CreateExerciseDto
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    [MaxLength(100)]
    public string MuscleGroup { get; set; } = string.Empty;
}