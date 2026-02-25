import type { ReactNode } from "react";
import "keen-slider/keen-slider.min.css";

export default function CartLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
