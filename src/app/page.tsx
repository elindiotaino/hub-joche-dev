import { redirect } from "next/navigation";

import { HubConsole } from "@/components/HubConsole";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentHubDashboard } from "@/lib/hub/queries";
import { hasSupabaseAuthEnv } from "@/lib/supabase/env";

export default function HomePage() {
  if (!hasSupabaseAuthEnv()) {
    redirect("/login");
  }

  return <ProtectedHomePage />;
}

async function ProtectedHomePage() {
  const dashboard = await getCurrentHubDashboard();

  if (!dashboard) {
    redirect("/login?next=/");
  }

  return (
    <>
      <SiteHeader />
      <HubConsole initialData={dashboard} />
    </>
  );
}
