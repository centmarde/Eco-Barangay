import { supabase, supabaseAdmin } from "@/lib/supabase";
import { useToast } from "vue-toastification";
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
  purok?: string;
  request_by: string;
  collector_assign?: string | null;
  status: string;
  garbage_type: string;
  notes?: string;
};

export type UpdateCollectionData = {
  address?: string;
  purok?: string;
  request_by?: string;
  collector_assign?: string;
  status?: string;
  garbage_type?: string;
  notes?: string;
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
  const toast = useToast();

  // State
  const collections = ref<Collection[]>([]);
  const collectors = ref<Collector[]>([]);
  const purokMonitoring = ref<PurokMonitoring[]>([]);
  const currentCollection = ref<Collection | undefined>(undefined);
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
      toast.error("Failed to fetch purok monitoring data");
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
      toast.error("Failed to update purok status");
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
      toast.error("Failed to link purok to collection");
      return undefined;
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

      collections.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch collections";
      toast.error("Failed to fetch collections");
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
      toast.error("Failed to fetch collectors");
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
      console.error("Create collection error:", err);
      toast.error(`Failed to create collection: ${error.value}`);
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

      // Collection deleted successfully
      collections.value = collections.value.filter((c) => c.id !== id);

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

      toast.success("Collection deleted successfully");
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete collection";
      console.error("Delete collection error:", err);
      toast.error(`Failed to delete collection: ${error.value}`);
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
    userId: string,
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

  return {
    // State
    collections,
    collectors,
    purokMonitoring,
    currentCollection,
    loading,
    error,
    // Actions
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
  };
});
