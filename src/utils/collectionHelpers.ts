/**
 * Electronic waste classifications
 */
export const ELECTRONIC_WASTE_TYPES = [
  "Computers & Laptops",
  "Mobile Phones & Tablets",
  "Televisions & Monitors",
  "Printers & Scanners",
  "Kitchen Appliances",
  "Batteries & Chargers",
  "Audio & Video Equipment",
  "Gaming Consoles",
  "Other Electronics",
] as const;

/**
 * Get available garbage types for collection requests
 * @returns Array of garbage type options
 */
export const getGarbageTypes = (): string[] => {
  return [...ELECTRONIC_WASTE_TYPES];
};

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
    "computers & laptops": "primary",
    "mobile phones & tablets": "info",
    "televisions & monitors": "deep-orange",
    "printers & scanners": "accent",
    "kitchen appliances": "success",
    "batteries & chargers": "warning",
    "audio & video equipment": "purple",
    "gaming consoles": "indigo",
    "other electronics": "grey",
  };
  return typeColors[type.toLowerCase()] || "grey";
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
    "computers & laptops": "mdi-laptop",
    "mobile phones & tablets": "mdi-cellphone",
    "televisions & monitors": "mdi-television",
    "printers & scanners": "mdi-printer",
    "kitchen appliances": "mdi-toaster-oven",
    "batteries & chargers": "mdi-battery-charging",
    "audio & video equipment": "mdi-speaker",
    "gaming consoles": "mdi-gamepad-variant",
    "other electronics": "mdi-chip",
  };
  return typeIcons[type.toLowerCase()] || "mdi-delete";
};

/**
 * Validate collection form data
 * @param address - The pickup address
 * @param garbageType - The garbage type
 * @returns Validation result with error message if invalid
 */
export const validateCollectionRequest = (
  purok: string,
  address: string,
  garbageType: string,
): { valid: boolean; error?: string } => {
  if (!purok || purok.trim().length === 0) {
    return { valid: false, error: "Purok is required" };
  }

  if (!address || address.trim().length === 0) {
    return { valid: false, error: "Pickup address is required" };
  }

  if (!garbageType || garbageType.trim().length === 0) {
    return { valid: false, error: "Garbage type is required" };
  }

  return { valid: true };
};
