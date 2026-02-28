namespace FitTrack.DTOs.Exercises;

// This is what we RETURN to the client — read-only, clean shape
public class ExerciseDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> MuscleGroups { get; set; } = new();
    public DateTime? CreatedAt { get; set; }
}