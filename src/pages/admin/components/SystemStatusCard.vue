<script setup lang="ts">
import { useDisplay } from "vuetify";
import { computed } from "vue";

const { mobile } = useDisplay();

interface Props {
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

// Derive status from loading/error states
const systemState = computed(() => {
  if (props.loading) return { text: "Checking...", color: "warning", icon: "mdi-loading mdi-spin" };
  if (props.error) return { text: "Issues Detected", color: "error", icon: "mdi-alert-circle" };
  return { text: "Online", color: "success", icon: "mdi-check-circle" };
});

const apiState = computed(() => {
    if (props.loading) return { text: "Connecting...", color: "warning" };
    if (props.error) return { text: "Unreachable", color: "error" };
    return { text: "Running", color: "success" };
});
</script>

<template>
  <v-card elevation="2" :class="mobile ? 'pa-4' : 'pa-6'" class="h-100">
    <v-card-title :class="mobile ? 'text-h6 mb-4 pa-0' : 'text-h5 mb-4 pa-0'">
      <v-icon :class="mobile ? 'mr-1' : 'mr-2'" :size="mobile ? 20 : 24">
        mdi-monitor-dashboard
      </v-icon>
      System Status
    </v-card-title>

    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <span :class="mobile ? 'text-caption' : 'text-body-2'">Database</span>
        <v-chip :color="systemState.color" size="small" variant="tonal">
          <v-icon start :size="mobile ? 10 : 12">{{ systemState.icon }}</v-icon>
          {{ systemState.text }}
        </v-chip>
      </div>

      <div class="d-flex justify-space-between align-center mb-3">
        <span :class="mobile ? 'text-caption' : 'text-body-2'"
          >API Services</span
        >
        <v-chip :color="apiState.color" size="small" variant="tonal">
          <v-icon start :size="mobile ? 10 : 12">mdi-check-circle</v-icon>
          {{ apiState.text }}
        </v-chip>
      </div>

      <div class="d-flex justify-space-between align-center mb-3">
        <span :class="mobile ? 'text-caption' : 'text-body-2'"
          >Notifications</span
        >
        <v-chip color="success" size="small" variant="tonal">
          <v-icon start :size="mobile ? 10 : 12">mdi-check-circle</v-icon>
          Active
        </v-chip>
      </div>

      <div class="d-flex justify-space-between align-center">
        <span :class="mobile ? 'text-caption' : 'text-body-2'"
          >Backup Status</span
        >
        <v-chip color="info" size="small" variant="tonal">
          <v-icon start :size="mobile ? 10 : 12">mdi-clock</v-icon>
          Scheduled
        </v-chip>
      </div>
    </div>

    <v-divider class="my-4"></v-divider>

    <div class="text-center">
      <v-btn
        variant="outlined"
        color="primary"
        :size="mobile ? 'small' : 'default'"
        block
      >
        View Details
      </v-btn>
    </div>
  </v-card>
</template>