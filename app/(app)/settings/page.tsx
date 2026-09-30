import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SettingsView } from "./settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Appearance and account." />
      <SettingsView />
    </>
  );
}
