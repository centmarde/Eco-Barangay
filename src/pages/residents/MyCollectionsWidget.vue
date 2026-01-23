<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAuthUserStore } from "@/stores/authUser";
import { useCollectionsStore } from "@/stores/collectionsData";
import MyCollectionsDialog from "./dialogs/MyCollectionsDialog.vue";
import type { CollectionWithEmails } from "@/stores/collectionsData";

const authStore = useAuthUserStore();
const collectionsStore = useCollectionsStore();

const { userData } = storeToRefs(authStore);
const { loading: storeLoading } = storeToRefs(collectionsStore);

// Local state
const myCollections = ref<CollectionWithEmails[]>([]);
const dialogOpen = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

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
  if (!userData.value?.id) {
    console.log('No user ID available, skipping collection fetch');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    console.log('Fetching collections for user:', userData.value.id);
    const collections = await collectionsStore.fetchCollectionsByRequestBy(userData.value.id);
    myCollections.value = collections as CollectionWithEmails[];
    console.log('Fetched collections:', collections.length);
  } catch (err) {
    console.error('Error fetching my collections:', err);
    error.value = 'Failed to load collections';
    myCollections.value = []; // Reset on error
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
  dialogOpen.value = true;
};

// Watch for userData changes (handles authentication timing)
watch(
  () => userData.value?.id,
  (newUserId, oldUserId) => {
    console.log('User ID changed:', { oldUserId, newUserId });
    if (newUserId && newUserId !== oldUserId) {
      fetchMyCollections();
    }
  },
  { immediate: true }
);

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
            <template v-if="loading">
              Loading...
            </template>
            <template v-else-if="error">
              {{ error }}
            </template>
            <template v-else>
              {{ myCollections.length }} requests • {{ statusCounts.pending }} pending
            </template>
          </v-card-subtitle>
        </v-col>
        <v-col cols="auto" class="text-center">
          <div class="text-h6 font-weight-bold text-white">
            <template v-if="loading">
              <v-progress-circular
                indeterminate
                color="white"
                size="24"
              />
            </template>
            <template v-else>
              {{ statusCounts.all }}
            </template>
          </div>
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
