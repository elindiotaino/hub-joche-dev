import type { User } from "@supabase/supabase-js";

import type { HubRole } from "@/lib/hub/roles";
import type { HubToolDefinition } from "@/lib/hub/tools";

export type HubUserSummary = {
  id: string;
  email: string | null;
  displayName: string | null;
  primaryProvider: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  role: HubRole;
};

export type HubOrganization = {
  organization_id: string;
  name: string;
  slug: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type HubOrganizationMember = {
  organization_id: string;
  profile_id: string;
  membership_role: string;
  created_at: string | null;
};

export type HubUserToolGrant = {
  profile_id: string;
  tool_key: string;
  created_at: string | null;
};

export type HubOrganizationToolGrant = {
  organization_id: string;
  tool_key: string;
  created_at: string | null;
};

export type HubOrganizationInvite = {
  invite_id: string;
  organization_id: string;
  email: string;
  membership_role: string;
  status: string;
  created_at: string | null;
};

export type HubDashboardData = {
  user: User;
  userSummary: HubUserSummary;
  organizations: Array<HubOrganization & { membershipRole: string }>;
  accessibleTools: HubToolDefinition[];
  management:
    | {
        users: HubUserSummary[];
        organizations: HubOrganization[];
        members: HubOrganizationMember[];
        userToolGrants: HubUserToolGrant[];
        organizationToolGrants: HubOrganizationToolGrant[];
        invites: HubOrganizationInvite[];
      }
    | null;
};
