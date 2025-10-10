<script setup lang="ts">
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
</script>

<template>
  <v-card elevation="2" :class="mobile ? 'pa-4' : 'pa-6'">
    <v-card-title :class="mobile ? 'text-h6 mb-3 pa-0' : 'text-h5 mb-4 pa-0'">
      <v-icon :class="mobile ? 'mr-1' : 'mr-2'" :size="mobile ? 20 : 24">
        mdi-monitor-dashboard
      </v-icon>
      System Status
    </v-card-title>

    <div class="mb-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <span :class="mobile ? 'text-caption' : 'text-body-2'">Database</span>
        <v-chip color="success" size="small" variant="tonal">
          <v-icon start :size="mobile ? 10 : 12">mdi-check-circle</v-icon>
          Online
        </v-chip>
      </div>

      <div class="d-flex justify-space-between align-center mb-3">
        <span :class="mobile ? 'text-caption' : 'text-body-2'"
          >API Services</span
        >
        <v-chip color="success" size="small" variant="tonal">
          <v-icon start :size="mobile ? 10 : 12">mdi-check-circle</v-icon>
          Running
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
