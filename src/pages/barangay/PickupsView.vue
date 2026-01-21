<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import { useToast } from "vue-toastification";
import { useCollectionsStore } from "@/stores/collectionsData";
import type { Collection, Collector } from "@/stores/collectionsData";
import RequestsTable from "./components/requestsTable.vue";
import CollectorDialog from "./components/collectorDialog.vue";
import StatCards from "./components/statCards.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";

// Composables
const toast = useToast();
const collectionsStore = useCollectionsStore();
const { collections, collectors, loading } = storeToRefs(collectionsStore);

// State
const search = ref("");
const statusFilter = ref<string | null>(null);
const garbageTypeFilter = ref<string | null>(null);

// Modal state
const assignCollectorDialog = ref(false);
const selectedCollection = ref<Collection | null>(null);
const assigningCollector = ref(false);

const confirmDialog = ref(false);
const confirmTitle = ref("");
const confirmMessage = ref("");
const confirmColor = ref("primary");
const confirmAction = ref<(() => Promise<void> | void) | null>(null);
const confirmLoading = ref(false);

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
        item.garbage_type.toLowerCase().includes(searchLower),
    );
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((item) => item.status === statusFilter.value);
  }

  // Garbage type filter
  if (garbageTypeFilter.value) {
    filtered = filtered.filter(
      (item) => item.garbage_type === garbageTypeFilter.value,
    );
  }

  return filtered.map((item) => ({
    ...item,
    purok: item.purok || "",
  })) as Collection[];
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
  await collectionsStore.fetchCollections();
};

const fetchCollectors = async () => {
  await collectionsStore.fetchCollectors();
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

    const success = await collectionsStore.assignCollector(
      selectedCollection.value.id,
      collectorId,
    );

    if (success) {
      assignCollectorDialog.value = false;
    }
  } catch (error: any) {
    console.error("Error assigning collector:", error);
  } finally {
    assigningCollector.value = false;
  }
};

const rejectRequest = (collection: Collection) => {
  confirmTitle.value = "Reject Request";
  confirmMessage.value = "Are you sure you want to reject this pickup request?";
  confirmColor.value = "warning";
  confirmAction.value = async () => {
    await collectionsStore.updateCollectionStatus(collection.id, "cancelled");
  };
  confirmDialog.value = true;
};

const deleteRequest = (collection: Collection) => {
  confirmTitle.value = "Delete Request";
  confirmMessage.value =
    "Are you sure you want to delete this pickup request? This action cannot be undone.";
  confirmColor.value = "error";
  confirmAction.value = async () => {
    await collectionsStore.deleteCollection(collection.id);
  };
  confirmDialog.value = true;
};

const handleConfirm = async () => {
  if (!confirmAction.value) return;

  confirmLoading.value = true;
  try {
    await confirmAction.value();
    confirmDialog.value = false;
  } catch (error) {
    console.error("Error confirming action:", error);
    toast.error("An error occurred while processing your request.");
  } finally {
    confirmLoading.value = false;
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

        <ConfirmDialog
          v-model="confirmDialog"
          :title="confirmTitle"
          :message="confirmMessage"
          :color="confirmColor"
          :loading="confirmLoading"
          @confirm="handleConfirm"
        />
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped></style>
