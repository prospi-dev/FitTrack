using FitTrack.DTOs.Auth;
using FluentValidation;

namespace FitTrack.Validators;

// Aligns registration requirements with the password rules already enforced
// in ProfileController's change-password endpoint (minimum 6 characters),
// which previously had no equivalent check at registration time.
public class RegisterDTOValidator : AbstractValidator<RegisterDTO>
{
    public RegisterDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must be 100 characters or fewer.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            // BCrypt only hashes the first 72 bytes, so cap the length here to
            // avoid silently truncating longer passwords.
            .MaximumLength(72).WithMessage("Password must be 72 characters or fewer.");
    }
}
