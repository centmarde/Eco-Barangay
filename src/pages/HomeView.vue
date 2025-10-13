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
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <!-- Simple Welcome Message -->
            <div class="text-center mb-6 mt-4">
              <h1 class="text-h4 text-md-h3 font-weight-bold mb-2">
                Welcome back, {{ userName }}!
              </h1>
              <p class="text-body-1 text-medium-emphasis">
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
