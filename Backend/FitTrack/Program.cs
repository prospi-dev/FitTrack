using System.Text;
using FitTrack.Data;
using FitTrack.Models;
using FitTrack.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration["AllowedOrigins"]?.Split(",")
    ?? new[] { "http://localhost:5173" };

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<JwtService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Apply migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed Admin user
    var adminEmail = builder.Configuration["AdminEmail"];
    var adminPassword = builder.Configuration["AdminPassword"];

    if (!string.IsNullOrEmpty(adminEmail) && !db.Users.Any(u => u.Email == adminEmail))
    {
        db.Users.Add(new User
        {
            Name = "Admin",
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }

    // Seed Exercises
    if (!db.Exercises.Any())
    {
        var exercises = new List<Exercise>
        {
            // Chest
            new() { Name = "Bench Press", Description = "Barbell flat bench press.", MuscleGroups = new() { MuscleGroup.Chest, MuscleGroup.Triceps, MuscleGroup.FrontDelts } },
            new() { Name = "Incline Bench Press", Description = "Barbell incline bench press.", MuscleGroups = new() { MuscleGroup.Chest, MuscleGroup.FrontDelts } },
            new() { Name = "Dumbbell Fly", Description = "Dumbbell chest fly on flat bench.", MuscleGroups = new() { MuscleGroup.Chest } },
            new() { Name = "Cable Crossover", Description = "Cable fly for chest isolation.", MuscleGroups = new() { MuscleGroup.Chest } },
            new() { Name = "Push-Up", Description = "Bodyweight chest exercise.", MuscleGroups = new() { MuscleGroup.Chest, MuscleGroup.Triceps } },
            new() { Name = "Dips", Description = "Parallel bar dips.", MuscleGroups = new() { MuscleGroup.Chest, MuscleGroup.Triceps } },

            // Back
            new() { Name = "Deadlift", Description = "Conventional barbell deadlift.", MuscleGroups = new() { MuscleGroup.Back, MuscleGroup.LowerBack, MuscleGroup.Glutes, MuscleGroup.Hamstrings } },
            new() { Name = "Barbell Row", Description = "Bent-over barbell row.", MuscleGroups = new() { MuscleGroup.Back, MuscleGroup.Lats, MuscleGroup.Biceps } },
            new() { Name = "Pull-Up", Description = "Bodyweight pull-up.", MuscleGroups = new() { MuscleGroup.Lats, MuscleGroup.Biceps } },
            new() { Name = "Lat Pulldown", Description = "Cable lat pulldown.", MuscleGroups = new() { MuscleGroup.Lats, MuscleGroup.Biceps } },
            new() { Name = "Seated Cable Row", Description = "Seated cable row for back thickness.", MuscleGroups = new() { MuscleGroup.Back, MuscleGroup.Biceps } },
            new() { Name = "Face Pull", Description = "Cable face pull for rear delts and upper back.", MuscleGroups = new() { MuscleGroup.RearDelts, MuscleGroup.Back } },

            // Shoulders
            new() { Name = "Overhead Press", Description = "Barbell overhead press.", MuscleGroups = new() { MuscleGroup.Shoulder, MuscleGroup.FrontDelts, MuscleGroup.Triceps } },
            new() { Name = "Dumbbell Lateral Raise", Description = "Dumbbell side lateral raise.", MuscleGroups = new() { MuscleGroup.SideDelts } },
            new() { Name = "Dumbbell Front Raise", Description = "Dumbbell front raise.", MuscleGroups = new() { MuscleGroup.FrontDelts } },
            new() { Name = "Rear Delt Fly", Description = "Dumbbell rear delt fly.", MuscleGroups = new() { MuscleGroup.RearDelts } },

            // Biceps
            new() { Name = "Barbell Curl", Description = "Standing barbell bicep curl.", MuscleGroups = new() { MuscleGroup.Biceps } },
            new() { Name = "Dumbbell Curl", Description = "Alternating dumbbell curl.", MuscleGroups = new() { MuscleGroup.Biceps } },
            new() { Name = "Hammer Curl", Description = "Neutral grip dumbbell curl.", MuscleGroups = new() { MuscleGroup.Biceps, MuscleGroup.Forearms } },
            new() { Name = "Preacher Curl", Description = "Barbell or dumbbell curl on preacher bench.", MuscleGroups = new() { MuscleGroup.Biceps } },

            // Triceps
            new() { Name = "Tricep Pushdown", Description = "Cable tricep pushdown.", MuscleGroups = new() { MuscleGroup.Triceps } },
            new() { Name = "Skull Crusher", Description = "Barbell skull crusher.", MuscleGroups = new() { MuscleGroup.Triceps } },
            new() { Name = "Overhead Tricep Extension", Description = "Dumbbell overhead tricep extension.", MuscleGroups = new() { MuscleGroup.Triceps } },

            // Legs
            new() { Name = "Squat", Description = "Barbell back squat.", MuscleGroups = new() { MuscleGroup.Quads, MuscleGroup.Glutes, MuscleGroup.Hamstrings } },
            new() { Name = "Romanian Deadlift", Description = "Barbell Romanian deadlift.", MuscleGroups = new() { MuscleGroup.Hamstrings, MuscleGroup.Glutes, MuscleGroup.LowerBack } },
            new() { Name = "Leg Press", Description = "Machine leg press.", MuscleGroups = new() { MuscleGroup.Quads, MuscleGroup.Glutes } },
            new() { Name = "Leg Curl", Description = "Machine lying leg curl.", MuscleGroups = new() { MuscleGroup.Hamstrings } },
            new() { Name = "Leg Extension", Description = "Machine leg extension.", MuscleGroups = new() { MuscleGroup.Quads } },
            new() { Name = "Walking Lunge", Description = "Dumbbell walking lunge.", MuscleGroups = new() { MuscleGroup.Quads, MuscleGroup.Glutes } },
            new() { Name = "Hip Thrust", Description = "Barbell hip thrust.", MuscleGroups = new() { MuscleGroup.Glutes, MuscleGroup.Hamstrings } },
            new() { Name = "Calf Raise", Description = "Standing or seated calf raise.", MuscleGroups = new() { MuscleGroup.Calves } },

            // Core
            new() { Name = "Plank", Description = "Isometric core hold.", MuscleGroups = new() { MuscleGroup.Abs } },
            new() { Name = "Crunch", Description = "Bodyweight abdominal crunch.", MuscleGroups = new() { MuscleGroup.Abs } },
            new() { Name = "Cable Crunch", Description = "Kneeling cable crunch.", MuscleGroups = new() { MuscleGroup.Abs } },
            new() { Name = "Russian Twist", Description = "Rotational core exercise.", MuscleGroups = new() { MuscleGroup.Abs, MuscleGroup.Obliques } },
            new() { Name = "Hanging Leg Raise", Description = "Hanging from bar, raise legs to 90 degrees.", MuscleGroups = new() { MuscleGroup.Abs } },

            // Cardio / Full Body
            new() { Name = "Running", Description = "Treadmill or outdoor running.", MuscleGroups = new() { MuscleGroup.Cardio } },
            new() { Name = "Rowing Machine", Description = "Ergometer rowing.", MuscleGroups = new() { MuscleGroup.Cardio, MuscleGroup.Back } },
            new() { Name = "Burpee", Description = "Full body cardio exercise.", MuscleGroups = new() { MuscleGroup.FullBody, MuscleGroup.Cardio } },
        };

        db.Exercises.AddRange(exercises);
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
}

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();