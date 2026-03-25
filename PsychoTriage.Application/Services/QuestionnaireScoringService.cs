namespace PsychoTriage.Application.Services;

public class QuestionnaireScoringService : IQuestionnaireScoringService
{
    public int CalculatePhq9(List<int> answers)
    {
        return answers.Sum();
    }

    public int CalculateGad7(List<int> answers)
    {
        return answers.Sum();
    }
}