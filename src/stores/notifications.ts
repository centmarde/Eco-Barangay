import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useAuthUserStore } from "./authUser";

// Type definitions
export interface Notification {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  action_url?: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  read?: boolean;
  action_url?: string;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  type?: "info" | "success" | "warning" | "error";
  read?: boolean;
  action_url?: string;
}

export const useNotificationsStore = defineStore("notifications", () => {
  // State
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.read).length;
  });

  const unreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.read);
  });

  const readNotifications = computed(() => {
    return notifications.value.filter((n) => n.read);
  });

  // Helper function to format relative time
  const getRelativeTime = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return past.toLocaleDateString();
  };

  // Actions
  const fetchNotifications = async (userId?: string, background: boolean = false) => {
    if (!background) {
      loading.value = true;
    }
    error.value = null;

    try {
      const authStore = useAuthUserStore();
      const targetUserId = userId || authStore.userData?.id;

      if (!targetUserId) {
        throw new Error("User ID not found");
      }

      // Fetch from user_notifications table with join to notifications
      // Now selecting is_read from user_notifications (local status)
      const { data, error: fetchError } = await supabase
        .from("user_notifications")
        .select(
          `
          id,
          created_at,
          user_id,
          is_read,
          notifications:notification_id (
            id,
            title,
            description
          )
        `,
        )
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Map the joined data to our Notification interface
      notifications.value =
        data?.map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          user_id: item.user_id,
          title: item.notifications?.title || "Notification",
          message: item.notifications?.description || "",
          type: "info" as const, // Default type since table doesn't have it
          read: item.is_read || false, // Get is_read from user_notifications table
          action_url: undefined,
        })) || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch notifications";
      console.error("Error fetching notifications:", err);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // Find the notification to get the notification_id
      const notification = notifications.value.find(
        (n) => n.id === notificationId,
      );

      if (!notification) {
        throw new Error("Notification not found");
      }

      // Update is_read in the user_notifications table directly
      const { error: updateError } = await supabase
        .from("user_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (updateError) throw updateError;

      // Update local state (optimistic update)
      notification.read = true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const authStore = useAuthUserStore();
      const userId = authStore.userData?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Update is_read for all notifications for this user
      const { error: updateError } = await supabase
        .from("user_notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (updateError) throw updateError;

      // Update local state
      notifications.value.forEach((n) => {
        n.read = true;
      });

    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from("user_notifications")
        .delete()
        .eq("id", notificationId);

      if (deleteError) throw deleteError;

      // Update local state
      notifications.value = notifications.value.filter(
        (n) => n.id !== notificationId,
      );

    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const authStore = useAuthUserStore();
      const userId = authStore.userData?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const { error: deleteError } = await supabase
        .from("user_notifications")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      notifications.value = [];
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  // Create a notification (admin function)
  const createNotification = async (
    notificationData: CreateNotificationData,
    showToast: boolean = true,
  ) => {
    console.log("createNotification called with:", notificationData);
    try {
      // First create the notification in the notifications table (shared content)
      // Note: We ignore 'is_read' here as it is now per-user in user_notifications
      const { data: notificationRecord, error: notificationError } =
        await supabase
          .from("notifications")
          .insert([
            {
              title: notificationData.title,
              description: notificationData.message,
              // is_read removed from here or ignored
            },
          ])
          .select()
          .single();

      if (notificationError) {
        console.error(
          "Error inserting into notifications table:",
          notificationError,
        );
        throw notificationError;
      }

      console.log("Notification record created:", notificationRecord);

      // Then create the user_notification entry (with is_read status)
      const { data: userNotification, error: userNotificationError } =
        await supabase
          .from("user_notifications")
          .insert([
            {
              user_id: notificationData.user_id,
              notification_id: notificationRecord.id,
              is_read: notificationData.read || false,
            },
          ])
          .select()
          .single();

      if (userNotificationError) {
        console.error(
          "Error inserting into user_notifications table:",
          userNotificationError,
        );
        throw userNotificationError;
      }

      console.log("User notification created:", userNotification);

      if (showToast) {
      }
      return userNotification;
    } catch (err) {
      console.error("Error creating notification:", err);
      if (showToast) {
      }
      return null;
    }
  };

  // Subscribe to real-time notifications
  const subscribeToNotifications = (userId: string) => {
    // Unsubscribe from existing channel if it exists (though caller usually handles this)
    // We create a new channel
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("Notification Realtime Event:", payload);

          if (payload.eventType === "INSERT") {
            // New notification received
            await fetchNotifications(userId, true);
          } else if (payload.eventType === "UPDATE") {
            // Notification updated (e.g., marked as read on another device)
            await fetchNotifications(userId, true);
          } else if (payload.eventType === "DELETE") {
            // Notification removed
            const oldId = (payload.old as any).id;
            if (oldId) {
              notifications.value = notifications.value.filter(
                (n) => n.id !== oldId,
              );
            } else {
               // Fallback if ID isn't in payload (should be for DELETE)
               await fetchNotifications(userId, true);
            }
          }
        },
      )
      .subscribe();

    return channel;
  };

  return {
    // State
    notifications,
    loading,
    error,

    // Computed
    unreadCount,
    unreadNotifications,
    readNotifications,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification,
    subscribeToNotifications,
    getRelativeTime,
  };
});
