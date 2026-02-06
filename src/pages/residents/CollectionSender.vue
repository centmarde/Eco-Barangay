<template>
  <div class="collection-sender">
    <!-- Main Content Area -->
    <div class="content-wrapper">
      <!-- Your existing content goes here -->
    </div>

    <!-- Floating Action Button -->
    <v-btn
      class="floating-action-button"
      color="primary"
      size="large"
      elevation="8"
      @click="openDialog"
    >
      <v-icon size="32">mdi-plus</v-icon>
    </v-btn>

    <!-- Collection Sender Dialog -->
    <CollectionSenderDialog
      v-model="dialogOpen"
      @collection-created="handleCollectionCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CollectionSenderDialog from './dialogs/CollectionSenderDialog.vue';
import { useCollectionsStore } from '@/stores/collectionsData';
import { useToast } from 'vue-toastification';

const collectionsStore = useCollectionsStore();
const toast = useToast();
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

<style scoped lang="scss">
.collection-sender {
  position: fixed;
  bottom: -60px;
  right: 24px;
  z-index: 1000;
}

.content-wrapper {
  display: none; // Hide content wrapper as we only want the floating button
}

.floating-action-button {
  position: relative;
  bottom: 0;
  right: 0;
  z-index: 1001;
  border-radius: 50%;
  width: 64px;
  height: 64px;

  &:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease-in-out;
  }
}

// Media query for mobile devices
@media (max-width: 600px) {
  .collection-sender {
    bottom: -60px;
    right: 16px;
  }
  
  .floating-action-button {
    width: 56px;
    height: 56px;
  }
}
</style>
