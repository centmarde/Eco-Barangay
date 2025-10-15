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
  position: relative;
  min-height: 100vh;
}

.content-wrapper {
  padding: 20px;
}

.floating-action-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
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
  .floating-action-button {
    bottom: 16px;
    right: 16px;
    width: 56px;
    height: 56px;
  }
}
</style>
