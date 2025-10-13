<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();

// Mock data - Replace with actual API call
const feedbackList = ref([
  {
    id: 1,
    userName: "John Doe",
    userAvatar: null,
    rating: 4,
    comment:
      "Great app! Very intuitive and easy to use. Would love to see dark mode support.",
    timestamp: "2025-10-13T10:30:00",
    status: "new", // new, reviewed, resolved
  },
  {
    id: 2,
    userName: "Jane Smith",
    userAvatar: null,
    rating: 3,
    comment: "Good overall, but the loading times could be improved.",
    timestamp: "2025-10-13T09:15:00",
    status: "reviewed",
  },
  {
    id: 3,
    userName: "Mike Johnson",
    userAvatar: null,
    rating: 2,
    comment: "Encountered several bugs. Please fix the form validation issues.",
    timestamp: "2025-10-12T16:45:00",
    status: "new",
  },
  {
    id: 4,
    userName: "Sarah Williams",
    userAvatar: null,
    rating: 4,
    comment: "Excellent service! The notification system works perfectly.",
    timestamp: "2025-10-12T14:20:00",
    status: "resolved",
  },
]);

const selectedFilter = ref("all");
const isLoading = ref(false);

// Computed
const filteredFeedback = computed(() => {
  if (selectedFilter.value === "all") {
    return feedbackList.value;
  }
  return feedbackList.value.filter(
    (item) => item.status === selectedFilter.value
  );
});

const feedbackStats = computed(() => {
  return {
    total: feedbackList.value.length,
    new: feedbackList.value.filter((f) => f.status === "new").length,
    reviewed: feedbackList.value.filter((f) => f.status === "reviewed").length,
    resolved: feedbackList.value.filter((f) => f.status === "resolved").length,
    avgRating: (
      feedbackList.value.reduce((sum, f) => sum + f.rating, 0) /
      feedbackList.value.length
    ).toFixed(1),
  };
});

// Methods
const getRatingIcon = (rating: number) => {
  if (rating >= 4) return "mdi-emoticon-excited";
  if (rating === 3) return "mdi-emoticon-happy";
  if (rating === 2) return "mdi-emoticon-neutral";
  return "mdi-emoticon-sad";
};

const getRatingColor = (rating: number) => {
  if (rating >= 4) return "success";
  if (rating === 3) return "info";
  if (rating === 2) return "warning";
  return "error";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    new: "primary",
    reviewed: "warning",
    resolved: "success",
  };
  return colors[status] || "default";
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return date.toLocaleDateString();
};

const updateStatus = (id: number, newStatus: string) => {
  const feedback = feedbackList.value.find((f) => f.id === id);
  if (feedback) {
    feedback.status = newStatus;
    toast.success(`Status updated to ${newStatus}`);
  }
};

const deleteFeedback = (id: number) => {
  const index = feedbackList.value.findIndex((f) => f.id === id);
  if (index !== -1) {
    feedbackList.value.splice(index, 1);
    toast.success("Feedback deleted");
  }
};

// Lifecycle
onMounted(() => {
  // TODO: Fetch feedback from API
  console.log("Fetching feedback...");
});
</script>

<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon class="me-2" color="primary">mdi-message-text</v-icon>
        <span class="text-h6">User Feedback</span>
      </div>
      <v-chip color="primary" size="small">
        {{ feedbackStats.total }} Total
      </v-chip>
    </v-card-title>

    <!-- Stats Overview -->
    <v-card-text class="pa-4 pt-0">
      <v-row dense class="mb-3">
        <v-col cols="6" sm="3">
          <v-card variant="tonal" color="primary">
            <v-card-text class="pa-3 text-center">
              <div class="text-h6">{{ feedbackStats.new }}</div>
              <div class="text-caption">New</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card variant="tonal" color="warning">
            <v-card-text class="pa-3 text-center">
              <div class="text-h6">{{ feedbackStats.reviewed }}</div>
              <div class="text-caption">Reviewed</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card variant="tonal" color="success">
            <v-card-text class="pa-3 text-center">
              <div class="text-h6">{{ feedbackStats.resolved }}</div>
              <div class="text-caption">Resolved</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card variant="tonal" color="info">
            <v-card-text class="pa-3 text-center">
              <div class="text-h6">{{ feedbackStats.avgRating }}</div>
              <div class="text-caption">Avg Rating</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filter Tabs -->
      <v-tabs v-model="selectedFilter" density="compact" class="mb-3">
        <v-tab value="all">All</v-tab>
        <v-tab value="new">New</v-tab>
        <v-tab value="reviewed">Reviewed</v-tab>
        <v-tab value="resolved">Resolved</v-tab>
      </v-tabs>

      <!-- Feedback List -->
      <div v-if="filteredFeedback.length > 0" class="feedback-list">
        <v-card
          v-for="feedback in filteredFeedback"
          :key="feedback.id"
          variant="outlined"
          class="mb-3"
        >
          <v-card-text class="pa-3">
            <!-- Header Row -->
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="me-2">
                  <v-icon v-if="!feedback.userAvatar" size="18">
                    mdi-account
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold">
                    {{ feedback.userName }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatTimestamp(feedback.timestamp) }}
                  </div>
                </div>
              </div>

              <div class="d-flex align-center ga-1">
                <!-- Rating -->
                <v-chip
                  :color="getRatingColor(feedback.rating)"
                  size="small"
                  variant="flat"
                >
                  <v-icon size="16" :icon="getRatingIcon(feedback.rating)" />
                  <span class="ms-1">{{ feedback.rating }}/4</span>
                </v-chip>

                <!-- Status -->
                <v-chip
                  :color="getStatusColor(feedback.status)"
                  size="small"
                  variant="tonal"
                >
                  {{ feedback.status }}
                </v-chip>
              </div>
            </div>

            <!-- Comment -->
            <p class="text-body-2 mb-3">{{ feedback.comment }}</p>

            <!-- Actions -->
            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-if="feedback.status === 'new'"
                size="x-small"
                variant="tonal"
                color="warning"
                @click="updateStatus(feedback.id, 'reviewed')"
              >
                Mark Reviewed
              </v-btn>
              <v-btn
                v-if="feedback.status !== 'resolved'"
                size="x-small"
                variant="tonal"
                color="success"
                @click="updateStatus(feedback.id, 'resolved')"
              >
                Mark Resolved
              </v-btn>
              <v-btn
                size="x-small"
                variant="tonal"
                color="error"
                @click="deleteFeedback(feedback.id)"
              >
                Delete
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-3">
          mdi-message-off
        </v-icon>
        <p class="text-body-2 text-medium-emphasis">No feedback found</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.feedback-list {
  max-height: 600px;
  overflow-y: auto;
}
</style>
