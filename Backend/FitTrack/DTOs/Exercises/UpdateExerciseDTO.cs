using FitTrack.Models;
using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.Exercises;

// Same as Create but all fields optional — for partial updates
// If a field is null, we simply don't update it
public class UpdateExerciseDTO
{
    [MaxLength(150)]
    public string? Name { get; set; }

    public string? Description { get; set; }

    // null means "don't update", empty list would clear all — so we check in the controller
    public List<MuscleGroup>? MuscleGroups { get; set; }
}