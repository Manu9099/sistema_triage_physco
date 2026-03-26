import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const base = "btn";
  const tone = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <button className={`${base} ${tone} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}