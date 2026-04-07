import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDisplayName, getResolvedUserEmail } from "@/lib/supabase/user";
import { isAdminEmail, type HubRole } from "@/lib/hub/roles";
import { HUB_TOOLS } from "@/lib/hub/tools";
import type {
  HubDashboardData,
  HubOrganization,
  HubOrganizationInvite,
  HubOrganizationMember,
  HubOrganizationToolGrant,
  HubUserSummary,
  HubUserToolGrant,
} from "@/lib/hub/types";

function isSchemaMissing(error: { code?: string; message?: string } | null) {
  return error?.code === "PGRST205" || error?.message?.includes("does not exist");
}

async function listUsers(): Promise<HubUserSummary[]> {
  const admin = getSupabaseAdminClient();
  const [{ data: listedUsers, error: usersError }, { data: roleRows, error: rolesError }] =
    await Promise.all([
      admin.auth.admin.listUsers(),
      admin.from("hub_user_roles").select("profile_id, role"),
    ]);

  if (usersError) {
    throw new Error(usersError.message);
  }

  if (rolesError && !isSchemaMissing(rolesError)) {
    throw new Error(rolesError.message);
  }

  const roleMap = new Map(
    ((roleRows ?? []) as Array<{ profile_id: string; role: HubRole }>).map((row) => [
      row.profile_id,
      row.role,
    ]),
  );

  return listedUsers.users.map((listedUser) => {
    const email = getResolvedUserEmail(listedUser);

    return {
      id: listedUser.id,
      email,
      displayName: getUserDisplayName(listedUser),
      primaryProvider:
        typeof listedUser.app_metadata?.provider === "string"
          ? listedUser.app_metadata.provider
          : null,
      createdAt: listedUser.created_at ?? null,
      lastSignInAt: listedUser.last_sign_in_at ?? null,
      role: isAdminEmail(email) ? "admin" : roleMap.get(listedUser.id) ?? "user",
    };
  });
}

export async function getCurrentHubDashboard(): Promise<HubDashboardData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const admin = getSupabaseAdminClient();
  const email = getResolvedUserEmail(user);

  const [roleResult, membershipsResult, organizationsResult, userToolResult, orgToolResult, inviteResult] =
    await Promise.all([
      admin.from("hub_user_roles").select("role").eq("profile_id", user.id).maybeSingle(),
      admin
        .from("hub_organization_members")
        .select("organization_id, profile_id, membership_role, created_at")
        .eq("profile_id", user.id),
      admin
        .from("hub_organizations")
        .select("organization_id, name, slug, notes, created_at, updated_at"),
      admin.from("hub_user_tool_access").select("profile_id, tool_key, created_at").eq("profile_id", user.id),
      admin.from("hub_organization_tool_access").select("organization_id, tool_key, created_at"),
      admin.from("hub_organization_invites").select("invite_id, organization_id, email, membership_role, status, created_at"),
    ]);

  if (roleResult.error && !isSchemaMissing(roleResult.error)) {
    throw new Error(roleResult.error.message);
  }
  if (membershipsResult.error && !isSchemaMissing(membershipsResult.error)) {
    throw new Error(membershipsResult.error.message);
  }
  if (organizationsResult.error && !isSchemaMissing(organizationsResult.error)) {
    throw new Error(organizationsResult.error.message);
  }
  if (userToolResult.error && !isSchemaMissing(userToolResult.error)) {
    throw new Error(userToolResult.error.message);
  }
  if (orgToolResult.error && !isSchemaMissing(orgToolResult.error)) {
    throw new Error(orgToolResult.error.message);
  }
  if (inviteResult.error && !isSchemaMissing(inviteResult.error)) {
    throw new Error(inviteResult.error.message);
  }

  const role: HubRole = isAdminEmail(email)
    ? "admin"
    : ((roleResult.data?.role as HubRole | undefined) ?? "user");

  const memberships = (membershipsResult.data ?? []) as HubOrganizationMember[];
  const organizations = ((organizationsResult.data ?? []) as HubOrganization[]).filter((organization) =>
    memberships.some((membership) => membership.organization_id === organization.organization_id),
  );

  const directToolKeys = new Set(
    ((userToolResult.data ?? []) as HubUserToolGrant[]).map((grant) => grant.tool_key),
  );

  const organizationToolKeys = new Set(
    ((orgToolResult.data ?? []) as HubOrganizationToolGrant[])
      .filter((grant) =>
        memberships.some((membership) => membership.organization_id === grant.organization_id),
      )
      .map((grant) => grant.tool_key),
  );

  const accessibleTools = HUB_TOOLS.filter((tool) => {
    if (tool.adminOnly && role !== "admin") {
      return false;
    }

    return role === "admin" || directToolKeys.has(tool.key) || organizationToolKeys.has(tool.key);
  });

  let management: HubDashboardData["management"] = null;

  if (role === "admin" || role === "manager") {
    const [membersResult, allUserToolResult] = await Promise.all([
      admin
        .from("hub_organization_members")
        .select("organization_id, profile_id, membership_role, created_at"),
      admin.from("hub_user_tool_access").select("profile_id, tool_key, created_at"),
    ]);

    if (membersResult.error && !isSchemaMissing(membersResult.error)) {
      throw new Error(membersResult.error.message);
    }

    if (allUserToolResult.error && !isSchemaMissing(allUserToolResult.error)) {
      throw new Error(allUserToolResult.error.message);
    }

    management = {
      users: await listUsers(),
      organizations: (organizationsResult.data ?? []) as HubOrganization[],
      members: (membersResult.data ?? []) as HubOrganizationMember[],
      userToolGrants: (allUserToolResult.data ?? []) as HubUserToolGrant[],
      organizationToolGrants: (orgToolResult.data ?? []) as HubOrganizationToolGrant[],
      invites: (inviteResult.data ?? []) as HubOrganizationInvite[],
    };
  }

  return {
    user,
    userSummary: {
      id: user.id,
      email,
      displayName: getUserDisplayName(user),
      primaryProvider:
        typeof user.app_metadata?.provider === "string" ? user.app_metadata.provider : null,
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
      role,
    },
    organizations: organizations.map((organization) => ({
      ...organization,
      membershipRole:
        memberships.find((membership) => membership.organization_id === organization.organization_id)
          ?.membership_role ?? "member",
    })),
    accessibleTools,
    management,
  };
}

export async function currentUserCanAccessTool(toolKey: string) {
  const dashboard = await getCurrentHubDashboard();

  if (!dashboard) {
    return { allowed: false, dashboard: null };
  }

  return {
    allowed: dashboard.accessibleTools.some((tool) => tool.key === toolKey),
    dashboard,
  };
}
