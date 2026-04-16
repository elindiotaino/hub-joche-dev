"use client";

import { FormEvent, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginScreenProps = {
  nextPath: string;
  isConfigured: boolean;
  initialError?: string | null;
  initialMessage?: string | null;
};

export function LoginScreen({
  nextPath,
  isConfigured,
  initialError = null,
  initialMessage = null,
}: LoginScreenProps) {
  const [googlePending, setGooglePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [message, setMessage] = useState<string | null>(initialMessage);

  async function handleGoogleSignIn() {
    if (!isConfigured) {
      setError("Supabase auth is not configured.");
      return;
    }

    setGooglePending(true);
    setError(null);
    setMessage(null);

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
      setGooglePending(false);
    }
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfigured) {
      setError("Supabase auth is not configured.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setPasswordPending(true);
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPasswordPending(false);
      return;
    }

    window.location.assign(nextPath);
  }

  return (
    <main className="shell auth-shell">
      <div className="auth-layout">
        <section className="auth-card auth-card--primary">
          <p className="eyebrow">Secure Access Layer</p>
          <h1>Enter the hub that runs your tool stack.</h1>
          <p className="lede">
            Shared Supabase auth gates the workspace, role assignments, organization access,
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
              <strong>Shared auth</strong>
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

          {message ? (
            <p className="notice success" style={{ marginTop: "1rem" }}>
              {message}
            </p>
          ) : null}

          <form className="form-grid" style={{ marginTop: "1.5rem" }} onSubmit={handlePasswordSignIn}>
            <label className="full">
              <span>Pre-authorized email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={googlePending || passwordPending}
              />
            </label>
            <label className="full">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your account password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={googlePending || passwordPending}
              />
            </label>
            <button type="submit" disabled={googlePending || passwordPending}>
              {passwordPending ? "Signing in..." : "Sign in with email and password"}
            </button>
          </form>

          <p className="lede" style={{ marginTop: "1rem", fontSize: "0.95rem" }}>
            Use this path for pre-authorized accounts that already exist in the shared hub identity system.
          </p>

          <div className="button-row" style={{ marginTop: "1.25rem" }}>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googlePending || passwordPending}
              className="button-pill"
              style={{ width: "100%" }}
            >
              <span aria-hidden="true">G</span>
              <span>{googlePending ? "Redirecting..." : "Sign in with Google"}</span>
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
              <span>Pre-authorized email accounts and Google-linked accounts both resolve to the same shared control plane.</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
