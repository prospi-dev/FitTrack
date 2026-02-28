using Microsoft.EntityFrameworkCore;

namespace FitTrack.Models;

public class SessionExercise
{
    public int Id { get; set; }

    public int SetNumber { get; set; }

    public int RepsCompleted { get; set; }

    public float? WeightKg { get; set; }

    // Foreign keys
    public int WorkoutSessionId { get; set; }
    public int ExerciseId { get; set; }

    // Navigation properties
    public WorkoutSession WorkoutSession { get; set; } = null!;
    public Exercise Exercise { get; set; } = null!;
}

