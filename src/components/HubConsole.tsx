"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { VercelStatus } from "@/components/VercelStatus";
import { HUB_TOOLS } from "@/lib/hub/tools";
import type { HubDashboardData } from "@/lib/hub/types";

type HubConsoleProps = {
  initialData: HubDashboardData;
};

type AdminFormCardProps = {
  eyebrow: string;
  title: string;
  copy: string;
  children: ReactNode;
};

function AdminFormCard({ eyebrow, title, copy, children }: AdminFormCardProps) {
  return (
    <article className="panel">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="caption">{copy}</p>
      <div style={{ marginTop: "1rem" }}>{children}</div>
    </article>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}

export function HubConsole({ initialData }: HubConsoleProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({ profileId: "", role: "user" });
  const [orgForm, setOrgForm] = useState({ name: "", slug: "", notes: "" });
  const [memberForm, setMemberForm] = useState({
    organizationId: "",
    profileId: "",
    membershipRole: "member",
  });
  const [inviteForm, setInviteForm] = useState({
    organizationId: "",
    email: "",
    membershipRole: "member",
  });
  const [userToolForm, setUserToolForm] = useState({
    profileId: "",
    toolKey: HUB_TOOLS[0]?.key ?? "funding-ops",
  });
  const [orgToolForm, setOrgToolForm] = useState({
    organizationId: "",
    toolKey: HUB_TOOLS[0]?.key ?? "funding-ops",
  });

  async function postAction(action: string, payload: Record<string, string>) {
    setPending(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Action failed.");
      }

      setMessage(result.message ?? "Saved. Refresh to see the latest access state.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
    } finally {
      setPending(null);
    }
  }

  const management = initialData.management;
  const roleClass = `role-pill role-pill--${initialData.userSummary.role}`;

  const summaryStats = useMemo(
    () => [
      {
        label: "Accessible tools",
        value: String(initialData.accessibleTools.length),
      },
      {
        label: "Organizations",
        value: String(initialData.organizations.length),
      },
      {
        label: "Current role",
        value: initialData.userSummary.role,
      },
      {
        label: "Last sign-in",
        value: formatDate(initialData.userSummary.lastSignInAt),
      },
    ],
    [
      initialData.accessibleTools.length,
      initialData.organizations.length,
      initialData.userSummary.lastSignInAt,
      initialData.userSummary.role,
    ],
  );

  const adminSummary =
    management &&
    [
      { label: "Users", value: String(management.users.length) },
      { label: "Organizations", value: String(management.organizations.length) },
      { label: "Invites", value: String(management.invites.length) },
      {
        label: "Tool grants",
        value: String(
          management.userToolGrants.length + management.organizationToolGrants.length,
        ),
      },
    ];

  return (
    <main className="shell">
      <div className="dashboard-stack">
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Authenticated Hub</p>
              <h1>
                Welcome back,{" "}
                {initialData.userSummary.displayName ||
                  initialData.userSummary.email ||
                  "operator"}
                .
              </h1>
              <p className="lede">
                This console is the shared access layer for internal tools, organization
                membership, deployment visibility, and role-based administration.
              </p>

              <div className="actions">
                <a className="primary-link" href="#tools">
                  Review tools
                </a>
                <a className="secondary-link" href="#organizations">
                  View organizations
                </a>
                {management ? (
                  <a className="ghost-link" href="#admin">
                    Open admin controls
                  </a>
                ) : null}
              </div>
            </div>

            <div className="cluster">
              <div className="hero-stat-grid">
                <div className="hero-stat">
                  <strong>{initialData.userSummary.primaryProvider ?? "oauth"}</strong>
                  <span>Primary provider</span>
                </div>
                <div className="hero-stat">
                  <strong>{initialData.userSummary.email ?? "No email"}</strong>
                  <span>Resolved identity</span>
                </div>
                <div className="hero-stat">
                  <strong>{formatDate(initialData.userSummary.createdAt)}</strong>
                  <span>Account created</span>
                </div>
                <div className="hero-stat">
                  <strong>{initialData.accessibleTools.length}</strong>
                  <span>Tools unlocked</span>
                </div>
              </div>

              <div className="surface">
                <p className="section-kicker">Access posture</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginTop: "0.7rem",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>Role-based console access</h2>
                    <p className="caption" style={{ marginTop: "0.55rem" }}>
                      Tool visibility comes from direct grants, organization access, and
                      admin-only surfaces.
                    </p>
                  </div>
                  <span className={roleClass}>{initialData.userSummary.role}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {message ? <p className="notice success">{message}</p> : null}
        {error ? <p className="notice error">{error}</p> : null}

        <section className="dashboard-grid">
          <div className="cluster">
            <section className="surface">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Session Snapshot</p>
                  <h2>Current operator context</h2>
                </div>
                <span className={roleClass}>{initialData.userSummary.role}</span>
              </div>

              <div className="stat-grid">
                {summaryStats.map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="section" id="tools">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Tool Access</p>
                  <h2>Apps unlocked for this session</h2>
                  <p>
                    Each tool keeps its own repo and deployment. The hub decides what
                    appears for the signed-in user.
                  </p>
                </div>
              </div>

              <div className="tool-grid">
                {initialData.accessibleTools.length === 0 ? (
                  <article className="card tool-card">
                    <div className="tool-card__head">
                      <div className="tool-card__icon">!</div>
                      <span className="status-pill status-pill--planned">No access</span>
                    </div>
                    <div>
                      <h2>No tools assigned yet.</h2>
                      <p>
                        Ask an admin or manager to grant access directly or through an
                        organization.
                      </p>
                    </div>
                  </article>
                ) : (
                  initialData.accessibleTools.map((tool) => (
                    <article className="card tool-card" key={tool.key}>
                      <div className="tool-card__head">
                        <div className="tool-card__icon">{tool.name.slice(0, 1)}</div>
                        <span className={`status-pill status-pill--${tool.status}`}>
                          {tool.status}
                        </span>
                      </div>

                      <div>
                        <h2>{tool.name}</h2>
                        <p>{tool.description}</p>
                      </div>

                      <div className="list-meta">
                        <span className="meta-pill">{tool.adminOnly ? "Admin only" : "Shared access"}</span>
                        <span className="meta-pill mono">{tool.key}</span>
                      </div>

                      <div className="actions">
                        <a className="primary-link" href={tool.href}>
                          Open tool
                        </a>
                        <a className="secondary-link" href={tool.repo} target="_blank" rel="noreferrer">
                          View repo
                        </a>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="cluster" id="organizations">
            <section className="surface">
              <div className="section-head">
                <div>
                  <p className="section-kicker">Memberships</p>
                  <h2>Organization access</h2>
                </div>
              </div>

              <div className="list">
                {initialData.organizations.length === 0 ? (
                  <div className="list-item">
                    <strong>No organizations yet</strong>
                    <p>Your account has not been attached to any organization.</p>
                  </div>
                ) : (
                  initialData.organizations.map((organization) => (
                    <div className="list-item" key={organization.organization_id}>
                      <strong>{organization.name}</strong>
                      <p className="mono">{organization.slug}</p>
                      <div className="list-meta">
                        <span className="meta-pill">{organization.membershipRole}</span>
                        <span className="meta-pill">{formatDate(organization.created_at)}</span>
                      </div>
                      <p>{organization.notes ?? "No notes have been attached to this organization yet."}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {management ? (
              <section className="surface">
                <div className="section-head">
                  <div>
                    <p className="section-kicker">Management Reach</p>
                    <h2>Operational scope</h2>
                  </div>
                </div>
                <div className="stat-grid">
                  {adminSummary?.map((stat) => (
                    <div className="stat-card" key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>

        {initialData.userSummary.role === "admin" && initialData.vercelProjects ? (
          <section className="section">
            <VercelStatus projects={initialData.vercelProjects} />
          </section>
        ) : null}

        {management ? (
          <section className="section" id="admin">
            <div className="section-head">
              <div>
                <p className="section-kicker">Admin Controls</p>
                <h2>Manage people, orgs, and grants</h2>
                <p>
                  These actions update the shared control plane that decides access
                  across the hub ecosystem.
                </p>
              </div>
            </div>

            <div className="admin-grid">
              <AdminFormCard
                eyebrow="User Roles"
                title="Set a global role"
                copy="Promote a user to manager or move them back to the standard user role."
              >
                <form
                  className="form-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void postAction("set-user-role", roleForm);
                  }}
                >
                  <label>
                    <span>User</span>
                    <select
                      value={roleForm.profileId}
                      onChange={(event) =>
                        setRoleForm((current) => ({ ...current, profileId: event.target.value }))
                      }
                    >
                      <option value="">Select user</option>
                      {management.users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName || user.email || user.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Role</span>
                    <select
                      value={roleForm.role}
                      onChange={(event) =>
                        setRoleForm((current) => ({ ...current, role: event.target.value }))
                      }
                    >
                      <option value="user">user</option>
                      <option value="manager">manager</option>
                    </select>
                  </label>
                  <button type="submit" disabled={pending === "set-user-role"}>
                    Save role
                  </button>
                </form>
              </AdminFormCard>

              <AdminFormCard
                eyebrow="Organization"
                title="Create a new organization"
                copy="Define a company or client space that can receive members, invites, and tool grants."
              >
                <form
                  className="form-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void postAction("create-organization", orgForm);
                  }}
                >
                  <label>
                    <span>Name</span>
                    <input
                      value={orgForm.name}
                      onChange={(event) =>
                        setOrgForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <span>Slug</span>
                    <input
                      value={orgForm.slug}
                      onChange={(event) =>
                        setOrgForm((current) => ({ ...current, slug: event.target.value }))
                      }
                    />
                  </label>
                  <label className="full">
                    <span>Notes</span>
                    <textarea
                      rows={3}
                      value={orgForm.notes}
                      onChange={(event) =>
                        setOrgForm((current) => ({ ...current, notes: event.target.value }))
                      }
                    />
                  </label>
                  <button type="submit" disabled={pending === "create-organization"}>
                    Create organization
                  </button>
                </form>
              </AdminFormCard>

              <AdminFormCard
                eyebrow="Memberships"
                title="Attach existing users"
                copy="Add a known user to an organization and define the role they should hold there."
              >
                <form
                  className="form-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void postAction("assign-organization-member", memberForm);
                  }}
                >
                  <label>
                    <span>Organization</span>
                    <select
                      value={memberForm.organizationId}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          organizationId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select organization</option>
                      {management.organizations.map((organization) => (
                        <option
                          key={organization.organization_id}
                          value={organization.organization_id}
                        >
                          {organization.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>User</span>
                    <select
                      value={memberForm.profileId}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          profileId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select user</option>
                      {management.users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName || user.email || user.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="full">
                    <span>Membership role</span>
                    <select
                      value={memberForm.membershipRole}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          membershipRole: event.target.value,
                        }))
                      }
                    >
                      <option value="member">member</option>
                      <option value="manager">manager</option>
                    </select>
                  </label>
                  <button type="submit" disabled={pending === "assign-organization-member"}>
                    Assign member
                  </button>
                </form>
              </AdminFormCard>

              <AdminFormCard
                eyebrow="Invites"
                title="Invite by email"
                copy="Queue a membership invitation before the user has signed in."
              >
                <form
                  className="form-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void postAction("invite-organization-member", inviteForm);
                  }}
                >
                  <label>
                    <span>Organization</span>
                    <select
                      value={inviteForm.organizationId}
                      onChange={(event) =>
                        setInviteForm((current) => ({
                          ...current,
                          organizationId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select organization</option>
                      {management.organizations.map((organization) => (
                        <option
                          key={organization.organization_id}
                          value={organization.organization_id}
                        >
                          {organization.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(event) =>
                        setInviteForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="full">
                    <span>Membership role</span>
                    <select
                      value={inviteForm.membershipRole}
                      onChange={(event) =>
                        setInviteForm((current) => ({
                          ...current,
                          membershipRole: event.target.value,
                        }))
                      }
                    >
                      <option value="member">member</option>
                      <option value="manager">manager</option>
                    </select>
                  </label>
                  <button type="submit" disabled={pending === "invite-organization-member"}>
                    Create invite
                  </button>
                </form>
              </AdminFormCard>

              <AdminFormCard
                eyebrow="Direct Access"
                title="Grant a tool to a user"
                copy="Use this for exceptions or high-trust access that should bypass organization membership."
              >
                <form
                  className="form-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void postAction("grant-user-tool", userToolForm);
                  }}
                >
                  <label>
                    <span>User</span>
                    <select
                      value={userToolForm.profileId}
                      onChange={(event) =>
                        setUserToolForm((current) => ({
                          ...current,
                          profileId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select user</option>
                      {management.users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName || user.email || user.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Tool</span>
                    <select
                      value={userToolForm.toolKey}
                      onChange={(event) =>
                        setUserToolForm((current) => ({
                          ...current,
                          toolKey: event.target.value,
                        }))
                      }
                    >
                      {HUB_TOOLS.map((tool) => (
                        <option key={tool.key} value={tool.key}>
                          {tool.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" disabled={pending === "grant-user-tool"}>
                    Grant user access
                  </button>
                </form>
              </AdminFormCard>

              <AdminFormCard
                eyebrow="Organization Access"
                title="Grant a tool to an organization"
                copy="Best for scaling access across teams without issuing individual grants."
              >
                <form
                  className="form-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void postAction("grant-organization-tool", orgToolForm);
                  }}
                >
                  <label>
                    <span>Organization</span>
                    <select
                      value={orgToolForm.organizationId}
                      onChange={(event) =>
                        setOrgToolForm((current) => ({
                          ...current,
                          organizationId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select organization</option>
                      {management.organizations.map((organization) => (
                        <option
                          key={organization.organization_id}
                          value={organization.organization_id}
                        >
                          {organization.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Tool</span>
                    <select
                      value={orgToolForm.toolKey}
                      onChange={(event) =>
                        setOrgToolForm((current) => ({
                          ...current,
                          toolKey: event.target.value,
                        }))
                      }
                    >
                      {HUB_TOOLS.map((tool) => (
                        <option key={tool.key} value={tool.key}>
                          {tool.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" disabled={pending === "grant-organization-tool"}>
                    Grant organization access
                  </button>
                </form>
              </AdminFormCard>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
