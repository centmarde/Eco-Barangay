import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router";

import Hero from "@/pages/index.vue";
import Auth from "@/pages/Auth.vue";
import Dashboard from "@/pages/HomeView.vue";
import NotFound from "@/pages/NotFound.vue";
import ForbiddenView from "@/pages/ForbiddenView.vue";
import AdminUserRolesView from "@/pages/admin/AdminUserRolesView.vue";
import UserManagementView from "@/pages/admin/UserManagementView.vue";
import AdminDashboardView from "@/pages/admin/DashboardView.vue";
import FeedbackManagementView from "@/pages/admin/FeedbackManagementView.vue";

// Collectors pages
import RequestsView from "@/pages/collectors/RequestsView.vue";
import RequestsHistoryView from "@/pages/collectors/RequestsHistoryView.vue";

// Barangay Officials pages
import PickupsView from "@/pages/barangay/PickupsView.vue";
import MonitoringView from "@/pages/barangay/MonitoringView.vue";
import ReportAnalysisView from "@/pages/barangay/ReportAnalysisView.vue";

// Residents pages
import MyFeedbackView from "@/pages/residents/MyFeedbackView.vue";

/**
 * Route definitions for the application
 */
const routes = setupLayouts([
  {
    path: "/",
    component: Hero,
  },
  {
    path: "/auth",
    component: Auth,
  },

  {
    path: "/account/home",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  // Collectors routes
  {
    path: "/collectors/requests",
    component: RequestsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/collectors/requests-history",
    component: RequestsHistoryView,
    meta: { requiresAuth: true },
  },
  // Barangay Officials routes
  {
    path: "/barangay/pickups",
    component: PickupsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/barangay/monitoring",
    component: MonitoringView,
    meta: { requiresAuth: true },
  },
  {
    path: "/barangay/report-analysis",
    component: ReportAnalysisView,
    meta: { requiresAuth: true },
  },
  // Residents routes
  {
    path: "/residents/my-feedback",
    component: MyFeedbackView,
    meta: { requiresAuth: true },
  },
  // Admin routes
  {
    path: "/admin/dashboard",
    component: AdminDashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/user-roles",
    component: AdminUserRolesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/user-management",
    component: UserManagementView,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/feedback-management",
    component: FeedbackManagementView,
    meta: { requiresAuth: true },
  },
  {
    path: "/forbidden",
    component: ForbiddenView,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
]);

/**
 * Create and configure the router instance
 */
export const createAppRouter = () => {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  });
};
