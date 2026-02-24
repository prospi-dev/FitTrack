namespace FitTrack.DTOs.Exercises;

// This is what we RETURN to the client — read-only, clean shape
public class ExerciseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string MuscleGroup { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}