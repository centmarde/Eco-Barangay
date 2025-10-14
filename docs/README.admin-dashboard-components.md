# Admin Dashboard Components

## Overview

The Admin Dashboard has been refactored into modular, reusable components following Vue 3 Composition API best practices.

## Component Structure

```
src/pages/admin/
├── DashboardView.vue (Main container)
└── components/
    ├── DashboardHeader.vue
    ├── DashboardStats.vue
    ├── QuickActionsCard.vue
    ├── RecentActivitiesCard.vue
    └── SystemStatusCard.vue
```

## Components

### 1. DashboardView.vue (Main Container)

**Purpose**: Orchestrates all dashboard components and manages state

**Responsibilities**:

- Fetches dashboard data from store
- Manages loading and error states
- Handles navigation logic
- Passes props to child components

**Props**: None (root component)

**State**:

- `dashboardStats` - Statistics data
- `recentActivities` - Activity log data
- `quickActions` - Quick action buttons
- `loading` - Loading state
- `error` - Error messages

---

### 2. DashboardHeader.vue

**Purpose**: Welcome header with user info and role badge

**Features**:

- Displays "Admin Dashboard" title
- Shows welcome message with username
- Administrator badge indicator
- Mobile-responsive layout

**Props**: None (uses auth store directly)

**Dependencies**:

- `useAuthUserStore()` - For username
- `useDisplay()` - For responsive layout

---

### 3. DashboardStats.vue

**Purpose**: Display statistical metrics in card format

**Features**:

- 6 stat cards (Users, Collectors, Pending, Completed, Reports, Waste)
- Configurable icons and colors
- Number formatting with locales
- Hover effects and animations
- Fully responsive grid layout

**Props**:

```typescript
interface Props {
  stats: DashboardStats;
}
```

**DashboardStats Interface**:

```typescript
{
  totalUsers: number;
  activeCollectors: number;
  pendingRequests: number;
  completedPickups: number;
  totalReports: number;
  wasteCollected: number;
}
```

**Layout**:

- Mobile: 2 columns (cols="6")
- Tablet: 3 columns (sm="4", md="4")
- Desktop: 6 columns (lg="2")

---

### 4. QuickActionsCard.vue

**Purpose**: Quick navigation buttons for admin functions

**Features**:

- 4 action cards with icons
- Click navigation with event emission
- Color-coded by purpose
- Mobile-optimized (hides descriptions on mobile)
- Hover effects

**Props**:

```typescript
interface Props {
  actions: QuickAction[];
}
```

**QuickAction Interface**:

```typescript
{
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}
```

**Events**:

- `@navigate(route: string)` - Emitted when action is clicked

**Layout**:

- Mobile: 2 columns (cols="6")
- Desktop: 4 columns (md="3")

---

### 5. RecentActivitiesCard.vue

**Purpose**: Display recent system activities

**Features**:

- Activity list with icons and timestamps
- Empty state when no activities
- "View All" button (for future implementation)
- Avatar colors per activity type

**Props**:

```typescript
interface Props {
  activities: RecentActivity[];
}
```

**RecentActivity Interface**:

```typescript
{
  id: number;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}
```

**States**:

- **Empty**: Shows info icon with helpful message
- **Populated**: Shows list of activities with icons

---

### 6. SystemStatusCard.vue

**Purpose**: Display system health status

**Features**:

- 4 status indicators (Database, API, Notifications, Backup)
- Color-coded chips (green=success, blue=info)
- "View Details" button (for future implementation)
- Mobile-responsive text sizing

**Props**: None (currently static, can be made dynamic)

**Status Items**:

- Database (Online)
- API Services (Running)
- Notifications (Active)
- Backup Status (Scheduled)

---

## Data Flow

```
DashboardView (Container)
    ↓
useDashboardStore (Pinia Store)
    ↓
├─→ DashboardHeader (No props, uses authStore)
├─→ DashboardStats (stats prop)
├─→ QuickActionsCard (actions prop) → @navigate event
├─→ RecentActivitiesCard (activities prop)
└─→ SystemStatusCard (No props)
```

## Responsive Breakpoints

All components respond to these breakpoints:

- **Mobile**: < 600px (`mobile.value`)
- **Tablet**: 600-960px (`sm`, `md`)
- **Desktop**: > 960px (`lg`, `xl`)
- **Large Desktop**: > 1280px (`mdAndUp`)

## Benefits of Component Structure

### ✅ Maintainability

- Each component has a single responsibility
- Easy to locate and update specific features
- Clear separation of concerns

### ✅ Reusability

- Components can be used in other dashboards
- Stats and cards are highly reusable
- Easy to create new dashboard layouts

### ✅ Testability

- Components can be unit tested independently
- Props and events are well-defined
- Mocking is straightforward

### ✅ Performance

- Smaller component bundles
- Better code splitting
- Optimized re-rendering

### ✅ Developer Experience

- Easier to understand codebase
- Simpler debugging
- Better IDE support with clear interfaces

## Usage Example

```vue
<template>
  <DashboardStats :stats="dashboardStats" />

  <QuickActionsCard :actions="quickActions" @navigate="handleNavigation" />

  <RecentActivitiesCard :activities="recentActivities" />
</template>

<script setup>
import DashboardStats from "./components/DashboardStats.vue";
import QuickActionsCard from "./components/QuickActionsCard.vue";
import RecentActivitiesCard from "./components/RecentActivitiesCard.vue";

const handleNavigation = (route) => {
  router.push(route);
};
</script>
```

## Future Enhancements

### DashboardStats.vue

- [ ] Add click handlers for drilling down into stats
- [ ] Add trend indicators (up/down arrows)
- [ ] Add percentage changes

### QuickActionsCard.vue

- [ ] Add customizable actions per user role
- [ ] Add badge notifications (e.g., pending count)
- [ ] Add keyboard navigation

### RecentActivitiesCard.vue

- [ ] Implement "View All" modal
- [ ] Add activity filtering
- [ ] Add real-time updates with WebSocket

### SystemStatusCard.vue

- [ ] Make status dynamic from API
- [ ] Add health check pings
- [ ] Add detailed metrics modal
- [ ] Add alert notifications

## File Locations

```
/src/pages/admin/
├── DashboardView.vue          # Main dashboard container
├── components/
│   ├── DashboardHeader.vue    # Header with welcome message
│   ├── DashboardStats.vue     # Statistics cards grid
│   ├── QuickActionsCard.vue   # Quick action buttons
│   ├── RecentActivitiesCard.vue # Activity feed
│   └── SystemStatusCard.vue   # System health indicators
└── README.md                   # Component documentation
```

## Notes

- All components use Vuetify 3 components
- TypeScript interfaces are imported from `@/stores/dashboard`
- Mobile-first responsive design throughout
- Consistent spacing and animation patterns
