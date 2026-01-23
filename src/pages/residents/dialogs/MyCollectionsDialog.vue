<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useDisplay } from "vuetify";
import { formatDate, formatRelativeTime } from "@/utils/dateHelpers";
import type { CollectionWithEmails } from "@/stores/collectionsData";

interface Props {
  modelValue: boolean;
  collections: CollectionWithEmails[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { xs, sm, mdAndUp } = useDisplay();

// Local state
const selectedStatus = ref('all');
const searchQuery = ref('');

// Status options
const statusOptions = [
  { value: 'all', title: 'All', color: 'primary' },
  { value: 'pending', title: 'Pending', color: 'orange' },
  { value: 'in_progress', title: 'In Progress', color: 'blue' },
  { value: 'completed', title: 'Completed', color: 'green' },
  { value: 'cancelled', title: 'Cancelled', color: 'red' }
];

// Computed
const statusCounts = computed(() => {
  if (!props.collections.length) {
    return {
      all: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };
  }

  return {
    all: props.collections.length,
    pending: props.collections.filter(c => c.status === 'pending').length,
    in_progress: props.collections.filter(c => c.status === 'in_progress').length,
    completed: props.collections.filter(c => c.status === 'completed').length,
    cancelled: props.collections.filter(c => c.status === 'cancelled').length,
  };
});

const filteredCollections = computed(() => {
  let filtered = props.collections;

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(collection => collection.status === selectedStatus.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(collection =>
      collection.address.toLowerCase().includes(query) ||
      collection.garbage_type.toLowerCase().includes(query) ||
      (collection.purok && collection.purok.toLowerCase().includes(query)) ||
      (collection.notes && collection.notes.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// Status color mapping
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'orange',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red'
  };
  return colors[status] || 'grey';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'mdi-clock-outline',
    in_progress: 'mdi-truck',
    completed: 'mdi-check-circle',
    cancelled: 'mdi-close-circle'
  };
  return icons[status] || 'mdi-help-circle';
};

const getGarbageTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    organic: 'mdi-leaf',
    recyclable: 'mdi-recycle',
    non_recyclable: 'mdi-delete',
    hazardous: 'mdi-biohazard',
    mixed: 'mdi-package-variant'
  };
  return icons[type] || 'mdi-trash-can';
};

// Methods
const closeDialog = () => {
  emit('update:modelValue', false);
};

const refreshCollections = () => {
  emit('refresh');
};

// Watch for dialog changes to reset filters
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedStatus.value = 'all';
    searchQuery.value = '';
  }
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="closeDialog"
    :max-width="mdAndUp ? '1200' : '95vw'"
    :fullscreen="xs"
    scrollable
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-4 bg-success">
        <div class="d-flex align-center text-white">
          <v-icon icon="mdi-format-list-bulleted" class="mr-3" size="large"></v-icon>
          <div>
            <div class="text-h6 font-weight-bold">My Collections</div>
            <div class="text-caption" style="opacity: 0.9;">
              Track your waste collection requests
            </div>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="closeDialog"
        />
      </v-card-title>



      <!-- Search and Actions -->
      <v-card-text class="pa-4 pt-2">
        <v-row align="center" dense>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search collections..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="4" class="text-md-right">
            <v-btn
              color="success"
              variant="flat"
              prepend-icon="mdi-refresh"
              @click="refreshCollections"
              block
              :class="{ 'mt-2': !mdAndUp }"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Content -->
      <v-card-text class="pa-0" style="max-height: 60vh;">
        <!-- Loading State -->
        <div v-if="false" class="text-center pa-8">
          <v-progress-circular color="success" size="60" indeterminate class="mb-4"></v-progress-circular>
          <div class="text-h6 text-grey-darken-1">Loading collections...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!filteredCollections.length" class="text-center pa-8">
          <v-avatar color="grey-lighten-3" size="80" class="mb-4">
            <v-icon icon="mdi-package-variant-closed" size="50" color="grey-darken-1"></v-icon>
          </v-avatar>
          <v-card-title class="text-h6 font-weight-bold mb-2 justify-center">
            {{ props.collections.length ? 'No matching collections' : 'No collections yet' }}
          </v-card-title>
          <v-card-subtitle class="text-body-2 text-grey-darken-1 mb-4">
            {{ props.collections.length
              ? 'Try adjusting your search criteria or status filter'
              : 'Submit your first collection request to get started'
            }}
          </v-card-subtitle>
          <v-btn
            v-if="props.collections.length"
            color="success"
            variant="outlined"
            @click="searchQuery = ''; selectedStatus = 'all'"
          >
            Clear Filters
          </v-btn>
        </div>

