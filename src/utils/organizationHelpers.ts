/**
 * Organization-related utility functions
 */

import { formatDate } from "./dateHelpers";

/**
 * Filters organizations by leader ID
 * @param organizations - Array of organizations
 * @param leaderId - ID of the leader to filter by
 * @returns Organizations where the user is the leader
 */
export const filterOrganizationsByLeader = (
  organizations: any[],
  leaderId: string | undefined
): any[] => {
  if (!leaderId) return [];
  return organizations.filter((org) => org.leader_id === leaderId);
};

/**
 * Filters organization members by search term
 * @param members - Array of organization members
 * @param searchTerm - Search term to filter by
 * @returns Filtered members matching the search term
 */
export const filterMembersBySearch = (
  members: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm) return members;

  const term = searchTerm.toLowerCase();
  return members.filter(
    (member) =>
      member.student?.full_name?.toLowerCase().includes(term) ||
      member.student?.email?.toLowerCase().includes(term) ||
      member.student?.student_number?.toLowerCase().includes(term)
  );
};

/**
 * Prepares organization data for card display
 * @param organization - Organization object
 * @returns Formatted organization data for UI display
 */
export const prepareOrganizationCardData = (organization: any) => {
  return {
    id: organization.id,
    title: organization.title || "Untitled Organization",
    createdAt: organization.created_at,
    formattedCreatedAt: formatDate(organization.created_at),
    isLeader: true, // This would be determined by the calling component
    memberCount: organization.member_count || 0,
  };
};

/**
 * Creates member management handlers factory
 * @param config - Configuration object with callbacks and state
 * @returns Object with standardized member management handlers
 */
export const createMemberManagementHandlers = (config: {
  setSelectedOrganization: (org: any) => void;
  setMembersDialog: (open: boolean) => void;
  fetchOrganizationMembers: (orgId: string) => Promise<any>;
  fetchAvailableStudents: (orgId: string) => Promise<any>;
  addMemberToOrganization: () => Promise<boolean>;
  updateOrganizationMember: (
    memberId: string,
    updates: any
  ) => Promise<boolean>;
  removeMemberFromOrganization: (memberId: string) => Promise<boolean>;
  resetMemberForm: () => void;
  clearMembersData: () => void;
  getSelectedOrganization: () => any;
}) => {
  const handleManageMembers = async (organization: any) => {
    config.setSelectedOrganization(organization);
    config.setMembersDialog(true);

    // Fetch members and available students
    await Promise.all([
      config.fetchOrganizationMembers(organization.id),
      config.fetchAvailableStudents(organization.id),
    ]);
  };

  const handleAddMember = async () => {
    const success = await config.addMemberToOrganization();
    if (success) {
      config.resetMemberForm();
      // Refresh members list
      const selectedOrg = config.getSelectedOrganization();
      if (selectedOrg) {
        await Promise.all([
          config.fetchOrganizationMembers(selectedOrg.id),
          config.fetchAvailableStudents(selectedOrg.id),
        ]);
      }
    }
  };

  const handleUpdateMember = async (memberId: string, updates: any) => {
    const success = await config.updateOrganizationMember(memberId, updates);
    if (success) {
      const selectedOrg = config.getSelectedOrganization();
      if (selectedOrg) {
        // Refresh members list
        await config.fetchOrganizationMembers(selectedOrg.id);
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const success = await config.removeMemberFromOrganization(memberId);
    if (success) {
      const selectedOrg = config.getSelectedOrganization();
      if (selectedOrg) {
        // Refresh members list
        await config.fetchOrganizationMembers(selectedOrg.id);
      }
    }
  };

  const handleCloseMembersDialog = () => {
    config.setMembersDialog(false);
    config.setSelectedOrganization(null);
    // Clear members data to prevent showing stale data
    config.clearMembersData();
  };

  return {
    handleManageMembers,
    handleAddMember,
    handleUpdateMember,
    handleRemoveMember,
    handleCloseMembersDialog,
  };
};

/**
 * Creates a handler for viewing organization members (admin/read-only mode)
 * @param config - Configuration object with callbacks and state
 * @returns Handler function for viewing members
 */
export const createViewMembersHandler = (config: {
  setSelectedOrganization: (org: any) => void;
  setMembersDialog: (open: boolean) => void;
  fetchOrganizationMembers: (orgId: string) => Promise<any>;
  fetchAvailableStudents?: (orgId: string) => Promise<any>; // Optional for view-only mode
  viewOnly?: boolean; // If true, won't fetch available students
}) => {
  return async (organization: any) => {
    config.setSelectedOrganization(organization);
    config.setMembersDialog(true);

    // Fetch members, and optionally available students based on mode
    if (config.viewOnly || !config.fetchAvailableStudents) {
      // View-only mode: fetch members only
      await config.fetchOrganizationMembers(organization.id);
    } else {
      // Full management mode: fetch both members and available students
      await Promise.all([
        config.fetchOrganizationMembers(organization.id),
        config.fetchAvailableStudents(organization.id),
      ]);
    }
  };
};

/**
 * Table configuration for Organizations data table
 */
export const organizationsTableHeaders = [
  { title: "Organization Name", key: "title", sortable: true },
  { title: "Leader", key: "leader", sortable: true },
  { title: "Created Date", key: "created_at", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
];

/**
 * Form validation rules for organizations
 */
export const organizationValidationRules = {
  title: [(v: string) => !!v || "Organization name is required"],
};
