/**
 * Feedback-related utility functions
 */

/**
 * Gets the icon for a feedback rating
 * @param rating - The rating value (1-4)
 * @returns Material Design Icon string
 */
export function getFeedbackRatingIcon(rating: number): string {
  if (rating >= 4) return "mdi-emoticon-excited";
  if (rating === 3) return "mdi-emoticon-happy";
  if (rating === 2) return "mdi-emoticon-neutral";
  return "mdi-emoticon-sad";
}

/**
 * Gets the color for a feedback rating
 * @param rating - The rating value (1-4)
 * @returns Color string for Vuetify components
 */
export function getFeedbackRatingColor(rating: number): string {
  if (rating >= 4) return "success";
  if (rating === 3) return "info";
  if (rating === 2) return "warning";
  return "error";
}

/**
 * Gets the color for a feedback status
 * @param status - The status (new, reviewed, resolved)
 * @returns Color string for Vuetify components
 */
export function getFeedbackStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "primary",
    reviewed: "warning",
    resolved: "success",
  };
  return colors[status] || "default";
}
