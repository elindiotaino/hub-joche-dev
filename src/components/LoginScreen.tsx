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
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={pending}
          className="google-login-button"
        >
          <span className="google-login-button__icon" aria-hidden="true">
            <svg viewBox="0 0 18 18" width="18" height="18">
              <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7968 2.7164v2.2582h2.9086c1.7018-1.5664 2.6846-3.8741 2.6846-6.6155Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1791l-2.9086-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5827-5.0364-3.7091H.9573v2.3318A8.9987 8.9987 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M3.9636 10.7127A5.4109 5.4109 0 0 1 3.6818 9c0-.5959.1023-1.1759.2818-1.7127V4.9555H.9573A8.9982 8.9982 0 0 0 0 9c0 1.4518.3482 2.8268.9573 4.0445l3.0063-2.3318Z"/>
              <path fill="#EA4335" d="M9 3.5782c1.3214 0 2.5077.4541 3.44 1.3459l2.5818-2.5818C13.4632.8918 11.43 0 9 0A8.9987 8.9987 0 0 0 .9573 4.9555l3.0063 2.3318C4.6718 5.1609 6.6559 3.5782 9 3.5782Z"/>
            </svg>
          </span>
          <span>{pending ? "Redirecting..." : "Sign in with Google"}</span>
        </button>
        {error ? <p className="notice error">{error}</p> : null}
      </section>
      <style jsx>{`
        .google-login-button {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.9rem;
          min-height: 3.5rem;
          padding: 0.9rem 1.25rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(240, 244, 249, 0.94));
          color: #0f172a;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.22);
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }

        .google-login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 22px 56px rgba(15, 23, 42, 0.28);
        }

        .google-login-button:disabled {
          opacity: 0.72;
          cursor: wait;
        }

        .google-login-button__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          background: white;
          box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
        }
      `}</style>
    </main>
  );
}
