<script setup lang="ts">
import { computed } from "vue";
import { useReportAnalysis } from "./composables/useReportAnalysis";
import {
  getGarbageTypeColor,
  getGarbageTypeIcon,
} from "@/utils/collectionHelpers";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";

const {
  loading,
  selectedPeriod,
  categoryData,
  totalCollected,
  filteredCollections,
  purokData,
} = useReportAnalysis();

// Helper for period labels
const periodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case "day":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    default:
      return "";
  }
});
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <!-- Header Section -->
        <v-row class="mb-6 align-center">
          <v-col>
            <h1 class="text-h4 font-weight-bold">E-Waste Analysis</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Insights on collected electronic waste in the barangay.
            </p>
          </v-col>
          <v-col cols="auto">
            <v-btn-toggle
              v-model="selectedPeriod"
              mandatory
              color="primary"
              variant="outlined"
              class="bg-surface"
            >
              <v-btn value="day">Day</v-btn>
              <v-btn value="week">Week</v-btn>
              <v-btn value="month">Month</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>

        <!-- Key Metrics Cards -->
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card elevation="2" class="h-100 rounded-lg">
              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-4">
                  <span class="text-subtitle-2 text-medium-emphasis"
                    >Total Requests ({{ periodLabel }})</span
                  >
                  <v-icon color="primary" size="24">mdi-clipboard-list</v-icon>
                </div>
                <div class="text-h3 font-weight-bold text-primary">
                  {{ totalCollected }}
                </div>
                <div class="text-caption text-medium-emphasis mt-2">
                  Based on verified collection requests
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card elevation="2" class="h-100 rounded-lg">
              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-4">
                  <span class="text-subtitle-2 text-medium-emphasis"
                    >Top Category</span
                  >
                  <v-icon color="secondary" size="24">mdi-trophy</v-icon>
                </div>
                <div
                  v-if="categoryData.length > 0 && categoryData[0].count > 0"
                >
                  <div
                    class="text-h5 font-weight-bold text-secondary text-truncate"
                  >
                    {{ categoryData[0].type }}
                  </div>
                  <div class="text-subtitle-1">
                    {{ categoryData[0].count }} items ({{
                      categoryData[0].percentage.toFixed(1)
                    }}%)
                  </div>
                </div>
                <div v-else class="text-h6 text-medium-emphasis">
                  No data available
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Category Analysis Section -->
        <v-row class="mt-6">
          <v-col cols="12">
            <v-card elevation="2" class="rounded-lg">
              <v-card-title class="pa-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-chart-pie</v-icon>
                Waste Categorization
              </v-card-title>
              <v-divider></v-divider>

              <v-card-text class="pa-6">
                <div v-if="loading" class="d-flex justify-center pa-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>

                <div
                  v-else-if="totalCollected === 0"
                  class="text-center pa-8 text-medium-emphasis"
                >
                  <v-icon size="64" class="mb-4">mdi-chart-bar-off</v-icon>
                  <p>No collection data found for this period.</p>
                </div>

                <v-row v-else>
                  <!-- Custom Bar Chart Visualization -->
                  <v-col cols="12">
                    <div
                      v-for="item in categoryData"
                      :key="item.type"
                      class="mb-6"
                    >
                      <div class="d-flex justify-space-between mb-1">
                        <div class="d-flex align-center">
                          <v-icon
                            :color="getGarbageTypeColor(item.type)"
                            size="small"
                            class="mr-2"
                          >
                            {{ getGarbageTypeIcon(item.type) }}
                          </v-icon>
                          <span class="font-weight-medium text-body-2">{{
                            item.type
                          }}</span>
                        </div>
                        <span class="text-caption font-weight-bold">
                          {{ item.count }} ({{ item.percentage.toFixed(1) }}%)
                        </span>
                      </div>
                      <v-progress-linear
                        :model-value="item.percentage"
                        :color="getGarbageTypeColor(item.type)"
                        height="12"
                        rounded
                        striped
                      ></v-progress-linear>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Purok Analysis Section -->
        <v-row class="mt-6">
          <v-col cols="12">
            <v-card elevation="2" class="rounded-lg">
              <v-card-title class="pa-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-map-marker-multiple</v-icon>
                Purok Collection Analysis
              </v-card-title>
              <v-divider></v-divider>

              <v-card-text class="pa-6">
                <div v-if="loading" class="d-flex justify-center pa-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>

                <div
                  v-else-if="purokData.every(p => p.count === 0)"
                  class="text-center pa-8 text-medium-emphasis"
                >
                  <v-icon size="64" class="mb-4">mdi-map-marker-off</v-icon>
                  <p>No purok data available for this period.</p>
                </div>

                <v-row v-else>
                  <v-col cols="12">
                    <div
                      v-for="item in purokData"
                      :key="item.name"
                      class="mb-6"
                    >
                      <div class="d-flex justify-space-between mb-1">
                        <div class="d-flex align-center">
                          <v-icon
                            color="primary"
                            size="small"
                            class="mr-2"
                          >
                            mdi-map-marker
                          </v-icon>
                          <span class="font-weight-medium text-body-2">{{
                            item.name
                          }}</span>
                        </div>
                        <span class="text-caption font-weight-bold">
                          {{ item.count }} ({{ item.percentage.toFixed(1) }}%)
                        </span>
                      </div>
                      <v-progress-linear
                        :model-value="item.percentage"
                        color="primary"
                        height="12"
                        rounded
                        striped
                      ></v-progress-linear>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>
