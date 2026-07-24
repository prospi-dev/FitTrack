using System.Text;
using System.Threading.RateLimiting;
using FitTrack.Data;
using FitTrack.Models;
using FitTrack.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
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

// RFC7807 ProblemDetails support, used by the global exception handler below
// and automatically by [ApiController] model-validation failures.
builder.Services.AddProblemDetails();

// FluentValidation — auto-validates action parameters against any
// registered AbstractValidator<T> and short-circuits with a 400
// ValidationProblemDetails response (via ModelState) on failure.
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

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

// Rate limiting — throttles the authentication endpoints so login/register can't
// be brute-forced. Partitioned by client IP; each IP gets a fixed window of
// attempts, and anything over the limit is rejected with 429 (no queueing).
// Note: behind a reverse proxy (e.g. Render) RemoteIpAddress is the proxy unless
// forwarded headers are wired up — acceptable for this portfolio deployment.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

var app = builder.Build();

// Apply migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Apply EF migrations against a real (relational) database; the in-memory
    // provider used by integration tests can't run migrations, so just
    // materialise the model there instead.
    if (db.Database.IsRelational())
        db.Database.Migrate();
    else
        db.Database.EnsureCreated();

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

// Global exception handler — catches any unhandled exception and returns an
// RFC7807 ProblemDetails response instead of a raw 500 / stack trace.
// In Development we include exception details to aid debugging; in all
// other environments the response body stays generic so nothing about the
// exception (message, stack trace, type) leaks to the client.
var isDevelopment = app.Environment.IsDevelopment();
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = exceptionHandlerFeature?.Error;

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred.",
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            Instance = context.Request.Path
        };

        if (isDevelopment && exception is not null)
        {
            problemDetails.Detail = exception.ToString();
        }

        context.Response.StatusCode = problemDetails.Status.Value;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
}

app.UseCors("FrontendPolicy");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Exposed so the integration-test project's WebApplicationFactory<Program> can
// bootstrap the real app pipeline. Program is otherwise implicit (top-level statements).
public partial class Program { }