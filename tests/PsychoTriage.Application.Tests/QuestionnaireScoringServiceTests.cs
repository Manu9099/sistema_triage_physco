using PsychoTriage.Application.Services;

namespace PsychoTriage.Application.Tests;

public class QuestionnaireScoringServiceTests
{
    private readonly QuestionnaireScoringService _sut = new();

    [Fact]
    public void CalculatePhq9_ShouldReturnSum()
    {
        var answers = new List<int> { 1, 2, 0, 3, 1, 0, 2, 1, 1 };

        var result = _sut.CalculatePhq9(answers);

        Assert.Equal(11, result);
    }

    [Fact]
    public void CalculateGad7_ShouldReturnSum()
    {
        var answers = new List<int> { 2, 1, 0, 3, 1, 1, 0 };

        var result = _sut.CalculateGad7(answers);

        Assert.Equal(8, result);
    }
}