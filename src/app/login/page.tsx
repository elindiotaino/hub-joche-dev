import { LoginScreen } from "@/components/LoginScreen";
import { hasSupabaseAuthEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/";
  const initialError =
    typeof params.error === "string" && params.error.trim().length > 0 ? params.error : null;
  const initialMessage =
    typeof params.message === "string" && params.message.trim().length > 0 ? params.message : null;
  const isConfigured = hasSupabaseAuthEnv();

  if (isConfigured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect(nextPath);
    }
  }

  return (
    <LoginScreen
      isConfigured={isConfigured}
      nextPath={nextPath}
      initialError={initialError}
      initialMessage={initialMessage}
    />
  );
}
