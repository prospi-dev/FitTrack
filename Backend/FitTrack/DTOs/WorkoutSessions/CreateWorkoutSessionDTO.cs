using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.WorkoutSessions;

// To log a session the user sends the routine they followed
// and the list of sets they actually performed.
public class CreateWorkoutSessionDTO
{
    [Required]
    public int RoutineId { get; set; }

    // Optional — defaults to UtcNow if not provided.
    // Lets the user backfill a session they forgot to log.
    public DateTime? Date { get; set; }

    [Required]
    public List<LogSessionExerciseDTO> Exercises { get; set; } = new();
}