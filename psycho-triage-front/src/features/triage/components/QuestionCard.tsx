import { answerLabels } from "../constants";

type Props = {
  index: number;
  question: string;
  value: number;
  name: string;
  onChange: (value: number) => void;
};

export default function QuestionCard({ index, question, value, name, onChange }: Props) {
  return (
    <div className="section-card">
      <p className="question-title">
        {index + 1}. {question}
      </p>

      <div className="radio-grid">
        {answerLabels.map((label, optionValue) => {
          const active = value === optionValue;

          return (
            <label
              key={label}
              className={`radio-pill ${active ? "active" : ""}`.trim()}
            >
              <input
                type="radio"
                name={name}
                checked={active}
                onChange={() => onChange(optionValue)}
              />
              {label}
            </label>
          );
        })}
      </div>
    </div>
  );
}