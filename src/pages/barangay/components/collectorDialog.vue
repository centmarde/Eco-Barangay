<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { formatDate } from "../utils/pickupHelpers";

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

// Props
const props = defineProps<{
  modelValue: boolean;
  collection: Collection | null;
  collectors: Collector[];
  loading?: boolean;
}>();

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  assign: [collectorId: string];
}>();

// State
const selectedCollectorId = ref<string | null>(null);

// Computed
const isReassignment = computed(() => {
  return props.collection?.collector_assign !== null;
});

const dialogTitle = computed(() => {
  return isReassignment.value ? "Reassign Collector" : "Assign Collector";
});

const collectorOptions = computed(() => {
  return props.collectors.map((collector) => ({
    title: `${collector.username} (${collector.email})`,
    value: collector.id,
  }));
});

// Watch for dialog open/close to reset/populate collector
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.collection) {
      selectedCollectorId.value = props.collection.collector_assign;
    } else if (!isOpen) {
      selectedCollectorId.value = null;
    }
  }
);

// Methods
const closeDialog = () => {
  emit("update:modelValue", false);
};

const handleAssign = () => {
  if (selectedCollectorId.value) {
    emit("assign", selectedCollectorId.value);
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h6 font-weight-bold bg-primary">
        <v-icon class="mr-2">{{
          isReassignment ? "mdi-account-switch" : "mdi-account-plus"
        }}</v-icon>
        {{ dialogTitle }}
      </v-card-title>

      <v-card-text class="pt-6">
        <div v-if="collection" class="mb-4">
          <div class="text-subtitle-2 text-medium-emphasis mb-2">
            Request Details:
          </div>
          <div class="d-flex align-center mb-1">
            <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
            <span class="text-body-2">{{ collection.address }}</span>
          </div>
          <div class="d-flex align-center mb-1">
            <v-icon size="small" class="mr-2">mdi-delete</v-icon>
            <span class="text-body-2">{{ collection.garbage_type }}</span>
          </div>
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2">mdi-calendar</v-icon>
            <span class="text-body-2">{{
              formatDate(collection.created_at)
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
          :hint="
            isReassignment
              ? 'Choose a new collector to reassign this pickup request'
              : 'Choose a collector to assign to this pickup request'
          "
          persistent-hint
        />

        <v-alert
          v-if="isReassignment"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <template #text>
            <span class="text-caption">
              This request is currently assigned. Selecting a new collector will
              reassign the request.
            </span>
          </template>
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog" :disabled="loading">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleAssign"
          :loading="loading"
          :disabled="!selectedCollectorId"
        >
          {{ isReassignment ? "Reassign Collector" : "Assign Collector" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
