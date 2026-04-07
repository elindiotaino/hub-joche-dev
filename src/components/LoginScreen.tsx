"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginScreenProps = {
  nextPath: string;
  isConfigured: boolean;
};

export function LoginScreen({ nextPath, isConfigured }: LoginScreenProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    if (!isConfigured) {
      setError("Supabase auth is not configured.");
      return;
    }

    setPending(true);
    setError(null);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);
    callbackUrl.searchParams.set("flow", "google-oauth");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
    }
  }

  return (
    <main className="shell auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Secure Access</p>
        <h1>Log in to enter the Hub.</h1>
        <p className="lede">
          Google sign-in is required before opening any tool. Your role and organization memberships decide what you can see.
        </p>
        <button type="button" onClick={handleGoogleSignIn} disabled={pending}>
          {pending ? "Redirecting..." : "Continue with Google"}
        </button>
        {error ? <p className="notice error">{error}</p> : null}
      </section>
    </main>
  );
}
