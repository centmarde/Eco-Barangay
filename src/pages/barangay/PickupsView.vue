<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { useToast } from "vue-toastification";
import RequestsTable from "./components/requestsTable.vue";
import CollectorDialog from "./components/collectorDialog.vue";
import StatCards from "./components/statCards.vue";

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
    console.log("Fetched collectors with full names:", collectorUsers);
  } catch (error: any) {
    console.error("Error fetching collectors:", error);
    toast.error("Failed to load collectors");
  }
};

const acceptRequest = (collection: Collection) => {
  selectedCollection.value = collection;
  assignCollectorDialog.value = true;
};

const assignCollector = async (collectorId: string) => {
  if (!selectedCollection.value || !collectorId) {
    toast.error("Please select a collector");
    return;
  }

  try {
    assigningCollector.value = true;

    const isReassignment = selectedCollection.value.collector_assign !== null;

    const { error } = await supabase
      .from("collections")
      .update({
        collector_assign: collectorId,
        // Status remains pending until collector accepts
        // status: "in_progress",
      })
      .eq("id", selectedCollection.value.id);

    if (error) throw error;

    const message = isReassignment
      ? "Collector reassigned successfully - Awaiting acceptance"
      : "Collector assigned successfully - Awaiting acceptance";

    toast.success(message);
    assignCollectorDialog.value = false;
    await fetchCollections();
  } catch (error: any) {
    console.error("Error assigning collector:", error);
    toast.error("Failed to assign collector");
  } finally {
    assigningCollector.value = false;
  }
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
        <StatCards :collections="collections" />

        <!-- Collections Table -->
        <v-row>
          <v-col cols="12">
            <RequestsTable
              :collections="filteredCollections"
              :collectors="collectors"
              :loading="loading"
              @accept="acceptRequest"
              @reject="rejectRequest"
              @delete="deleteRequest"
            />
          </v-col>
        </v-row>

        <!-- Assign Collector Dialog -->
        <CollectorDialog
          v-model="assignCollectorDialog"
          :collection="selectedCollection"
          :collectors="collectors"
          :loading="assigningCollector"
          @assign="assignCollector"
        />
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped></style>
