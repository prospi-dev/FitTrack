using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.Exercises;

// Same as Create but all fields optional — for partial updates
// If a field is null, we simply don't update it
public class UpdateExerciseDto
{
    [MaxLength(150)]
    public string? Name { get; set; }

    public string? Description { get; set; }

    [MaxLength(100)]
    public string? MuscleGroup { get; set; }
}