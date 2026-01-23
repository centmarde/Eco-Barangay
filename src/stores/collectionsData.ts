import { supabase, supabaseAdmin } from "@/lib/supabase";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useNotificationsStore } from "./notifications";
import { useAuthUserStore } from "./authUser";

// Type definitions
export type Collection = {
  id: number;
  created_at: string;
  address: string;
  purok?: string;
  request_by: string;
  collector_assign: string | null;
  status: string;
  garbage_type: string;
  notes?: string;
  is_hazardous?: boolean;
};

export type Feedback = {
  id: number;
  created_at: string;
  user_id: string | null;
  title: string | null;
  rate: number | null;
  description: string | null;
  collection_id: number | null;
  type: string;
};

export type Collector = {
  id: string;
  username: string;
  email: string;
};

export type CollectionWithEmails = Collection & {
  requester_email?: string;
  requester_name?: string;
  collector_email?: string;
  collector_name?: string;
};

export type CollectionWithFeedback = Collection & {
  feedbacks?: Feedback[];
};

export type FeedbackWithUser = Feedback & {
  user_email?: string;
  user_name?: string;
};

export type CreateFeedbackData = {
  user_id: string;
  title?: string;
  rate?: number;
  description?: string;
  collection_id?: number;
  type?: string;
};

export type UpdateFeedbackData = {
  title?: string;
  rate?: number;
  description?: string;
  collection_id?: number;
  type?: string;
};

export type CollectionWithUsers = Collection & {
  requester?: {
    id: string;
    email: string;
    user_metadata: Record<string, any>;
  };
  collector?: {
    id: string;
    email: string;
    user_metadata: Record<string, any>;
  };
};

export type CreateCollectionData = {
  address: string;
  purok?: string;
  request_by: string;
  collector_assign?: string | null;
  status: string;
  garbage_type: string;
  notes?: string;
  is_hazardous?: boolean;
};

export type UpdateCollectionData = {
  address?: string;
  purok?: string;
  request_by?: string;
  collector_assign?: string;
  status?: string;
  garbage_type?: string;
  notes?: string;
  is_hazardous?: boolean;
};

export type StatusCounts = {
  all: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
};

export type PurokStatus =
  | "pending"
  | "clean"
  | "needs_pickup"
  | "pickup_scheduled";

export type PurokMonitoring = {
  id: number;
  name: string;
  status: PurokStatus;
  last_surveyed?: string;
  collection_id?: number;
  notes?: string;
};

