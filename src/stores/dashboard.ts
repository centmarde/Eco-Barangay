import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabase";
import { useToast } from "vue-toastification";

// Type definitions
export interface DashboardStats {
  totalUsers: number;
  activeCollectors: number;
  pendingRequests: number;
  completedPickups: number;
  totalReports: number;
  wasteCollected: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

export const useDashboardStore = defineStore("dashboard", () => {
  const toast = useToast();

  // State
  const dashboardStats = ref<DashboardStats>({
    totalUsers: 0,
    activeCollectors: 0,
    pendingRequests: 0,
    completedPickups: 0,
    totalReports: 0,
    wasteCollected: 0,
  });

  const recentActivities = ref<RecentActivity[]>([]);

  const quickActions = ref<QuickAction[]>([
    {
      title: "User Management",
      description: "Manage users and roles",
      icon: "mdi-account-group",
      color: "primary",
      route: "/admin/user-management",
    },
    {
      title: "User Roles",
      description: "Configure user permissions",
      icon: "mdi-shield-account",
      color: "primary",
      route: "/admin/user-roles",
    },
    {
      title: "Pickup Monitoring",
      description: "Monitor waste collection",
      icon: "mdi-truck-delivery",
      color: "success",
      route: "/barangay/monitoring",
    },
    {
      title: "Report Analysis",
      description: "View analytics and reports",
      icon: "mdi-chart-line",
      color: "primary",
      route: "/barangay/report-analysis",
    },
  ]);

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Helper function to format relative time
  const getRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return past.toLocaleDateString();
  };

  // Actions
  const loadDashboardData = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Fetch total users count from auth.users via admin API
      const { count: totalUsers, error: usersError } = await supabase
        .from("auth.users")
        .select("*", { count: "exact", head: true });

      if (usersError && usersError.code !== "PGRST116") {
        console.error("Error fetching users:", usersError);
      }

      // For now, we'll use placeholder data structure
      // You'll need to adjust these queries based on your actual database schema

      // Example: Fetch collectors count (adjust table name as needed)
      // const { count: activeCollectors } = await supabase
      //   .from("collectors")
      //   .select("*", { count: "exact", head: true })
      //   .eq("status", "active");

      // Example: Fetch pending requests (adjust table name as needed)
      // const { count: pendingRequests } = await supabase
      //   .from("pickup_requests")
      //   .select("*", { count: "exact", head: true })
      //   .eq("status", "pending");

      // Example: Fetch completed pickups (adjust table name as needed)
      // const { count: completedPickups } = await supabase
      //   .from("pickups")
      //   .select("*", { count: "exact", head: true })
      //   .eq("status", "completed");

      // Update stats with real data where available
      dashboardStats.value = {
        totalUsers: totalUsers || 0,
        activeCollectors: 0, // Replace with actual query
        pendingRequests: 0, // Replace with actual query
        completedPickups: 0, // Replace with actual query
        totalReports: 0, // Replace with actual query
        wasteCollected: 0, // Replace with actual query
      };

      // Fetch recent activities if you have an activity log table
      await loadRecentActivities();
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      error.value =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      toast.error("Failed to load dashboard data");
    } finally {
      loading.value = false;
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Example query - adjust based on your actual schema
      // You might have an activity_log or audit_log table
      // const { data: activities, error: activitiesError } = await supabase
      //   .from("activity_log")
      //   .select("*")
      //   .order("created_at", { ascending: false })
      //   .limit(10);

      // if (activitiesError) throw activitiesError;

      // For now, keeping empty array until you have activity tracking
      recentActivities.value = [];
    } catch (err) {
      console.error("Error loading recent activities:", err);
    }
  };

  const addRecentActivity = (activity: Omit<RecentActivity, "id">) => {
    const newActivity = {
      ...activity,
      id: Math.max(...recentActivities.value.map((a) => a.id)) + 1,
    };
    recentActivities.value.unshift(newActivity);

    // Keep only the latest 10 activities
    if (recentActivities.value.length > 10) {
      recentActivities.value = recentActivities.value.slice(0, 10);
    }
  };

  const updateDashboardStats = (newStats: Partial<DashboardStats>) => {
    dashboardStats.value = { ...dashboardStats.value, ...newStats };
  };

  return {
    // State
    dashboardStats,
    recentActivities,
    quickActions,
    loading,
    error,

    // Actions
    loadDashboardData,
    addRecentActivity,
    updateDashboardStats,
  };
});
