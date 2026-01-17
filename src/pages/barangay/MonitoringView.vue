<script setup lang="ts">
import { ref } from "vue";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import EWasteMonitoring from "./components/EWasteMonitoring.vue";
import FeedbackAnnouncementTabs from "./components/FeedbackAnnouncementTabs.vue";
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-2">Barangay Monitoring</h1>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Monitor and manage e-waste and feedback from your barangay
        </p>

        <v-row>
          <!-- E-Waste Monitoring Section (Left/Top) -->
          <v-col cols="12" md="8">
            <EWasteMonitoring />
          </v-col>

          <!-- Feedback and Announcements Section (Right/Bottom) -->
          <v-col cols="12" md="4">
            <FeedbackAnnouncementTabs />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped></style>
