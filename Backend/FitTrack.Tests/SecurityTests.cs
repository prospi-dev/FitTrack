using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Xunit;

namespace FitTrack.Tests;

// End-to-end tests over the real HTTP pipeline. They target the app's strongest
// design point — that every user-scoped resource is filtered by owner, and that
// catalogue mutations are admin-only — plus a regression guard for the
// free-workout fix.
public class SecurityTests
{
    private record AuthResponse(string Token, string Name, string Email, string Role);

    private static async Task<string> RegisterAsync(
        HttpClient client, string name, string email, string password = "password123")
    {
        var res = await client.PostAsJsonAsync("/api/auth/register",
            new { name, email, password });
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<AuthResponse>();
        return body!.Token;
    }

    private static async Task<string> LoginAsync(HttpClient client, string email, string password)
    {
        var res = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<AuthResponse>();
        return body!.Token;
    }

    private static HttpClient Authed(CustomWebAppFactory factory, string token)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task Protected_endpoint_rejects_request_without_token()
    {
        using var factory = new CustomWebAppFactory();
        var client = factory.CreateClient();

        var res = await client.GetAsync("/api/routines");

        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Register_returns_a_token_that_unlocks_protected_endpoints()
    {
        using var factory = new CustomWebAppFactory();
        var token = await RegisterAsync(factory.CreateClient(), "Ada", "ada@test.local");

        var res = await Authed(factory, token).GetAsync("/api/routines");

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task User_cannot_read_another_users_routine()
    {
        using var factory = new CustomWebAppFactory();

        // User A creates a routine.
        var tokenA = await RegisterAsync(factory.CreateClient(), "Alice", "alice@test.local");
        var clientA = Authed(factory, tokenA);
        var created = await clientA.PostAsJsonAsync("/api/routines", new { name = "Push day" });
        created.EnsureSuccessStatusCode();
        var routine = await created.Content.ReadFromJsonAsync<RoutineResponse>();

        // User B must not be able to read it — and gets 404 (not 403) so the
        // routine's very existence isn't leaked.
        var tokenB = await RegisterAsync(factory.CreateClient(), "Bob", "bob@test.local");
        var asB = await Authed(factory, tokenB).GetAsync($"/api/routines/{routine!.Id}");
        Assert.Equal(HttpStatusCode.NotFound, asB.StatusCode);

        // Sanity: the owner can read it.
        var asA = await clientA.GetAsync($"/api/routines/{routine.Id}");
        Assert.Equal(HttpStatusCode.OK, asA.StatusCode);
    }

    [Fact]
    public async Task Only_admins_can_add_exercises_to_the_catalogue()
    {
        using var factory = new CustomWebAppFactory();

        // A normal user is forbidden.
        var userToken = await RegisterAsync(factory.CreateClient(), "Nia", "nia@test.local");
        var asUser = await Authed(factory, userToken).PostAsJsonAsync("/api/exercises",
            new { name = "Zercher Squat", muscleGroups = new[] { "Quads" } });
        Assert.Equal(HttpStatusCode.Forbidden, asUser.StatusCode);

        // The seeded admin is allowed.
        var adminToken = await LoginAsync(
            factory.CreateClient(), CustomWebAppFactory.AdminEmail, CustomWebAppFactory.AdminPassword);
        var asAdmin = await Authed(factory, adminToken).PostAsJsonAsync("/api/exercises",
            new { name = "Zercher Squat", muscleGroups = new[] { "Quads" } });
        Assert.Equal(HttpStatusCode.Created, asAdmin.StatusCode);
    }

    [Fact]
    public async Task Free_workout_with_no_routine_can_be_logged()
    {
        using var factory = new CustomWebAppFactory();
        var token = await RegisterAsync(factory.CreateClient(), "Sam", "sam@test.local");
        var client = Authed(factory, token);

        // Grab a seeded exercise to reference.
        var exercises = await client.GetFromJsonAsync<List<ExerciseResponse>>("/api/exercises");
        var exerciseId = exercises!.First().Id;

        // routineId omitted → a "free workout". This used to 404 before the fix.
        var res = await client.PostAsJsonAsync("/api/workoutsessions", new
        {
            routineId = (int?)null,
            exercises = new[]
            {
                new { exerciseId, setNumber = 1, repsCompleted = 8, weightKg = 60f },
            },
        });

        Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }

    private record RoutineResponse(int Id, string Name);
    private record ExerciseResponse(int Id, string Name);
}
