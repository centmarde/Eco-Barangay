<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { RecentActivity } from "@/stores/dashboard";

interface Props {
  activities: RecentActivity[];
}

defineProps<Props>();
const { mobile } = useDisplay();
</script>

<template>
  <v-card elevation="2" :class="mobile ? 'pa-4' : 'pa-6'" class="h-100">
    <v-card-title :class="mobile ? 'text-h6 mb-4 pa-0' : 'text-h5 mb-4 pa-0'">
      <v-icon :class="mobile ? 'mr-1' : 'mr-2'" :size="mobile ? 20 : 24">
        mdi-history
      </v-icon>
      Recent Activities
    </v-card-title>

    <!-- Empty State for Activities -->
    <div v-if="activities.length === 0" class="text-center py-8">
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
        v-for="activity in activities"
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

    <template v-if="activities.length > 0">
      <v-divider class="my-4"></v-divider>

      <div class="text-center">
        <v-btn
          variant="text"
          color="primary"
          :size="mobile ? 'small' : 'default'"
        >
          View All Activities
          <v-icon class="ml-1" :size="mobile ? 18 : 20">mdi-arrow-right</v-icon>
        </v-btn>
      </div>
    </template>
  </v-card>
</template>

<style scoped>
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
