<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import type { DashboardStats } from "@/stores/dashboard";

interface Props {
  stats: DashboardStats;
}

const props = defineProps<Props>();
const { mobile } = useDisplay();

const iconSize = computed(() => (mobile.value ? 32 : 40));

const statsConfig = computed(() => [
  {
    label: "Total Users",
    value: props.stats.totalUsers,
    icon: "mdi-account-group",
    color: "primary",
  },
  {
    label: "Collectors",
    value: props.stats.activeCollectors,
    icon: "mdi-truck",
    color: "success",
  },
  {
    label: "Pending",
    value: props.stats.pendingRequests,
    icon: "mdi-clock-outline",
    color: "primary",
  },
  {
    label: "Completed",
    value: props.stats.completedPickups,
    icon: "mdi-check-circle",
    color: "primary",
  },
  {
    label: "Reports",
    value: props.stats.totalReports,
    icon: "mdi-file-document",
    color: "green",
  },
  {
    label: "Waste (kg)",
    value: props.stats.wasteCollected,
    icon: "mdi-recycle",
    color: "green",
  },
]);
</script>

<template>
  <v-row class="mb-4">
    <v-col
      v-for="stat in statsConfig"
      :key="stat.label"
      cols="6"
      sm="4"
      md="4"
      lg="2"
    >
      <v-card
        elevation="2"
        :class="mobile ? 'pa-3' : 'pa-4'"
        class="text-center stat-card"
        :color="stat.color"
        variant="tonal"
      >
        <v-icon :size="iconSize" class="mb-2" :color="stat.color">
          {{ stat.icon }}
        </v-icon>
        <div :class="mobile ? 'text-h6' : 'text-h5'" class="font-weight-bold">
          {{ stat.value.toLocaleString() }}
        </div>
        <div
          :class="mobile ? 'text-caption' : 'text-body-2'"
          class="text-medium-emphasis"
        >
          {{ stat.label }}
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  height: 100%;
  min-height: 100px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .stat-card {
    min-height: 90px;
  }
}
</style>
