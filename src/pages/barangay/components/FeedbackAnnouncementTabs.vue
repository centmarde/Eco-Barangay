<script setup lang="ts">
import { ref } from "vue";
import AnnouncementsTab from "./AnnouncementsTab.vue";
import FeedbackTab from "./FeedbackTab.vue";

const tab = ref(null);
</script>

<template>
  <v-card class="h-100">
    <v-tabs v-model="tab" bg-color="primary">
      <v-tab value="feedback">Feedback</v-tab>
      <v-tab value="announcements">Announcements</v-tab>
    </v-tabs>

    <v-card-text class="pa-0">
      <v-window v-model="tab">
        <v-window-item value="feedback">
          <FeedbackTab />
        </v-window-item>

        <v-window-item value="announcements">
          <AnnouncementsTab />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>
