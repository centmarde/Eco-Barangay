<script setup lang="ts">
import { getUserDisplayName, getEmailInitials } from "@/utils/userHelpers";
import { useRequestHistoryView } from "../composables/requestView";
import { useDisplay } from "vuetify";
import { onMounted, ref, computed, watch } from "vue";
import RequestDialog from "../dialogs/RequestDialog.vue";
import RequestsPagination from "./RequestsPagination.vue";

const { smAndDown, mdAndUp } = useDisplay();

const {
  loading,
  selectedStatus,
  filteredCollections,
  statusCounts,
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
} = useRequestHistoryView();

// Search
const searchQuery = ref("");

// Apply search filter
const searchedCollections = computed(() => {
  if (!searchQuery.value.trim()) {
    return filteredCollections.value;
  }

  const query = searchQuery.value.toLowerCase().trim();

  return filteredCollections.value.filter((collection) => {
    const requesterName = collection.requester_name?.toLowerCase() || "";
    const requesterEmail = collection.requester_email?.toLowerCase() || "";
    const collectorName = collection.collector_name?.toLowerCase() || "";
    const collectorEmail = collection.collector_email?.toLowerCase() || "";

    return (
      requesterName.includes(query) ||
      requesterEmail.includes(query) ||
      collectorName.includes(query) ||
      collectorEmail.includes(query)
    );
  });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(8);

const paginatedCollections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return searchedCollections.value.slice(start, end);
});

// Reset to page 1 when filters change
const resetPagination = () => {
  currentPage.value = 1;
};

// Watch for filter changes
watch([selectedStatus, searchQuery], () => {
  resetPagination();
});

onMounted(async () => {
  await fetchCollections();
});

const handleStatusUpdate = async (collectionId: number, newStatus: string) => {
  await updateCollectionStatus(collectionId, newStatus);
};
</script>

<template>
  <div class="requests-widget">
    <!-- Search Section -->
    <v-card class="mb-4">
      <v-card-text class="pa-3">
        <v-text-field
          v-model="searchQuery"
          density="comfortable"
          variant="outlined"
          placeholder="Search by name or email..."
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          :loading="loading"
        >
          <template #append-inner>
            <v-fade-transition>
              <v-chip
                v-if="searchQuery"
                size="small"
                color="primary"
                variant="flat"
              >
                {{ searchedCollections.length }} found
              </v-chip>
            </v-fade-transition>
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>

    <!-- Filter Section -->
    <v-card class="mb-4">
      <v-card-text class="pa-2">
        <!-- Filter Header -->
        <div class="d-flex align-center mb-3 px-2">
          <v-icon color="primary" class="mr-2">mdi-filter</v-icon>
          <span class="text-subtitle-2 font-weight-bold">Status Filters</span>
        </div>

        <v-divider class="mb-2" />

        <!-- Status Filter Tabs -->
        <v-chip-group
          v-model="selectedStatus"
          mandatory
          selected-class="text-primary"
          class="d-flex flex-wrap"
        >
          <v-chip value="all" :size="smAndDown ? 'small' : 'default'">
            <v-icon start>mdi-format-list-bulleted</v-icon>
            All ({{ statusCounts.all }})
          </v-chip>
          <v-chip
            value="pending"
            color="warning"
            :size="smAndDown ? 'small' : 'default'"
          >
            <v-icon start>mdi-clock-outline</v-icon>
            Pending ({{ statusCounts.pending }})
          </v-chip>
          <v-chip
            value="in_progress"
            color="info"
            :size="smAndDown ? 'small' : 'default'"
          >
            <v-icon start>mdi-truck-delivery</v-icon>
            In Progress ({{ statusCounts.in_progress }})
          </v-chip>
          <v-chip
            value="completed"
            color="success"
            :size="smAndDown ? 'small' : 'default'"
          >
            <v-icon start>mdi-check-circle</v-icon>
            Completed ({{ statusCounts.completed }})
          </v-chip>
          <v-chip
            value="cancelled"
            color="error"
            :size="smAndDown ? 'small' : 'default'"
          >
            <v-icon start>mdi-close-circle</v-icon>
            Cancelled ({{ statusCounts.cancelled }})
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
      v-else-if="!searchedCollections.length"
      justify="center"
      class="my-8"
    >
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey">
          {{ searchQuery ? "mdi-file-search-outline" : "mdi-inbox" }}
        </v-icon>
        <p class="text-h6 mt-4 text-grey">
          {{ searchQuery ? "No results found" : "No collections found" }}
        </p>
        <p class="text-body-2 text-grey">
          <template v-if="searchQuery">
            No collections match your search "{{ searchQuery }}"
          </template>
          <template v-else>
            {{
              selectedStatus === "all"
                ? "There are no collections yet."
                : `No ${getStatusText(selectedStatus).toLowerCase()} collections.`
            }}
          </template>
        </p>
        <v-btn
          v-if="searchQuery"
          variant="outlined"
          color="primary"
          class="mt-2"
          @click="searchQuery = ''"
        >
          <v-icon start>mdi-close</v-icon>
          Clear Search
        </v-btn>
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
              @click="openDialog(collection)"
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
      :total-items="searchedCollections.length"
    />

    <!-- Request Dialog -->
    <RequestDialog
      v-model="showDialog"
      :collection="selectedCollection"
      @status-updated="handleStatusUpdate"
    />
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
</style>
