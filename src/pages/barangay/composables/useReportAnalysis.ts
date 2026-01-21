import { ref, computed, onMounted } from "vue";
import { useCollectionsStore } from "@/stores/collectionsData";
import { ELECTRONIC_WASTE_TYPES } from "@/utils/collectionHelpers";

export const useReportAnalysis = () => {
  const collectionsStore = useCollectionsStore();
  const loading = ref(false);

  // Time period filter
  const selectedPeriod = ref<"day" | "week" | "month">("week");

  // Computed: Filter collections based on selected period
  const filteredCollections = computed(() => {
    const now = new Date();
    const collections = collectionsStore.collections;

    return collections.filter((c) => {
      // Only include completed collections
      if (c.status !== 'completed') return false;

      if (!c.created_at) return false;
      const date = new Date(c.created_at);
      
      if (selectedPeriod.value === "day") {
        return (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      } else if (selectedPeriod.value === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= oneWeekAgo;
      } else if (selectedPeriod.value === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  });

  // Computed: Aggregate data by Garbage Type
  const categoryData = computed(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    // Initialize counts for known types
    ELECTRONIC_WASTE_TYPES.forEach((type) => {
      counts[type] = 0;
    });

    // Count occurrences
    filteredCollections.value.forEach((c) => {
      // Normalize type string to match keys (case insensitive check usually good practice but data seems consistent)
      // We'll stick to direct match or simple normalization if needed.
      const type = c.garbage_type;
      if (counts[type] !== undefined) {
        counts[type]++;
        total++;
      } else {
        // Handle unexpected types or "Other" if not in list
        // For now, ignore or add to 'Other Electronics' if matched strictly
        if (ELECTRONIC_WASTE_TYPES.includes(type as any)) {
             counts[type]++;
             total++;
        }
      }
    });

    // Transform to array for display, sorted by count desc
    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  });
  
  // Computed: Aggregate data by Time (Trend)
  // For simplicity in this prototype without Chart.js, we might just show total counts
  // or a simple list of recent activity.
  const trendData = computed(() => {
     // Group by date (YYYY-MM-DD)
     const dailyCounts: Record<string, number> = {};
     filteredCollections.value.forEach(c => {
        const dateStr = new Date(c.created_at).toLocaleDateString();
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
     });
     
     return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
  });

  // Computed: Aggregate data by Purok
  const purokData = computed(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    // Initialize counts for all known puroks from monitoring
    collectionsStore.purokMonitoring.forEach((p) => {
      counts[p.name] = 0;
    });

    // Count occurrences in filtered collections
    filteredCollections.value.forEach((c) => {
      const name = c.purok;
      if (name) {
        // If the purok exists in our monitoring list (initialized above), increment
        // Or if we want to capture unknown puroks too:
        if (counts[name] === undefined) {
             counts[name] = 0;
        }
        counts[name]++;
        total++;
      }
    });

    // Transform to array for display, sorted by count desc
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  });

  const totalCollected = computed(() => filteredCollections.value.length);

  const fetchData = async () => {
    loading.value = true;
    await Promise.all([
      collectionsStore.fetchCollectionsWithEmails(), // Ensure we have data
      collectionsStore.fetchPurokMonitoring(), // Ensure we have purok list
    ]);
    loading.value = false;
  };

  onMounted(() => {
    fetchData();
  });

  return {
    loading,
    selectedPeriod,
    filteredCollections,
    categoryData,
    trendData,
    purokData,
    totalCollected,
    fetchData
  };
};
