import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAuthEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getSupabaseAuthEnv();
  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
