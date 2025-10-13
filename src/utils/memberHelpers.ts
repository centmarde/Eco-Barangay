/**
 * Organization member management utility functions and configurations
 */

/**
 * Organization member management configuration
 */
export const memberStatusOptions = [
  {
    value: "active",
    title: "Active",
    color: "success",
    icon: "mdi-check-circle",
  },
  { value: "pending", title: "Pending", color: "warning", icon: "mdi-clock" },
  {
    value: "inactive",
    title: "Inactive",
    color: "grey",
    icon: "mdi-minus-circle",
  },
  {
    value: "suspended",
    title: "Suspended",
    color: "error",
    icon: "mdi-alert-circle",
  },
] as const;

export const memberRoleOptions = [
  {
    value: "member",
    title: "Member",
    description: "Regular organization member",
  },
  {
    value: "officer",
    title: "Officer",
    description: "Organization officer with special responsibilities",
  },
  {
    value: "secretary",
    title: "Secretary",
    description: "Handles documentation and communications",
  },
  {
    value: "treasurer",
    title: "Treasurer",
    description: "Manages organization finances",
  },
  {
    value: "vice_president",
    title: "Vice President",
    description: "Second-in-command of the organization",
  },
] as const;

export type MemberStatus = (typeof memberStatusOptions)[number]["value"];
export type MemberRole = (typeof memberRoleOptions)[number]["value"];

/**
 * Gets the color for a member status
 */
export const getMemberStatusColor = (status: string): string => {
  const option = memberStatusOptions.find((opt) => opt.value === status);
  return option?.color || "grey";
};

/**
 * Gets the icon for a member status
 */
export const getMemberStatusIcon = (status: string): string => {
  const option = memberStatusOptions.find((opt) => opt.value === status);
  return option?.icon || "mdi-help-circle";
};

/**
 * Gets the title for a member role
 */
export const getMemberRoleTitle = (role: string): string => {
  const option = memberRoleOptions.find((opt) => opt.value === role);
  return option?.title || role;
};

/**
 * Gets the description for a member role
 */
export const getMemberRoleDescription = (role: string): string => {
  const option = memberRoleOptions.find((opt) => opt.value === role);
  return option?.description || "";
};

/**
 * Validates if a member status is valid
 */
export const isValidMemberStatus = (status: string): status is MemberStatus => {
  return memberStatusOptions.some((opt) => opt.value === status);
};

/**
 * Validates if a member role is valid
 */
export const isValidMemberRole = (role: string): role is MemberRole => {
  return memberRoleOptions.some((opt) => opt.value === role);
};
