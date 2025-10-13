<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthUserStore } from "@/stores/authUser";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import FeedbackList from "@/pages/admin/components/FeedbackSection.vue";

const authStore = useAuthUserStore();

// Reactive references from the auth store
const { userName } = storeToRefs(authStore);
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="px-4 px-md-6">
        <v-row justify="center">
          <v-col cols="12" xl="10">
            <!-- Simple Welcome Message -->
            <div class="welcome-header text-center mb-8 mt-6">
              <h1 class="text-h5 text-sm-h4 text-md-h4 font-weight-bold mb-2">
                Welcome back, {{ userName }}!
              </h1>
              <p class="text-body-2 text-sm-body-1 text-medium-emphasis">
                Here's what your users are saying
              </p>
            </div>

            <!-- Feedback Section -->
            <FeedbackList />
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
