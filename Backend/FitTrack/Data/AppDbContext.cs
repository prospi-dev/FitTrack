using System;
using System.Collections.Generic;
using FitTrack.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace FitTrack.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<User> Users => Set<User>(); // Using => Set<User>() instead of { get; set; } is the modern EF Core recommended style — it's null-safe and avoids the CS8618 uninitialized property warning.
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<Routine> Routines => Set<Routine>();
    public DbSet<RoutineExercise> RoutineExercises => Set<RoutineExercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<SessionExercise> SessionExercises => Set<SessionExercise>();
    public DbSet<ExerciseRequest> ExerciseRequests => Set<ExerciseRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(200);

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .IsRequired();

            entity.Property(u => u.Role)
                .IsRequired()
                .HasDefaultValue("User");
        });

        // Exercise
        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(e => e.MuscleGroup)
                .IsRequired()
                .HasMaxLength(100);
        });

        // Routine
        modelBuilder.Entity<Routine>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.Property(r => r.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.HasOne(r => r.User)
                .WithMany(u => u.Routines)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // RoutineExercise
        modelBuilder.Entity<RoutineExercise>(entity =>
        {
            entity.HasKey(re => re.Id);

            entity.HasOne(re => re.Routine)
                .WithMany(r => r.RoutineExercises)
                .HasForeignKey(re => re.RoutineId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(re => re.Exercise)
                .WithMany(e => e.RoutineExercises)
                .HasForeignKey(re => re.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        // WorkoutSession 
        modelBuilder.Entity<WorkoutSession>(entity =>
        {
            entity.HasKey(ws => ws.Id);

            entity.HasOne(ws => ws.User)
                .WithMany(u => u.WorkoutSessions)
                .HasForeignKey(ws => ws.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ws => ws.Routine)
                .WithMany(r => r.WorkoutSessions)
                .HasForeignKey(ws => ws.RoutineId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // SessionExercise
        modelBuilder.Entity<SessionExercise>(entity =>
        {
            entity.HasKey(se => se.Id);

            entity.HasOne(se => se.WorkoutSession)
                .WithMany(ws => ws.SessionExercises)
                .HasForeignKey(se => se.WorkoutSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(se => se.Exercise)
                .WithMany(e => e.SessionExercises)
                .HasForeignKey(se => se.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ExerciseRequest 
        modelBuilder.Entity<ExerciseRequest>(entity =>
        {
            entity.HasKey(er => er.Id);

            entity.Property(er => er.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(er => er.MuscleGroup)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(er => er.Status)
                .IsRequired()
                .HasDefaultValue("Pending");

            entity.HasOne(er => er.User)
                .WithMany(u => u.ExerciseRequests)
                .HasForeignKey(er => er.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Self-referencing FK — admin is also a User
            entity.HasOne(er => er.ReviewedByAdmin)
                .WithMany()
                .HasForeignKey(er => er.ReviewedByAdminId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        });
    }
}

