import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

export default function Field({ label, children }: Props) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}