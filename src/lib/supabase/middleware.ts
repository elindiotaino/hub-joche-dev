import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAdminEmail } from "@/lib/hub/roles";
import { getResolvedUserEmail } from "@/lib/supabase/user";
import { getOptionalSupabaseAuthEnv } from "@/lib/supabase/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookies";

function buildLoginRedirect(
  request: NextRequest,
  response: NextResponse,
  params?: Record<string, string>,
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = "";

  redirectUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      redirectUrl.searchParams.set(key, value);
    });
  }

  const redirectResponse = NextResponse.redirect(redirectUrl);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function updateSupabaseSession(request: NextRequest) {
  const env = getOptionalSupabaseAuthEnv();
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!env) {
    if (isAdminRoute) {
      return buildLoginRedirect(request, NextResponse.next({ request }), {
        error: "Supabase auth is not configured yet.",
      });
    }

    return NextResponse.next({ request });
  }

  const cookieOptions = getSupabaseCookieOptions(request.nextUrl.origin);
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            ...cookieOptions,
          });
        });
      },
    },
  });

  if (!isAdminRoute) {
    await supabase.auth.getUser();
    return response;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return buildLoginRedirect(request, response);
  }

  if (!isAdminEmail(getResolvedUserEmail(user))) {
    return buildLoginRedirect(request, response, {
      error: "Admin access is restricted to the configured owner account.",
    });
  }

  return response;
}
