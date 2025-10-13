<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthUserStore } from "@/stores/authUser";
import { useDisplay } from "vuetify";
import type { RealtimeChannel } from "@supabase/supabase-js";
import NotificationDialog from "./NotificationDialog.vue";

const router = useRouter();
const notificationsStore = useNotificationsStore();
const authStore = useAuthUserStore();
const { mobile } = useDisplay();

// Local state
const notificationMenu = ref(false);
let realtimeChannel: RealtimeChannel | null = null;

// Computed properties
const notifications = computed(() =>
  notificationsStore.notifications.slice(0, 5)
); // Show only latest 5 in dropdown
const unreadCount = computed(() => notificationsStore.unreadCount);

// Methods
const markAllAsRead = async () => {
  await notificationsStore.markAllAsRead();
};

const markAsRead = async (notificationId: number) => {
  await notificationsStore.markAsRead(notificationId);
};

const viewAllNotifications = () => {
  notificationMenu.value = false;
  router.push("/notifications");
};

const handleNotificationClick = async (notification: any) => {
  // Mark as read
  if (!notification.read) {
    await markAsRead(notification.id);
  }

  // Navigate if there's an action URL
  if (notification.action_url) {
    notificationMenu.value = false;
    router.push(notification.action_url);
  }
};

// Lifecycle hooks
onMounted(async () => {
  const userId = authStore.userData?.id;

  if (userId) {
    // Fetch initial notifications
    await notificationsStore.fetchNotifications(userId);

    // Subscribe to real-time updates
    realtimeChannel = notificationsStore.subscribeToNotifications(userId);
  }
});

onUnmounted(() => {
  // Cleanup real-time subscription
  if (realtimeChannel) {
    realtimeChannel.unsubscribe();
  }
});
</script>

<template>
  <NotificationDialog
    v-model="notificationMenu"
    :notifications="notifications"
    :unread-count="unreadCount"
    @mark-all-read="markAllAsRead"
    @mark-read="markAsRead"
    @view-all="viewAllNotifications"
    @notification-click="handleNotificationClick"
  />
</template>
