<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthUserStore } from "@/stores/authUser";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import FeedbackList from "@/pages/admin/components/FeedbackSection.vue";
import DailyAnnouncement from "@/pages/residents/DailyAnnouncement.vue";

const authStore = useAuthUserStore();

// Reactive references from the auth store
const { userName } = storeToRefs(authStore);
</script>

<template>
  <!-- Daily Announcement - Fixed Position at Top Center -->
  <DailyAnnouncement />

  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="px-4 px-md-6">
        <v-row justify="center">
          <v-col cols="12" xl="10">

          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.welcome-header {
  padding: 1rem 0;
}

@media (min-width: 600px) {
  .welcome-header {
    padding: 1.5rem 0;
  }
}
</style>
