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
  collections: Collection[];
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
const assignedCollectorIds = computed(() => {
  // Get all collector IDs that are currently assigned to active requests
  return props.collections
    .filter((c) => c.status === "in_progress" || c.status === "pending")
    .map((c) => c.collector_assign)
    .filter((id): id is string => id !== null);
});

const isCollectorAvailable = (collectorId: string): boolean => {
  return !assignedCollectorIds.value.includes(collectorId);
};

const collectorOptions = computed(() => {
  return props.collectors.map((collector) => {
    const available = isCollectorAvailable(collector.id);
    return {
      title: available
        ? `${collector.username} (${collector.email})`
        : `${collector.username} (${collector.email}) - Currently Assigned`,
      value: collector.id,
      props: {
        disabled: !available,
      },
    };
  });
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
        <v-icon class="mr-2">mdi-account-plus</v-icon>
        Assign Collector
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
          hint="Choose an available collector to assign to this pickup request"
          persistent-hint
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :disabled="!isCollectorAvailable(item.value as string)"
            >
              <template #append>
                <v-chip
                  v-if="!isCollectorAvailable(item.value as string)"
                  size="x-small"
                  color="error"
                  variant="flat"
                >
                  Not Available
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-select>

        <v-alert
          v-if="assignedCollectorIds.length > 0"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <template #text>
            <span class="text-caption">
              {{ assignedCollectorIds.length }} collector{{
                assignedCollectorIds.length > 1 ? "s are" : " is"
              }}
              currently assigned to active requests
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
          Assign Collector
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
