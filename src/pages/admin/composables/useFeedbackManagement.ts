import { ref, computed } from "vue";
import { useToast } from "vue-toastification";
import { useFeedbackStore } from "@/stores/feedBackData";
import type { FeedbackStatus } from "@/utils/constants";

/**
 * Type definition for feedback with user information
 */
export type FeedbackWithUser = {
  id: number;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string;
  timestamp: string;
  status: FeedbackStatus;
  user_id: string;
};

/**
 * Composable for managing feedback operations
 */
export function useFeedbackManagement() {
  const toast = useToast();
  const feedbackStore = useFeedbackStore();

  // State
  const feedbackList = ref<FeedbackWithUser[]>([]);
  const selectedFilter = ref<string>("all");
  const isLoading = ref(false);

  // Computed
  const filteredFeedback = computed(() => {
    if (selectedFilter.value === "all") {
      return feedbackList.value;
    }
    return feedbackList.value.filter(
      (item) => item.status === selectedFilter.value
    );
  });

  const feedbackStats = computed(() => {
    const total = feedbackList.value.length;
    const newCount = feedbackList.value.filter(
      (f) => f.status === "new"
    ).length;
    const reviewedCount = feedbackList.value.filter(
      (f) => f.status === "reviewed"
    ).length;
    const resolvedCount = feedbackList.value.filter(
      (f) => f.status === "resolved"
    ).length;
    const avgRating =
      total > 0
        ? (
            feedbackList.value.reduce((sum, f) => sum + f.rating, 0) / total
          ).toFixed(1)
        : "0.0";

    return {
      total,
      new: newCount,
      reviewed: reviewedCount,
      resolved: resolvedCount,
      avgRating,
    };
  });

  // Methods
  const loadFeedbacks = async () => {
    isLoading.value = true;
    try {
      // Fetch feedbacks with user information from the store
      const data = await feedbackStore.fetchFeedbacksWithUsers();

      // Transform data to match component structure
      feedbackList.value = (data || []).map((item: any) => ({
        id: item.id,
        userName: item.users
          ? `${item.users.first_name} ${item.users.last_name}`
          : "Unknown User",
        userAvatar: item.users?.profile_photo_url || null,
        rating: item.rate,
        comment: item.description,
        timestamp: item.created_at,
        status: "new" as FeedbackStatus, // Default status
        user_id: item.user_id,
      }));
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      toast.error("Failed to load feedbacks");
    } finally {
      isLoading.value = false;
    }
  };

  const updateStatus = async (id: number, newStatus: FeedbackStatus) => {
    const feedback = feedbackList.value.find((f) => f.id === id);
    if (feedback) {
      feedback.status = newStatus;
      // TODO: Update in Supabase (you may need to add a status field to the feedbacks table)
      toast.success(`Status updated to ${newStatus}`);
    }
  };

  const deleteFeedback = async (id: number) => {
    try {
      const success = await feedbackStore.deleteFeedback(id);
      if (success) {
        const index = feedbackList.value.findIndex((f) => f.id === id);
        if (index !== -1) {
          feedbackList.value.splice(index, 1);
        }
      }
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  return {
    // State
    feedbackList,
    selectedFilter,
    isLoading,
    // Computed
    filteredFeedback,
    feedbackStats,
    // Methods
    loadFeedbacks,
    updateStatus,
    deleteFeedback,
  };
}
