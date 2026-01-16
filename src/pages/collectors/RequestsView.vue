<script setup lang="ts">
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import RequestsWidget from "./components/RequestsWidget.vue";
import { useRequestView } from "./composables/requestView";
import { ref, computed, onMounted } from "vue";
import { useDisplay } from "vuetify";
import "./css/requestView.css";

const { smAndDown, mdAndUp, lgAndUp } = useDisplay();
const { statusCounts, loading, fetchCollections } = useRequestView();

// Stats cards configuration
const statsCards = computed(() => [
  {
    title: "Pending Requests",
    value: statusCounts.value.pending,
    icon: "mdi-clock-alert",
    color: "warning",
    gradient: "linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)",
    description: "Awaiting assignment",
  },
  {
    title: "In Progress",
    value: statusCounts.value.in_progress,
    icon: "mdi-truck-fast",
    color: "info",
    gradient: "linear-gradient(135deg, #29B6F6 0%, #0288D1 100%)",
    description: "Currently collecting",
  },
  {
    title: "Completed",
    value: statusCounts.value.completed,
    icon: "mdi-check-circle",
    color: "success",
    gradient: "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)",
    description: "Successfully done",
  },
  {
    title: "Total Requests",
    value: statusCounts.value.all,
    icon: "mdi-format-list-bulleted-square",
    color: "primary",
    gradient: "linear-gradient(135deg, #5E35B1 0%, #4527A0 100%)",
    description: "All time",
  },
]);

onMounted(async () => {
  // Fetch collections data on component mount
  await fetchCollections();
});
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div class="mb-4 mb-md-0">
                <h1 class="text-h4 font-weight-bold d-flex align-center">
                  <v-icon size="40" color="primary" class="mr-3"
                    >mdi-clipboard-text-multiple</v-icon
                  >
                  Collection Requests
                </h1>
                <p class="text-body-1 text-grey mt-2 mb-0">
                  Manage and track all waste collection requests in your area
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-refresh"
                  :size="smAndDown ? 'small' : 'default'"
                  variant="tonal"
                  :loading="loading"
                  @click="fetchCollections"
                >
                  Refresh
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Stats Cards -->
        <v-row class="mb-6">
          <v-col
            v-for="(stat, index) in statsCards"
            :key="index"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              :elevation="3"
              class="stat-card"
              :class="`stat-card-${stat.color}`"
            >
              <div
                class="stat-gradient"
                :style="{ background: stat.gradient }"
              />
              <v-card-text class="stat-content">
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <p
                      class="text-caption text-white mb-1 text-uppercase font-weight-medium"
                    >
                      {{ stat.title }}
                    </p>
                    <h2 class="text-h3 font-weight-bold text-white mb-1">
                      <span v-if="!loading">{{ stat.value }}</span>
                      <v-progress-circular
                        v-else
                        indeterminate
                        color="white"
                        size="32"
                      />
                    </h2>
                    <p class="text-caption text-white opacity-80 mb-0">
                      {{ stat.description }}
                    </p>
                  </div>
                  <v-avatar
                    :color="stat.color"
                    size="56"
                    class="stat-icon-avatar"
                  >
                    <v-icon :icon="stat.icon" size="32" color="white" />
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Quick Actions Banner -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card color="primary" variant="flat" class="quick-actions-card">
              <v-card-text class="py-4">
                <v-row align="center">
                  <v-col cols="12" md="6">
                    <div class="d-flex align-center">
                      <v-icon size="48" color="white" class="mr-4"
                        >mdi-information</v-icon
                      >
                      <div>
                        <h3 class="text-h6 font-weight-bold text-white mb-1">
                          Quick Tips
                        </h3>
                        <p class="text-body-2 text-white mb-0 opacity-90">
                          Click on any request card to view details and manage
                          collection status
                        </p>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6" class="text-md-right">
                    <v-btn
                      variant="elevated"
                      color="white"
                      prepend-icon="mdi-filter"
                      class="mr-2 mb-2 mb-md-0 design-only-btn"
                      :size="smAndDown ? 'small' : 'default'"
                      disabled
                    >
                      Filter
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Main Content - Requests Widget -->
        <v-row>
          <v-col cols="12">
            <v-card-title
              class="d-flex align-center justify-space-between pa-6 bg-surface-variant"
            >
              <div class="d-flex align-center">
                <v-icon color="primary" size="28" class="mr-3"
                  >mdi-view-grid</v-icon
                >
                <span class="text-h5 font-weight-bold">All Requests</span>
              </div>
              <v-chip
                v-if="!loading"
                color="primary"
                variant="flat"
                prepend-icon="mdi-database"
              >
                {{ statusCounts.all }} Total
              </v-chip>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0 mt-2">
              <RequestsWidget />
            </v-card-text>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>
