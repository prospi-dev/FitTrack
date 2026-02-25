namespace FitTrack.Models;

public class WorkoutSession
{
    public int Id { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public int UserId { get; set; }
    public int? RoutineId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Routine Routine { get; set; } = null!;
    public ICollection<SessionExercise> SessionExercises { get; set; } = new List<SessionExercise>();
}