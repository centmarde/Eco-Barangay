<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="500px">
    <v-card>
      <v-card-title class="text-h5 font-weight-bold text-error">
        <v-icon left class="mr-2" color="error">mdi-delete-circle</v-icon>
        Confirm Delete
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-body-1 mb-4">
          Are you sure you want to delete
          <strong>{{ selectedCount }}</strong>
          announcement{{ selectedCount > 1 ? 's' : '' }}?
        </div>

        <!-- Show announcement titles if deleting specific ones -->
        <div v-if="announcementTitles.length > 0 && selectedCount <= 3" class="mb-4">
          <v-chip
            v-for="title in announcementTitles"
            :key="title"
            size="small"
            class="ma-1"
            color="error"
            variant="outlined"
          >
            {{ truncateTitle(title) }}
          </v-chip>
        </div>

        <v-alert type="warning" variant="tonal" class="mb-0">
          This action cannot be undone.
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          @click="handleConfirm"
          :loading="loading"
        >
          <v-icon start>mdi-delete</v-icon>
          Delete {{ selectedCount > 1 ? 'All' : '' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Announcement } from '@/stores/announcementsData'

interface Props {
  show: boolean
  loading?: boolean
  selectedIds: number[]
  announcements: Announcement[]
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectedIds: () => [],
  announcements: () => []
})

const emit = defineEmits<Emits>()

// Computed
const selectedCount = computed(() => props.selectedIds.length)

const announcementTitles = computed(() => {
  return props.announcements
    .filter(announcement => props.selectedIds.includes(announcement.id))
    .map(announcement => announcement.title)
})

// Methods
const truncateTitle = (title: string, maxLength: number = 30): string => {
  return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}
</script>

<style scoped>
.v-chip {
  max-width: 200px;
}
</style>
