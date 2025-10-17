<script setup lang="ts">
import { computed } from "vue";

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

// Props
const props = defineProps<{
  collections: Collection[];
}>();

// Computed
const totalRequests = computed(() => props.collections.length);

const pendingRequests = computed(
  () => props.collections.filter((c) => c.status === "pending").length
);

const inProgressRequests = computed(
  () => props.collections.filter((c) => c.status === "in_progress").length
);

const completedRequests = computed(
  () => props.collections.filter((c) => c.status === "completed").length
);
</script>

<template>
  <v-row class="mb-4">
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4 stat-card" elevation="0">
        <div class="d-flex align-center">
          <v-icon color="primary" size="32" class="mr-3"
            >mdi-clipboard-list</v-icon
          >
          <div>
            <div class="text-h5 font-weight-bold">
              {{ totalRequests }}
            </div>
            <div class="text-caption text-medium-emphasis">Total Requests</div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4 stat-card" elevation="0">
        <div class="d-flex align-center">
          <v-icon color="warning" size="32" class="mr-3"
            >mdi-clock-outline</v-icon
          >
          <div>
            <div class="text-h5 font-weight-bold">
              {{ pendingRequests }}
            </div>
            <div class="text-caption text-medium-emphasis">Pending</div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4 stat-card" elevation="0">
        <div class="d-flex align-center">
          <v-icon color="info" size="32" class="mr-3">mdi-truck-fast</v-icon>
          <div>
            <div class="text-h5 font-weight-bold">
              {{ inProgressRequests }}
            </div>
            <div class="text-caption text-medium-emphasis">In Progress</div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4 stat-card" elevation="0">
        <div class="d-flex align-center">
          <v-icon color="success" size="32" class="mr-3"
            >mdi-check-circle</v-icon
          >
          <div>
            <div class="text-h5 font-weight-bold">
              {{ completedRequests }}
            </div>
            <div class="text-caption text-medium-emphasis">Completed</div>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.stat-card {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 16px;
}

.v-theme--dark .stat-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
