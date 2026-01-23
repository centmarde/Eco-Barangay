export interface NavigationItem {
  title: string;
  icon: string;
  route: string;
  selected?: boolean;
  permission?: string; // Optional permission key for role-based access
}

export interface NavigationGroup {
  title: string;
  icon: string;
  permission?: string; // Optional permission key for the entire group
  children: NavigationItem[];
}

export const navigationConfig: NavigationGroup[] = [
  {
    title: "My Account",
    icon: "mdi-account",
    children: [
      {
        title: "Home",
        icon: "mdi-home",
        route: "/account/home",
      },
       {
        title: "My Feedback",
        icon: "mdi-comment-account",
        route: "/residents/my-feedback",
        permission: "residents.feedback.view",
      }
    ],
  },
  {
    title: "Collectors",
    icon: "mdi-truck",
    permission: "collectors.access",
    children: [
      {
        title: "Requests",
        icon: "mdi-clipboard-text",
        route: "/collectors/requests",
        permission: "collectors.requests.view",
      }
    ],
  },
  {
    title: "Barangay Officials",
    icon: "mdi-account-tie",
    permission: "barangay.access",
    children: [
      {
        title: "Pickups",
        icon: "mdi-truck-delivery",
        route: "/barangay/pickups",
        permission: "barangay.pickups.view",
      },
      {
        title: "Monitoring",
        icon: "mdi-monitor-dashboard",
        route: "/barangay/monitoring",
        permission: "barangay.monitoring.view",
      },
      {
        title: "Report Analysis",
        icon: "mdi-chart-box",
        route: "/barangay/report-analysis",
        permission: "barangay.reports.view",
      },
    ],
  },

  {
    title: "Admin Controls",
    icon: "mdi-cog",
    permission: "admin.access",
    children: [
      {
        title: "User Management",
        icon: "mdi-account-multiple",
        route: "/admin/user-management",
        permission: "admin.users.manage",
      },
      {
        title: "User Roles",
        icon: "mdi-account-key",
        route: "/admin/user-roles",
        permission: "admin.roles.manage",
      },
      {
        title: "Feedback Management",
        icon: "mdi-comment-multiple",
        route: "/admin/feedback-management",
        permission: "admin.feedback.manage",
      },
       {
        title: "Admin Requests History",
        icon: "mdi-history",
        route: "/collectors/requests-history",
        permission: "collectors.requests.history",
      },
       {
        title: "Dashboard",
        icon: "mdi-view-dashboard",
        route: "/admin/dashboard",
        permission: "admin.dashboard.view",
      },
    ],
  },
];

// Helper function to get all permissions from navigation config
export const getAllPermissions = (): string[] => {
  const permissions: string[] = [];

  navigationConfig.forEach((group) => {
    if (group.permission) {
      permissions.push(group.permission);
    }

    group.children.forEach((item) => {
      if (item.permission) {
        permissions.push(item.permission);
      }
    });
  });

  return Array.from(new Set(permissions)); // Remove duplicates
};

// Helper function to get navigation items with selected state
export const getNavigationWithSelection = (
  selectedPermissions: string[] = []
): NavigationGroup[] => {
  return navigationConfig.map((group) => ({
    ...group,
    children: group.children.map((item) => ({
      ...item,
      selected: selectedPermissions.includes(item.permission || item.route),
    })),
  }));
};
