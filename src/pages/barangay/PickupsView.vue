<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import { supabase, supabaseAdmin } from "@/lib/supabase";
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

interface Collector {
  id: string;
  username: string;
  email: string;
}

// Composables
const toast = useToast();

// State
const loading = ref(false);
const collections = ref<Collection[]>([]);
const collectors = ref<Collector[]>([]);
const search = ref("");
const statusFilter = ref<string | null>(null);
const garbageTypeFilter = ref<string | null>(null);

// Modal state
const assignCollectorDialog = ref(false);
const selectedCollection = ref<Collection | null>(null);
const selectedCollectorId = ref<string | null>(null);
const assigningCollector = ref(false);

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

const collectorOptions = computed(() => {
  return collectors.value.map((collector) => ({
    title: `${collector.username} (${collector.email})`,
    value: collector.id,
  }));
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

const fetchCollectors = async () => {
  try {
    // Fetch all auth users using admin client
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;

    // Filter users with collector role (role = 4) from user_metadata
    const collectorUsers = (data.users || [])
      .filter((user) => user.user_metadata?.role === 4)
      .map((user) => ({
        id: user.id,
        username:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Unknown",
        email: user.email || "",
      }));

    collectors.value = collectorUsers;
  } catch (error: any) {
    console.error("Error fetching collectors:", error);
    toast.error("Failed to load collectors");
  }
};

const openAssignCollectorDialog = (collection: Collection) => {
  selectedCollection.value = collection;
  selectedCollectorId.value = collection.collector_assign;
  assignCollectorDialog.value = true;
};

const assignCollector = async () => {
  if (!selectedCollection.value || !selectedCollectorId.value) {
    toast.error("Please select a collector");
    return;
  }

  try {
    assigningCollector.value = true;

    const { error } = await supabase
      .from("collections")
      .update({
        collector_assign: selectedCollectorId.value,
        status: "in_progress",
      })
      .eq("id", selectedCollection.value.id);

    if (error) throw error;

    toast.success("Collector assigned successfully");
    assignCollectorDialog.value = false;
    await fetchCollections();
  } catch (error: any) {
    console.error("Error assigning collector:", error);
    toast.error("Failed to assign collector");
  } finally {
    assigningCollector.value = false;
  }
};

const acceptRequest = (collection: Collection) => {
  openAssignCollectorDialog(collection);
};

const rejectRequest = async (collection: Collection) => {
  if (!confirm("Are you sure you want to reject this pickup request?")) {
    return;
  }

  try {
    const { error } = await supabase
      .from("collections")
      .update({ status: "cancelled" })
      .eq("id", collection.id);

    if (error) throw error;

    toast.success("Pickup request rejected");
    await fetchCollections();
  } catch (error: any) {
    console.error("Error rejecting request:", error);
    toast.error("Failed to reject pickup request");
  }
};

const deleteRequest = async (collection: Collection) => {
  if (
    !confirm(
      "Are you sure you want to delete this pickup request? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id);

    if (error) throw error;

    toast.success("Pickup request deleted");
    await fetchCollections();
  } catch (error: any) {
    console.error("Error deleting request:", error);
    toast.error("Failed to delete pickup request");
  }
};

const getCollectorName = (collectorId: string | null) => {
  if (!collectorId) return "Unassigned";
  const collector = collectors.value.find((c) => c.id === collectorId);
  return collector ? collector.username : "Unknown";
};

const clearFilters = () => {
  search.value = "";
  statusFilter.value = null;
  garbageTypeFilter.value = null;
};

onMounted(() => {
  fetchCollections();
  fetchCollectors();
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
                  {
                    title: 'Assigned Collector',
                    key: 'collector_assign',
                    width: '180px',
                  },
                  { title: 'Requested On', key: 'created_at', width: '200px' },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: '200px',
                    sortable: false,
                  },
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

                <template #item.collector_assign="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      size="small"
                      class="mr-2"
                      :color="item.collector_assign ? 'success' : 'grey'"
                      >mdi-account</v-icon
                    >
                    <span
                      :class="
                        item.collector_assign ? '' : 'text-medium-emphasis'
                      "
                    >
                      {{ getCollectorName(item.collector_assign) }}
                    </span>
                  </div>
                </template>

                <template #item.created_at="{ item }">
                  <div class="text-body-2">
                    {{ formatDate(item.created_at) }}
                  </div>
                </template>

                <template #item.actions="{ item }">
                  <div class="d-flex ga-1">
                    <v-tooltip text="Accept & Assign" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-check"
                          size="small"
                          color="success"
                          variant="tonal"
                          @click="acceptRequest(item)"
                          :disabled="
                            item.status === 'completed' ||
                            item.status === 'cancelled'
                          "
                        />
                      </template>
                    </v-tooltip>

                    <v-tooltip text="Reject Request" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-close"
                          size="small"
                          color="warning"
                          variant="tonal"
                          @click="rejectRequest(item)"
                          :disabled="
                            item.status === 'completed' ||
                            item.status === 'cancelled'
                          "
                        />
                      </template>
                    </v-tooltip>

                    <v-tooltip text="Delete Request" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-delete"
                          size="small"
                          color="error"
                          variant="tonal"
                          @click="deleteRequest(item)"
                        />
                      </template>
                    </v-tooltip>
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

        <!-- Assign Collector Dialog -->
        <v-dialog v-model="assignCollectorDialog" max-width="500px" persistent>
          <v-card>
            <v-card-title class="text-h6 font-weight-bold bg-primary">
              <v-icon class="mr-2">mdi-account-plus</v-icon>
              Assign Collector
            </v-card-title>

            <v-card-text class="pt-6">
              <div v-if="selectedCollection" class="mb-4">
                <div class="text-subtitle-2 text-medium-emphasis mb-2">
                  Request Details:
                </div>
                <div class="d-flex align-center mb-1">
                  <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
                  <span class="text-body-2">{{
                    selectedCollection.address
                  }}</span>
                </div>
                <div class="d-flex align-center mb-1">
                  <v-icon size="small" class="mr-2">mdi-delete</v-icon>
                  <span class="text-body-2">{{
                    selectedCollection.garbage_type
                  }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-calendar</v-icon>
                  <span class="text-body-2">{{
                    formatDate(selectedCollection.created_at)
                  }}</span>
                </div>
              </div>

              <v-divider class="my-4" />

              <v-select
                v-model="selectedCollectorId"
                :items="collectorOptions"
                label="Select Collector"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
                :rules="[(v) => !!v || 'Please select a collector']"
                hint="Choose a collector to assign to this pickup request"
                persistent-hint
              />
            </v-card-text>

            <v-card-actions class="px-6 pb-4">
              <v-spacer />
              <v-btn
                variant="text"
                @click="assignCollectorDialog = false"
                :disabled="assigningCollector"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                @click="assignCollector"
                :loading="assigningCollector"
                :disabled="!selectedCollectorId"
              >
                Assign Collector
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.rounded-lg {
  border-radius: 12px;
}
</style>
