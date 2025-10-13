/**
 * Role-related utility functions
 */

/**
 * Gets the color associated with a role ID
 * @param roleId - The role ID to get color for
 * @returns A color string for Vuetify components
 */
export function getRoleColor(roleId: number | null | undefined): string {
  if (!roleId) return "grey";
  // You can customize colors based on role ID or title
  switch (roleId) {
    case 1:
      return "red"; // Admin
    case 2:
      return "blue"; // Student
    case 3:
      return "green"; // Organization Leader
    default:
      return "grey";
  }
}

/**
 * Gets the title of a role by looking it up in the roles array
 * @param roleId - The role ID to get title for
 * @param roles - The roles array to search in
 * @returns A human-readable role title
 */
export function getRoleTitle(
  roleId: number | null | undefined,
  roles: Array<{ id: number; title: string | null }>
): string {
  if (!roleId) return "Unknown";
  const role = roles.find((r) => r.id === roleId);
  return role?.title || "Unknown";
}

/**
 * Gets the text representation of a role ID
 * @param roleId - The role ID to get text for
 * @returns A human-readable role name
 */
export function getRoleText(roleId: number | null | undefined): string {
  switch (roleId) {
    case 1:
      return "Admin";
    case 2:
      return "Student";
    case 3:
      return "Organization Leader";
    default:
      return "Unknown";
  }
}
