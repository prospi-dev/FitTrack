namespace FitTrack.Models;

public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public List<MuscleGroup> MuscleGroups { get; set; } = new(); // renamed + now a list
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<RoutineExercise> RoutineExercises { get; set; } = new List<RoutineExercise>();
    public ICollection<SessionExercise> SessionExercises { get; set; } = new List<SessionExercise>();
    public ICollection<ExerciseRequest> ExerciseRequests { get; set; } = new List<ExerciseRequest>();
}

