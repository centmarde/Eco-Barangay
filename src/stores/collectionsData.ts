import { supabase, supabaseAdmin } from "@/lib/supabase";
import { useToast } from "vue-toastification";
import { defineStore } from "pinia";
import { ref } from "vue";

// Type definitions
export type Collection = {
  id: number;
  created_at: string;
  address: string;
  request_by: string;
  collector_assign: string;
  status: string;
  garbage_type: string;
};

export type CollectionWithEmails = Collection & {
  requester_email?: string;
  requester_name?: string;
  collector_email?: string;
  collector_name?: string;
};

export type CollectionWithFeedback = Collection & {
  feedbacks?: Array<{
    id: number;
    title: string;
    rate: number;
    description: string;
    user_id: string;
  }>;
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
  request_by: string;
  collector_assign: string;
  status: string;
  garbage_type: string;
};

export type UpdateCollectionData = {
  address?: string;
  request_by?: string;
  collector_assign?: string;
  status?: string;
  garbage_type?: string;
};

export type StatusCounts = {
  all: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
};

export const useCollectionsStore = defineStore("collections", () => {
  const toast = useToast();

  // State
  const collections = ref<Collection[]>([]);
  const currentCollection = ref<Collection | undefined>(undefined);
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  // Actions
  const fetchCollections = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      collections.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch collections";
      toast.error("Failed to fetch collections");
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
      toast.error("Failed to fetch collection");
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
      toast.error("Failed to fetch collections by requester");
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
      toast.error("Failed to fetch collections by collector");
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
      toast.error("Failed to fetch collections by status");
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
      toast.error("Failed to fetch collections by garbage type");
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
        `
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
      toast.error("Failed to fetch collection with feedback");
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
        `
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data as CollectionWithFeedback[];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections with feedback";
      toast.error("Failed to fetch collections with feedback");
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
        collectionData.request_by
      );

      // Fetch collector details
      const { data: collector } = await supabase.auth.admin.getUserById(
        collectionData.collector_assign
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
      toast.error("Failed to fetch collection with users");
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
      toast.error("Failed to fetch collections by user");
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
      toast.error("Failed to search collections by address");
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
      toast.error("Failed to fetch collection stats");
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

      if (data) {
        collections.value.unshift(data);
      }

      toast.success("Collection created successfully");
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create collection";
      toast.error("Failed to create collection");
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const updateCollection = async (
    id: number,
    collectionData: UpdateCollectionData
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

      if (data) {
        const index = collections.value.findIndex((c) => c.id === id);
        if (index !== -1) {
          collections.value[index] = data;
        }
      }

      toast.success("Collection updated successfully");
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update collection";
      toast.error("Failed to update collection");
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const updateCollectionStatus = async (id: number, status: string) => {
    return await updateCollection(id, { status });
  };

  const assignCollector = async (id: number, collectorId: string) => {
    return await updateCollection(id, { collector_assign: collectorId });
  };

  const deleteCollection = async (id: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("collections")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      collections.value = collections.value.filter((c) => c.id !== id);
      toast.success("Collection deleted successfully");
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete collection";
      toast.error("Failed to delete collection");
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
        (c) => c.request_by !== userId && c.collector_assign !== userId
      );
      toast.success("User collections deleted successfully");
      return true;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to delete user collections";
      toast.error("Failed to delete user collections");
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getUserEmail = async (
    userId: string
  ): Promise<{ email?: string; full_name?: string } | null> => {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (error || !user) {
        console.error("Error fetching user email:", error);
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

  const fetchCollectionsWithEmails = async () => {
    loading.value = true;
    error.value = undefined;

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
        })
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
        }
      );

      return collectionsWithEmails;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections with emails";
      toast.error("Failed to fetch collections with emails");
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchCollectionWithEmails = async (collectionId: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (fetchError) throw fetchError;

      if (!data) return undefined;

      // Fetch user emails for requester and collector
      const requesterData = await getUserEmail(data.request_by);
      const collectorData = await getUserEmail(data.collector_assign);

      const collectionWithEmails: CollectionWithEmails = {
        ...data,
        requester_email: requesterData?.email,
        requester_name: requesterData?.full_name,
        collector_email: collectorData?.email,
        collector_name: collectorData?.full_name,
      };

      return collectionWithEmails;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collection with emails";
      toast.error("Failed to fetch collection with emails");
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
        .from("collections")
        .select("*")
        .eq("status", status)
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
        })
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
        }
      );

      return collectionsWithEmails;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch collections by status with emails";
      toast.error("Failed to fetch collections by status with emails");
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
    collectorId?: string
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
      toast.error("Failed to fetch status counts");
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
    collections: Collection[] | CollectionWithEmails[]
  ): StatusCounts => {
    return {
      all: collections.length,
      pending: collections.filter((c) => c.status === "pending").length,
      in_progress: collections.filter((c) => c.status === "in_progress").length,
      completed: collections.filter((c) => c.status === "completed").length,
      cancelled: collections.filter((c) => c.status === "cancelled").length,
    };
  };

  return {
    // State
    collections,
    currentCollection,
    loading,
    error,
    // Actions
    fetchCollections,
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
  };
});
