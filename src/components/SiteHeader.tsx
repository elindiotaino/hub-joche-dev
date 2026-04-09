"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseAuthEnv } from "@/lib/supabase/env";
import {
  getResolvedUserEmail,
  getUserAvatarUrl,
  getUserDisplayName,
} from "@/lib/supabase/user";

const navItems = [
  { label: "Tool Grid", href: "#tools" },
  { label: "Organizations", href: "#organizations" },
  { label: "Admin", href: "#admin" },
  { label: "Funding Ops", href: "/funding-ops" },
  { label: "Joche.dev", href: "https://joche.dev", external: true },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const accountToggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!hasSupabaseAuthEnv()) {
      return;
    }

    let active = true;
    const supabase = createSupabaseBrowserClient();

    async function syncUser() {
      const {
        data: { user: nextUser },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      setUser(nextUser);
    }

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncUser();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const accountLabel = getUserDisplayName(user);
  const accountEmail = getResolvedUserEmail(user);
  const accountAvatarUrl = getUserAvatarUrl(user);
  const accountMenuItems = [
    { label: "Hub Home", href: "/" },
    { label: "Funding Ops", href: "/funding-ops" },
    { label: "Joche.dev", href: "https://joche.dev", external: true },
  ];

  function closeMobile() {
    setMobileOpen(false);
    setAccountMenuOpen(false);
  }

  function closeAccountMenu() {
    setAccountMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {user ? (
            <div className="account-avatar-shell">
              <button
                type="button"
                className={`account-avatar-button${accountMenuOpen ? " account-avatar-button--open" : ""}`}
                aria-expanded={accountMenuOpen}
                aria-label={accountMenuOpen ? "Close account menu" : "Open account menu"}
                onClick={() => setAccountMenuOpen((current) => !current)}
                ref={accountToggleRef}
              >
                {accountAvatarUrl ? (
                  <img
                    src={accountAvatarUrl}
                    alt=""
                    className="account-avatar-image"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="account-avatar-fallback">
                    {accountLabel.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </button>
            </div>
          ) : null}

          <Link className="brand" href="/">
            <span className="brand__mark">H</span>
            <span className="brand__copy">
              <strong>Hub Joche Dev</strong>
              <span>Operations Console</span>
            </span>
          </Link>
        </div>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) =>
            item.external ? (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <button
          type="button"
          className="mobile-toggle"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((current) => !current)}
          ref={toggleRef}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-panel${mobileOpen ? " mobile-panel--open" : ""}`}>
        <nav className="mobile-nav" aria-label="Mobile navigation" ref={menuRef}>
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={closeMobile}
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} onClick={closeMobile}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      {user && accountMenuOpen ? (
        <div className="account-subnav" ref={accountMenuRef}>
          <div className="account-subnav__inner">
            <div className="account-summary">
              <div className="account-summary__avatar">
                {accountAvatarUrl ? (
                  <img
                    src={accountAvatarUrl}
                    alt=""
                    className="account-avatar-image"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="account-avatar-fallback">
                    {accountLabel.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="account-summary__copy">
                <strong>{accountLabel}</strong>
                <span>{accountEmail || "Signed in"}</span>
              </div>
            </div>

            <nav className="account-subnav__links" aria-label="Account navigation">
              {accountMenuItems.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-link"
                    onClick={closeAccountMenu}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="secondary-link"
                    onClick={closeAccountMenu}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <OutsideClickCloser
          onOutside={() => setMobileOpen(false)}
          menuRef={menuRef}
          toggleRef={toggleRef}
        />
      ) : null}
      {accountMenuOpen ? (
        <OutsideClickCloser
          onOutside={closeAccountMenu}
          menuRef={accountMenuRef}
          toggleRef={accountToggleRef}
        />
      ) : null}
    </header>
  );
}

function OutsideClickCloser({
  onOutside,
  menuRef,
  toggleRef,
}: {
  onOutside: () => void;
  menuRef: React.RefObject<HTMLElement | null>;
  toggleRef: React.RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      const menuElement = menuRef.current;
      const toggleElement = toggleRef.current;

      if (!target) {
        return;
      }

      if (menuElement && menuElement.contains(target)) {
        return;
      }

      if (toggleElement && toggleElement.contains(target)) {
        return;
      }

      onOutside();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, true);
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [menuRef, onOutside, toggleRef]);

  return null;
}
