import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import { useToast } from "vue-toastification";

// Type definitions
export type Feedback = {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  rate: number;
  description: string;
  collection_id: number;
};

export type CreateFeedbackData = {
  user_id: string;
  title: string;
  rate: number;
  description: string;
  collection_id: number;
};

export type UpdateFeedbackData = {
  user_id?: string;
  title?: string;
  rate?: number;
  description?: string;
  collection_id?: number;
};

export const useFeedbackStore = defineStore("feedback", () => {
  const toast = useToast();

  // State
  const feedbacks = ref<Feedback[]>([]);
  const currentFeedback = ref<Feedback | undefined>(undefined);
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  // Actions
  const fetchFeedbacks = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      feedbacks.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch feedbacks";
      toast.error("Failed to fetch feedbacks");
    } finally {
      loading.value = false;
    }
  };

  const fetchFeedbackById = async (id: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      currentFeedback.value = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch feedback";
      toast.error("Failed to fetch feedback");
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const fetchFeedbacksByUserId = async (userId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedbacks by user";
      toast.error("Failed to fetch feedbacks by user");
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchFeedbacksByCollectionId = async (collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedbacks by collection";
      toast.error("Failed to fetch feedbacks by collection");
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchFeedbacksByRating = async (
    minRating: number,
    maxRating?: number
  ) => {
    loading.value = true;
    error.value = undefined;

    try {
      let query = supabase.from("feedbacks").select("*").gte("rate", minRating);

      if (maxRating !== undefined) {
        query = query.lte("rate", maxRating);
      }

      const { data, error: fetchError } = await query.order("created_at", {
        ascending: false,
      });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedbacks by rating";
      toast.error("Failed to fetch feedbacks by rating");
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getAverageRatingByCollectionId = async (collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("rate")
        .eq("collection_id", collectionId);

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        return 0;
      }

      const sum = data.reduce((acc, feedback) => acc + feedback.rate, 0);
      return sum / data.length;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to calculate average rating";
      toast.error("Failed to calculate average rating");
      return 0;
    } finally {
      loading.value = false;
    }
  };

  const createFeedback = async (feedbackData: CreateFeedbackData) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: createError } = await supabase
        .from("feedbacks")
        .insert([feedbackData])
        .select()
        .single();

      if (createError) throw createError;

      if (data) {
        feedbacks.value.unshift(data);
      }

      toast.success("Feedback created successfully");
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create feedback";
      toast.error("Failed to create feedback");
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const updateFeedback = async (
    id: number,
    feedbackData: UpdateFeedbackData
  ) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: updateError } = await supabase
        .from("feedbacks")
        .update(feedbackData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        const index = feedbacks.value.findIndex((f) => f.id === id);
        if (index !== -1) {
          feedbacks.value[index] = data;
        }
      }

      toast.success("Feedback updated successfully");
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update feedback";
      toast.error("Failed to update feedback");
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const deleteFeedback = async (id: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("feedbacks")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      feedbacks.value = feedbacks.value.filter((f) => f.id !== id);
      toast.success("Feedback deleted successfully");
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete feedback";
      toast.error("Failed to delete feedback");
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteFeedbacksByUserId = async (userId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("feedbacks")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      feedbacks.value = feedbacks.value.filter((f) => f.user_id !== userId);
      toast.success("User feedbacks deleted successfully");
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete user feedbacks";
      toast.error("Failed to delete user feedbacks");
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteFeedbacksByCollectionId = async (collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("feedbacks")
        .delete()
        .eq("collection_id", collectionId);

      if (deleteError) throw deleteError;

      feedbacks.value = feedbacks.value.filter(
        (f) => f.collection_id !== collectionId
      );
      toast.success("Collection feedbacks deleted successfully");
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to delete collection feedbacks";
      toast.error("Failed to delete collection feedbacks");
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    feedbacks,
    currentFeedback,
    loading,
    error,
    // Actions
    fetchFeedbacks,
    fetchFeedbackById,
    fetchFeedbacksByUserId,
    fetchFeedbacksByCollectionId,
    fetchFeedbacksByRating,
    getAverageRatingByCollectionId,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    deleteFeedbacksByUserId,
    deleteFeedbacksByCollectionId,
  };
});
