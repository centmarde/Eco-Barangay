import type { CollectionWithEmails } from "@/stores/collectionsData";
import { useCollectionsStore } from "@/stores/collectionsData";
import { useAuthUserStore } from "@/stores/authUser";
import { ref, computed, onMounted } from "vue";
import { formatDate } from "@/utils/helpers";
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

  // State
  const collections = ref<CollectionWithEmails[]>([]);
  const loading = ref(false);
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
    loading.value = true;
    try {
      const data = await collectionsStore.fetchCollectionsWithEmails();
      collections.value = data;
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      loading.value = false;
    }
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
    loading.value = true;
    try {
      await collectionsStore.updateCollectionStatus(collectionId, newStatus);
      await fetchCollections();
      closeDialog();
    } catch (error) {
      console.error("Error updating collection status:", error);
    } finally {
      loading.value = false;
    }
  };

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
