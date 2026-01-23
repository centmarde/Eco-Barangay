<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAuthUserStore } from "@/stores/authUser";
import { useCollectionsStore } from "@/stores/collectionsData";
import MyCollectionsDialog from "./dialogs/MyCollectionsDialog.vue";
import type { CollectionWithEmails } from "@/stores/collectionsData";

const authStore = useAuthUserStore();
const collectionsStore = useCollectionsStore();

const { userData } = storeToRefs(authStore);
const { loading } = storeToRefs(collectionsStore);

// Local state
const myCollections = ref<CollectionWithEmails[]>([]);
const dialogOpen = ref(false);

// Computed
const statusCounts = computed(() => {
  if (!myCollections.value.length) {
    return {
      all: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };
  }

  return collectionsStore.getStatusCountsFromArray(myCollections.value);
});

// Methods
const fetchMyCollections = async () => {
  if (!userData.value?.id) return;

  try {
    const collections = await collectionsStore.fetchCollectionsByRequestBy(userData.value.id);
    myCollections.value = collections as CollectionWithEmails[];
  } catch (error) {
    console.error('Error fetching my collections:', error);
  }
};

const openDialog = () => {
  dialogOpen.value = true;
};

// Lifecycle
onMounted(() => {
  fetchMyCollections();
});
</script>

<template>
  <v-card
    elevation="4"
    rounded="lg"
    color="success"
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
              icon="mdi-format-list-bulleted"
              size="32"
              color="success"
            />
          </v-avatar>
        </v-col>
        <v-col>
          <v-card-title class="text-h5 font-weight-bold text-white pa-0 mb-2">
            My Collections
          </v-card-title>
          <v-card-subtitle class="text-body-2 text-white pa-0" style="opacity: 0.9;">
            {{ myCollections.length }} requests • {{ statusCounts.pending }} pending
          </v-card-subtitle>
        </v-col>
        <v-col cols="auto" class="text-center">
          <div class="text-h6 font-weight-bold text-white">{{ statusCounts.all }}</div>
          <div class="text-caption text-white" style="opacity: 0.8;">Total</div>
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

  <!-- My Collections Dialog -->
  <MyCollectionsDialog
    v-model="dialogOpen"
    :collections="myCollections"
    @refresh="fetchMyCollections"
  />
</template>

<style scoped lang="scss">
</style>
