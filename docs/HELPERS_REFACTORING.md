# Helper Files Refactoring

## Overview

The monolithic `helpers.ts` file has been refactored into smaller, more focused helper files based on their specific functionality. This improves code organization, maintainability, and makes it easier to find and reuse utility functions.

## New Helper Files

### 1. `errorHelpers.ts`

**Purpose**: Error handling utilities

**Functions**:

- `getErrorMessage(error)` - Extracts readable error messages from various error formats

---

### 2. `userHelpers.ts`

**Purpose**: User-related utility functions

**Functions**:

- `getEmailInitials(email)` - Generates initials from email for avatar display
- `getUserDisplayName(userData)` - Generates display name from user data
- `createSlugName(email)` - Creates slug name from email
- `createDisplaySlugName(email)` - Creates capitalized display name from email

---

### 3. `roleHelpers.ts`

**Purpose**: Role-related utility functions

**Functions**:

- `getRoleColor(roleId)` - Gets color for role ID
- `getRoleTitle(roleId, roles)` - Gets role title from roles array
- `getRoleText(roleId)` - Gets text representation of role ID

---

### 4. `dateHelpers.ts`

**Purpose**: Date and time formatting utilities

**Functions**:

- `formatDate(dateString)` - Formats date string to human-readable format
- `formatRelativeTime(timestamp)` - Formats timestamp to relative time string (e.g., "2h ago")

---

### 5. `memberHelpers.ts`

**Purpose**: Organization member management utilities

**Constants**:

- `memberStatusOptions` - Member status configuration
- `memberRoleOptions` - Member role configuration

**Types**:

- `MemberStatus` - Type for member status values
- `MemberRole` - Type for member role values

**Functions**:

- `getMemberStatusColor(status)` - Gets color for member status
- `getMemberStatusIcon(status)` - Gets icon for member status
- `getMemberRoleTitle(role)` - Gets title for member role
- `getMemberRoleDescription(role)` - Gets description for member role
- `isValidMemberStatus(status)` - Validates member status
- `isValidMemberRole(role)` - Validates member role

---

### 6. `organizationHelpers.ts`

**Purpose**: Organization-related utility functions

**Constants**:

- `organizationsTableHeaders` - Table configuration for organizations
- `organizationValidationRules` - Form validation rules

**Functions**:

- `filterOrganizationsByLeader(organizations, leaderId)` - Filters organizations by leader
- `filterMembersBySearch(members, searchTerm)` - Filters members by search term
- `prepareOrganizationCardData(organization)` - Prepares organization data for display
- `createMemberManagementHandlers(config)` - Creates member management handlers factory
- `createViewMembersHandler(config)` - Creates view members handler

---

### 7. `notificationHelpers.ts`

**Purpose**: Notification-related utility functions

**Functions**:

- `getNotificationIcon(type)` - Gets icon for notification type
- `getNotificationColor(notification)` - Gets color based on type and read status

---

### 8. `feedbackHelpers.ts`

**Purpose**: Feedback-related utility functions

**Functions**:

- `getFeedbackRatingIcon(rating)` - Gets icon for feedback rating (1-4)
- `getFeedbackRatingColor(rating)` - Gets color for feedback rating
- `getFeedbackStatusColor(status)` - Gets color for feedback status

---

## Updated Files

The following files have been updated to use the new helper imports:

1. **`src/components/common/NotificationDialog.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/notificationHelpers`

2. **`src/pages/admin/components/FeedbackSection.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/feedbackHelpers` and `@/utils/dateHelpers`

3. **`src/pages/collectors/composables/requestView.ts`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/dateHelpers`

4. **`src/pages/collectors/components/RequestsWidget.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/userHelpers`

5. **`src/pages/collectors/dialogs/RequestDialog.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/userHelpers`

6. **`src/components/common/insideNavbar/SlugName.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/userHelpers`

7. **`src/pages/admin/components/UserManagementTable.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/dateHelpers`, `@/utils/errorHelpers`, `@/utils/roleHelpers`

8. **`src/pages/admin/components/dialogs/DeleteUserDialog.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/errorHelpers`

9. **`src/pages/admin/components/dialogs/EditUserDialog.vue`**

   - Changed from: `@/utils/helpers`
   - Changed to: `@/utils/errorHelpers`

10. **`src/pages/admin/components/dialogs/UserDetailsDialog.vue`**
    - Changed from: `@/utils/helpers`
    - Changed to: `@/utils/roleHelpers` and `@/utils/dateHelpers`

---

## Benefits

### ✅ Better Organization

- Each helper file has a clear, single purpose
- Easy to locate specific utility functions
- Related functions are grouped together

### ✅ Improved Maintainability

- Smaller files are easier to understand and modify
- Changes to one domain don't affect others
- Reduced risk of merge conflicts

### ✅ Better Performance

- Smaller bundle sizes with tree-shaking
- Only import what you need
- Reduced memory footprint

### ✅ Enhanced Developer Experience

- Clearer import statements
- Better IDE autocomplete
- Easier to write and find tests

### ✅ Scalability

- Easy to add new helper functions
- Simple to split files further if needed
- Clear patterns for organization

---

## Migration Guide

### Before:

```typescript
import {
  formatDate,
  getUserDisplayName,
  getNotificationIcon,
} from "@/utils/helpers";
```

### After:

```typescript
import { formatDate } from "@/utils/dateHelpers";
import { getUserDisplayName } from "@/utils/userHelpers";
import { getNotificationIcon } from "@/utils/notificationHelpers";
```

---

## File Structure

```
src/utils/
├── constants.ts                # Application constants
├── dateHelpers.ts             # Date/time formatting
├── errorHelpers.ts            # Error handling
├── feedbackHelpers.ts         # Feedback utilities
├── memberHelpers.ts           # Member management
├── notificationHelpers.ts     # Notification utilities
├── organizationHelpers.ts     # Organization utilities
├── roleHelpers.ts             # Role utilities
└── userHelpers.ts             # User utilities
```

---

## Notes

- All imports have been updated across the codebase
- No functionality has changed, only organization
- All files pass TypeScript compilation with no errors
- The original `helpers.ts` file has been removed
