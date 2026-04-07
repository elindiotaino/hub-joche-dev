import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentHubDashboard } from "@/lib/hub/queries";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import type { HubRole } from "@/lib/hub/roles";

const payloadSchema = z.object({
  action: z.enum([
    "set-user-role",
    "create-organization",
    "assign-organization-member",
    "invite-organization-member",
    "grant-user-tool",
    "grant-organization-tool",
  ]),
  profileId: z.string().optional(),
  role: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  notes: z.string().optional(),
  organizationId: z.string().optional(),
  membershipRole: z.string().optional(),
  email: z.string().optional(),
  toolKey: z.string().optional(),
});

async function ensureManagerOrAdmin() {
  const dashboard = await getCurrentHubDashboard();

  if (!dashboard) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  if (!["admin", "manager"].includes(dashboard.userSummary.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { ok: true as const, dashboard };
}

export async function POST(request: Request) {
  const authCheck = await ensureManagerOrAdmin();

  if (!authCheck.ok) {
    return authCheck.response;
  }

  if (!hasSupabaseServiceRoleEnv()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for admin actions." },
      { status: 500 },
    );
  }

  const parsed = payloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin payload." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const actorId = authCheck.dashboard.userSummary.id;

  try {
    if (parsed.data.action === "set-user-role") {
      if (!parsed.data.profileId || !parsed.data.role) {
        return NextResponse.json(
          { error: "profileId and role are required." },
          { status: 400 },
        );
      }

      await admin.from("hub_user_roles").upsert(
        {
          profile_id: parsed.data.profileId,
          role: parsed.data.role as HubRole,
          updated_by: actorId,
        },
        { onConflict: "profile_id" },
      );

      return NextResponse.json({ message: "User role updated." });
    }

    if (parsed.data.action === "create-organization") {
      if (!parsed.data.name || !parsed.data.slug) {
        return NextResponse.json(
          { error: "name and slug are required." },
          { status: 400 },
        );
      }

      const created = await admin
        .from("hub_organizations")
        .insert({
          name: parsed.data.name,
          slug: parsed.data.slug,
          notes: parsed.data.notes ?? null,
          created_by: actorId,
        })
        .select("organization_id")
        .single();

      if (created.error) {
        throw new Error(created.error.message);
      }

      await admin.from("hub_organization_members").upsert(
        {
          organization_id: created.data.organization_id,
          profile_id: actorId,
          membership_role: "manager",
        },
        { onConflict: "organization_id,profile_id" },
      );

      return NextResponse.json({ message: "Organization created." });
    }

    if (parsed.data.action === "assign-organization-member") {
      if (!parsed.data.organizationId || !parsed.data.profileId) {
        return NextResponse.json(
          { error: "organizationId and profileId are required." },
          { status: 400 },
        );
      }

      await admin.from("hub_organization_members").upsert(
        {
          organization_id: parsed.data.organizationId,
          profile_id: parsed.data.profileId,
          membership_role: parsed.data.membershipRole ?? "member",
        },
        { onConflict: "organization_id,profile_id" },
      );

      return NextResponse.json({ message: "Organization membership updated." });
    }

    if (parsed.data.action === "invite-organization-member") {
      if (!parsed.data.organizationId || !parsed.data.email) {
        return NextResponse.json(
          { error: "organizationId and email are required." },
          { status: 400 },
        );
      }

      await admin.from("hub_organization_invites").insert({
        organization_id: parsed.data.organizationId,
        email: parsed.data.email.toLowerCase(),
        membership_role: parsed.data.membershipRole ?? "member",
        status: "pending",
        invited_by: actorId,
      });

      return NextResponse.json({ message: "Invite created." });
    }

    if (parsed.data.action === "grant-user-tool") {
      if (!parsed.data.profileId || !parsed.data.toolKey) {
        return NextResponse.json(
          { error: "profileId and toolKey are required." },
          { status: 400 },
        );
      }

      await admin.from("hub_user_tool_access").upsert(
        {
          profile_id: parsed.data.profileId,
          tool_key: parsed.data.toolKey,
          granted_by: actorId,
        },
        { onConflict: "profile_id,tool_key" },
      );

      return NextResponse.json({ message: "Direct tool access granted." });
    }

    if (parsed.data.action === "grant-organization-tool") {
      if (!parsed.data.organizationId || !parsed.data.toolKey) {
        return NextResponse.json(
          { error: "organizationId and toolKey are required." },
          { status: 400 },
        );
      }

      await admin.from("hub_organization_tool_access").upsert(
        {
          organization_id: parsed.data.organizationId,
          tool_key: parsed.data.toolKey,
          granted_by: actorId,
        },
        { onConflict: "organization_id,tool_key" },
      );

      return NextResponse.json({ message: "Organization tool access granted." });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin action failed." },
      { status: 500 },
    );
  }
}
