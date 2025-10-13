/**
 * User-related utility functions
 */

/**
 * Generates initials from an email address for avatar display
 * @param email - The email address to extract initials from
 * @returns A string of 1-2 uppercase letters representing the user's initials
 */
export function getEmailInitials(email: string | null | undefined): string {
  if (!email) return "U"; // Default to 'U' for User if no email

  // Extract the local part (before @) from email
  const localPart = email.split("@")[0];

  // Split by common separators (dots, underscores, hyphens, numbers)
  const parts = localPart.split(/[\._\-\d]+/).filter((part) => part.length > 0);

  if (parts.length >= 2) {
    // Take first letter of first two parts
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length >= 2) {
    // Take first two letters of single part
    return (parts[0][0] + parts[0][1]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length === 1) {
    // Single letter part
    return parts[0][0].toUpperCase();
  }

  // Fallback: take first letter of email
  return email[0].toUpperCase();
}

/**
 * Generates a display name from user data
 * @param userData - User data object containing name/email information
 * @returns A formatted display name
 */
export function getUserDisplayName(
  userData: {
    user_metadata?: { full_name?: string };
    email?: string;
  } | null
): string {
  if (!userData) return "User";

  const fullName = userData.user_metadata?.full_name;
  if (fullName) return fullName;

  if (userData.email) {
    // Extract name from email (part before @)
    const emailLocal = userData.email.split("@")[0];
    // Replace dots/underscores with spaces and capitalize
    return emailLocal
      .replace(/[\._]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return "User";
}

/**
 * Creates a slug name from an email address for display purposes
 * @param email - The email address to convert to slug name
 * @returns A formatted slug name string
 */
export function createSlugName(email: string | null | undefined): string {
  if (!email) return "user";

  // Extract the local part (before @) from email
  const localPart = email.split("@")[0];

  // Replace dots, underscores, hyphens, and numbers with spaces
  const cleaned = localPart.replace(/[\._\-\d]+/g, " ");

  // Split by spaces and filter out empty parts
  const parts = cleaned.split(" ").filter((part) => part.length > 0);

  if (parts.length === 0) {
    // Fallback: use first part of email before @
    return localPart.toLowerCase();
  }

  // Join parts with dots to create slug-like name
  return parts.map((part) => part.toLowerCase()).join(".");
}

/**
 * Creates a display slug name with proper capitalization from email
 * @param email - The email address to convert
 * @returns A capitalized display name
 */
export function createDisplaySlugName(
  email: string | null | undefined
): string {
  if (!email) return "User";

  const slugName = createSlugName(email);

  // Split by dots and capitalize each part
  return slugName
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
