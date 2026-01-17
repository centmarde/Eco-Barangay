<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAnnouncementsStore } from "@/stores/announcementsData";

const announcementsStore = useAnnouncementsStore();
const { announcements, loading } = storeToRefs(announcementsStore);

onMounted(() => {
  announcementsStore.fetchAnnouncements();
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
        v-else-if="announcements.length === 0"
        class="text-center pa-4 text-medium-emphasis"
      >
        No announcements found to monitor.
      </div>

      <v-list v-else lines="three">
        <template v-for="(item, index) in announcements" :key="item.id">
          <v-list-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon>mdi-bullhorn</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{
              item.title
            }}</v-list-item-title>
            <v-list-item-subtitle class="mt-1">
              {{ new Date(item.created_at).toLocaleDateString() }}
            </v-list-item-subtitle>
            <p class="text-body-2 mt-2">{{ item.description }}</p>
          </v-list-item>
          <v-divider v-if="index < announcements.length - 1" inset></v-divider>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>
