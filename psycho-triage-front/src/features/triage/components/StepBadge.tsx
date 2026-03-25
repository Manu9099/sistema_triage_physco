type Props = {
  index: number;
  active: boolean;
  done: boolean;
};

export default function StepBadge({ index, active, done }: Props) {
  const className = [
    "step-badge",
    active ? "active" : "",
    done ? "done" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}>{done ? "✓" : index + 1}</div>;
}