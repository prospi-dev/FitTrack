using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.WorkoutSessions;

// One set of one exercise the user performed.
// The user sends one entry per SET — so if they did 3 sets of bench press,
// they send 3 entries with SetNumber 1, 2, 3.
public class LogSessionExerciseDTO
{
    [Required]
    public int ExerciseId { get; set; }

    [Required]
    [Range(1, 100)]
    public int SetNumber { get; set; }

    [Required]
    [Range(0, 10000)]
    public int RepsCompleted { get; set; }

    public float? WeightKg { get; set; }
}