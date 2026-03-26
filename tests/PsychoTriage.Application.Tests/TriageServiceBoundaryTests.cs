using PsychoTriage.Application.Services;
using PsychoTriage.Application.Tests.Support;
using PsychoTriage.Application.Validators;

namespace PsychoTriage.Application.Tests;

public class TriageServiceBoundaryTests
{
    private static TriageService CreateSut(FakeTriageEvaluationRepository repo)
    {
        return new TriageService(
            new TriageRequestValidator(),
            new TriageQueryParametersValidator(),
            new QuestionnaireScoringService(),
            repo);
    }

    [Fact]
    public async Task EvaluateAsync_WhenComputedScoreIsExactly14_ShouldReturnRoutine()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 },   // 7
            gad7: new[] { 1, 1, 1, 1, 1, 1, 0 },         // 6
            socialSupportLevel: 4,                       // +0
            substanceUse: false,
            functionalImpairment: false);               // total 13? no, 7+6=13

        request.Gad7Answers = new[] { 1, 1, 1, 1, 1, 1, 1 }.ToList(); // 7
        // total = 14

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Rutinario", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenComputedScoreIsExactly15_ShouldReturnPriority()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 },   // 7
            gad7: new[] { 1, 1, 1, 1, 1, 1, 1 },         // 7
            socialSupportLevel: 3);                      // +3 => total 17? no

        request.Gad7Answers = new[] { 1, 1, 1, 1, 0, 0, 0 }.ToList(); // 4
        // 7 + 4 + 3 = 14? no

        request.Phq9Answers = new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 }.ToList(); // 7
        request.Gad7Answers = new[] { 1, 1, 1, 1, 1, 0, 0 }.ToList();       // 5
        request.SocialSupportLevel = 3;                                      // +3
        // total = 15

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenComputedScoreIsExactly24_ShouldReturnPriority()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 2, 1, 1, 1, 1, 1, 1, 1 },   // 11
            gad7: new[] { 2, 2, 2, 1, 1, 1, 1 },         // 10
            socialSupportLevel: 4,
            substanceUse: true);                         // +3 => total 24

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenComputedScoreIsExactly25_ShouldReturnUrgent()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 2, 2, 1, 1, 1, 1, 1, 1 },   // 12
            gad7: new[] { 2, 2, 2, 1, 1, 1, 1 },         // 10
            socialSupportLevel: 4,
            substanceUse: true);                         // +3 => total 25

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Urgente", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSocialSupportIsExactly3_ShouldAddRiskBonus()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 },   // 7
            gad7: new[] { 1, 1, 1, 1, 1, 0, 0 },         // 5
            socialSupportLevel: 3);                      // +3 => total 15

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSocialSupportIsExactly4_ShouldNotAddRiskBonus()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 },   // 7
            gad7: new[] { 1, 1, 1, 1, 1, 0, 0 },         // 5
            socialSupportLevel: 4);                      // +0 => total 12

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Rutinario", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenFunctionalImpairmentIsTrue_ShouldAddFourPoints()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 },   // 7
            gad7: new[] { 1, 1, 1, 1, 1, 0, 0 },         // 5
            functionalImpairment: true,
            socialSupportLevel: 4);                      // +4 => total 16

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSuicidalIdeationIsTrue_ShouldOverrideLowScoreAndReturnCritical()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 0, 0, 0, 0, 0, 0, 0, 0, 0 },
            gad7: new[] { 0, 0, 0, 0, 0, 0, 0 },
            suicidalIdeation: true,
            socialSupportLevel: 10);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Crítico", result.UrgencyLevel);
        Assert.Equal("Alto riesgo", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSelfHarmHistoryAndFunctionalImpairmentAreTrue_ShouldOverrideLowScoreAndReturnUrgent()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 0, 0, 0, 0, 0, 0, 0, 0, 0 },
            gad7: new[] { 0, 0, 0, 0, 0, 0, 0 },
            selfHarmHistory: true,
            functionalImpairment: true,
            socialSupportLevel: 10);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Urgente", result.UrgencyLevel);
        Assert.Equal("Alto riesgo", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_Summary_ShouldContainExpectedFieldsOnly()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 1, 1 },   // 9
            gad7: new[] { 1, 1, 1, 1, 1, 1, 1 },         // 7
            functionalImpairment: true,
            suicidalIdeation: false,
            selfHarmHistory: true,
            substanceUse: true,
            socialSupportLevel: 2);

        var result = await sut.EvaluateAsync(request);

        Assert.Contains("PHQ-9=9", result.Summary);
        Assert.Contains("GAD-7=7", result.Summary);
        Assert.Contains("deterioro funcional=sí", result.Summary);
        Assert.Contains("ideación suicida=no", result.Summary);

        Assert.DoesNotContain("autoles", result.Summary, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("sustanc", result.Summary, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("soporte", result.Summary, StringComparison.OrdinalIgnoreCase);
    }
}