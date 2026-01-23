import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase, supabaseAdmin } from "@/lib/supabase";

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
      // 1. Fetch Users Data (Total Users & Active Collectors)
      const { data: usersData, error: usersError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (usersError) throw usersError;

      const totalUsers = usersData?.users?.length || 0;

      // Filter collectors (assuming role 4 is collector)
      // Note: Adjust the role check if your metadata structure is different
      const activeCollectors = usersData?.users?.filter(
        (u) => u.user_metadata?.role === 4
      ).length || 0;

      // 2. Fetch Collections Data (Pending & Completed)
      // Pending
      const { count: pendingRequests, error: pendingError } = await supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (pendingError) console.error("Error fetching pending requests:", pendingError);

      // Completed
      const { count: completedPickups, error: completedError } = await supabase
        .from("collections")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      if (completedError) console.error("Error fetching completed pickups:", completedError);

      // 3. Reports (Total Reports / Monitoring items)
      // Assuming purok_monitoring table holds 'reports' or surveys
      const { count: totalReports, error: reportsError } = await supabase
        .from("purok_monitoring")
        .select("*", { count: "exact", head: true });

      if (reportsError) console.error("Error fetching reports:", reportsError);

      // Update stats
      dashboardStats.value = {
        totalUsers,
        activeCollectors,
        pendingRequests: pendingRequests || 0,
        completedPickups: completedPickups || 0,
        totalReports: totalReports || 0,
        wasteCollected: completedPickups || 0, // Simplified metric
      };

      // Fetch recent activities
      await loadRecentActivities();
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      error.value =
        err instanceof Error ? err.message : "Failed to load dashboard data";
    } finally {
      loading.value = false;
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Use 'collections' table as the source of activity for now
      // Fetch latest 10 collections
      const { data: latestCollections, error: collectionsError } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (collectionsError) throw collectionsError;

      if (latestCollections) {
        recentActivities.value = latestCollections.map((c) => {
          let type = "New Request";
          let message = `Pickup requested at ${c.address}`;
          let icon = "mdi-delete-outline";
          let color = "info";

          if (c.status === "completed") {
            type = "Collection Completed";
            message = `Waste collected at ${c.address}`;
            icon = "mdi-check-circle";
            color = "success";
          } else if (c.status === "cancelled") {
            type = "Request Cancelled";
            message = `Pickup cancelled at ${c.address}`;
            icon = "mdi-close-circle";
            color = "error";
          } else if (c.status === "in_progress") {
             type = "Collection Started";
             message = `Collector assigned to ${c.address}`;
             icon = "mdi-truck-fast";
             color = "warning";
          }

          return {
            id: c.id,
            type,
            message,
            timestamp: getRelativeTime(c.created_at),
            icon,
            color,
          };
        });
      }
    } catch (err) {
      console.error("Error loading recent activities:", err);
    }
  };

  const addRecentActivity = (activity: Omit<RecentActivity, "id">) => {
    // In a real app, you would insert into DB. Here we just update local state.
    const newActivity = {
      ...activity,
      id: Date.now(), // simple unique ID
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
