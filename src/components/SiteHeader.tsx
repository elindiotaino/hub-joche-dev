"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "Tool Grid", href: "#tools" },
  { label: "Organizations", href: "#organizations" },
  { label: "Admin", href: "#admin" },
  { label: "Funding Ops", href: "/funding-ops" },
  { label: "Joche.dev", href: "https://joche.dev", external: true },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="brand" href="/">
          <span className="brand__mark">H</span>
          <span className="brand__copy">
            <strong>Hub Joche Dev</strong>
            <span>Operations Console</span>
          </span>
        </Link>

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
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-panel${mobileOpen ? " mobile-panel--open" : ""}`}>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
