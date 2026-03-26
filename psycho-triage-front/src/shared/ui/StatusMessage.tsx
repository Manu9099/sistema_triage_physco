type Props = {
  kind?: "error" | "info";
  message: string;
};

export default function StatusMessage({ kind = "info", message }: Props) {
  if (kind === "error") {
    return <div className="error-box">{message}</div>;
  }

  return <div className="info-box">{message}</div>;
}