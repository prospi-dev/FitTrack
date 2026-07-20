using FitTrack.DTOs.Routines;
using FluentValidation;

namespace FitTrack.Validators;

// Name max length (150) matches the "Routines.Name" column constraint
// defined in the InitialPostgres migration (character varying(150)).
public class CreateRoutineDTOValidator : AbstractValidator<CreateRoutineDTO>
{
    public CreateRoutineDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(150).WithMessage("Name must be 150 characters or fewer.");
    }
}
