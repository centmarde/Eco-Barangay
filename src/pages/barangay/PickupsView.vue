<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import { supabase } from "@/lib/supabase";
import { useToast } from "vue-toastification";

// Types
interface Collection {
  id: number;
  created_at: string;
  address: string;
  request_by: string;
  collector_assign: string | null;
  status: string;
  garbage_type: string;
}

// Composables
const toast = useToast();

// State
const loading = ref(false);
const collections = ref<Collection[]>([]);
const search = ref("");
const statusFilter = ref<string | null>(null);
const garbageTypeFilter = ref<string | null>(null);

// Computed
const filteredCollections = computed(() => {
  let filtered = collections.value;

  // Search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.address.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        item.garbage_type.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((item) => item.status === statusFilter.value);
  }

  // Garbage type filter
  if (garbageTypeFilter.value) {
    filtered = filtered.filter(
      (item) => item.garbage_type === garbageTypeFilter.value
    );
  }

  return filtered;
});

const statusOptions = computed(() => {
  const statuses = [...new Set(collections.value.map((item) => item.status))];
  return statuses.map((status) => ({ title: status, value: status }));
});

const garbageTypeOptions = computed(() => {
  const types = [
    ...new Set(collections.value.map((item) => item.garbage_type)),
  ];
  return types.map((type) => ({ title: type, value: type }));
});

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const garbageTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "organic":
      return "success";
    case "recyclable":
      return "info";
    case "hazardous":
      return "error";
    default:
      return "default";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Methods
const fetchCollections = async () => {
  try {
    loading.value = true;

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    collections.value = data || [];
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    toast.error("Failed to load pickup requests");
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  search.value = "";
  statusFilter.value = null;
  garbageTypeFilter.value = null;
};

onMounted(() => {
  fetchCollections();
});
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Header -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h1 class="text-h4 font-weight-bold mb-2">Pickup Requests</h1>
                <p class="text-body-2 text-medium-emphasis">
                  Monitor and manage all waste collection requests
                </p>
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                variant="tonal"
                @click="fetchCollections"
                :loading="loading"
              >
                Refresh
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Filters -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search by address, status, or type"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Filter by Status"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="garbageTypeFilter"
              :items="garbageTypeOptions"
              label="Filter by Type"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn block variant="outlined" @click="clearFilters" height="40">
              Clear Filters
            </v-btn>
          </v-col>
        </v-row>

        <!-- Stats Cards -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="0" color="surface-variant">
              <div class="d-flex align-center">
                <v-icon color="primary" size="32" class="mr-3"
                  >mdi-clipboard-list</v-icon
                >
                <div>
                  <div class="text-h5 font-weight-bold">
                    {{ collections.length }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Total Requests
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="0" color="warning-lighten-5">
              <div class="d-flex align-center">
                <v-icon color="warning" size="32" class="mr-3"
                  >mdi-clock-outline</v-icon
                >
                <div>
                  <div class="text-h5 font-weight-bold">
                    {{
                      collections.filter((c) => c.status === "pending").length
                    }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Pending</div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="0" color="info-lighten-5">
              <div class="d-flex align-center">
                <v-icon color="info" size="32" class="mr-3"
                  >mdi-truck-fast</v-icon
                >
                <div>
                  <div class="text-h5 font-weight-bold">
                    {{
                      collections.filter((c) => c.status === "in_progress")
                        .length
                    }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    In Progress
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card class="pa-4" elevation="0" color="success-lighten-5">
              <div class="d-flex align-center">
                <v-icon color="success" size="32" class="mr-3"
                  >mdi-check-circle</v-icon
                >
                <div>
                  <div class="text-h5 font-weight-bold">
                    {{
                      collections.filter((c) => c.status === "completed").length
                    }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Completed</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Collections Table -->
        <v-row>
          <v-col cols="12">
            <v-card elevation="0" class="rounded-lg">
              <v-data-table
                :headers="[
                  { title: 'ID', key: 'id', width: '80px' },
                  { title: 'Address', key: 'address' },
                  {
                    title: 'Garbage Type',
                    key: 'garbage_type',
                    width: '150px',
                  },
                  { title: 'Status', key: 'status', width: '150px' },
                  { title: 'Requested On', key: 'created_at', width: '200px' },
                ]"
                :items="filteredCollections"
                :loading="loading"
                :items-per-page="10"
                class="elevation-0"
              >
                <template #item.id="{ item }">
                  <span class="font-weight-medium">#{{ item.id }}</span>
                </template>

                <template #item.address="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2" color="primary"
                      >mdi-map-marker</v-icon
                    >
                    <span>{{ item.address }}</span>
                  </div>
                </template>

                <template #item.garbage_type="{ item }">
                  <v-chip
                    :color="garbageTypeColor(item.garbage_type)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.garbage_type }}
                  </v-chip>
                </template>

                <template #item.status="{ item }">
                  <v-chip
                    :color="statusColor(item.status)"
                    size="small"
                    variant="flat"
                  >
                    {{ item.status.replace("_", " ") }}
                  </v-chip>
                </template>

                <template #item.created_at="{ item }">
                  <div class="text-body-2">
                    {{ formatDate(item.created_at) }}
                  </div>
                </template>

                <template #loading>
                  <v-skeleton-loader type="table-row@10" />
                </template>

                <template #no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1"
                      >mdi-package-variant</v-icon
                    >
                    <p class="text-h6 mt-4 text-medium-emphasis">
                      No pickup requests found
                    </p>
                    <p class="text-body-2 text-medium-emphasis">
                      Try adjusting your filters
                    </p>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.rounded-lg {
  border-radius: 12px;
}
</style>
