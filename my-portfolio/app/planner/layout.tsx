import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planner | Becoming",
  description: "A private daily planner and goal-anchoring system.",
  robots: { index: false, follow: false },
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
