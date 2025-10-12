import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useToast } from "vue-toastification";
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
  const toast = useToast();

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
  const fetchNotifications = async (userId?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const authStore = useAuthUserStore();
      const targetUserId = userId || authStore.userData?.id;

      if (!targetUserId) {
        throw new Error("User ID not found");
      }

      // Fetch from notifications table directly
      // Join with user_notifications to get read status
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
            description,
            is_read
          )
        `
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
          read: item.is_read || false,
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
      const { error: updateError } = await supabase
        .from("user_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (updateError) throw updateError;

      // Update local state
      const notification = notifications.value.find(
        (n) => n.id === notificationId
      );
      if (notification) {
        notification.read = true;
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const authStore = useAuthUserStore();
      const userId = authStore.userData?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

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

      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error("Failed to mark all notifications as read");
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
        (n) => n.id !== notificationId
      );

      toast.success("Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
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
      toast.success("All notifications cleared");
    } catch (err) {
      console.error("Error clearing notifications:", err);
      toast.error("Failed to clear notifications");
    }
  };

  // Create a notification (admin function)
  const createNotification = async (
    notificationData: CreateNotificationData
  ) => {
    try {
      // First create the notification in the notifications table
      const { data: notificationRecord, error: notificationError } =
        await supabase
          .from("notifications")
          .insert([
            {
              title: notificationData.title,
              description: notificationData.message,
              is_read: notificationData.read || false,
            },
          ])
          .select()
          .single();

      if (notificationError) throw notificationError;

      // Then create the user_notification entry
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

      if (userNotificationError) throw userNotificationError;

      toast.success("Notification created successfully");
      return userNotification;
    } catch (err) {
      console.error("Error creating notification:", err);
      toast.error("Failed to create notification");
      return null;
    }
  };

  // Subscribe to real-time notifications
  const subscribeToNotifications = (userId: string) => {
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
          console.log("Notification change received:", payload);

          if (payload.eventType === "INSERT") {
            // Fetch the new notification details
            await fetchNotifications(userId);
          } else if (payload.eventType === "UPDATE") {
            // Update the notification in the local state
            await fetchNotifications(userId);
          } else if (payload.eventType === "DELETE") {
            // Remove the notification from local state
            notifications.value = notifications.value.filter(
              (n) => n.id !== (payload.old as any).id
            );
          }
        }
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
