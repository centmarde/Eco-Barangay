<script setup lang="ts">
import {
  statusColor,
  garbageTypeColor,
  formatDate,
  getCollectorName,
} from "../utils/pickupHelpers";

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
  collections: Collection[];
  collectors: Collector[];
  loading: boolean;
}>();

// Emits
const emit = defineEmits<{
  accept: [collection: Collection];
  reject: [collection: Collection];
  delete: [collection: Collection];
}>();

// Methods
const handleAccept = (collection: Collection) => {
  emit("accept", collection);
};

const handleReject = (collection: Collection) => {
  emit("reject", collection);
};

const handleDelete = (collection: Collection) => {
  emit("delete", collection);
};
</script>

<template>
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
      :items="collections"
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
        <v-chip :color="statusColor(item.status)" size="small" variant="flat">
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
          <span :class="item.collector_assign ? '' : 'text-medium-emphasis'">
            {{ getCollectorName(item.collector_assign, collectors) }}
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
                @click="handleAccept(item)"
                :disabled="
                  item.status === 'completed' || item.status === 'cancelled'
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
                @click="handleReject(item)"
                :disabled="
                  item.status === 'completed' || item.status === 'cancelled'
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
                @click="handleDelete(item)"
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
          <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
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
</template>

<style scoped>
.rounded-lg {
  border-radius: 12px;
}
</style>
