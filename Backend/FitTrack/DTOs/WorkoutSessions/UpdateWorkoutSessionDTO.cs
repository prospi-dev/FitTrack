using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.WorkoutSessions;

// To correct an already logged session the user resends the whole set list.
// Sets have no stable identity for the user — they see "Set 2 of bench press",
// not a row id — so patching individual rows would be more fragile than
// replacing them.
public class UpdateWorkoutSessionDTO
{
    public int? RoutineId { get; set; }

    // Optional — keeps the existing date if not provided.
    public DateTime? Date { get; set; }

    [Required]
    public List<LogSessionExerciseDTO> Exercises { get; set; } = new();
}
