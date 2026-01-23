<script setup lang="ts">
import { ref, watch } from "vue";
import { getUserDisplayName, getEmailInitials } from "@/utils/userHelpers";
import { getGarbageTypeIcon } from "@/utils/types";
import { getGarbageTypeColor } from "@/utils/colors";
import type { CollectionWithEmails } from "@/stores/collectionsData";

interface Props {
  modelValue: boolean;
  collection: CollectionWithEmails | null;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "statusUpdated", collectionId: number, newStatus: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const localStatus = ref<string>("");
const saving = ref(false);

// Status options
const statusOptions = [
  {
    value: "pending",
    title: "Pending",
    color: "warning",
    icon: "mdi-clock-outline",
  },
  {
    value: "in_progress",
    title: "In Progress",
    color: "info",
    icon: "mdi-truck-delivery",
  },
  {
    value: "completed",
    title: "Completed",
    color: "success",
    icon: "mdi-check-circle",
  },
  {
    value: "cancelled",
    title: "Cancelled",
    color: "error",
    icon: "mdi-close-circle",
  },
];

// Watch for changes in collection prop
watch(
  () => props.collection,
  (newCollection) => {
    if (newCollection) {
      localStatus.value = newCollection.status;
    }
  },
  { immediate: true }
);

const closeDialog = () => {
  emit("update:modelValue", false);
};

const saveStatus = () => {
  if (!props.collection || !localStatus.value) return;

  // Prevent saving if already completed or cancelled
  if (props.collection.status === "completed" || props.collection.status === "cancelled") {
    closeDialog();
    return;
  }

  emit("statusUpdated", props.collection.id, localStatus.value);
};

const getStatusColor = (status: string) => {
  return statusOptions.find((s) => s.value === status)?.color || "grey";
};

const getStatusIcon = (status: string) => {
  return (
    statusOptions.find((s) => s.value === status)?.icon || "mdi-help-circle"
  );
};

const getStatusTitle = (status: string) => {
  return statusOptions.find((s) => s.value === status)?.title || status;
};
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="800" persistent>
    <v-card v-if="collection">
      <v-card-title
        class="text-h5 font-weight-bold d-flex align-center bg-primary"
      >
        <v-icon left class="mr-2">mdi-file-document-edit</v-icon>
        Collection Details
        <v-spacer />
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row>
          <!-- Current Status Badge -->
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-4">
              <span class="text-subtitle-1 font-weight-bold"
                >Current Status:</span
              >
              <v-chip
                :color="getStatusColor(collection.status)"
                size="large"
                label
              >
                <v-icon start :icon="getStatusIcon(collection.status)" />
                {{ getStatusTitle(collection.status) }}
              </v-chip>
            </div>
            <v-divider class="mb-4" />
          </v-col>

          <!-- Requester Information -->
          <v-col cols="12" md="6" class="d-flex">
            <v-card variant="outlined" class="flex-fill">
              <v-card-title class="text-subtitle-1 bg-primary">
                <v-icon start color="primary">mdi-account</v-icon>
                Requester Information
              </v-card-title>
              <v-card-text>
                <div class="d-flex align-center my-2">
                  <v-avatar color="primary" size="48" class="mr-3">
                    <span class="text-h6 font-weight-bold">
                      {{ getEmailInitials(collection.requester_email) }}
                    </span>
                  </v-avatar>
                  <div>
                    <p class="text-body-1 mb-1 font-weight-medium">
                      {{
                        collection.requester_name ||
                        getUserDisplayName({
                          email: collection.requester_email,
                        })
                      }}
                    </p>
                    <p class="text-caption text-grey mb-0">
                      {{ collection.requester_email || "No email" }}
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Collector Information -->
          <v-col cols="12" md="6" class="d-flex">
            <v-card variant="outlined" class="flex-fill">
              <v-card-title class="text-subtitle-1 bg-primary">
                <v-icon start color="success">mdi-truck</v-icon>
                Collector Information
              </v-card-title>
              <v-card-text>
                <div class="d-flex align-center my-2">
                  <v-avatar
                    :color="collection.collector_email ? 'success' : 'grey'"
                    size="48"
                    class="mr-3"
                  >
                    <span class="text-h6 font-weight-bold">
                      {{
                        collection.collector_email
                          ? getEmailInitials(collection.collector_email)
                          : "?"
                      }}
                    </span>
                  </v-avatar>
                  <div>
                    <p class="text-body-1 mb-1 font-weight-medium">
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
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Address -->
          <v-col cols="12">
            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1 bg-primary">
                <v-icon start color="error">mdi-map-marker</v-icon>
                Pickup Location
              </v-card-title>
              <v-card-text>
                <p class="text-body-1 mb-0">{{ collection.address }}</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Garbage Type & Hazardous Status -->
          <v-col cols="12" md="6" class="d-flex">
            <v-card variant="outlined" class="flex-fill">
              <v-card-title class="text-subtitle-1 bg-primary">
                <v-icon start>mdi-delete-variant</v-icon>
                Waste Classification
              </v-card-title>
              <v-card-text>
                <div class="mb-1 text-caption text-medium-emphasis">Type</div>
                <v-chip
                  :color="getGarbageTypeColor(collection.garbage_type)"
                  size="default"
                  variant="tonal"
                  class="mb-4"
                >
                  <v-icon
                    start
                    :icon="getGarbageTypeIcon(collection.garbage_type)"
                  />
                  {{ collection.garbage_type.replace(/_/g, " ").toUpperCase() }}
                </v-chip>

