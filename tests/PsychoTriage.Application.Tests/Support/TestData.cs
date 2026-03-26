using PsychoTriage.Application.DTOs;

namespace PsychoTriage.Application.Tests.Support;

internal static class TestData
{
    public static TriageRequestDto ValidRequest(
        int age = 22,
        int[]? phq9 = null,
        int[]? gad7 = null,
        bool suicidalIdeation = false,
        bool selfHarmHistory = false,
        bool functionalImpairment = false,
        bool substanceUse = false,
        int socialSupportLevel = 5)
    {
        return new TriageRequestDto
        {
            Age = age,
            Phq9Answers = (phq9 ?? new[] { 0, 0, 0, 0, 0, 0, 0, 0, 0 }).ToList(),
            Gad7Answers = (gad7 ?? new[] { 0, 0, 0, 0, 0, 0, 0 }).ToList(),
            SuicidalIdeation = suicidalIdeation,
            SelfHarmHistory = selfHarmHistory,
            FunctionalImpairment = functionalImpairment,
            SubstanceUse = substanceUse,
            SocialSupportLevel = socialSupportLevel
        };
    }
}