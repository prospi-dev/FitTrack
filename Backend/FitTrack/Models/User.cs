using Microsoft.AspNetCore.Identity;

namespace FitTrack.Models;

public class User
{
    public int Id { get; set; }

    public string Name { get; set; }

    public string Email { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "User"; // "User" or "Admin"

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Routine> Routines { get; set; } = new List<Routine>();
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = new List<WorkoutSession>();
    public ICollection<ExerciseRequest> ExerciseRequests { get; set; } = new List<ExerciseRequest>();
}