        <!-- Collections List -->
        <div v-else class="pa-4">
          <v-row dense>
            <v-col
              v-for="collection in filteredCollections"
              :key="collection.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <v-card
                elevation="2"
                rounded="lg"
                border
                class="h-100"
              >
                <!-- Status Header -->
                <v-card-title
                  :class="[
                    'pa-3 d-flex align-center justify-space-between',
                    `bg-${getStatusColor(collection.status)}`
                  ]"
                >
                  <div class="d-flex align-center text-white">
                    <v-icon :icon="getStatusIcon(collection.status)" class="mr-2" size="small"></v-icon>
                    <span class="text-capitalize font-weight-medium text-body-2">
                      {{ collection.status.replace('_', ' ') }}
                    </span>
                  </div>
                  <v-chip
                    color="white"
                    variant="flat"
                    size="x-small"
                    :text="`#${collection.id}`"
                  />
                </v-card-title>

                <!-- Content -->
                <v-card-text class="pa-3">
                  <!-- Address -->
                  <div class="mb-2">
                    <div class="d-flex align-center mb-1">
                      <v-icon icon="mdi-map-marker" size="x-small" class="mr-1" color="grey-darken-1"></v-icon>
                      <span class="text-caption text-grey-darken-1 font-weight-medium">ADDRESS</span>
                    </div>
                    <div class="text-body-2 font-weight-medium">{{ collection.address }}</div>
                    <div v-if="collection.purok" class="text-caption text-grey-darken-1">
                      Purok: {{ collection.purok }}
                    </div>
                  </div>

                  <!-- Garbage Type -->
                  <div class="mb-2">
                    <div class="d-flex align-center mb-1">
                      <v-icon :icon="getGarbageTypeIcon(collection.garbage_type)" size="x-small" class="mr-1" color="grey-darken-1"></v-icon>
                      <span class="text-caption text-grey-darken-1 font-weight-medium">TYPE</span>
                    </div>
                    <div class="d-flex align-center flex-wrap ga-1">
                      <v-chip
                        :color="getStatusColor(collection.status)"
                        variant="tonal"
                        size="x-small"
                        class="text-capitalize"
                      >
                        {{ collection.garbage_type.replace('_', ' ') }}
                      </v-chip>
                      <v-chip
                        v-if="collection.is_hazardous"
                        color="red"
                        variant="tonal"
                        size="x-small"
                      >
                        <v-icon icon="mdi-biohazard" start size="x-small"></v-icon>
                        Hazardous
                      </v-chip>
                    </div>
                  </div>

                  <!-- Date -->
                  <div class="mb-2">
                    <div class="d-flex align-center mb-1">
                      <v-icon icon="mdi-calendar" size="x-small" class="mr-1" color="grey-darken-1"></v-icon>
                      <span class="text-caption text-grey-darken-1 font-weight-medium">REQUESTED</span>
                    </div>
                    <div class="text-caption">{{ formatDate(collection.created_at) }}</div>
                    <div class="text-caption text-grey-darken-1">{{ formatRelativeTime(collection.created_at) }}</div>
                  </div>

                  <!-- Collector -->
                  <div v-if="collection.collector_assign" class="mb-2">
                    <div class="d-flex align-center mb-1">
                      <v-icon icon="mdi-account" size="x-small" class="mr-1" color="grey-darken-1"></v-icon>
                      <span class="text-caption text-grey-darken-1 font-weight-medium">COLLECTOR</span>
                    </div>
                    <div class="text-caption">{{ collection.collector_name || 'Assigned' }}</div>
                  </div>

                  <!-- Notes -->
                  <div v-if="collection.notes">
                    <div class="d-flex align-center mb-1">
                      <v-icon icon="mdi-note-text" size="x-small" class="mr-1" color="grey-darken-1"></v-icon>
                      <span class="text-caption text-grey-darken-1 font-weight-medium">NOTES</span>
                    </div>
                    <div class="text-caption">{{ collection.notes }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.cursor-pointer {
  cursor: pointer;
}

.h-100 {
  height: 100%;
}
</style>
