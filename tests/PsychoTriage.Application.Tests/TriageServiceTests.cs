using FluentValidation;
using PsychoTriage.Application.Services;
using PsychoTriage.Application.Tests.Support;
using PsychoTriage.Application.Validators;

namespace PsychoTriage.Application.Tests;

public class TriageServiceTests
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
    public async Task EvaluateAsync_WhenSuicidalIdeationIsTrue_ShouldReturnCriticalAndSave()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);
        var request = TestData.ValidRequest(suicidalIdeation: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Crítico", result.UrgencyLevel);
        Assert.Equal("Alto riesgo", result.ClinicalProfile);
        Assert.Equal("Evaluación inmediata y activación de protocolo de seguridad.", result.Recommendation);

        var saved = Assert.Single(repo.SavedItems);
        Assert.True(saved.SuicidalIdeation);
        Assert.Contains("ideación suicida=sí", saved.Summary);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSelfHarmAndFunctionalImpairment_ShouldReturnUrgent()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);
        var request = TestData.ValidRequest(
            selfHarmHistory: true,
            functionalImpairment: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Urgente", result.UrgencyLevel);
        Assert.Equal("Alto riesgo", result.ClinicalProfile);
        Assert.Equal("Atención prioritaria en menos de 24 horas.", result.Recommendation);
        Assert.Single(repo.SavedItems);
    }

    [Fact]
    public async Task EvaluateAsync_WhenScoreIsTwentyFiveOrMore_ShouldReturnUrgent()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 2, 2, 2, 1, 1, 1, 1, 1 },   // 13
            gad7: new[] { 2, 2, 1, 1, 1, 1, 1 },         // 9
            substanceUse: true,                          // +3
            socialSupportLevel: 2);                      // +3
                                                           // total = 28

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Urgente", result.UrgencyLevel);
        Assert.Equal("Depresión", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenScoreIsBetween15And24_ShouldReturnPriority()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 1, 1, 1, 0, 0 },   // 7
            gad7: new[] { 1, 1, 1, 1, 1, 1, 0 },         // 6
            socialSupportLevel: 3);                      // +3
                                                           // total = 16

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
        Assert.Equal("Depresión", result.ClinicalProfile);
        Assert.Equal("Programar evaluación en 48-72 horas.", result.Recommendation);
    }

    [Fact]
    public async Task EvaluateAsync_WhenScoreIsBelow15_ShouldReturnRoutine()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 0, 0, 0, 0, 0, 0 },   // 3
            gad7: new[] { 1, 1, 1, 1, 0, 0, 0 });        // 4

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Rutinario", result.UrgencyLevel);
        Assert.Equal("Ansiedad", result.ClinicalProfile);
        Assert.Equal("Seguimiento rutinario y reevaluación clínica.", result.Recommendation);
    }

    [Fact]
    public async Task EvaluateAsync_WhenSubstanceUseWithLowScores_ShouldReturnSubstanceRelatedProfile()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 1, 1, 1, 1, 0, 0, 0, 0, 0 },   // 4
            gad7: new[] { 1, 1, 1, 1, 1, 0, 0 },         // 5
            substanceUse: true);

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Rutinario", result.UrgencyLevel);
        Assert.Equal("Relacionado con sustancias", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenBothScoresAreTenOrMore_ShouldReturnMixedProfile()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);

        var request = TestData.ValidRequest(
            phq9: new[] { 2, 2, 1, 1, 1, 1, 1, 1, 0 },   // 10
            gad7: new[] { 2, 2, 2, 1, 1, 1, 1 });        // 10

        var result = await sut.EvaluateAsync(request);

        Assert.Equal("Prioridad", result.UrgencyLevel);
        Assert.Equal("Ansioso-depresivo mixto", result.ClinicalProfile);
    }

    [Fact]
    public async Task EvaluateAsync_WhenRequestIsInvalid_ShouldThrowAndNotSave()
    {
        var repo = new FakeTriageEvaluationRepository();
        var sut = CreateSut(repo);
        var request = TestData.ValidRequest(age: 3);

        await Assert.ThrowsAsync<ValidationException>(() => sut.EvaluateAsync(request));

        Assert.Empty(repo.SavedItems);
    }
}