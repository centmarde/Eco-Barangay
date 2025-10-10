import { useAuthUserStore } from "@/stores/authUser";
import { useUserPagesStore } from "@/stores/pages";

/**
 * Determines the appropriate home route for a user based on their role and permissions
 */
export const getUserHomeRoute = async (): Promise<string> => {
  try {
    const authStore = useAuthUserStore();
    const pagesStore = useUserPagesStore();

    // Get current user data to access role ID from metadata
    const currentUserResult = await authStore.getCurrentUser();

    if (currentUserResult.user) {
      const userRoleId = currentUserResult.user.user_metadata?.role;

      if (userRoleId) {
        // Fetch pages accessible by this role
        const rolePages = await pagesStore.fetchRolePagesByRoleId(userRoleId);

        if (rolePages && rolePages.length > 0) {
          // Check if user has access to admin pages
          const allowedPages = rolePages
            .map((rolePage) => rolePage.pages)
            .filter(Boolean);
          const hasAdminAccess = allowedPages.some((page: string) =>
            page.startsWith("/admin/")
          );

          // Return appropriate home route
          if (hasAdminAccess) {
            return "/admin/dashboard";
          }
        }
      }
    }
  } catch (error) {
    console.error("Error determining user home route:", error);
  }

  // Default fallback to regular home
  return "/account/home";
};

/**
 * Checks if a user has admin access
 */
export const userHasAdminAccess = async (): Promise<boolean> => {
  try {
    const authStore = useAuthUserStore();
    const pagesStore = useUserPagesStore();

    const currentUserResult = await authStore.getCurrentUser();

    if (currentUserResult.user) {
      const userRoleId = currentUserResult.user.user_metadata?.role;

      if (userRoleId) {
        const rolePages = await pagesStore.fetchRolePagesByRoleId(userRoleId);

        if (rolePages && rolePages.length > 0) {
          const allowedPages = rolePages
            .map((rolePage) => rolePage.pages)
            .filter(Boolean);
          return allowedPages.some((page: string) =>
            page.startsWith("/admin/")
          );
        }
      }
    }
  } catch (error) {
    console.error("Error checking admin access:", error);
  }

  return false;
};
