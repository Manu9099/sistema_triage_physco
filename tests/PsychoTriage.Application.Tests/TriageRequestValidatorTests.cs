using PsychoTriage.Application.DTOs;
using PsychoTriage.Application.Tests.Support;
using PsychoTriage.Application.Validators;

namespace PsychoTriage.Application.Tests;

public class TriageRequestValidatorTests
{
    private readonly TriageRequestValidator _sut = new();

    [Fact]
    public void Validate_WhenRequestIsCorrect_ShouldBeValid()
    {
        var request = TestData.ValidRequest();

        var result = _sut.Validate(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WhenAgeIsOutOfRange_ShouldFail()
    {
        var request = TestData.ValidRequest(age: 4);

        var result = _sut.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(TriageRequestDto.Age));
    }

    [Fact]
    public void Validate_WhenPhq9DoesNotHaveNineAnswers_ShouldFail()
    {
        var request = TestData.ValidRequest(phq9: new[] { 0, 1, 2 });

        var result = _sut.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(TriageRequestDto.Phq9Answers));
    }

    [Fact]
    public void Validate_WhenGad7ContainsValueOutsideRange_ShouldFail()
    {
        var request = TestData.ValidRequest(gad7: new[] { 0, 1, 2, 3, 4, 0, 1 });

        var result = _sut.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.StartsWith(nameof(TriageRequestDto.Gad7Answers)));
    }

    [Fact]
    public void Validate_WhenSocialSupportIsOutOfRange_ShouldFail()
    {
        var request = TestData.ValidRequest(socialSupportLevel: 11);

        var result = _sut.Validate(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(TriageRequestDto.SocialSupportLevel));
    }
}