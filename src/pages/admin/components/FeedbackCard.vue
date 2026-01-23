<script setup lang="ts">
import { computed } from 'vue'
import type { FeedbackWithUser } from '@/stores/collectionsData'

interface Props {
  feedback: FeedbackWithUser
}

interface Emits {
  (e: 'view-details', feedback: FeedbackWithUser): void
  (e: 'delete', feedback: FeedbackWithUser): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const formattedDate = computed(() => {
  return new Date(props.feedback.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const typeColor = computed(() => {
  switch (props.feedback.type) {
    case 'collection':
      return 'info'
    case 'system':
      return 'secondary'
    default:
      return 'primary'
  }
})

const typeIcon = computed(() => {
  switch (props.feedback.type) {
    case 'collection':
      return 'mdi-truck'
    case 'system':
      return 'mdi-cog'
    default:
      return 'mdi-comment'
  }
})

const ratingColor = computed(() => {
  const rating = props.feedback.rate || 0
  if (rating >= 4) return 'success'
  if (rating >= 3) return 'warning'
  if (rating >= 1) return 'error'
  return 'grey'
})

const truncatedDescription = computed(() => {
  const desc = props.feedback.description || ''
  return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
})

// Methods
const handleViewDetails = () => {
  emit('view-details', props.feedback)
}

const handleDelete = () => {
  emit('delete', props.feedback)
}
</script>

<template>
  <v-card
    class="feedback-card"
    elevation="2"
    hover
  >
    <!-- Card Header -->
    <v-card-title class="pb-2">
      <div class="d-flex align-center justify-space-between w-100">
        <div class="d-flex align-center">
          <v-chip
            :color="typeColor"
            :prepend-icon="typeIcon"
            size="small"
            variant="tonal"
            class="mr-2"
          >
            {{ feedback.type }}
          </v-chip>

          <div v-if="feedback.rate" class="d-flex align-center">
            <v-rating
              :model-value="feedback.rate"
              :color="ratingColor"
              readonly
              density="compact"
              size="small"
            />
            <span class="text-body-2 ml-1">({{ feedback.rate }})</span>
          </div>
        </div>

        <v-menu>
          <template v-slot:activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
            />
          </template>

          <v-list>
            <v-list-item @click="handleViewDetails">
              <v-list-item-title>
                <v-icon left size="small">mdi-eye</v-icon>
                View Details
              </v-list-item-title>
            </v-list-item>

            <v-list-item @click="handleDelete" class="text-error">
              <v-list-item-title>
                <v-icon left size="small">mdi-delete</v-icon>
                Delete
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-card-title>

    <!-- Card Content -->
    <v-card-text>
      <!-- Title -->
      <h4 class="text-subtitle-1 font-weight-medium mb-2">
        {{ feedback.title || 'No Title' }}
      </h4>

      <!-- Description -->
      <p class="text-body-2 mb-3" v-if="feedback.description">
        {{ truncatedDescription }}
      </p>

      <!-- User Info -->
      <div class="d-flex align-center mb-2">
        <v-icon size="16" class="mr-1">mdi-account</v-icon>
        <span class="text-body-2">
          {{ feedback.user_name || feedback.user_email || 'Unknown User' }}
        </span>
      </div>

      <!-- Collection ID (for collection feedback) -->
      <div
        v-if="feedback.type === 'collection' && feedback.collection_id"
        class="d-flex align-center mb-2"
      >
        <v-icon size="16" class="mr-1">mdi-truck</v-icon>
        <span class="text-body-2">
          Collection #{{ feedback.collection_id }}
        </span>
      </div>

      <!-- Date -->
      <div class="d-flex align-center">
        <v-icon size="16" class="mr-1">mdi-calendar</v-icon>
        <span class="text-caption grey--text">
          {{ formattedDate }}
        </span>
      </div>
    </v-card-text>

    <!-- Card Actions -->
    <v-card-actions class="pt-0">
      <v-btn
        @click="handleViewDetails"
        variant="text"
        size="small"
        color="primary"
      >
        View Details
      </v-btn>

      <v-spacer />

      <v-btn
        @click="handleDelete"
        variant="text"
        size="small"
        color="error"
        icon="mdi-delete"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.feedback-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.feedback-card .v-card-text {
  flex-grow: 1;
}

.v-card-title {
  padding-bottom: 8px;
}

.v-card-actions {
  margin-top: auto;
}
</style>
