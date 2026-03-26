type Props = {
  index: number;
  active: boolean;
  done: boolean;
};

export default function StepBadge({ index, active, done }: Props) {
  const classes = ["step-badge"];
  if (active) classes.push("active");
  if (done) classes.push("done");

  return <div className={classes.join(" ")}>{done ? "✓" : index + 1}</div>;
}