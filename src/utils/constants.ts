/**
 * Constants for the application
 */

// ========================================
// FEEDBACK CONSTANTS
// ========================================

/**
 * Feedback status options
 */
export const FEEDBACK_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "New", color: "primary" },
  { value: "reviewed", label: "Reviewed", color: "warning" },
  { value: "resolved", label: "Resolved", color: "success" },
] as const;

export type FeedbackStatus = "new" | "reviewed" | "resolved";

/**
 * Feedback rating scale (1-4)
 */
export const FEEDBACK_RATING_MIN = 1;
export const FEEDBACK_RATING_MAX = 4;

/**
 * Feedback rating thresholds for color/icon determination
 */
export const FEEDBACK_RATING_THRESHOLDS = {
  EXCELLENT: 4,
  GOOD: 3,
  FAIR: 2,
  POOR: 1,
} as const;
