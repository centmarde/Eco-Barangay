<script setup lang="ts">
import { onMounted } from "vue";
import { useDisplay } from "vuetify";
import {
  getFeedbackRatingIcon,
  getFeedbackRatingColor,
  getFeedbackStatusColor,
} from "@/utils/feedbackHelpers";
import { formatRelativeTime } from "@/utils/dateHelpers";
import { FEEDBACK_STATUS_OPTIONS } from "@/utils/constants";
import { useFeedbackManagement } from "../composables/useFeedbackManagement";

const { mobile, smAndDown } = useDisplay();

// Use feedback management composable
const {
  selectedFilter,
  isLoading,
  filteredFeedback,
  feedbackStats,
  loadFeedbacks,
  updateStatus,
  deleteFeedback,
} = useFeedbackManagement();

// Constants
const statusOptions = FEEDBACK_STATUS_OPTIONS;

// Methods (aliases for helpers)
const getRatingIcon = getFeedbackRatingIcon;
const getRatingColor = getFeedbackRatingColor;
const getStatusColor = getFeedbackStatusColor;
const formatTimestamp = formatRelativeTime;

// Lifecycle
onMounted(() => {
  loadFeedbacks();
});
</script>

<template>
  <v-card elevation="2" class="feedback-card rounded-lg">
    <!-- Header -->
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-3">
      <div class="d-flex align-center">
        <v-icon class="me-2" color="primary" size="24">mdi-message-text</v-icon>
        <span class="text-h6 text-sm-h5">User Feedback</span>
      </div>
      <v-chip color="primary" variant="tonal" size="small">
        <span class="font-weight-bold">{{ feedbackStats.total }}</span>
        <span class="ms-1">Total</span>
      </v-chip>
    </v-card-title>

    <v-divider />

    <!-- Stats Overview -->
    <v-card-text class="pa-4">
      <v-row dense class="mb-4">
        <v-col cols="6" sm="3">
          <v-card
            variant="tonal"
            color="primary"
            class="stat-card"
            elevation="0"
          >
            <v-card-text class="pa-3 text-center">
              <div class="text-h5 text-sm-h4 font-weight-bold mb-1">
                {{ feedbackStats.new }}
              </div>
              <div class="text-caption text-sm-body-2">New</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card
            variant="tonal"
            color="success"
            class="stat-card"
            elevation="0"
          >
            <v-card-text class="pa-3 text-center">
              <div class="text-h5 text-sm-h4 font-weight-bold mb-1">
                {{ feedbackStats.reviewed }}
              </div>
              <div class="text-caption text-sm-body-2">Reviewed</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card
            variant="tonal"
            color="success"
            class="stat-card"
            elevation="0"
          >
            <v-card-text class="pa-3 text-center">
              <div class="text-h5 text-sm-h4 font-weight-bold mb-1">
                {{ feedbackStats.resolved }}
              </div>
              <div class="text-caption text-sm-body-2">Resolved</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card variant="tonal" color="info" class="stat-card" elevation="0">
            <v-card-text class="pa-3 text-center">
              <div class="text-h5 text-sm-h4 font-weight-bold mb-1">
                {{ feedbackStats.avgRating }}
              </div>
              <div class="text-caption text-sm-body-2">Avg Rating</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filter Tabs -->
      <v-tabs
        v-model="selectedFilter"
        :density="smAndDown ? 'comfortable' : 'default'"
        color="primary"
        class="mb-4"
        slider-color="primary"
      >
        <v-tab
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
          class="text-none"
        >
          <span class="text-caption text-sm-body-2">{{ option.label }}</span>
        </v-tab>
      </v-tabs>

      <!-- Feedback List -->
      <div v-if="isLoading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <p class="text-body-2 text-medium-emphasis mt-4">
          Loading feedbacks...
        </p>
      </div>

      <div v-else-if="filteredFeedback.length > 0" class="feedback-list">
        <v-card
          v-for="feedback in filteredFeedback"
          :key="feedback.id"
          variant="outlined"
          class="mb-3 feedback-item"
          elevation="0"
        >
          <v-card-text class="pa-3 pa-sm-4">
            <!-- Header Row -->
            <div class="d-flex align-start justify-space-between mb-3">
              <div class="d-flex align-start flex-grow-1">
                <v-avatar size="40" color="primary" class="me-3">
                  <v-icon v-if="!feedback.userAvatar" size="20">
                    mdi-account
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-bold mb-1">
                    {{ feedback.userName }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatTimestamp(feedback.timestamp) }}
                  </div>
                </div>
              </div>

              <div
                class="d-flex flex-column flex-sm-row align-end align-sm-center ga-2 ms-2"
              >
                <!-- Rating -->
                <v-chip
                  :color="getRatingColor(feedback.rating)"
                  size="small"
                  variant="flat"
                  class="rating-chip"
                >
                  <v-icon
                    size="16"
                    :icon="getRatingIcon(feedback.rating)"
                    class="me-1"
                  />
                  <span class="font-weight-bold">{{ feedback.rating }}/4</span>
                </v-chip>

                <!-- Status -->
                <v-chip
                  :color="getStatusColor(feedback.status)"
                  size="small"
                  variant="tonal"
                  class="text-capitalize"
                >
                  {{ feedback.status }}
                </v-chip>
              </div>
            </div>

            <!-- Comment -->
            <p class="text-body-2 mb-3 feedback-comment">
              {{ feedback.comment }}
            </p>

            <!-- Actions -->
            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-if="feedback.status === 'new'"
                size="small"
                variant="flat"
                color="warning"
                class="text-none"
                @click="updateStatus(feedback.id, 'reviewed')"
              >
                <v-icon size="16" class="me-1">mdi-eye-check</v-icon>
                <span class="d-none d-sm-inline">Mark </span>Reviewed
              </v-btn>
              <v-btn
                v-if="feedback.status !== 'resolved'"
                size="small"
                variant="flat"
                color="success"
                class="text-none"
                @click="updateStatus(feedback.id, 'resolved')"
              >
                <v-icon size="16" class="me-1">mdi-check-circle</v-icon>
                <span class="d-none d-sm-inline">Mark </span>Resolved
              </v-btn>
              <v-btn
                size="small"
                variant="flat"
                color="error"
                class="text-none"
                @click="deleteFeedback(feedback.id)"
              >
                <v-icon size="16" class="me-1">mdi-delete</v-icon>
                Delete
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading" class="text-center py-12">
        <v-icon size="80" color="grey-lighten-1" class="mb-4">
          mdi-message-off-outline
        </v-icon>
        <p class="text-h6 text-medium-emphasis mb-2">No feedback found</p>
        <p class="text-body-2 text-medium-emphasis">
          Try selecting a different filter
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.feedback-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feedback-list {
  max-height: 800px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom scrollbar for feedback list */
.feedback-list::-webkit-scrollbar {
  width: 6px;
}

.feedback-list::-webkit-scrollbar-track {
  background: transparent;
}

.feedback-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.feedback-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.feedback-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}

.feedback-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.feedback-comment {
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.7);
}

.v-theme--dark .feedback-comment {
  color: rgba(255, 255, 255, 0.7);
}

.rating-chip {
  min-width: 60px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .feedback-list {
    max-height: 600px;
  }
}

@media (min-width: 960px) {
  .feedback-list {
    max-height: 1000px;
  }
}
</style>
