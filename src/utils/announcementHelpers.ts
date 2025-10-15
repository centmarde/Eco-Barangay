/**
 * Announcement related helper utilities
 */

export function getAnnouncementColor(index: number): string {
  const colors = ['primary', 'success', 'info', 'warning', 'secondary'];
  return colors[index % colors.length];
}
