using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.Routines;

// Sent when the user adds an exercise to a routine.
// ExerciseId tells us which exercise, the rest is the training config.
public class AddExerciseToRoutineDto
{
    [Required]
    public int ExerciseId { get; set; }

    [Required]
    [Range(1, 100)]
    public int Order { get; set; }

    [Required]
    [Range(1, 100)]
    public int Sets { get; set; }

    [Required]
    [Range(1, 1000)]
    public int Reps { get; set; }

    public float? WeightKg { get; set; }
}