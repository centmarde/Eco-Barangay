import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";

// Type definitions
export type Announcement = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  image?: string;
};

export type CreateAnnouncementData = {
  title: string;
  description: string;
  image?: string;
};

export type UpdateAnnouncementData = {
  title?: string;
  description?: string;
  image?: string;
};

export const useAnnouncementsStore = defineStore("announcements", () => {
  // State
  const announcements = ref<Announcement[]>([]);
  const currentAnnouncement = ref<Announcement | undefined>(undefined);
  const loading = ref(false);
  const error = ref<string | undefined>(undefined);

  // Actions
  const fetchAnnouncements = async () => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      announcements.value = data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch announcements";
    } finally {
      loading.value = false;
    }
  };

  const fetchAnnouncementById = async (id: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      currentAnnouncement.value = data;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch announcement";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const fetchRecentAnnouncements = async (limit: number = 5) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch recent announcements";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const searchAnnouncements = async (searchTerm: string) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: fetchError } = await supabase
        .from("announcements")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to search announcements";
      return [];
    } finally {
      loading.value = false;
    }
  };

  const createAnnouncement = async (
    announcementData: CreateAnnouncementData
  ) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: createError } = await supabase
        .from("announcements")
        .insert([announcementData])
        .select()
        .single();

      if (createError) throw createError;

      if (data) {
        announcements.value.unshift(data);
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create announcement";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const updateAnnouncement = async (
    id: number,
    announcementData: UpdateAnnouncementData
  ) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { data, error: updateError } = await supabase
        .from("announcements")
        .update(announcementData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        const index = announcements.value.findIndex((a) => a.id === id);
        if (index !== -1) {
          announcements.value[index] = data;
        }
      }

      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update announcement";
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      announcements.value = announcements.value.filter((a) => a.id !== id);
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete announcement";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteMultipleAnnouncements = async (ids: number[]) => {
    loading.value = true;
    error.value = undefined;

    try {
      const { error: deleteError } = await supabase
        .from("announcements")
        .delete()
        .in("id", ids);

      if (deleteError) throw deleteError;

      announcements.value = announcements.value.filter(
        (a) => !ids.includes(a.id)
      );
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete announcements";
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    announcements,
    currentAnnouncement,
    loading,
    error,
    // Actions
    fetchAnnouncements,
    fetchAnnouncementById,
    fetchRecentAnnouncements,
    searchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    deleteMultipleAnnouncements,
  };
});
