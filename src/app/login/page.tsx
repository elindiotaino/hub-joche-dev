import { LoginScreen } from "@/components/LoginScreen";
import { hasSupabaseAuthEnv } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/";

  return <LoginScreen isConfigured={hasSupabaseAuthEnv()} nextPath={nextPath} />;
}
