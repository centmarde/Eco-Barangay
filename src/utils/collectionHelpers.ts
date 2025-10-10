export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    pending: "warning",
    in_progress: "info",
    completed: "success",
    cancelled: "error",
  };
  return statusColors[status] || "grey";
};

/**
 * Get the icon for a collection status
 * @param status - The collection status
 * @returns Material Design Icon name
 */
export const getStatusIcon = (status: string): string => {
  const statusIcons: Record<string, string> = {
    pending: "mdi-clock-outline",
    in_progress: "mdi-truck-delivery",
    completed: "mdi-check-circle",
    cancelled: "mdi-close-circle",
  };
  return statusIcons[status] || "mdi-help-circle";
};

/**
 * Get the display text for a collection status
 * @param status - The collection status
 * @returns Human-readable status text
 */
export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return statusTexts[status] || status;
};

/**
 * Get the color for a garbage type
 * @param type - The garbage type
 * @returns Vuetify color name
 */
export const getGarbageTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    biodegradable: "success",
    non_biodegradable: "error",
    recyclable: "info",
    hazardous: "warning",
  };
  return typeColors[type] || "grey";
};

/**
 * Get the icon for a garbage type
 * @param type - The garbage type
 * @returns Material Design Icon name
 */
export const getGarbageTypeIcon = (type: string): string => {
  const typeIcons: Record<string, string> = {
    biodegradable: "mdi-leaf",
    non_biodegradable: "mdi-trash-can",
    recyclable: "mdi-recycle",
    hazardous: "mdi-biohazard",
  };
  return typeIcons[type] || "mdi-delete";
};
