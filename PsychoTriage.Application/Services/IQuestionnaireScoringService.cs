namespace PsychoTriage.Application.Services;

public interface IQuestionnaireScoringService
{
    int CalculatePhq9(List<int> answers);
    int CalculateGad7(List<int> answers);
}