export const useCollectionsStore = defineStore("collections", () => {
  // State
  const collections = ref<CollectionWithEmails[]>([]);
  const collectors = ref<Collector[]>([]);
  const feedbacks = ref<FeedbackWithUser[]>([]);
  const purokMonitoring = ref<PurokMonitoring[]>([]);
  const currentCollection = ref<Collection | undefined>(undefined);
  const currentFeedback = ref<Feedback | undefined>(undefined);
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  // Actions
  const fetchPurokMonitoring = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("purok_monitoring")
        .select("*")
        .order("id", { ascending: true });

      if (fetchError) throw fetchError;

      purokMonitoring.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch purok monitoring data";
    } finally {
      loading.value = false;
    }
  };

  const updatePurokStatus = async (
    id: number,
    status: PurokStatus,
    notes?: string,
  ) => {
    loading.value = true;
    error.value = undefined;

    try {
      const updates: any = {
        status,
        last_surveyed: new Date().toISOString(),
      };

      if (notes !== undefined) {
        updates.notes = notes;
      }

      if (status === "clean" || status === "needs_pickup") {
        updates.collection_id = null; // Reset collection link if status changes
      }

      const { data, error: updateError } = await supabase
        .from("purok_monitoring")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = purokMonitoring.value.findIndex((p) => p.id === id);
      if (index !== -1 && data) {
        purokMonitoring.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update purok status";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const linkPurokCollection = async (id: number, collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: updateError } = await supabase
        .from("purok_monitoring")
        .update({
          status: "pickup_scheduled",
          collection_id: collectionId,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = purokMonitoring.value.findIndex((p) => p.id === id);
      if (index !== -1 && data) {
        purokMonitoring.value[index] = data;
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to link purok to collection";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  // Feedback Actions
  const fetchFeedbacks = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      feedbacks.value = (data as Feedback[]) || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch feedbacks";
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
      return data as Feedback;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch feedback";
      return undefined;
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

      return (data as Feedback[]) || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedbacks by collection";
      return [];
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

      return (data as Feedback[]) || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedbacks by user";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchFeedbacksByType = async (type: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return (data as Feedback[]) || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedbacks by type";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchFeedbacksWithUserInfo = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (!data) return [];

      // Fetch user emails for all unique user IDs
      const userIds = new Set<string>();
      data.forEach((feedback) => {
        if (feedback.user_id) userIds.add(feedback.user_id);
      });

      // Create a map of user IDs to user data
      const userDataMap = new Map<
        string,
        { email?: string; full_name?: string }
      >();

      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          const userData = await getUserEmail(userId);
          if (userData) {
            userDataMap.set(userId, userData);
          }
        }),
      );

      // Enrich feedbacks with user emails and names
      const feedbacksWithUserInfo: FeedbackWithUser[] = data.map(
        (feedback) => {
          const userData = userDataMap.get(feedback.user_id);

          return {
            ...feedback,
            user_email: userData?.email,
            user_name: userData?.full_name,
          };
        },
      );

      feedbacks.value = feedbacksWithUserInfo;
      return feedbacksWithUserInfo;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedbacks with user info";
      return [];
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

      return data as Feedback;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create feedback";
      console.error("Create feedback error:", err);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const updateFeedback = async (
    id: number,
    feedbackData: UpdateFeedbackData,
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

      return data as Feedback;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update feedback";
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

      // Remove from local state
      feedbacks.value = feedbacks.value.filter((f) => f.id !== id);

      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete feedback";
      console.error("Delete feedback error:", err);
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
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to delete user feedbacks";
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
        (f) => f.collection_id !== collectionId,
      );
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to delete collection feedbacks";
      return false;
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
        .eq("collection_id", collectionId)
        .not("rate", "is", null);

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) return 0;

      const totalRating = data.reduce((sum, feedback) => sum + (feedback.rate || 0), 0);
      return totalRating / data.length;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to calculate average rating";
      return 0;
    } finally {
      loading.value = false;
    }
  };

  const getFeedbackStatsByCollector = async (collectorId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      // Get all collections assigned to this collector
      const { data: collections, error: collectionsError } = await supabase
        .from("collections")
        .select("id")
        .eq("collector_assign", collectorId);

      if (collectionsError) throw collectionsError;

      if (!collections || collections.length === 0) {
        return {
          totalFeedbacks: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const collectionIds = collections.map((c) => c.id);

      // Get all feedbacks for these collections
      const { data: feedbacks, error: feedbacksError } = await supabase
        .from("feedbacks")
        .select("rate")
        .in("collection_id", collectionIds)
        .not("rate", "is", null);

      if (feedbacksError) throw feedbacksError;

      const totalFeedbacks = feedbacks?.length || 0;
      const totalRating = feedbacks?.reduce((sum, f) => sum + (f.rate || 0), 0) || 0;
      const averageRating = totalFeedbacks > 0 ? totalRating / totalFeedbacks : 0;

      // Calculate rating distribution
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      feedbacks?.forEach((f) => {
        if (f.rate && f.rate >= 1 && f.rate <= 5) {
          ratingDistribution[f.rate as keyof typeof ratingDistribution]++;
        }
      });

      return {
        totalFeedbacks,
        averageRating,
        ratingDistribution,
      };
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch feedback stats";
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchCollections = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Cast to any to satisfy the type since we know it's compatible base type
      // but might lack the email fields initially if using this generic fetch
      collections.value = (data as any) || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch collections";
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectors = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      // Fetch all auth users using admin client
      const { data, error: fetchError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (fetchError) throw fetchError;

      // Filter users with collector role (role = 4) from user_metadata
      const collectorUsers = (data.users || [])
        .filter((user) => user.user_metadata?.role === 4)
        .map((user) => ({
          id: user.id,
          username:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Unknown",
          email: user.email || "",
        }));

      collectors.value = collectorUsers;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch collectors";
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionById = async (id: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      currentCollection.value = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch collection";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionsByRequestBy = async (userId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("request_by", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections by requester";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionsByCollectorAssign = async (userId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("collector_assign", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections by collector";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionsByStatus = async (status: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections by status";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionsByGarbageType = async (garbageType: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("garbage_type", garbageType)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections by garbage type";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionWithFeedback = async (collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select(
          `
          *,
          feedbacks (
            id,
            title,
            rate,
            description,
            user_id
          )
        `,
        )
        .eq("id", collectionId)
        .single();

      if (fetchError) throw fetchError;

      return data as CollectionWithFeedback;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collection with feedback";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionsWithFeedback = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select(
          `
          *,
          feedbacks (
            id,
            title,
            rate,
            description,
            user_id
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data as CollectionWithFeedback[];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections with feedback";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionWithUsers = async (collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data: collectionData, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (fetchError) throw fetchError;

      // Fetch requester details
      const { data: requester } = await supabase.auth.admin.getUserById(
        collectionData.request_by,
      );

      // Fetch collector details
      const { data: collector } = await supabase.auth.admin.getUserById(
        collectionData.collector_assign,
      );

      return {
        ...collectionData,
        requester: requester?.user,
        collector: collector?.user,
      } as CollectionWithUsers;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collection with users";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionsByUserId = async (userId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .or(`request_by.eq.${userId},collector_assign.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections by user";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const searchCollectionsByAddress = async (searchTerm: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .ilike("address", `%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to search collections by address";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionStatsByCollector = async (collectorId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("status")
        .eq("collector_assign", collectorId);

      if (fetchError) throw fetchError;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((c) => c.status === "pending").length || 0,
        inProgress: data?.filter((c) => c.status === "in_progress").length || 0,
        completed: data?.filter((c) => c.status === "completed").length || 0,
        cancelled: data?.filter((c) => c.status === "cancelled").length || 0,
      };

      return stats;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch collection stats";
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      };
    } finally {
      loading.value = false;
    }
  };

  const createCollection = async (collectionData: CreateCollectionData) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: createError } = await supabase
        .from("collections")
        .insert([collectionData])
        .select()
        .single();

      if (createError) throw createError;

      // Note: we don't need to manually update state here as realtime subscription will catch it
      // but for immediate feedback we can optimistic update or let the sub handle it.
      // Optimistic update:
      // collections.value.unshift(data);
      // But we lack email data, so better let realtime fetch it or sub handle it.
      // For now, keeping legacy behavior (unshift) but casting.
      // collections.value.unshift(data as CollectionWithEmails);

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create collection";
      console.error("Create collection error:", err);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const updateCollection = async (
    id: number,
    collectionData: UpdateCollectionData,
  ) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: updateError } = await supabase
        .from("collections")
        .update(collectionData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Realtime will handle the update

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update collection";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const updateCollectionStatus = async (id: number, status: string) => {
    const result = await updateCollection(id, { status });

    if (result) {
      // Update Purok Monitoring status if linked
      try {
        if (status === "completed") {
          // If collection is completed, the purok is now clean
          const { error: purokError } = await supabase
            .from("purok_monitoring")
            .update({
              status: "clean",
              collection_id: null,
              last_surveyed: new Date().toISOString(),
            })
            .eq("collection_id", id);

          if (!purokError) {
            // Update local state if it exists
            const index = purokMonitoring.value.findIndex(
              (p) => p.collection_id === id,
            );
            if (index !== -1) {
              purokMonitoring.value[index] = {
                ...purokMonitoring.value[index],
                status: "clean",
                collection_id: undefined,
                last_surveyed: new Date().toISOString(),
              };
            }
          }
        } else if (status === "cancelled") {
          // If collection is cancelled, the purok still needs pickup
          const { error: purokError } = await supabase
            .from("purok_monitoring")
            .update({
              status: "needs_pickup",
              collection_id: null,
            })
            .eq("collection_id", id);

          if (!purokError) {
            // Update local state if it exists
            const index = purokMonitoring.value.findIndex(
              (p) => p.collection_id === id,
            );
            if (index !== -1) {
              purokMonitoring.value[index] = {
                ...purokMonitoring.value[index],
                status: "needs_pickup",
                collection_id: undefined,
              };
            }
          }
        }
      } catch (err) {
        console.error("Error updating related purok status:", err);
      }

      const notificationsStore = useNotificationsStore();

      // Notify requester
      await notificationsStore.createNotification(
        {
          user_id: result.request_by,
          title: "Pickup Request Status Updated",
          message: `Your pickup request at ${result.address} is now ${status}.`,
          type: "info",
        },
        false,
      );

      // Notify Admins (Barangay Officials)
      try {
        const { data: usersData, error: usersError } =
          await supabaseAdmin.auth.admin.listUsers();

        if (!usersError && usersData?.users) {
          const admins = usersData.users.filter(
            (user: any) => user.user_metadata?.role === 1,
          );

          await Promise.all(
            admins.map((admin: any) =>
              notificationsStore.createNotification(
                {
                  user_id: admin.id,
                  title: "Pickup Status Update",
                  message: `Request at ${result.address} has been updated to ${status}.`,
                  type: "info",
                },
                false,
              ),
            ),
          );
        }
      } catch (err) {
        console.error("Error notifying admins:", err);
      }
    }

    return result;
  };

  const assignCollector = async (id: number, collectorId: string) => {
    const result = await updateCollection(id, {
      collector_assign: collectorId,
    });

    if (result) {
      const notificationsStore = useNotificationsStore();
      const authStore = useAuthUserStore();
      const currentUserId = authStore.userData?.id;

      // Notify collector
      await notificationsStore.createNotification(
        {
          user_id: collectorId,
          title: "New Pickup Assignment",
          message: `You have been assigned to a pickup request at ${result.address}.`,
          type: "info",
        },
        false,
      );

      // Notify requester (only if the requester is NOT the one assigning)
      if (result.request_by !== currentUserId) {
        await notificationsStore.createNotification(
          {
            user_id: result.request_by,
            title: "Collector Assigned",
            message: `A collector has been assigned to your pickup request at ${result.address}.`,
            type: "success",
          },
          false,
        );
      }
    }

    return result;
  };

  const deleteCollection = async (id: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      // Find linked purok first (before deleting)
      let linkedPurokId: number | null = null;
      if (purokMonitoring.value.length === 0) {
        // Fetch if not loaded
        const { data } = await supabase
          .from("purok_monitoring")
          .select("id")
          .eq("collection_id", id)
          .single();
        if (data) linkedPurokId = data.id;
      } else {
        const found = purokMonitoring.value.find((p) => p.collection_id === id);
        if (found) linkedPurokId = found.id;
      }

      // Delete the collection
      // Note: Foreign key is ON DELETE SET NULL, so this will succeed even if linked
      const { error: deleteError } = await supabase
        .from("collections")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Realtime will handle removal
      // But we can optimistic update:
      // collections.value = collections.value.filter((c) => c.id !== id);

      // Now update the purok status if it was linked
      if (linkedPurokId) {
        // Update local state
        const index = purokMonitoring.value.findIndex(
          (p) => p.id === linkedPurokId,
        );
        if (index !== -1) {
          purokMonitoring.value[index] = {
            ...purokMonitoring.value[index],
            status: "needs_pickup",
            collection_id: undefined,
          };
        }

        // Update DB
        // We update by Purok ID since collection_id is now NULL
        await supabase
          .from("purok_monitoring")
          .update({
            status: "needs_pickup",
            collection_id: null,
          })
          .eq("id", linkedPurokId);
      }

      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete collection";
      console.error("Delete collection error:", err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteCollectionsByUserId = async (userId: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("collections")
        .delete()
        .or(`request_by.eq.${userId},collector_assign.eq.${userId}`);

      if (deleteError) throw deleteError;

      collections.value = collections.value.filter(
        (c) => c.request_by !== userId && c.collector_assign !== userId,
      );
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to delete user collections";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getUserEmail = async (
    userId: string,
  ): Promise<{ email?: string; full_name?: string } | null> => {
    try {
      // First try to fetch from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data;
      }

      // Fallback to admin API if available (e.g. for super admins)
      // or if profiles table is not yet populated
      const {
        data: { user },
        error: adminError,
      } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (adminError || !user) {
        console.error("Error fetching user email:", adminError);
        return null;
      }

      return {
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
      };
    } catch (err) {
      console.error("Error fetching user email:", err);
      return null;
    }
  };

  // Improved fetch with view
  const fetchCollectionsWithEmails = async (background: boolean = false) => {
    if (!background) loading.value = true;
    error.value = undefined;

    try {
      // Use the new view to get data + user info in one go
      const { data, error: fetchError } = await supabase
        .from("collections_with_user_info")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        // Fallback to old method if view doesn't exist yet
        console.warn("View collections_with_user_info not found, falling back...", fetchError);
        return await fetchCollectionsWithEmailsLegacy();
      }

      collections.value = data as CollectionWithEmails[];
      return data as CollectionWithEmails[];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections with emails";
      return [];
    } finally {
      if (!background) loading.value = false;
    }
  };

  // Legacy method for fallback
  const fetchCollectionsWithEmailsLegacy = async () => {
     try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (!data) return [];

      // Fetch user emails for all unique user IDs
      const userIds = new Set<string>();
      data.forEach((collection) => {
        if (collection.request_by) userIds.add(collection.request_by);
        if (collection.collector_assign)
          userIds.add(collection.collector_assign);
      });

      // Create a map of user IDs to user data
      const userDataMap = new Map<
        string,
        { email?: string; full_name?: string }
      >();

      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          const userData = await getUserEmail(userId);
          if (userData) {
            userDataMap.set(userId, userData);
          }
        }),
      );

      // Enrich collections with user emails and names
      const collectionsWithEmails: CollectionWithEmails[] = data.map(
        (collection) => {
          const requesterData = userDataMap.get(collection.request_by);
          const collectorData = userDataMap.get(collection.collector_assign);

          return {
            ...collection,
            requester_email: requesterData?.email,
            requester_name: requesterData?.full_name,
            collector_email: collectorData?.email,
            collector_name: collectorData?.full_name,
          };
        },
      );

      collections.value = collectionsWithEmails;

      return collectionsWithEmails;
    } catch (err) {
      console.error("Legacy fetch error", err);
      return [];
    }
  }

  const fetchCollectionWithEmails = async (collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      // Use the view
      const { data, error: fetchError } = await supabase
        .from("collections_with_user_info")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (fetchError) throw fetchError;

      return data as CollectionWithEmails;

    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collection with emails";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionsByStatusWithEmails = async (status: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections_with_user_info")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data as CollectionWithEmails[];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections by status with emails";
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get status counts for all collections or filtered by collector
   * @param collectorId - Optional collector ID to filter by
   * @returns Object with counts for each status
   */
  const getStatusCounts = async (
    collectorId?: string,
  ): Promise<StatusCounts> => {
    loading.value = true;
    error.value = undefined;

    try {
      let query = supabase
        .from("collections")
        .select("status", { count: "exact" });

      // Filter by collector if provided
      if (collectorId) {
        query = query.eq("collector_assign", collectorId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Count collections by status
      const counts: StatusCounts = {
        all: data?.length || 0,
        pending: data?.filter((c) => c.status === "pending").length || 0,
        in_progress:
          data?.filter((c) => c.status === "in_progress").length || 0,
        completed: data?.filter((c) => c.status === "completed").length || 0,
        cancelled: data?.filter((c) => c.status === "cancelled").length || 0,
      };

      return counts;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch status counts";
      return {
        all: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get status counts from a provided array of collections
   * @param collections - Array of collections to count
   * @returns Object with counts for each status
   */
  const getStatusCountsFromArray = (
    collections: Collection[] | CollectionWithEmails[],
  ): StatusCounts => {
    return {
      all: collections.length,
      pending: collections.filter((c) => c.status === "pending").length,
      in_progress: collections.filter((c) => c.status === "in_progress").length,
      completed: collections.filter((c) => c.status === "completed").length,
      cancelled: collections.filter((c) => c.status === "cancelled").length,
    };
  };

  // Realtime subscription
  const subscribeToCollections = () => {
    const channel = supabase
      .channel('collections-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collections' },
        async (payload) => {
          console.log('Collections Realtime Change:', payload);

          if (payload.eventType === 'INSERT') {
            // Fetch the specific new row with user info from the VIEW
            const { data } = await supabase
              .from('collections_with_user_info')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (data) {
              collections.value.unshift(data as CollectionWithEmails);
            } else {
               // Fallback: refresh all if simple fetch fails (unlikely)
               await fetchCollectionsWithEmails(true);
            }
          }
          else if (payload.eventType === 'UPDATE') {
            // Fetch updated row
            const { data } = await supabase
              .from('collections_with_user_info')
              .select('*')
              .eq('id', payload.new.id)
              .single();

             if (data) {
               const index = collections.value.findIndex(c => c.id === payload.new.id);
               if (index !== -1) {
                 collections.value[index] = data as CollectionWithEmails;
               } else {
                 // Might be a status change that moved it into a filtered view or just appeared
                 collections.value.unshift(data as CollectionWithEmails);
               }
             }
          }
          else if (payload.eventType === 'DELETE') {
             const oldId = (payload.old as any).id;
             collections.value = collections.value.filter(c => c.id !== oldId);
          }
        }
      )
      .subscribe();

    return channel;
  };

  return {
    // State
    collections,
    collectors,
    feedbacks,
    purokMonitoring,
    currentCollection,
    currentFeedback,
    loading,
    error,
    // Collection Actions
    fetchCollections,
    fetchCollectors,
    fetchCollectionById,
    fetchCollectionsByRequestBy,
    fetchCollectionsByCollectorAssign,
    fetchCollectionsByStatus,
    fetchCollectionsByGarbageType,
    fetchCollectionWithFeedback,
    fetchCollectionsWithFeedback,
    fetchCollectionWithUsers,
    fetchCollectionsByUserId,
    searchCollectionsByAddress,
    fetchCollectionStatsByCollector,
    createCollection,
    updateCollection,
    updateCollectionStatus,
    assignCollector,
    deleteCollection,
    deleteCollectionsByUserId,
    // New actions with emails
    getUserEmail,
    fetchCollectionsWithEmails,
    fetchCollectionWithEmails,
    fetchCollectionsByStatusWithEmails,
    // Status count functions
    getStatusCounts,
    getStatusCountsFromArray,
    // Purok Monitoring
    fetchPurokMonitoring,
    updatePurokStatus,
    linkPurokCollection,
    // Feedback Actions
    fetchFeedbacks,
    fetchFeedbackById,
    fetchFeedbacksByCollectionId,
    fetchFeedbacksByUserId,
    fetchFeedbacksByType,
    fetchFeedbacksWithUserInfo,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    deleteFeedbacksByUserId,
    deleteFeedbacksByCollectionId,
    getAverageRatingByCollectionId,
    getFeedbackStatsByCollector,
    // Realtime
    subscribeToCollections
  };
});
