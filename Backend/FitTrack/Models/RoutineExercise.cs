namespace FitTrack.Models;

public class RoutineExercise
{
    public int Id { get; set; }
    public int Order { get; set; } // position in the routine
    public int Sets { get; set; }
    public int Reps { get; set; }
    public float? WeightKg { get; set; } // nullable — bodyweight exercises

    // Foreign keys
    public int RoutineId { get; set; }
    public int ExerciseId { get; set; }

    // Navigation properties
    public Routine Routine { get; set; } = null!;
    public Exercise Exercise { get; set; } = null!;
}

