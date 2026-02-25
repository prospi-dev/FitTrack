namespace FitTrack.DTOs.Routines;

// For updating sets/reps/weight of an exercise already in a routine.
// All nullable — only update what was sent.
public class UpdateRoutineExerciseDTO
{
    public int? Order { get; set; }
    public int? Sets { get; set; }
    public int? Reps { get; set; }
    public float? WeightKg { get; set; }
}