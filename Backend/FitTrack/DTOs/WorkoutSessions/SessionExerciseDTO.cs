namespace FitTrack.DTOs.WorkoutSessions;

// Represents one set of one exercise within a session response.
public class SessionExerciseDTO
{
    public int Id { get; set; }
    public int ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public string MuscleGroup { get; set; } = string.Empty;
    public int SetNumber { get; set; }
    public int RepsCompleted { get; set; }
    public float? WeightKg { get; set; }
}