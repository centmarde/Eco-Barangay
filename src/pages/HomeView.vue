<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthUserStore } from "@/stores/authUser";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import DailyAnnouncement from "@/pages/residents/DailyAnnouncement.vue";
import AnnouncementsWidget from "@/pages/residents/AnnouncementsWidget.vue";
import CollectionRequestWidget from "@/pages/residents/CollectionRequestWidget.vue";
import MyCollectionsWidget from "@/pages/residents/MyCollectionsWidget.vue";

const authStore = useAuthUserStore();

// Reactive references from the auth store
const { userName } = storeToRefs(authStore);
</script>

<template>
  <!-- Daily Announcement - Fixed Position at Top Center -->
  <DailyAnnouncement />

  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" xl="12">
            <!-- Collection Widgets Row -->
            <v-row class="mb-6">
              <v-col cols="12" sm="6" md="6">
                <!-- Collection Request Widget -->
                <CollectionRequestWidget />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <!-- My Collections Widget -->
                <MyCollectionsWidget />
              </v-col>
            </v-row>

            <!-- Announcements Widget -->
            <AnnouncementsWidget />
						<v-divider></v-divider>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped lang="scss">
.welcome-header {
  padding: 1rem 0;
}

@media (min-width: 600px) {
  .welcome-header {
    padding: 1.5rem 0;
  }
}
</style>
