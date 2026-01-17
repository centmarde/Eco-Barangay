<script setup lang="ts">
import { getUserDisplayName, getEmailInitials } from "@/utils/userHelpers";
import { useRequestView } from "../composables/requestView";
import { useDisplay } from "vuetify";
import { onMounted, ref, computed } from "vue";
import RequestDialog from "../dialogs/RequestDialog.vue";
import RequestsPagination from "./RequestsPagination.vue";

const { smAndDown, mdAndUp } = useDisplay();

// Dialog for completed/cancelled collections
const showNotificationDialog = ref(false);
const notificationMessage = ref("");
const notificationTitle = ref("");
const notificationColor = ref("info");

const {
  loading,
  selectedStatus,
  showOnlyMyCollections,
  filteredCollections,
  statusCounts,
  myCollectionsCount,
  showDialog,
  selectedCollection,
  fetchCollections,
  openDialog,
  closeDialog,
  updateCollectionStatus,
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getGarbageTypeColor,
  getGarbageTypeIcon,
  formatDate,
} = useRequestView();

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(8);

const paginatedCollections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredCollections.value.slice(start, end);
});

// Reset to page 1 when filters change
const resetPagination = () => {
  currentPage.value = 1;
};

// Watch for filter changes
import { watch } from "vue";
watch([selectedStatus, showOnlyMyCollections], () => {
  resetPagination();
});

onMounted(async () => {
  await fetchCollections();
});

const handleStatusUpdate = async (collectionId: number, newStatus: string) => {
  await updateCollectionStatus(collectionId, newStatus);
};

const handleOpenDialog = (collection: any) => {
  // Check if collection is completed or cancelled
  if (collection.status === "completed") {
    notificationTitle.value = "Collection Completed";
    notificationMessage.value = "This collection has already been completed and cannot be modified.";
    notificationColor.value = "success";
    showNotificationDialog.value = true;
    return;
  }

  if (collection.status === "cancelled") {
    notificationTitle.value = "Collection Cancelled";
    notificationMessage.value = "This collection has been cancelled and cannot be modified.";
    notificationColor.value = "error";
    showNotificationDialog.value = true;
    return;
  }

  // If not completed or cancelled, open the dialog normally
  openDialog(collection);
};
</script>

