<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthUserStore } from "@/stores/authUser";
import { useCollectionsStore } from "@/stores/collectionsData";
import { useToast } from "vue-toastification";
import InnerLayoutWrapper from "@/layouts/InnerLayoutWrapper.vue";
import FeedbackList from "@/pages/admin/components/FeedbackSection.vue";
import DailyAnnouncement from "@/pages/residents/DailyAnnouncement.vue";
import AnnouncementsWidget from "@/pages/residents/AnnouncementsWidget.vue";
import CollectionSenderDialog from "@/pages/residents/dialogs/CollectionSenderDialog.vue";

const authStore = useAuthUserStore();
const collectionsStore = useCollectionsStore();
const toast = useToast();

// Reactive references from the auth store
const { userName } = storeToRefs(authStore);

// Dialog state
const dialogOpen = ref(false);

const openDialog = () => {
  dialogOpen.value = true;
};

const handleCollectionCreated = async () => {
  // Refresh collections list after creating a new collection
  await collectionsStore.fetchCollections();
  toast.success('Collection request submitted successfully!');
};
</script>

<template>
  <!-- Daily Announcement - Fixed Position at Top Center -->
  <DailyAnnouncement />

  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" xl="12">
            <!-- Announcements Widget -->
            <AnnouncementsWidget />
						<v-divider></v-divider>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>

  <!-- Floating Action Button for Collection Request -->
  <v-btn
    icon
    color="primary"
    size="x-large"
    elevation="8"
    position="fixed"
    location="bottom right"
    style="bottom: 24px; right: 24px; z-index: 1000;"
    @click="openDialog"
  >
    <v-icon size="32">mdi-plus</v-icon>
  </v-btn>

  <!-- Collection Sender Dialog -->
  <CollectionSenderDialog
    v-model="dialogOpen"
    @collection-created="handleCollectionCreated"
  />
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
