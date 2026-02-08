<template>
  <!-- Announcement Card -->
  <v-card
    class="announcement-card mb-4"
    elevation="2"
    :class="{ 'selected': isSelected }"
    @click="handleCardClick"
  >
    <!-- Selection Checkbox -->
    <div class="selection-checkbox">
      <v-checkbox
        :model-value="isSelected"
        @update:model-value="$emit('toggle-selection', announcement.id)"
        @click.stop
        color="primary"
        hide-details
        density="compact"
      />
    </div>

    <!-- Announcement Header -->
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <div class="text-h6 font-weight-bold announcement-title">
        {{ announcement.title }}
      </div>

      <!-- Action Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            @click.stop
          />
        </template>
        <v-list>
          <v-list-item @click="$emit('view', announcement)">
            <template v-slot:prepend>
              <v-icon>mdi-eye</v-icon>
            </template>
            <v-list-item-title>View Details</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('edit', announcement)">
            <template v-slot:prepend>
              <v-icon>mdi-pencil</v-icon>
            </template>
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item
            @click="$emit('delete', announcement.id)"
            class="text-error"
          >
            <template v-slot:prepend>
              <v-icon color="error">mdi-delete</v-icon>
            </template>
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>



    <!-- Announcement Content -->
    <v-card-text class="pa-4">
      <div class="announcement-description">
        {{ truncatedDescription }}
        <v-btn
          v-if="announcement.description.length > descriptionLimit"
          variant="text"
          size="small"
          color="primary"
          @click.stop="$emit('view', announcement)"
          class="pa-0 ml-1"
        >
          Read more
        </v-btn>
      </div>
    </v-card-text>

    <!-- Announcement Footer -->
    <v-card-actions class="px-4 pb-4">
      <div class="d-flex justify-space-between align-center w-100">
        <!-- Created Date -->
        <div class="text-caption text-medium-emphasis d-flex align-center">
          <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
          {{ formatDate(announcement.created_at) }}
        </div>

        <!-- Quick Actions -->
        <div class="d-flex ga-2">

          <v-btn
            size="small"
            variant="outlined"
            color="secondary"
            @click.stop="$emit('edit', announcement)"
          >
            <v-icon start>mdi-pencil</v-icon>
            Edit
          </v-btn>
        </div>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Announcement } from '@/stores/announcementsData'

interface Props {
  announcement: Announcement
  isSelected?: boolean
  descriptionLimit?: number
}

interface Emits {
  (e: 'toggle-selection', id: number): void
  (e: 'view', announcement: Announcement): void
  (e: 'edit', announcement: Announcement): void
  (e: 'delete', id: number): void
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  descriptionLimit: 150
})

const emit = defineEmits<Emits>()

// Computed
const truncatedDescription = computed(() => {
  if (props.announcement.description.length <= props.descriptionLimit) {
    return props.announcement.description
  }
  return props.announcement.description.substring(0, props.descriptionLimit) + '...'
})

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

const handleCardClick = () => {
  emit('view', props.announcement)
}
</script>

<style scoped>
.announcement-card {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
}

.announcement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.announcement-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.selection-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;

  border-radius: 4px;
  padding: 2px;
}

.announcement-title {
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
  word-break: break-word;
  max-width: calc(100% - 48px); /* Account for menu button */
}

.announcement-image {
  border-radius: 8px;
  overflow: hidden;
}

.announcement-description {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.5;
  word-break: break-word;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .announcement-card {
    margin-bottom: 12px;
  }

  .announcement-title {
    font-size: 1.1rem;
  }

  .selection-checkbox {
    top: 4px;
    left: 4px;
  }
}
</style>
