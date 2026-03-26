using FluentValidation;
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
    public async Task EvaluateAsync_WhenSuicidalIdeationIsTrue_ShouldReturnCritical()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 0, 0, 0, 0, 0, 0, 0, 0, 0 },
            gad7: new[] { 0, 0, 0, 0, 0, 0, 0 },
            suicidalIdeation: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Crítico", result.UrgencyLevel);
        Assert.Equal("Alto riesgo", result.ClinicalProfile);
        Assert.Contains("ideación suicida=sí", result.Summary);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSelfHarmHistoryAndFunctionalImpairment_ShouldReturnUrgent()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            selfHarmHistory: true,
            functionalImpairment: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Urgente", result.UrgencyLevel);
        Assert.Equal("Alto riesgo", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenPhq9IsTwentyOrMore_ShouldReturnUrgent()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 3, 3, 2, 2, 2, 2, 2, 2, 2 }, // 20
            gad7: new[] { 0, 0, 0, 0, 0, 0, 0 });

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Urgente", result.UrgencyLevel);
        Assert.Equal("Depresión", result.ClinicalProfile);
        Assert.Contains("PHQ-9=20", result.Summary);
    }

    [Fact]
    public async Task EvaluateAsync_WhenPhq9IsFifteenWithoutFunctionalImpairment_ShouldReturnPriority()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 2, 2, 2, 2, 2, 1, 1, 1 }, // 15
            gad7: new[] { 0, 0, 0, 0, 0, 0, 0 },
            functionalImpairment: false);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
        Assert.Equal("Depresión", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenGad7IsFifteenWithFunctionalImpairment_ShouldReturnUrgent()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 0, 0, 0, 0, 0, 0, 0, 0, 0 },
            gad7: new[] { 3, 2, 2, 2, 2, 2, 2 }, // 15
            functionalImpairment: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Urgente", result.UrgencyLevel);
        Assert.Equal("Ansiedad", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenModerateSymptomsAndFunctionalImpairment_ShouldReturnPriority()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 1, 1, 1, 1, 1, 1, 1, 1 }, // 10
            gad7: new[] { 0, 0, 0, 0, 0, 0, 0 },
            functionalImpairment: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
        Assert.Equal("Depresión", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenModerateSymptomsAndLowSocialSupport_ShouldReturnPriority()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 1, 1, 1, 1, 1, 1, 1, 1 }, // 10
            gad7: new[] { 0, 0, 0, 0, 0, 0, 0 },
            socialSupportLevel: 2);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
        Assert.Equal("Depresión", result.ClinicalProfile);
        Assert.Contains("soporte social=bajo", result.Summary);
    }

    [Fact]
    public async Task EvaluateAsync_WhenModerateSymptomsAndSubstanceUse_ShouldReturnPriority()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 0, 0, 0, 0, 0, 0, 0, 0, 0 },
            gad7: new[] { 2, 1, 1, 1, 1, 1, 3 }, // 10
            substanceUse: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
        Assert.Equal("Ansiedad", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenBothPhq9AndGad7AreTenOrMore_ShouldReturnMixedProfile()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 1, 1, 1, 1, 1, 1, 1, 1 }, // 10
            gad7: new[] { 2, 1, 1, 1, 1, 2, 2 });      // 10

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
        Assert.Equal("Ansioso-depresivo mixto", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSymptomsAreMildAndNoRedFlags_ShouldReturnRoutine()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 0, 0, 0, 0, 0, 0 }, // 3
            gad7: new[] { 1, 1, 1, 1, 0, 0, 0 });      // 4

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Rutinario", result.UrgencyLevel);
    }

    [Fact]
    public async Task EvaluateAsync_WhenRequestIsInvalid_ShouldThrowValidationException()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(age: 3);

        await Assert.ThrowsAsync<ValidationException>(() => sut.EvaluateAsync(request));
        Assert.Empty(repo.SavedItems);
    }
}