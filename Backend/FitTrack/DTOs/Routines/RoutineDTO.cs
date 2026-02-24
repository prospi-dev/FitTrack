namespace FitTrack.DTOs.Routines;

// Full routine response — includes the list of exercises inside it.
// This is what GET /api/routines and GET /api/routines/{id} return.
public class RoutineDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<RoutineExerciseDto> Exercises { get; set; } = new();
}