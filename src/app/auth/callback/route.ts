import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAdminEmail } from "@/lib/hub/roles";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookies";
import {
  getSupabaseAuthEnv,
  hasSupabaseAuthEnv,
  hasSupabaseServiceRoleEnv,
} from "@/lib/supabase/env";

function normalizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  return nextPath;
}

function buildRedirect(
  request: NextRequest,
  nextPath: string,
  params?: Record<string, string>,
) {
  const redirectUrl = new URL(nextPath, request.url);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      redirectUrl.searchParams.set(key, value);
    });
  }

  return NextResponse.redirect(redirectUrl);
}

function createCallbackRedirectClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, publishableKey } = getSupabaseAuthEnv();
  const cookieOptions = getSupabaseCookieOptions(request.nextUrl.origin);

  return createServerClient(url, publishableKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            ...cookieOptions,
          });
        });
      },
    },
  });
}

async function syncHubUser(email: string | null, userId: string) {
  if (!userId || !hasSupabaseServiceRoleEnv()) {
    return;
  }

  const admin = getSupabaseAdminClient();

  if (isAdminEmail(email)) {
    await admin.from("hub_user_roles").upsert(
      {
        profile_id: userId,
        role: "admin",
      },
      { onConflict: "profile_id" },
    );
  }

  if (email) {
    const inviteLookup = await admin
      .from("hub_organization_invites")
      .select("invite_id, organization_id, membership_role")
      .eq("email", email.toLowerCase())
      .eq("status", "pending");

    const invites = inviteLookup.data ?? [];

    for (const invite of invites) {
      await admin.from("hub_organization_members").upsert(
        {
          organization_id: invite.organization_id,
          profile_id: userId,
          membership_role: invite.membership_role,
        },
        {
          onConflict: "organization_id,profile_id",
        },
      );

      await admin
        .from("hub_organization_invites")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("invite_id", invite.invite_id);
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = normalizeNextPath(searchParams.get("next"));
  const providerError =
    searchParams.get("error_description") || searchParams.get("error");

  if (!hasSupabaseAuthEnv()) {
    return buildRedirect(request, "/login", {
      error: "Supabase auth is not configured yet.",
    });
  }

  if (providerError) {
    return buildRedirect(request, "/login", {
      error: providerError,
    });
  }

  if (!code) {
    return buildRedirect(request, nextPath);
  }

  const successResponse = buildRedirect(request, nextPath, {
    message: "Signed in.",
  });
  const supabase = createCallbackRedirectClient(request, successResponse);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return buildRedirect(request, "/login", {
      error: error.message,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await syncHubUser(user?.email ?? null, user?.id ?? "");

  return successResponse;
}
