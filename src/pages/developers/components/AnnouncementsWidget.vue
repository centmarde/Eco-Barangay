<template>
  <!-- Announcement Card -->
  <v-card
    class="d-flex flex-column"
    elevation="2"
    height="280"
    :class="{ 'border-primary border-lg': isSelected }"
    @click="handleCardClick"
    hover
  >
    <!-- Card Header with Controls -->
    <v-card-title class="d-flex align-center pa-3">
      <!-- Selection Checkbox -->
      <v-checkbox
        :model-value="isSelected"
        @update:model-value="$emit('toggle-selection', announcement.id)"
        @click.stop
        color="primary"
        hide-details
        density="compact"
        class="me-3"
      />

      <!-- Title -->
      <div class="flex-grow-1 text-subtitle-1 font-weight-medium text-truncate">
        {{ announcement.title }}
      </div>

      <!-- Action Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            @click.stop
          />
        </template>
        <v-list density="compact">
          <v-list-item @click="$emit('view', announcement)">
            <template v-slot:prepend>
              <v-icon size="18">mdi-eye</v-icon>
            </template>
            <v-list-item-title>View</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('edit', announcement)">
            <template v-slot:prepend>
              <v-icon size="18">mdi-pencil</v-icon>
            </template>
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item
            @click="$emit('delete', announcement.id)"
            class="text-error"
          >
            <template v-slot:prepend>
              <v-icon size="18" color="error">mdi-delete</v-icon>
            </template>
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>



    <!-- Announcement Content -->
    <v-card-text class="px-4 py-2 flex-grow-1">
      <v-sheet class="text-body-2" color="transparent">
        {{ truncatedDescription }}
        <v-btn
          v-if="announcement.description.length > descriptionLimit"
          variant="text"
          size="x-small"
          color="primary"
          class="pa-0 ml-1"
          @click.stop="$emit('view', announcement)"
        >
          Read more
        </v-btn>
      </v-sheet>
    </v-card-text>

    <!-- Announcement Footer -->
    <v-card-actions class="px-4 py-2 mt-auto">
      <v-row no-gutters class="align-center justify-space-between w-100">
        <!-- Created Date -->
        <v-col cols="auto">
          <v-chip
            size="x-small"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-clock-outline"
          >
            {{ formatDate(announcement.created_at) }}
          </v-chip>
        </v-col>

        <!-- Quick Actions -->
        <v-col cols="auto">
          <v-btn
            size="small"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-pencil"
            @click.stop="$emit('edit', announcement)"
          >
            Edit
          </v-btn>
        </v-col>
      </v-row>
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
