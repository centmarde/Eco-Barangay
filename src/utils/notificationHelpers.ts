/**
 * Notification-related utility functions
 */

/**
 * Gets the icon for a notification type
 * @param type - The notification type (success, warning, error, info)
 * @returns Material Design Icon string
 */
export function getNotificationIcon(type: string): string {
  switch (type) {
    case "success":
      return "mdi-check-circle";
    case "warning":
      return "mdi-alert";
    case "error":
      return "mdi-alert-circle";
    case "info":
    default:
      return "mdi-information";
  }
}

/**
 * Gets the color for a notification based on its type and read status
 * @param notification - The notification object with type and read status
 * @returns Color string for Vuetify components
 */
export function getNotificationColor(notification: {
  read: boolean;
  type: string;
}): string {
  if (notification.read) return "grey-lighten-1";

  switch (notification.type) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "error";
    case "info":
    default:
      return "primary";
  }
}
