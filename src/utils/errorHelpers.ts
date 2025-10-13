/**
 * Error handling utility functions
 */

/**
 * Extracts a readable error message from various error formats
 * @param error - The error object to extract message from
 * @returns A human-readable error message string
 */
export function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.msg) {
    return error.msg;
  }
  return "Unknown error occurred";
}
