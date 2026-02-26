namespace FitTrack.DTOs.WorkoutSessions;

// Full session response — includes all exercise sets logged.
public class WorkoutSessionDTO
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public int? RoutineId { get; set; }
    public string RoutineName { get; set; } = string.Empty;
    public List<SessionExerciseDTO> Exercises { get; set; } = new();
}