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
      <div className="auth-layout">
        <section className="auth-card auth-card--primary">
          <p className="eyebrow">Secure Access Layer</p>
          <h1>Enter the hub that runs your tool stack.</h1>
          <p className="lede">
            Google sign-in gates the workspace, role assignments, organization access,
            and private operations surfaces behind one shared control plane.
          </p>

          <ul className="auth-feature-list">
            <li>
              <span className="check-dot" />
              <span>One identity across internal tools, grants, and organization memberships.</span>
            </li>
            <li>
              <span className="check-dot" />
              <span>Admin-only access stays separate from general members and managers.</span>
            </li>
            <li>
              <span className="check-dot" />
              <span>Each tool keeps its own repo and deployment, while access stays centralized here.</span>
            </li>
          </ul>

          <div className="metric-band">
            <div className="metric">
              <span>Identity model</span>
              <strong>Google OAuth</strong>
            </div>
            <div className="metric">
              <span>Scope</span>
              <strong>Hub-wide</strong>
            </div>
            <div className="metric">
              <span>Routing</span>
              <strong>Tool-first</strong>
            </div>
          </div>
        </section>

        <section className="auth-card auth-card--secondary">
          <p className="eyebrow">Log In</p>
          <h2
            style={{
              margin: "0.6rem 0 0.75rem",
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              letterSpacing: "-0.04em",
            }}
          >
            Continue into the operations console.
          </h2>
          <p className="lede">
            The next destination is <span className="mono">{nextPath}</span>.
          </p>

          <div className="button-row" style={{ marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={pending}
              className="button-pill"
              style={{ width: "100%" }}
            >
              <span aria-hidden="true">G</span>
              <span>{pending ? "Redirecting..." : "Sign in with Google"}</span>
            </button>
          </div>

          {!isConfigured ? (
            <p className="notice error" style={{ marginTop: "1rem" }}>
              Supabase auth is not configured.
            </p>
          ) : null}

          {error ? (
            <p className="notice error" style={{ marginTop: "1rem" }}>
              {error}
            </p>
          ) : null}

          <ul className="bullet-list" style={{ marginTop: "1.5rem" }}>
            <li>
              <span className="check-dot" />
              <span>Managers can organize people, grants, and invitations without exposing admin controls to everyone.</span>
            </li>
            <li>
              <span className="check-dot" />
              <span>Admins get deployment visibility, high-trust tools, and system-wide access from the same session.</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
