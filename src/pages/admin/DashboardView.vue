<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import { useDashboardStore } from "@/stores/dashboard";
import DashboardHeader from "./components/DashboardHeader.vue";
import DashboardStats from "./components/DashboardStats.vue";
import QuickActionsCard from "./components/QuickActionsCard.vue";
import RecentActivitiesCard from "./components/RecentActivitiesCard.vue";
import SystemStatusCard from "./components/SystemStatusCard.vue";

const router = useRouter();
const dashboardStore = useDashboardStore();
const { mobile, mdAndUp } = useDisplay();

// Reactive references from stores
const { dashboardStats, recentActivities, quickActions, loading, error } =
  storeToRefs(dashboardStore);

const navigateTo = (route: string) => {
  router.push(route);
};

onMounted(() => {
  dashboardStore.loadDashboardData();
});
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid :class="mobile ? 'pa-3' : 'pa-6'">
        <!-- Welcome Header -->
        <DashboardHeader />

        <!-- Loading State -->
        <v-row v-if="loading" class="mb-4">
          <v-col cols="12" class="text-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
              :size="mobile ? 50 : 70"
            ></v-progress-circular>
            <p class="text-body-1 mt-4">Loading dashboard data...</p>
          </v-col>
        </v-row>

        <!-- Error State -->
        <v-row v-if="error && !loading" class="mb-4">
          <v-col cols="12">
            <v-alert type="error" variant="tonal" closable>
              {{ error }}
            </v-alert>
          </v-col>
        </v-row>

        <!-- Statistics Cards -->
        <DashboardStats :stats="dashboardStats" />

        <!-- Quick Actions -->
        <QuickActionsCard :actions="quickActions" @navigate="navigateTo" />

        <!-- Recent Activities & System Status -->
        <v-row>
          <v-col cols="12" :lg="mdAndUp ? 8 : 12">
            <RecentActivitiesCard :activities="recentActivities" />
          </v-col>

          <v-col cols="12" :lg="mdAndUp ? 4 : 12">
            <SystemStatusCard />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
/* Smooth animations */
.v-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
