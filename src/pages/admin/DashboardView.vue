<script setup lang="ts">
import { onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import { useAuthUserStore } from "@/stores/authUser";
import { useDashboardStore } from "@/stores/dashboard";

const router = useRouter();
const authStore = useAuthUserStore();
const dashboardStore = useDashboardStore();
const { mobile, mdAndUp } = useDisplay();

// Reactive references from stores
const { dashboardStats, recentActivities, quickActions, loading, error } =
  storeToRefs(dashboardStore);

// Computed properties for mobile optimization
const statsCardSize = computed(() => (mobile.value ? "small" : "default"));
const iconSize = computed(() => (mobile.value ? 32 : 40));
const quickActionCols = computed(() => (mobile.value ? 6 : 3));

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
        <v-row class="mb-4">
          <v-col cols="12">
            <div
              :class="
                mobile
                  ? 'd-flex flex-column'
                  : 'd-flex align-center justify-space-between'
              "
            >
              <div :class="mobile ? 'mb-3' : ''">
                <h1
                  :class="mobile ? 'text-h5' : 'text-h4'"
                  class="font-weight-bold mb-2"
                >
                  Admin Dashboard
                </h1>
                <p
                  :class="mobile ? 'text-body-2' : 'text-subtitle-1'"
                  class="text-medium-emphasis"
                >
                  Welcome back, {{ authStore.userName }}!
                </p>
              </div>
              <v-chip
                color="success"
                variant="tonal"
                prepend-icon="mdi-shield-check"
                :size="mobile ? 'default' : 'large'"
              >
                Administrator
              </v-chip>
            </div>
          </v-col>
        </v-row>

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
        <v-row class="mb-4">
          <v-col cols="6" sm="4" md="4" lg="2">
            <v-card
              elevation="2"
              :class="mobile ? 'pa-3' : 'pa-4'"
              class="text-center stat-card"
              color="primary"
              variant="tonal"
            >
              <v-icon :size="iconSize" class="mb-2" color="primary">
                mdi-account-group
              </v-icon>
              <div
                :class="mobile ? 'text-h6' : 'text-h5'"
                class="font-weight-bold"
              >
                {{ dashboardStats.totalUsers.toLocaleString() }}
              </div>
              <div
                :class="mobile ? 'text-caption' : 'text-body-2'"
                class="text-medium-emphasis"
              >
                Total Users
              </div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="4" md="4" lg="2">
            <v-card
              elevation="2"
              :class="mobile ? 'pa-3' : 'pa-4'"
              class="text-center stat-card"
              color="success"
              variant="tonal"
            >
              <v-icon :size="iconSize" class="mb-2" color="success">
                mdi-truck
              </v-icon>
              <div
                :class="mobile ? 'text-h6' : 'text-h5'"
                class="font-weight-bold"
              >
                {{ dashboardStats.activeCollectors }}
              </div>
              <div
                :class="mobile ? 'text-caption' : 'text-body-2'"
                class="text-medium-emphasis"
              >
                Collectors
              </div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="4" md="4" lg="2">
            <v-card
              elevation="2"
              :class="mobile ? 'pa-3' : 'pa-4'"
              class="text-center stat-card"
              color="warning"
              variant="tonal"
            >
              <v-icon :size="iconSize" class="mb-2" color="warning">
                mdi-clock-outline
              </v-icon>
              <div
                :class="mobile ? 'text-h6' : 'text-h5'"
                class="font-weight-bold"
              >
                {{ dashboardStats.pendingRequests }}
              </div>
              <div
                :class="mobile ? 'text-caption' : 'text-body-2'"
                class="text-medium-emphasis"
              >
                Pending
              </div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="4" md="4" lg="2">
            <v-card
              elevation="2"
              :class="mobile ? 'pa-3' : 'pa-4'"
              class="text-center stat-card"
              color="info"
              variant="tonal"
            >
              <v-icon :size="iconSize" class="mb-2" color="info">
                mdi-check-circle
              </v-icon>
              <div
                :class="mobile ? 'text-h6' : 'text-h5'"
                class="font-weight-bold"
              >
                {{ dashboardStats.completedPickups.toLocaleString() }}
              </div>
              <div
                :class="mobile ? 'text-caption' : 'text-body-2'"
                class="text-medium-emphasis"
              >
                Completed
              </div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="4" md="4" lg="2">
            <v-card
              elevation="2"
              :class="mobile ? 'pa-3' : 'pa-4'"
              class="text-center stat-card"
              color="secondary"
              variant="tonal"
            >
              <v-icon :size="iconSize" class="mb-2" color="secondary">
                mdi-file-document
              </v-icon>
              <div
                :class="mobile ? 'text-h6' : 'text-h5'"
                class="font-weight-bold"
              >
                {{ dashboardStats.totalReports }}
              </div>
              <div
                :class="mobile ? 'text-caption' : 'text-body-2'"
                class="text-medium-emphasis"
              >
                Reports
              </div>
            </v-card>
          </v-col>

          <v-col cols="6" sm="4" md="4" lg="2">
            <v-card
              elevation="2"
              :class="mobile ? 'pa-3' : 'pa-4'"
              class="text-center stat-card"
              color="green"
              variant="tonal"
            >
              <v-icon :size="iconSize" class="mb-2" color="green">
                mdi-recycle
              </v-icon>
              <div
                :class="mobile ? 'text-h6' : 'text-h5'"
                class="font-weight-bold"
              >
                {{ dashboardStats.wasteCollected.toLocaleString() }}
              </div>
              <div
                :class="mobile ? 'text-caption' : 'text-body-2'"
                class="text-medium-emphasis"
              >
                Waste (kg)
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick Actions -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card elevation="2" :class="mobile ? 'pa-4' : 'pa-6'">
              <v-card-title
                :class="mobile ? 'text-h6 mb-3 pa-0' : 'text-h5 mb-4 pa-0'"
              >
                <v-icon
                  :class="mobile ? 'mr-1' : 'mr-2'"
                  :size="mobile ? 20 : 24"
                >
                  mdi-lightning-bolt
                </v-icon>
                Quick Actions
              </v-card-title>

              <v-row dense>
                <v-col
                  v-for="action in quickActions"
                  :key="action.title"
                  cols="6"
                  :md="quickActionCols"
                >
                  <v-card
                    :color="action.color"
                    variant="tonal"
                    :class="mobile ? 'pa-3' : 'pa-4'"
                    class="action-card cursor-pointer h-100"
                    elevation="1"
                    hover
                    @click="navigateTo(action.route)"
                  >
                    <div
                      class="text-center d-flex flex-column align-center justify-center h-100"
                    >
                      <v-icon
                        :color="action.color"
                        :size="mobile ? 36 : 48"
                        class="mb-2"
                      >
                        {{ action.icon }}
                      </v-icon>
                      <div
                        :class="mobile ? 'text-body-2' : 'text-h6'"
                        class="font-weight-bold mb-1"
                      >
                        {{ action.title }}
                      </div>
                      <div
                        v-if="!mobile"
                        class="text-caption text-medium-emphasis"
                      >
                        {{ action.description }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activities & System Status -->
        <v-row>
          <v-col cols="12" :lg="mdAndUp ? 8 : 12">
            <v-card elevation="2" :class="mobile ? 'pa-4' : 'pa-6'">
              <v-card-title
                :class="mobile ? 'text-h6 mb-3 pa-0' : 'text-h5 mb-4 pa-0'"
              >
                <v-icon
                  :class="mobile ? 'mr-1' : 'mr-2'"
                  :size="mobile ? 20 : 24"
                >
                  mdi-history
                </v-icon>
                Recent Activities
              </v-card-title>

              <!-- Empty State for Activities -->
              <div
                v-if="recentActivities.length === 0"
                class="text-center py-8"
              >
                <v-icon size="64" color="grey-lighten-1" class="mb-3">
                  mdi-information-outline
                </v-icon>
                <p class="text-body-1 text-medium-emphasis">
                  No recent activities to display
                </p>
                <p class="text-caption text-medium-emphasis">
                  Activity tracking will appear here once configured
                </p>
              </div>

              <!-- Activities List -->
              <v-list v-else>
                <v-list-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :class="mobile ? 'px-0 py-2' : 'px-0'"
                >
                  <template #prepend>
                    <v-avatar
                      :color="activity.color"
                      variant="tonal"
                      :size="mobile ? 32 : 40"
                    >
                      <v-icon :color="activity.color" :size="mobile ? 18 : 20">
                        {{ activity.icon }}
                      </v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title
                    :class="mobile ? 'text-body-2' : ''"
                    class="font-weight-medium"
                  >
                    {{ activity.message }}
                  </v-list-item-title>

                  <v-list-item-subtitle
                    :class="mobile ? 'text-caption' : ''"
                    class="text-medium-emphasis"
                  >
                    {{ activity.timestamp }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <template v-if="recentActivities.length > 0">
                <v-divider class="my-4"></v-divider>

                <div class="text-center">
                  <v-btn
                    variant="text"
                    color="primary"
                    :size="mobile ? 'small' : 'default'"
                  >
                    View All Activities
                    <v-icon class="ml-1" :size="mobile ? 18 : 20"
                      >mdi-arrow-right</v-icon
                    >
                  </v-btn>
                </div>
              </template>
            </v-card>
          </v-col>

          <!-- System Status -->
          <v-col cols="12" :lg="mdAndUp ? 4 : 12">
            <v-card elevation="2" :class="mobile ? 'pa-4' : 'pa-6'">
              <v-card-title
                :class="mobile ? 'text-h6 mb-3 pa-0' : 'text-h5 mb-4 pa-0'"
              >
                <v-icon
                  :class="mobile ? 'mr-1' : 'mr-2'"
                  :size="mobile ? 20 : 24"
                >
                  mdi-monitor-dashboard
                </v-icon>
                System Status
              </v-card-title>

              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <span :class="mobile ? 'text-caption' : 'text-body-2'"
                    >Database</span
                  >
                  <v-chip color="success" size="small" variant="tonal">
                    <v-icon start :size="mobile ? 10 : 12"
                      >mdi-check-circle</v-icon
                    >
                    Online
                  </v-chip>
                </div>

                <div class="d-flex justify-space-between align-center mb-3">
                  <span :class="mobile ? 'text-caption' : 'text-body-2'"
                    >API Services</span
                  >
                  <v-chip color="success" size="small" variant="tonal">
                    <v-icon start :size="mobile ? 10 : 12"
                      >mdi-check-circle</v-icon
                    >
                    Running
                  </v-chip>
                </div>

                <div class="d-flex justify-space-between align-center mb-3">
                  <span :class="mobile ? 'text-caption' : 'text-body-2'"
                    >Notifications</span
                  >
                  <v-chip color="success" size="small" variant="tonal">
                    <v-icon start :size="mobile ? 10 : 12"
                      >mdi-check-circle</v-icon
                    >
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
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.stat-card {
  transition: all 0.3s ease;
  height: 100%;
  min-height: 100px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.action-card {
  transition: all 0.3s ease;
  min-height: 120px;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .stat-card {
    min-height: 90px;
  }

  .action-card {
    min-height: 100px;
  }
}

/* Smooth animations */
.v-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Touch-friendly spacing */
.v-list-item {
  min-height: 56px;
}

@media (max-width: 600px) {
  .v-list-item {
    min-height: 48px;
  }
}
</style>
