using FitTrack.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FitTrack.Tests;

// Boots the real application pipeline (auth, controllers, validation, the
// global exception handler) but swaps PostgreSQL for an isolated in-memory
// database so tests are fast, hermetic, and require no running server.
// Each factory instance gets its own database name — construct one per test
// for full isolation.
public class CustomWebAppFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin@test.local";
    public const string AdminPassword = "admin-password-123";

    private readonly string _dbName = "TestDb-" + Guid.NewGuid();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] =
                    "Host=localhost;Database=ignored;Username=x;Password=x",
                ["Jwt:Key"] =
                    "test-signing-key-that-is-definitely-long-enough-for-hmac-sha256-0123456789",
                ["Jwt:Issuer"] = "FitTrackApi",
                ["Jwt:Audience"] = "FitTrackClient",
                ["AdminEmail"] = AdminEmail,
                ["AdminPassword"] = AdminPassword,
                ["AllowedOrigins"] = "http://localhost",
            });
        });

        builder.ConfigureServices(services =>
        {
            // Drop every EF registration tied to AppDbContext (its options and,
            // in EF 9, the IDbContextOptionsConfiguration<AppDbContext> that
            // carries the Npgsql provider) so the in-memory provider is the only
            // one left — otherwise EF throws "only a single provider" at startup.
            var toRemove = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.GetGenericArguments().Contains(typeof(AppDbContext))))
                .ToList();
            foreach (var descriptor in toRemove)
                services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
