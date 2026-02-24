namespace FitTrack.DTOs.Routines;

// Represents one exercise entry inside a routine response.
// We include the exercise name/muscleGroup so the frontend
// doesn't need to make a second call to /api/exercises.
public class RoutineExerciseDto
{
    public int Id { get; set; }
    public int ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public string MuscleGroup { get; set; } = string.Empty;
    public int Order { get; set; }
    public int Sets { get; set; }
    public int Reps { get; set; }
    public float? WeightKg { get; set; }
}