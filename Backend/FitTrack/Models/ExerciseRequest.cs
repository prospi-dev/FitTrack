namespace FitTrack.Models
{
    public class ExerciseRequest
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string MuscleGroup { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReviewedAt { get; set; }

        // Foreign keys
        public int UserId { get; set; }
        public int? ReviewedByAdminId { get; set; } // nullable — not reviewed yet

        // Navigation properties
        public User User { get; set; } = null!;
        public User? ReviewedByAdmin { get; set; }
    }
}