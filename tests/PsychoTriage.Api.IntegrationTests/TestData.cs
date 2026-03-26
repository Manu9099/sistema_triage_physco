namespace PsychoTriage.Api.IntegrationTests;

internal static class TestData
{
    public static object ValidRequest(
        int age = 22,
        int[]? phq9 = null,
        int[]? gad7 = null,
        bool suicidalIdeation = false,
        bool selfHarmHistory = false,
        bool functionalImpairment = false,
        bool substanceUse = false,
        int socialSupportLevel = 5)
    {
        return new
        {
            age,
            phq9Answers = phq9 ?? new[] { 0, 0, 0, 0, 0, 0, 0, 0, 0 },
            gad7Answers = gad7 ?? new[] { 0, 0, 0, 0, 0, 0, 0 },
            suicidalIdeation,
            selfHarmHistory,
            functionalImpairment,
            substanceUse,
            socialSupportLevel
        };
    }
}