<script setup lang="ts">
import { computed } from 'vue'
import type { FeedbackWithUser } from '@/stores/collectionsData'

interface Props {
  modelValue: boolean
  feedback: FeedbackWithUser | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formattedDate = computed(() => {
  if (!props.feedback) return ''
  return new Date(props.feedback.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const typeColor = computed(() => {
  if (!props.feedback) return 'primary'
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
  if (!props.feedback) return 'mdi-comment'
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
  if (!props.feedback?.rate) return 'grey'
  const rating = props.feedback.rate
  if (rating >= 4) return 'success'
  if (rating >= 3) return 'warning'
  return 'error'
})

const closeDialog = () => {
  dialog.value = false
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
    scrollable
  >
    <v-card v-if="feedback">
      <!-- Dialog Header -->
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon :icon="typeIcon" :color="typeColor" class="mr-2" />
          <span>Feedback Details</span>
        </div>

        <v-btn
          @click="closeDialog"
          icon="mdi-close"
          variant="text"
          size="small"
        />
      </v-card-title>

      <v-divider />

      <!-- Dialog Content -->
      <v-card-text class="pa-6">
        <v-row>
          <!-- Basic Information -->
          <v-col cols="12">
            <h3 class="text-h6 mb-4">Basic Information</h3>

            <v-row>
              <!-- Type -->
              <v-col cols="12" sm="6">
                <div class="info-field">
                  <label class="text-caption font-weight-bold grey--text">Type</label>
                  <div class="mt-1">
                    <v-chip
                      :color="typeColor"
                      :prepend-icon="typeIcon"
                      variant="tonal"
                      size="small"
                    >
                      {{ feedback.type }}
                    </v-chip>
                  </div>
                </div>
              </v-col>

              <!-- Date Created -->
              <v-col cols="12" sm="6">
                <div class="info-field">
                  <label class="text-caption font-weight-bold grey--text">Date Created</label>
                  <div class="text-body-1 mt-1">{{ formattedDate }}</div>
                </div>
              </v-col>

              <!-- Rating (if available) -->
              <v-col cols="12" sm="6" v-if="feedback.rate">
                <div class="info-field">
                  <label class="text-caption font-weight-bold grey--text">Rating</label>
                  <div class="mt-1 d-flex align-center">
                    <v-rating
                      :model-value="feedback.rate"
                      :color="ratingColor"
                      readonly
                      density="compact"
                    />
                    <span class="text-body-1 ml-2">({{ feedback.rate }}/5)</span>
                  </div>
                </div>
              </v-col>

              <!-- Collection ID (for collection feedback) -->
              <v-col
                cols="12"
                sm="6"
                v-if="feedback.type === 'collection' && feedback.collection_id"
              >
                <div class="info-field">
                  <label class="text-caption font-weight-bold grey--text">Collection ID</label>
                  <div class="text-body-1 mt-1">#{{ feedback.collection_id }}</div>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <!-- User Information -->
          <v-col cols="12">
            <v-divider class="my-4" />
            <h3 class="text-h6 mb-4">User Information</h3>

            <v-row>
              <v-col cols="12" sm="6">
                <div class="info-field">
                  <label class="text-caption font-weight-bold grey--text">Name</label>
                  <div class="text-body-1 mt-1">
                    {{ feedback.user_name || 'Not provided' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="info-field">
                  <label class="text-caption font-weight-bold grey--text">Email</label>
                  <div class="text-body-1 mt-1">
                    {{ feedback.user_email || 'Not provided' }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <!-- Feedback Content -->
          <v-col cols="12">
            <v-divider class="my-4" />
            <h3 class="text-h6 mb-4">Feedback Content</h3>

            <!-- Title -->
            <div class="info-field mb-4">
              <label class="text-caption font-weight-bold grey--text">Title</label>
              <div class="text-h6 mt-1">
                {{ feedback.title || 'No title provided' }}
              </div>
            </div>

            <!-- Description -->
            <div class="info-field">
              <label class="text-caption font-weight-bold grey--text">Description</label>
              <v-card variant="outlined" class="mt-2">
                <v-card-text class="text-body-1" style="white-space: pre-wrap;">
                  {{ feedback.description || 'No description provided' }}
                </v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          @click="closeDialog"
          variant="elevated"
          color="primary"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.info-field {
  margin-bottom: 16px;
}

.info-field label {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.v-card-text {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
