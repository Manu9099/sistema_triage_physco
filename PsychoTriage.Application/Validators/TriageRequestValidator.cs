using FluentValidation;
using PsychoTriage.Application.DTOs;

namespace PsychoTriage.Application.Validators;

public class TriageRequestValidator : AbstractValidator<TriageRequestDto>
{
    public TriageRequestValidator()
    {
        RuleFor(x => x.Age)
            .InclusiveBetween(5, 100);

        RuleFor(x => x.Phq9Answers)
            .NotNull()
            .Must(x => x.Count == 9)
            .WithMessage("PHQ-9 debe tener exactamente 9 respuestas.");

        RuleForEach(x => x.Phq9Answers)
            .InclusiveBetween(0, 3);

        RuleFor(x => x.Gad7Answers)
            .NotNull()
            .Must(x => x.Count == 7)
            .WithMessage("GAD-7 debe tener exactamente 7 respuestas.");

        RuleForEach(x => x.Gad7Answers)
            .InclusiveBetween(0, 3);

        RuleFor(x => x.SocialSupportLevel)
            .InclusiveBetween(0, 10);
    }
}