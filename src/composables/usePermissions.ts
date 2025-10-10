import { ref, computed } from "vue";
import { useAuthUserStore } from "@/stores/authUser";
import { useUserPagesStore } from "@/stores/pages";

/**
 * Composable for handling user permissions and page access
 */
export const usePermissions = () => {
  const authStore = useAuthUserStore();
  const pagesStore = useUserPagesStore();

  const allowedPages = ref<string[]>([]);
  const isLoading = ref(false);

  /**
   * Fetch and cache the allowed pages for the current user
   */
  const fetchUserPermissions = async () => {
    isLoading.value = true;
    try {
      const currentUserResult = await authStore.getCurrentUser();

      if (currentUserResult.user) {
        const userRoleId = currentUserResult.user.user_metadata?.role;

        if (userRoleId) {
          const rolePages = await pagesStore.fetchRolePagesByRoleId(userRoleId);

          if (rolePages && rolePages.length > 0) {
            allowedPages.value = rolePages
              .map((rolePage) => rolePage.pages)
              .filter(Boolean) as string[];
          } else {
            allowedPages.value = [];
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      allowedPages.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Check if a specific page/route is allowed for the current user
   */
  const hasPageAccess = (route: string): boolean => {
    // Always allow access to account home
    if (route === "/account/home") {
      return true;
    }

    // If user has access to admin dashboard, also allow access to it
    if (
      route === "/admin/dashboard" &&
      allowedPages.value.some((page) => page.startsWith("/admin/"))
    ) {
      return true;
    }

    return allowedPages.value.includes(route);
  };

  /**
   * Check if any child route in a group is accessible
   */
  const hasGroupAccess = (routes: string[]): boolean => {
    return routes.some((route) => hasPageAccess(route));
  };

  return {
    allowedPages: computed(() => allowedPages.value),
    isLoading: computed(() => isLoading.value),
    fetchUserPermissions,
    hasPageAccess,
    hasGroupAccess,
  };
};
