"use client";

import { useState } from "react";

import { HUB_TOOLS } from "@/lib/hub/tools";
import type { HubDashboardData } from "@/lib/hub/types";

type HubConsoleProps = {
  initialData: HubDashboardData;
};

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
  const [userToolForm, setUserToolForm] = useState({ profileId: "", toolKey: "funding-ops" });
  const [orgToolForm, setOrgToolForm] = useState({ organizationId: "", toolKey: "funding-ops" });

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

      setMessage(result.message ?? "Saved. Refresh to view updated access.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
    } finally {
      setPending(null);
    }
  }

  const management = initialData.management;

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Authenticated Hub</p>
        <h1>Welcome back, {initialData.userSummary.displayName || initialData.userSummary.email || "user"}.</h1>
        <p className="lede">
          Your current role is <strong>{initialData.userSummary.role}</strong>. Tool visibility comes from direct grants and organization access.
        </p>
      </section>

      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      <section className="grid" id="tools">
        {initialData.accessibleTools.length === 0 ? (
          <article className="card">
            <p className="status">No Access Yet</p>
            <h2>No tools are currently assigned.</h2>
            <p>Ask an admin or manager to grant access directly or through an organization.</p>
          </article>
        ) : (
          initialData.accessibleTools.map((tool) => (
            <article className="card" key={tool.key}>
              <p className="status">{tool.status}</p>
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
              <div className="actions">
                <a className="primary-link" href={tool.href}>Open tool</a>
                <a className="secondary-link" href={tool.repo}>Repo</a>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="panel-list">
        <article className="panel">
          <p className="eyebrow">Organizations</p>
          <h2>Your memberships</h2>
          <div className="list">
            {initialData.organizations.length === 0 ? (
              <div className="empty">You are not assigned to any organizations yet.</div>
            ) : (
              initialData.organizations.map((organization) => (
                <div className="list-item" key={organization.organization_id}>
                  <strong>{organization.name}</strong>
                  <p>{organization.slug}</p>
                  <p>Role: {organization.membershipRole}</p>
                  <p>{organization.notes ?? "No notes."}</p>
                </div>
              ))
            )}
          </div>
        </article>

        {management ? (
          <>
            <article className="panel">
              <p className="eyebrow">User Roles</p>
              <h2>Assign global manager or user roles.</h2>
              <form className="form-grid" onSubmit={(event) => {
                event.preventDefault();
                void postAction("set-user-role", roleForm);
              }}>
                <label><span>User</span><select value={roleForm.profileId} onChange={(event) => setRoleForm((current) => ({ ...current, profileId: event.target.value }))}><option value="">Select user</option>{management.users.map((user) => <option key={user.id} value={user.id}>{user.displayName || user.email || user.id}</option>)}</select></label>
                <label><span>Role</span><select value={roleForm.role} onChange={(event) => setRoleForm((current) => ({ ...current, role: event.target.value }))}><option value="user">user</option><option value="manager">manager</option></select></label>
                <button type="submit" disabled={pending === "set-user-role"}>Save role</button>
              </form>
            </article>

            <article className="panel">
              <p className="eyebrow">Create Organization</p>
              <h2>Admins and managers can create organizations.</h2>
              <form className="form-grid" onSubmit={(event) => {
                event.preventDefault();
                void postAction("create-organization", orgForm);
              }}>
                <label><span>Name</span><input value={orgForm.name} onChange={(event) => setOrgForm((current) => ({ ...current, name: event.target.value }))} /></label>
                <label><span>Slug</span><input value={orgForm.slug} onChange={(event) => setOrgForm((current) => ({ ...current, slug: event.target.value }))} /></label>
                <label className="full"><span>Notes</span><textarea rows={3} value={orgForm.notes} onChange={(event) => setOrgForm((current) => ({ ...current, notes: event.target.value }))} /></label>
                <button type="submit" disabled={pending === "create-organization"}>Create organization</button>
              </form>
            </article>

            <article className="panel">
              <p className="eyebrow">Memberships</p>
              <h2>Add existing users to organizations.</h2>
              <form className="form-grid" onSubmit={(event) => {
                event.preventDefault();
                void postAction("assign-organization-member", memberForm);
              }}>
                <label><span>Organization</span><select value={memberForm.organizationId} onChange={(event) => setMemberForm((current) => ({ ...current, organizationId: event.target.value }))}><option value="">Select organization</option>{management.organizations.map((organization) => <option key={organization.organization_id} value={organization.organization_id}>{organization.name}</option>)}</select></label>
                <label><span>User</span><select value={memberForm.profileId} onChange={(event) => setMemberForm((current) => ({ ...current, profileId: event.target.value }))}><option value="">Select user</option>{management.users.map((user) => <option key={user.id} value={user.id}>{user.displayName || user.email || user.id}</option>)}</select></label>
                <label><span>Membership role</span><select value={memberForm.membershipRole} onChange={(event) => setMemberForm((current) => ({ ...current, membershipRole: event.target.value }))}><option value="member">member</option><option value="manager">manager</option></select></label>
                <button type="submit" disabled={pending === "assign-organization-member"}>Assign member</button>
              </form>
            </article>

            <article className="panel">
              <p className="eyebrow">Invites</p>
              <h2>Invite a user by email into an organization.</h2>
              <form className="form-grid" onSubmit={(event) => {
                event.preventDefault();
                void postAction("invite-organization-member", inviteForm);
              }}>
                <label><span>Organization</span><select value={inviteForm.organizationId} onChange={(event) => setInviteForm((current) => ({ ...current, organizationId: event.target.value }))}><option value="">Select organization</option>{management.organizations.map((organization) => <option key={organization.organization_id} value={organization.organization_id}>{organization.name}</option>)}</select></label>
                <label><span>Email</span><input type="email" value={inviteForm.email} onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))} /></label>
                <label><span>Membership role</span><select value={inviteForm.membershipRole} onChange={(event) => setInviteForm((current) => ({ ...current, membershipRole: event.target.value }))}><option value="member">member</option><option value="manager">manager</option></select></label>
                <button type="submit" disabled={pending === "invite-organization-member"}>Create invite</button>
              </form>
            </article>

            <article className="panel">
              <p className="eyebrow">Direct Tool Access</p>
              <h2>Grant a tool directly to a user.</h2>
              <form className="form-grid" onSubmit={(event) => {
                event.preventDefault();
                void postAction("grant-user-tool", userToolForm);
              }}>
                <label><span>User</span><select value={userToolForm.profileId} onChange={(event) => setUserToolForm((current) => ({ ...current, profileId: event.target.value }))}><option value="">Select user</option>{management.users.map((user) => <option key={user.id} value={user.id}>{user.displayName || user.email || user.id}</option>)}</select></label>
                <label><span>Tool</span><select value={userToolForm.toolKey} onChange={(event) => setUserToolForm((current) => ({ ...current, toolKey: event.target.value }))}>{HUB_TOOLS.map((tool) => <option key={tool.key} value={tool.key}>{tool.name}</option>)}</select></label>
                <button type="submit" disabled={pending === "grant-user-tool"}>Grant user access</button>
              </form>
            </article>

            <article className="panel">
              <p className="eyebrow">Organization Tool Access</p>
              <h2>Grant a tool to every user in an organization.</h2>
              <form className="form-grid" onSubmit={(event) => {
                event.preventDefault();
                void postAction("grant-organization-tool", orgToolForm);
              }}>
                <label><span>Organization</span><select value={orgToolForm.organizationId} onChange={(event) => setOrgToolForm((current) => ({ ...current, organizationId: event.target.value }))}><option value="">Select organization</option>{management.organizations.map((organization) => <option key={organization.organization_id} value={organization.organization_id}>{organization.name}</option>)}</select></label>
                <label><span>Tool</span><select value={orgToolForm.toolKey} onChange={(event) => setOrgToolForm((current) => ({ ...current, toolKey: event.target.value }))}>{HUB_TOOLS.map((tool) => <option key={tool.key} value={tool.key}>{tool.name}</option>)}</select></label>
                <button type="submit" disabled={pending === "grant-organization-tool"}>Grant organization access</button>
              </form>
            </article>
          </>
        ) : null}
      </section>
    </main>
  );
}
