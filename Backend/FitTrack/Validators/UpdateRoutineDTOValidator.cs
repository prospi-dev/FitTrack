using FitTrack.DTOs.Routines;
using FluentValidation;

namespace FitTrack.Validators;

// Name is optional on update (partial update semantics — only supplied
// fields are changed), but when it IS supplied it must be non-empty and
// within the "Routines.Name" column constraint (character varying(150)).
public class UpdateRoutineDTOValidator : AbstractValidator<UpdateRoutineDTO>
{
    public UpdateRoutineDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name cannot be empty.")
            .MaximumLength(150).WithMessage("Name must be 150 characters or fewer.")
            .When(x => x.Name is not null);
    }
}
