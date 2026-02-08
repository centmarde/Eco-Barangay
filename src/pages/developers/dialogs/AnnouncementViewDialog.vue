<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="700px">
    <v-card v-if="announcement">
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon left class="mr-2" color="info">mdi-eye-circle</v-icon>
        {{ announcement.title }}
      </v-card-title>

      <v-divider />

      <!-- Image Section -->
      <div v-if="announcement.image" class="pa-6 pb-0">
        <v-img
          :src="announcement.image"
          :alt="announcement.title"
          height="300"
          class="rounded"
          cover
        >
          <template v-slot:error>
            <div class="d-flex align-center justify-center fill-height">
              <v-icon size="48" color="grey-lighten-1">mdi-image-broken</v-icon>
            </div>
          </template>
        </v-img>
      </div>

      <v-card-text class="pa-6">
        <!-- Description -->
        <div class="text-body-1 mb-4" style="white-space: pre-wrap; line-height: 1.6;">
          {{ announcement.description }}
        </div>

        <!-- Metadata -->
        <div class="d-flex align-center text-caption text-medium-emphasis">
          <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
          Created on {{ formatDate(announcement.created_at) }}
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleClose"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          @click="handleEdit"
        >
          <v-icon start>mdi-pencil</v-icon>
          Edit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Announcement } from '@/stores/announcementsData'

interface Props {
  show: boolean
  announcement?: Announcement | null
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'edit', announcement: Announcement): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  announcement: null
})

const emit = defineEmits<Emits>()

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleEdit = () => {
  if (props.announcement) {
    emit('edit', props.announcement)
  }
}
</script>

<style scoped>
/* Add any specific styles for the view dialog */
</style>
