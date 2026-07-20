using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FitTrack.Models;
using Microsoft.IdentityModel.Tokens;

namespace FitTrack.Services;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            // Emitted directly as ClaimTypes.NameIdentifier (rather than the JWT
            // "sub" claim) so that controllers reading ClaimTypes.NameIdentifier
            // work reliably regardless of JwtBearer's inbound claim mapping
            // configuration (e.g. if MapInboundClaims is ever set to false).
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

