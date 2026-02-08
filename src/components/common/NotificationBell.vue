<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthUserStore } from "@/stores/authUser";
import { useDisplay } from "vuetify";
import type { RealtimeChannel } from "@supabase/supabase-js";
import NotificationDialog from "./NotificationDialog.vue";
import NotificationDetailDialog from "./NotificationDetailDialog.vue";

const router = useRouter();
const notificationsStore = useNotificationsStore();
const authStore = useAuthUserStore();
const { mobile } = useDisplay();

// Local state
const notificationMenu = ref(false);
const showDetailDialog = ref(false);
const selectedNotification = ref<any>(null);
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
  // Close the notification menu
  notificationMenu.value = false;

  // Set the selected notification and show detail dialog
  selectedNotification.value = notification;
  showDetailDialog.value = true;
};

const handleDetailDialogClose = async () => {
  // Mark notification as read when dialog is closed
  if (selectedNotification.value && !selectedNotification.value.read) {
    await markAsRead(selectedNotification.value.id);
  }

  // Reset selected notification
  selectedNotification.value = null;
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

  <NotificationDetailDialog
    v-model="showDetailDialog"
    :notification="selectedNotification"
    @close="handleDetailDialogClose"
  />
</template>
