<script setup lang="ts">
import { ref } from "vue";
import { useCollectionsStore } from "@/stores/collectionsData";
import { useToast } from "vue-toastification";
import CollectionSenderDialog from "./dialogs/CollectionSenderDialog.vue";

const collectionsStore = useCollectionsStore();
const toast = useToast();

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
  <v-card
    elevation="4"
    rounded="lg"
    color="primary"
    style="cursor: pointer;"
    class="h-100"
    @click="openDialog"
  >
    <v-card-text class="pa-4">
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-avatar
            color="white"
            size="56"
            class="mr-3"
          >
            <v-icon
              icon="mdi-recycle"
              size="32"
              color="primary"
            />
          </v-avatar>
        </v-col>
        <v-col>
          <v-card-title class="text-h5 font-weight-bold text-white pa-0 mb-2">
            Collection Request
          </v-card-title>
          <v-card-subtitle class="text-body-2 text-white pa-0" style="opacity: 0.9;">
            Submit a waste collection request for your area
          </v-card-subtitle>
        </v-col>
        <v-col cols="auto">
          <v-icon
            icon="mdi-chevron-right"
            size="default"
            color="white"
            class="ml-3"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- Collection Sender Dialog -->
  <CollectionSenderDialog
    v-model="dialogOpen"
    @collection-created="handleCollectionCreated"
  />
</template>

<style scoped lang="scss">
</style>
