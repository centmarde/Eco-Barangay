<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useFeedbackStore } from "@/stores/feedBackData";

const feedbackStore = useFeedbackStore();
const { feedbacks, loading } = storeToRefs(feedbackStore);

onMounted(() => {
  feedbackStore.fetchFeedbacks();
});
</script>

<template>
  <v-card flat>
    <v-card-text>
      <div v-if="loading" class="d-flex justify-center pa-4">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>

      <div
        v-else-if="feedbacks.length === 0"
        class="text-center pa-4 text-medium-emphasis"
      >
        No feedback received yet.
      </div>

      <v-list v-else lines="three">
        <template v-for="(item, index) in feedbacks" :key="item.id">
          <v-list-item>
            <template v-slot:prepend>
              <v-avatar
                :color="
                  item.rate >= 4
                    ? 'success'
                    : item.rate >= 3
                      ? 'warning'
                      : 'error'
                "
                variant="tonal"
              >
                <span class="text-h6">{{ item.rate }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{
              item.title
            }}</v-list-item-title>
            <v-list-item-subtitle class="mt-1">
              {{ new Date(item.created_at).toLocaleDateString() }}
            </v-list-item-subtitle>

            <div class="mt-2">
              <v-rating
                :model-value="item.rate"
                color="amber"
                density="compact"
                half-increments
                readonly
                size="small"
              ></v-rating>
            </div>

            <p class="text-body-2 mt-2">{{ item.description }}</p>
          </v-list-item>
          <v-divider v-if="index < feedbacks.length - 1" inset></v-divider>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>
