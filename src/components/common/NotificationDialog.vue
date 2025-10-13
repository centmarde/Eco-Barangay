<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";
import { getNotificationIcon, getNotificationColor } from "@/utils/helpers";

// Props
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

// Composables
const router = useRouter();
const notificationsStore = useNotificationsStore();

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const notifications = computed(() =>
  notificationsStore.notifications.slice(0, 5)
); // Show only latest 5

const unreadCount = computed(() => notificationsStore.unreadCount);

// Methods
const closeDialog = () => {
  isOpen.value = false;
};

const markAllAsRead = async () => {
  await notificationsStore.markAllAsRead();
};

const markAsRead = async (notificationId: number) => {
  await notificationsStore.markAsRead(notificationId);
};

const viewAllNotifications = () => {
  closeDialog();
  router.push("/notifications");
};

const handleNotificationClick = async (notification: any) => {
  // Mark as read
  if (!notification.read) {
    await markAsRead(notification.id);
  }

  // Navigate if there's an action URL
  if (notification.action_url) {
    closeDialog();
    router.push(notification.action_url);
  }
};
</script>

<template>
  <v-menu
    v-model="isOpen"
    :close-on-content-click="false"
    location="bottom end"
    :offset="[0, 20]"
    max-width="400"
  >
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn icon v-bind="activatorProps">
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="error"
          overlap
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="350" max-width="400">
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">Notifications</span>
        <v-btn icon variant="text" size="small" @click="closeDialog">
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
