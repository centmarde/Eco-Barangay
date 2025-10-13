<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useNotificationsStore } from "@/stores/notifications";
import {
  getNotificationIcon,
  getNotificationColor,
} from "@/utils/notificationHelpers";

// Props
interface Props {
  modelValue: boolean;
  notifications: any[];
  unreadCount: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "mark-all-read"): void;
  (e: "mark-read", notificationId: number): void;
  (e: "view-all"): void;
  (e: "notification-click", notification: any): void;
}>();

const notificationsStore = useNotificationsStore();

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <v-menu
    v-model="isOpen"
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
        <v-tooltip activator="parent" location="bottom">
          Notifications
        </v-tooltip>
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
          @click="emit('mark-all-read')"
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
            @click="emit('notification-click', notification)"
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
        <v-btn block variant="text" color="primary" @click="emit('view-all')">
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
