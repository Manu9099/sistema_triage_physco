import QuestionCard from "../QuestionCard";

type Props = {
  title: string;
  score: number;
  questions: string[];
  values: number[];
  prefix: string;
  onChange: (index: number, value: number) => void;
};

export default function StepQuestionnaire({
  title,
  score,
  questions,
  values,
  prefix,
  onChange,
}: Props) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="history-header">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span className="tag">Puntaje: {score}</span>
      </div>

      <div className="question-list">
        {questions.map((question, index) => (
          <QuestionCard
            key={question}
            index={index}
            question={question}
            value={values[index]}
            name={`${prefix}-${index}`}
            onChange={(value) => onChange(index, value)}
          />
        ))}
      </div>
    </div>
  );
}