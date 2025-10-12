// Utilities
import { createPinia } from "pinia";

// Export stores
export { useAuthUserStore } from "./authUser";
export { useUserRolesStore } from "./roles";
export { useUserPagesStore } from "./pages";
export { useDashboardStore } from "./dashboard";
export { useAppStore } from "./app";
export { useNotificationsStore } from "./notifications";

export default createPinia();
