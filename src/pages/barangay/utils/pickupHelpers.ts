// Helper functions for PickupsView

/**
 * Get color for status chip based on status value
 */
export const statusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

/**
 * Get color for garbage type chip based on type value
 */
export const garbageTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case "organic":
      return "success";
    case "recyclable":
      return "info";
    case "hazardous":
      return "error";
    default:
      return "default";
  }
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get collector name from collector ID
 * Returns the full name from user_metadata if available
 */
export const getCollectorName = (
  collectorId: string | null,
  collectors: Array<{ id: string; username: string; email: string }>
): string => {
  if (!collectorId) return "Unassigned";

  const collector = collectors.find((c) => c.id === collectorId);

  if (!collector) {
    return "Unknown";
  }

  // Return the username which contains the full_name from user_metadata
  return collector.username || collector.email?.split("@")[0] || "Unknown";
};
