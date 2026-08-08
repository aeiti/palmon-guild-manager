import { AppShell } from "@/components/layout/app-shell";

/** Member-facing pages render inside the nav shell. */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
