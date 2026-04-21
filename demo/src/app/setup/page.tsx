import { redirect } from "next/navigation";
import { loadSettings } from "../../lib/settings";
import InstallWizard from "../components/InstallWizard";

export const metadata = {
  title: "Atelier · Install",
  description: "Pick a template, set up your business, and launch in under two minutes.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ force?: string }>;
}) {
  const s = await loadSettings();
  const sp = await searchParams;
  if (s.onboarded && sp.force !== "1") redirect("/admin");
  return <InstallWizard />;
}