                <v-divider class="mb-3"></v-divider>

                <div class="mb-1 text-caption text-medium-emphasis">Safety Status</div>
                <div v-if="collection.is_hazardous">
                  <v-alert
                    density="compact"
                    type="error"
                    variant="tonal"
                    border="start"
                    class="mb-0"
                  >
                    <template #prepend>
                      <v-icon>mdi-biohazard</v-icon>
                    </template>
                    <div class="text-subtitle-2 font-weight-bold">Hazardous</div>
                    <div class="text-caption">Handle with extreme care.</div>
                  </v-alert>
                </div>
                <div v-else>
                   <v-chip color="success" variant="tonal" size="small">
                      <v-icon start>mdi-shield-check</v-icon>
                      Non-Hazardous
                   </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Created Date -->
          <v-col cols="12" md="6" class="d-flex">
            <v-card variant="outlined" class="flex-fill">
              <v-card-title class="text-subtitle-1 bg-primary">
                <v-icon start color="grey">mdi-calendar</v-icon>
                Request Date
              </v-card-title>
              <v-card-text>
                <p class="text-body-1 my-3">
                  {{ new Date(collection.created_at).toLocaleString() }}
                </p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Status Update Section -->
          <v-col cols="12" v-if="collection.status !== 'completed' && collection.status !== 'cancelled'">
            <v-divider class="my-4" />
            <v-card variant="outlined" color="primary">
              <v-card-title class="text-subtitle-1 bg-primary">
                <v-icon start>mdi-update</v-icon>
                Update Status
              </v-card-title>
              <v-card-text class="pa-4">
                <v-select
                  v-model="localStatus"
                  :items="statusOptions"
                  item-title="title"
                  item-value="value"
                  label="Select New Status"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-format-list-bulleted"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :color="item.raw.color" :icon="item.raw.icon" />
                      </template>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="item.raw.color"
                        :icon="item.raw.icon"
                        class="mr-2"
                        size="small"
                      />
                      {{ item.title }}
                    </div>
                  </template>
                </v-select>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Read-only message for completed/cancelled -->
          <v-col cols="12" v-else>
            <v-divider class="my-4" />
            <v-alert
              :color="collection.status === 'completed' ? 'success' : 'error'"
              variant="tonal"
              prominent
            >
              <template #prepend>
                <v-icon size="large">
                  {{ collection.status === 'completed' ? 'mdi-check-circle' : 'mdi-cancel' }}
                </v-icon>
              </template>
              <div class="text-body-1">
                <strong>This collection is {{ collection.status }}</strong>
                <p class="mb-0 mt-2">
                  {{ collection.status === 'completed'
                    ? 'This collection has been completed and can no longer be modified.'
                    : 'This collection has been cancelled and can no longer be modified.' }}
                </p>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          v-if="collection.status === 'completed' || collection.status === 'cancelled'"
          variant="elevated"
          color="primary"
          @click="closeDialog"
        >
          <v-icon start>mdi-close</v-icon>
          Close
        </v-btn>
        <template v-else>
          <v-btn
            variant="text"
            color="grey"
            @click="closeDialog"
            :disabled="saving"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            @click="saveStatus"
            :loading="saving"
            :disabled="localStatus === collection.status"
          >
            <v-icon start>mdi-content-save</v-icon>
            Save Changes
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card-title.bg-grey-lighten-4 {
  padding: 12px 16px;
}

/* Make all cards in a row have equal height */
.d-flex {
  display: flex;
}

.flex-fill {
  flex: 1 1 auto;
  width: 100%;
}
</style>
