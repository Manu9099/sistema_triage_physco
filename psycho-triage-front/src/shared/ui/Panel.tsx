import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Panel({ children, className = "" }: Props) {
  return <section className={`panel ${className}`.trim()}>{children}</section>;
}