<template>
  <div class="requests-widget">
    <!-- Filter Section -->
    <v-card class="mb-4">
      <v-card-text :class="smAndDown ? 'pa-2' : 'pa-4'">
        <div class="d-flex align-center mb-3" :class="smAndDown ? 'px-1' : 'px-2'">
          <v-icon color="primary" :class="smAndDown ? 'mr-1' : 'mr-2'" :size="smAndDown ? 'small' : 'default'">mdi-filter</v-icon>
          <span :class="smAndDown ? 'text-body-2 font-weight-bold' : 'text-subtitle-2 font-weight-bold'">Status Filters</span>
        </div>

        <v-divider :class="smAndDown ? 'mb-2' : 'mb-3'" />

        <!-- Status Filter Tabs -->
        <v-chip-group
          v-model="selectedStatus"
          mandatory
          selected-class="text-primary"
          :class="smAndDown ? 'd-flex flex-wrap justify-center' : 'd-flex flex-wrap'"
          :column="smAndDown"
        >
          <v-chip
            value="all"
            :size="smAndDown ? 'small' : 'default'"
            :class="smAndDown ? 'ma-1 flex-fill' : ''"
            style="min-width: fit-content;"
          >
            <v-icon start :size="smAndDown ? 'x-small' : 'small'">mdi-format-list-bulleted</v-icon>
            <span :class="smAndDown ? 'text-caption' : ''">All ({{ statusCounts.all }})</span>
          </v-chip>
          <v-chip
            value="pending"
            color="warning"
            :size="smAndDown ? 'small' : 'default'"
            :class="smAndDown ? 'ma-1 flex-fill' : ''"
            style="min-width: fit-content;"
          >
            <v-icon start :size="smAndDown ? 'x-small' : 'small'">mdi-clock-outline</v-icon>
            <span :class="smAndDown ? 'text-caption' : ''">Pending ({{ statusCounts.pending }})</span>
          </v-chip>
          <v-chip
            value="in_progress"
            color="info"
            :size="smAndDown ? 'small' : 'default'"
            :class="smAndDown ? 'ma-1 flex-fill' : ''"
            style="min-width: fit-content;"
          >
            <v-icon start :size="smAndDown ? 'x-small' : 'small'">mdi-truck-delivery</v-icon>
            <span :class="smAndDown ? 'text-caption' : ''">Progress ({{ statusCounts.in_progress }})</span>
          </v-chip>
          <v-chip
            value="completed"
            color="success"
            :size="smAndDown ? 'small' : 'default'"
            :class="smAndDown ? 'ma-1 flex-fill' : ''"
            style="min-width: fit-content;"
          >
            <v-icon start :size="smAndDown ? 'x-small' : 'small'">mdi-check-circle</v-icon>
            <span :class="smAndDown ? 'text-caption' : ''">Done ({{ statusCounts.completed }})</span>
          </v-chip>
          <v-chip
            value="cancelled"
            color="error"
            :size="smAndDown ? 'small' : 'default'"
            :class="smAndDown ? 'ma-1 flex-fill' : ''"
            style="min-width: fit-content;"
          >
            <v-icon start :size="smAndDown ? 'x-small' : 'small'">mdi-close-circle</v-icon>
            <span :class="smAndDown ? 'text-caption' : ''">Cancelled ({{ statusCounts.cancelled }})</span>
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <v-row v-if="loading" justify="center" class="my-8">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="text-h6 mt-4">Loading collections...</p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row
      v-else-if="!filteredCollections.length"
      justify="center"
      class="my-8"
    >
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">mdi-inbox</v-icon>
        <p class="text-h6 mt-4 text-grey">No collections found</p>
        <p class="text-body-2 text-grey">
          <template v-if="showOnlyMyCollections">
            {{
              selectedStatus === "all"
                ? "You have no collections assigned yet."
                : `You have no ${getStatusText(
                    selectedStatus
                  ).toLowerCase()} collections.`
            }}
          </template>
          <template v-else>
            {{
              selectedStatus === "all"
                ? "There are no collections yet."
                : `No ${getStatusText(
                    selectedStatus
                  ).toLowerCase()} collections.`
            }}
          </template>
        </p>
      </v-col>
    </v-row>

    <!-- Collections Grid -->
    <v-row v-else>
      <v-col
        v-for="collection in paginatedCollections"
        :key="collection.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="collection-card" :elevation="2" hover>
          <!-- Status Badge -->
          <div class="status-badge">
            <v-chip
              :color="getStatusColor(collection.status)"
              size="small"
              label
            >
              <v-icon
                start
                :icon="getStatusIcon(collection.status)"
                size="small"
              />
              {{ getStatusText(collection.status) }}
            </v-chip>
          </div>

          <v-card-text class="pb-2">
            <!-- Requester Info -->
            <div class="mb-3">
              <div class="d-flex align-center mb-2">
                <v-avatar color="primary" size="32" class="mr-2">
                  <span class="text-caption font-weight-bold">
                    {{ getEmailInitials(collection.requester_email) }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <p class="text-body-2 mb-0 font-weight-medium">
                    {{
                      collection.requester_name ||
                      getUserDisplayName({ email: collection.requester_email })
                    }}
                  </p>
                  <p class="text-caption text-grey mb-0">
                    {{ collection.requester_email || "No email" }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Collector Info -->
            <div class="mb-3">
              <div class="d-flex align-center mb-2">
                <v-avatar
                  :color="collection.collector_email ? 'success' : 'grey'"
                  size="32"
                  class="mr-2"
                >
                  <span class="text-caption font-weight-bold">
                    {{
                      collection.collector_email
                        ? getEmailInitials(collection.collector_email)
                        : "?"
                    }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <p class="text-body-2 mb-0 font-weight-medium">
                    {{
                      collection.collector_name ||
                      (collection.collector_email
                        ? getUserDisplayName({
                            email: collection.collector_email,
                          })
                        : "Not assigned")
                    }}
                  </p>
                  <p
                    v-if="collection.collector_email"
                    class="text-caption text-grey mb-0"
                  >
                    {{ collection.collector_email }}
                  </p>
                </div>
              </div>
            </div>

            <v-divider class="my-2" />

            <!-- Address -->
            <div class="mb-3">
              <div class="d-flex align-center mb-1">
                <v-icon size="small" class="mr-2" color="error"
                  >mdi-map-marker</v-icon
                >
                <span class="text-subtitle-2 font-weight-bold">Location</span>
              </div>
              <p class="text-body-2 ml-7 mb-0">{{ collection.address }}</p>
            </div>

            <!-- Garbage Type -->
            <div class="mb-3">
              <v-chip
                :color="getGarbageTypeColor(collection.garbage_type)"
                size="small"
                variant="tonal"
              >
                <v-icon
                  start
                  :icon="getGarbageTypeIcon(collection.garbage_type)"
                  size="small"
                />
                {{ collection.garbage_type.replace(/_/g, " ").toUpperCase() }}
              </v-chip>
            </div>

            <!-- Date -->
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2" color="grey"
                >mdi-calendar</v-icon
              >
              <span class="text-caption text-grey">{{
                formatDate(collection.created_at)
              }}</span>
            </div>
          </v-card-text>

          <v-divider />

          <!-- Actions -->
          <v-card-actions>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              block
              @click="handleOpenDialog(collection)"
            >
              <v-icon start>mdi-eye</v-icon>
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <RequestsPagination
      v-model:current-page="currentPage"
      v-model:items-per-page="itemsPerPage"
      :total-items="filteredCollections.length"
    />

    <!-- Request Dialog -->
    <RequestDialog
      v-model="showDialog"
      :collection="selectedCollection"
      @status-updated="handleStatusUpdate"
    />

    <!-- Notification Dialog for Completed/Cancelled Collections -->
    <v-dialog v-model="showNotificationDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold d-flex align-center" :class="`bg-${notificationColor}`">
          <v-icon :color="notificationColor" class="mr-2">
            {{ notificationColor === 'success' ? 'mdi-check-circle' : 'mdi-cancel' }}
          </v-icon>
          {{ notificationTitle }}
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-0">{{ notificationMessage }}</p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="elevated"
            :color="notificationColor"
            @click="showNotificationDialog = false"
          >
            <v-icon start>mdi-check</v-icon>
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.requests-widget {
  width: 100%;
}

.collection-card {
  position: relative;
  transition: transform 0.2s ease-in-out;
}

.collection-card:hover {
  transform: translateY(-4px);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.collection-card .v-card-text {
  padding-top: 48px;
}

/* Mobile responsive filter styles */
@media (max-width: 599px) {
  /* Extra small screens - stack chips in 2-3 columns */
  :deep(.v-chip-group) {
    gap: 4px !important;
  }

  :deep(.v-chip) {
    flex: 1 1 calc(50% - 8px) !important;
    max-width: calc(50% - 8px) !important;
    justify-content: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  :deep(.v-chip .v-chip__content) {
    font-size: 0.7rem !important;
    padding: 0 4px !important;
  }

  /* Adjust icon and text sizes on very small screens */
  :deep(.v-chip .v-icon) {
    font-size: 12px !important;
  }
}

@media (max-width: 959px) {
  /* Small to medium screens */
  :deep(.v-chip-group) {
    justify-content: center !important;
    gap: 6px !important;
  }

  :deep(.v-chip) {
    margin: 2px !important;
    min-width: fit-content !important;
  }

  /* Reduce padding on mobile filter section */
  .v-card-text {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

/* Ensure chips don't get too small on larger mobile screens */
@media (min-width: 600px) and (max-width: 959px) {
  :deep(.v-chip) {
    flex: 1 1 auto !important;
    max-width: none !important;
  }
}
</style>
