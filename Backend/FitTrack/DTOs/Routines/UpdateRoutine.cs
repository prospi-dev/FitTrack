using System.ComponentModel.DataAnnotations;

namespace FitTrack.DTOs.Routines;

public class UpdateRoutineDto
{
    [MaxLength(150)]
    public string? Name { get; set; }

    public string? Description { get; set; }
}