<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthUserStore } from "@/stores/authUser";
import { useDisplay } from "vuetify";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getNotificationIcon, getNotificationColor } from "@/utils/helpers";

const router = useRouter();
const notificationsStore = useNotificationsStore();
const authStore = useAuthUserStore();
const { mobile } = useDisplay();

// Local state
const notificationMenu = ref(false);
const mobileMenu = ref(false);
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
  mobileMenu.value = false;
  router.push("/notifications"); // TODO: Update to actual notifications page route
};

const handleNotificationClick = async (notification: any) => {
  // Mark as read
  if (!notification.read) {
    await markAsRead(notification.id);
  }

  // Navigate if there's an action URL
  if (notification.action_url) {
    notificationMenu.value = false;
    mobileMenu.value = false;
    router.push(notification.action_url);
  }
};

const openMobileMenu = () => {
  mobileMenu.value = true;
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
  <!-- Desktop Notification Bell -->
  <v-menu
    v-if="!mobile"
    v-model="notificationMenu"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
    max-width="420"
  >
    <template #activator="{ props: menuProps }">
      <v-btn v-bind="menuProps" icon variant="text" size="small">
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="error"
          overlap
        >
          <v-icon icon="mdi-bell" />
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="380" max-width="420">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">Notifications</span>
        <v-btn
          v-if="unreadCount > 0"
          variant="text"
          size="small"
          color="primary"
          @click="markAllAsRead"
        >
          Mark all as read
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-list class="pa-0" max-height="400" style="overflow-y: auto">
        <template v-if="notifications.length > 0">
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            :class="{ 'bg-surface-light': !notification.read }"
            class="px-4 py-3 cursor-pointer"
            @click="handleNotificationClick(notification)"
          >
            <template #prepend>
              <v-avatar
                :color="getNotificationColor(notification)"
                size="40"
                variant="tonal"
              >
                <v-icon :icon="getNotificationIcon(notification.type)" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium mb-1">
              {{ notification.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              {{ notification.message }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="text-caption mt-1">
              {{ notificationsStore.getRelativeTime(notification.created_at) }}
            </v-list-item-subtitle>
          </v-list-item>
        </template>

        <v-list-item v-else class="text-center py-8">
          <div class="text-center">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">
              mdi-bell-off
            </v-icon>
            <p class="text-body-2 text-medium-emphasis">No notifications</p>
          </div>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-card-actions class="pa-3">
        <v-btn
          block
          variant="text"
          color="primary"
          @click="viewAllNotifications"
        >
          View All Notifications
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <!-- Mobile Notification Bell - Menu Style -->
  <v-menu
    v-else
    v-model="mobileMenu"
    :close-on-content-click="false"
    location="bottom end"
    offset="8"
    max-width="400"
  >
    <template #activator="{ props: menuProps }">
      <v-btn v-bind="menuProps" icon variant="text" size="small">
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="error"
          overlap
        >
          <v-icon icon="mdi-bell" size="20" />
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="350" max-width="400">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">Notifications</span>
        <v-btn icon variant="text" size="small" @click="mobileMenu = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-list class="pa-0" max-height="400" style="overflow-y: auto">
        <template v-if="notifications.length > 0">
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            :class="{ 'bg-surface-light': !notification.read }"
            class="px-4 py-3 cursor-pointer"
            @click="handleNotificationClick(notification)"
          >
            <template #prepend>
              <v-avatar
                :color="getNotificationColor(notification)"
                size="40"
                variant="tonal"
              >
                <v-icon :icon="getNotificationIcon(notification.type)" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium mb-1">
              {{ notification.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              {{ notification.message }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="text-caption mt-1">
              {{ notificationsStore.getRelativeTime(notification.created_at) }}
            </v-list-item-subtitle>
          </v-list-item>
        </template>

        <div v-else class="text-center py-8">
          <v-icon size="48" color="grey-lighten-1" class="mb-2">
            mdi-bell-off-outline
          </v-icon>
          <p class="text-body-2 text-medium-emphasis">No notifications</p>
        </div>
      </v-list>

      <v-divider />

      <v-card-actions class="pa-3 d-flex flex-column ga-2">
        <v-btn
          v-if="unreadCount > 0"
          block
          variant="text"
          color="primary"
          size="small"
          @click="markAllAsRead"
        >
          Mark all as read
        </v-btn>
        <v-btn
          block
          variant="tonal"
          color="primary"
          @click="viewAllNotifications"
        >
          View All Notifications
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Dark mode hover */
.v-theme--dark .cursor-pointer:hover {
  background-color: rgba(255, 255, 255, 0.08);
}
</style>
