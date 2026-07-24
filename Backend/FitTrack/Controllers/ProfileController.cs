using System.Security.Claims;
using FitTrack.Data;
using FitTrack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitTrack.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public ProfileController(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/profile
    // Returns the current user's profile info
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _db.Users.FindAsync(GetUserId());
        if (user is null) return NotFound();

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            user.CreatedAt
        });
    }

    // PUT api/profile/name
    // Update display name
    [HttpPut("name")]
    public async Task<IActionResult> UpdateName([FromBody] UpdateNameDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name cannot be empty.");

        var user = await _db.Users.FindAsync(GetUserId());
        if (user is null) return NotFound();

        user.Name = dto.Name.Trim();
        await _db.SaveChangesAsync();

        // Return a fresh token with the updated name claim
        var token = _jwt.GenerateToken(user);
        return Ok(new { user.Name, Token = token });
    }

    // PUT api/profile/password
    // Change password — requires current password for verification
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
    {
        var user = await _db.Users.FindAsync(GetUserId());
        if (user is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect.");

        // Mirror the registration rules: at least 8 chars, and no more than 72
        // (BCrypt only hashes the first 72 bytes, so anything longer is silently
        // truncated).
        if (dto.NewPassword is null || dto.NewPassword.Length < 8)
            return BadRequest("New password must be at least 8 characters.");

        if (dto.NewPassword.Length > 72)
            return BadRequest("New password must be 72 characters or fewer.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();

        return Ok("Password updated successfully.");
    }

    // DELETE api/profile
    // Delete account and all associated data (cascades via DB)
    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var user = await _db.Users.FindAsync(GetUserId());
        if (user is null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return Ok("Account deleted.");
    }
}

public record UpdateNameDTO(string Name);
public record ChangePasswordDTO(string CurrentPassword, string NewPassword);