import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";

// Type definitions
export type UserNotification = {
  id: number;
  created_at: string;
  user_id: string;
  notification_id: number;
};

export type CreateUserNotificationData = {
  user_id: string;
  notification_id: number;
};

export type UpdateUserNotificationData = {
  user_id?: string;
  notification_id?: number;
};

export const useUserNotificationsStore = defineStore(
  "userNotifications",
  () => {
    // State
    const userNotifications = ref<UserNotification[]>([]);
    const currentUserNotification = ref<UserNotification | undefined>(
      undefined
    );
    const loading = ref(false);
    const error = ref<string | undefined>(undefined);

    // Actions
    const fetchUserNotifications = async () => {
      loading.value = true;
      error.value = undefined;

      try {
        const { data, error: fetchError } = await supabase
          .from("user_notifications")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        userNotifications.value = data || [];
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to fetch user notifications";
      } finally {
        loading.value = false;
      }
    };

    const fetchUserNotificationById = async (id: number) => {
      loading.value = true;
      error.value = undefined;

      try {
        const { data, error: fetchError } = await supabase
          .from("user_notifications")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        currentUserNotification.value = data;
        return data;
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to fetch user notification";
        return undefined;
      } finally {
        loading.value = false;
      }
    };

    const fetchUserNotificationsByUserId = async (userId: string) => {
      loading.value = true;
      error.value = undefined;

      try {
        const { data, error: fetchError } = await supabase
          .from("user_notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        return data || [];
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to fetch user notifications by user ID";
        return [];
      } finally {
        loading.value = false;
      }
    };

    const fetchUserNotificationsByNotificationId = async (
      notificationId: number
    ) => {
      loading.value = true;
      error.value = undefined;

      try {
        const { data, error: fetchError } = await supabase
          .from("user_notifications")
          .select("*")
          .eq("notification_id", notificationId)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        return data || [];
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to fetch user notifications by notification ID";
        return [];
      } finally {
        loading.value = false;
      }
    };

    const createUserNotification = async (
      notificationData: CreateUserNotificationData
    ) => {
      loading.value = true;
      error.value = undefined;

      try {
        const { data, error: createError } = await supabase
          .from("user_notifications")
          .insert([notificationData])
          .select()
          .single();

        if (createError) throw createError;

        if (data) {
          userNotifications.value.unshift(data);
        }

        return data;
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to create user notification";
        return undefined;
      } finally {
        loading.value = false;
      }
    };

    const updateUserNotification = async (
      id: number,
      notificationData: UpdateUserNotificationData
    ) => {
      loading.value = true;
      error.value = undefined;

      try {
        const { data, error: updateError } = await supabase
          .from("user_notifications")
          .update(notificationData)
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;

        if (data) {
          const index = userNotifications.value.findIndex((n) => n.id === id);
          if (index !== -1) {
            userNotifications.value[index] = data;
          }
        }

        return data;
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to update user notification";
        return undefined;
      } finally {
        loading.value = false;
      }
    };

    const deleteUserNotification = async (id: number) => {
      loading.value = true;
      error.value = undefined;

      try {
        const { error: deleteError } = await supabase
          .from("user_notifications")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        userNotifications.value = userNotifications.value.filter(
          (n) => n.id !== id
        );
        return true;
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to delete user notification";
        return false;
      } finally {
        loading.value = false;
      }
    };

    const deleteUserNotificationsByUserId = async (userId: string) => {
      loading.value = true;
      error.value = undefined;

      try {
        const { error: deleteError } = await supabase
          .from("user_notifications")
          .delete()
          .eq("user_id", userId);

        if (deleteError) throw deleteError;

        userNotifications.value = userNotifications.value.filter(
          (n) => n.user_id !== userId
        );
        return true;
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to delete user notifications";
        return false;
      } finally {
        loading.value = false;
      }
    };

    return {
      // State
      userNotifications,
      currentUserNotification,
      loading,
      error,
      // Actions
      fetchUserNotifications,
      fetchUserNotificationById,
      fetchUserNotificationsByUserId,
      fetchUserNotificationsByNotificationId,
      createUserNotification,
      updateUserNotification,
      deleteUserNotification,
      deleteUserNotificationsByUserId,
    };
  }
);
