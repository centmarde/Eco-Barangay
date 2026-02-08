<script setup lang="ts">
import { computed } from 'vue'
import { getNotificationIcon, getNotificationColor } from '@/utils/notificationHelpers'

interface Props {
  modelValue: boolean
  notification: any | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    if (!value) {
      emit('close')
    }
  }
})

const formattedDate = computed(() => {
  if (!props.notification?.created_at) return ''
  return new Date(props.notification.created_at).toLocaleString()
})
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
    scrollable
  >
    <v-card v-if="notification">
      <v-card-title class="d-flex align-center pa-4">
        <v-avatar
          :color="getNotificationColor(notification)"
          size="40"
          variant="tonal"
          class="mr-3"
        >
          <v-icon :icon="getNotificationIcon(notification.type)" />
        </v-avatar>
        <div class="flex-grow-1">
          <h2 class="text-h6 font-weight-bold">
            {{ notification.title }}
          </h2>
          <p class="text-caption text-medium-emphasis mb-0">
            {{ formattedDate }}
          </p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="isOpen = false"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <div class="text-body-1" style="white-space: pre-wrap; line-height: 1.6;">
          {{ notification.message }}
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="primary"
          variant="elevated"
          @click="isOpen = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card-text {
  max-height: 400px;
  overflow-y: auto;
}
</style>
