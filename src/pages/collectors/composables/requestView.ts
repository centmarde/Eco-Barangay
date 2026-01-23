import type { CollectionWithEmails } from "@/stores/collectionsData";
import { useCollectionsStore } from "@/stores/collectionsData";
import { useAuthUserStore } from "@/stores/authUser";
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { formatDate } from "@/utils/dateHelpers";
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getGarbageTypeColor,
  getGarbageTypeIcon,
} from "@/utils/collectionHelpers";

export const useRequestView = () => {
  const collectionsStore = useCollectionsStore();
  const authStore = useAuthUserStore();

  // Realtime subscription
  let realtimeChannel: RealtimeChannel | null = null;

  // State
  // collections is now computed from store
  const collections = computed(() => collectionsStore.collections);
  const loading = computed(() => collectionsStore.loading);
  const selectedStatus = ref<string>("all");
  const showOnlyMyCollections = ref<boolean>(true);

  // Dialog state
  const showDialog = ref(false);
  const selectedCollection = ref<CollectionWithEmails | null>(null);

  // Status order for fetching (pending first)
  const statusOrder = ["pending", "in_progress", "completed", "cancelled"];

  // Computed properties
  const sortedCollections = computed(() => {
    if (!collections.value.length) return [];

    // Sort by status order (pending first), then by created_at
    return [...collections.value].sort((a, b) => {
      const statusIndexA = statusOrder.indexOf(a.status);
      const statusIndexB = statusOrder.indexOf(b.status);

      // If statuses are different, sort by status order
      if (statusIndexA !== statusIndexB) {
        return statusIndexA - statusIndexB;
      }

      // If statuses are the same, sort by created_at (newest first)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  });

  const filteredCollections = computed(() => {
    let filtered = sortedCollections.value;

    // Filter by "My Collections" (assigned to current user)
    if (showOnlyMyCollections.value && authStore.userData?.id) {
      filtered = filtered.filter(
        (c) => c.collector_assign === authStore.userData?.id
      );
    }

    // Filter by status
    if (selectedStatus.value !== "all") {
      filtered = filtered.filter((c) => c.status === selectedStatus.value);
    }

    return filtered;
  });

  const statusCounts = computed(() => {
    // Base collections (either all or only user's collections)
    const baseCollections =
      showOnlyMyCollections.value && authStore.userData?.id
        ? collections.value.filter(
            (c) => c.collector_assign === authStore.userData?.id
          )
        : collections.value;

    // Use store's helper function to get counts from filtered collections
    return collectionsStore.getStatusCountsFromArray(baseCollections);
  });

  const myCollectionsCount = computed(() => {
    if (!authStore.userData?.id) return 0;
    return collections.value.filter(
      (c) => c.collector_assign === authStore.userData?.id
    ).length;
  });

  // Actions
  const fetchCollections = async () => {
    await collectionsStore.fetchCollectionsWithEmails();
  };

  const openDialog = (collection: CollectionWithEmails) => {
    selectedCollection.value = collection;
    showDialog.value = true;
  };

  const closeDialog = () => {
    showDialog.value = false;
    selectedCollection.value = null;
  };

  const updateCollectionStatus = async (
    collectionId: number,
    newStatus: string
  ) => {
    try {
      await collectionsStore.updateCollectionStatus(collectionId, newStatus);
      // No need to manually fetchCollections(), realtime/store handles it
      closeDialog();
    } catch (error) {
      console.error("Error updating collection status:", error);
    }
  };
  
  onMounted(() => {
    fetchCollections();
    realtimeChannel = collectionsStore.subscribeToCollections();
  });

  onUnmounted(() => {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
    }
  });

  return {
    // State
    collections,
    loading,
    selectedStatus,
    showOnlyMyCollections,
    showDialog,
    selectedCollection,
    // Computed
    sortedCollections,
    filteredCollections,
    statusCounts,
    myCollectionsCount,
    // Actions
    fetchCollections,
    openDialog,
    closeDialog,
    updateCollectionStatus,
    getStatusColor,
    getStatusIcon,
    getStatusText,
    getGarbageTypeColor,
    getGarbageTypeIcon,
    formatDate,
  };
};

// New composable for history widget - shows all data sorted by latest first
export const useRequestHistoryView = () => {
  const collectionsStore = useCollectionsStore();
  
  // Realtime subscription
  let realtimeChannel: RealtimeChannel | null = null;

  // State
  // collections is now computed from store
  const collections = computed(() => collectionsStore.collections);
  const loading = computed(() => collectionsStore.loading);
  const selectedStatus = ref<string>("all");

  // Dialog state
  const showDialog = ref(false);
  const selectedCollection = ref<CollectionWithEmails | null>(null);

  // Computed properties - sort by latest first (created_at desc)
  const sortedCollections = computed(() => {
    if (!collections.value.length) return [];

    // Sort by created_at (newest first)
    return [...collections.value].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  });

  const filteredCollections = computed(() => {
    let filtered = sortedCollections.value;

    // Filter by status only
    if (selectedStatus.value !== "all") {
      filtered = filtered.filter((c) => c.status === selectedStatus.value);
    }

    return filtered;
  });

  const statusCounts = computed(() => {
    // Get counts from all collections
    return collectionsStore.getStatusCountsFromArray(collections.value);
  });

  // Actions
  const fetchCollections = async () => {
    await collectionsStore.fetchCollectionsWithEmails();
  };

  const openDialog = (collection: CollectionWithEmails) => {
    selectedCollection.value = collection;
    showDialog.value = true;
  };

  const closeDialog = () => {
    showDialog.value = false;
    selectedCollection.value = null;
  };

  const updateCollectionStatus = async (
    collectionId: number,
    newStatus: string
  ) => {
    try {
      await collectionsStore.updateCollectionStatus(collectionId, newStatus);
      // Realtime handles update
      closeDialog();
    } catch (error) {
      console.error("Error updating collection status:", error);
    }
  };
  
  onMounted(() => {
    fetchCollections();
    realtimeChannel = collectionsStore.subscribeToCollections();
  });

  onUnmounted(() => {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
    }
  });

  return {
    // State
    collections,
    loading,
    selectedStatus,
    showDialog,
    selectedCollection,
    // Computed
    sortedCollections,
    filteredCollections,
    statusCounts,
    // Actions
    fetchCollections,
    openDialog,
    closeDialog,
    updateCollectionStatus,
    getStatusColor,
    getStatusIcon,
    getStatusText,
    getGarbageTypeColor,
    getGarbageTypeIcon,
    formatDate,
  };
};
