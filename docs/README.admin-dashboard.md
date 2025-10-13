# Admin Dashboard

## Overview

The Admin Dashboard provides a comprehensive view of the Eco-Barangay system with real-time statistics, quick actions, and system monitoring.

## Features

### 📊 Dashboard Statistics

- **Total Users**: Count of all registered users in the system
- **Active Collectors**: Number of active waste collectors
- **Pending Requests**: Pickup requests awaiting action
- **Completed Pickups**: Successfully completed waste collection
- **Total Reports**: Number of reports generated
- **Waste Collected**: Total waste collected in kilograms

### ⚡ Quick Actions

Direct navigation to key admin functions:

- User Management
- User Roles Configuration
- Pickup Monitoring
- Reports Analysis

### 📜 Recent Activities

Real-time activity feed showing recent system events (when configured)

### 🔧 System Status

Monitor the health of core system components:

- Database connectivity
- API services status
- Notification system
- Backup status

## Mobile-First Design

The dashboard is optimized for mobile devices with:

- Responsive grid layouts (6 columns on mobile, scales up on larger screens)
- Touch-friendly tap targets
- Optimized font sizes and spacing
- Collapsible layout on smaller screens
- Smooth animations and transitions

## Data Integration

### Supabase Integration

The dashboard fetches real data from Supabase:

```typescript
// Example: Fetching total users
const { count: totalUsers } = await supabase
  .from("auth.users")
  .select("*", { count: "exact", head: true });
```

### Customizing Data Sources

To connect your database tables:

1. **Update `/src/stores/dashboard.ts`**
2. **Modify the `loadDashboardData()` function**
3. **Uncomment and adjust the example queries**

Example for collectors:

```typescript
const { count: activeCollectors } = await supabase
  .from("collectors") // Your table name
  .select("*", { count: "exact", head: true })
  .eq("status", "active");
```

### Adding Activity Tracking

To enable recent activities:

1. Create an activity log table in Supabase
2. Update `loadRecentActivities()` in the dashboard store
3. Map your activity data to the `RecentActivity` interface

## Responsive Breakpoints

- **Mobile**: < 600px (cols="6" for stats, cols="6" for actions)
- **Tablet**: 600-960px (cols="4" for stats, cols="6" for actions)
- **Desktop**: > 960px (cols="2" for stats, cols="3" for actions)

## Performance Optimizations

- Lazy loading of dashboard data
- Computed properties for responsive values
- Efficient state management with Pinia
- Minimal re-renders with proper refs

## Future Enhancements

- [ ] Add charts and graphs for visual analytics
- [ ] Implement real-time updates with Supabase subscriptions
- [ ] Add date range filters for statistics
- [ ] Export dashboard data to PDF/CSV
- [ ] Customizable dashboard widgets
- [ ] User activity heatmap
- [ ] System performance metrics

## Usage

```vue
<script setup>
import { onMounted } from "vue";
import { useDashboardStore } from "@/stores/dashboard";

const dashboardStore = useDashboardStore();

onMounted(() => {
  dashboardStore.loadDashboardData();
});
</script>
```

## Notes

- Ensure your Supabase environment variables are configured
- Update table names in queries to match your schema
- Activity tracking requires additional setup
- System status indicators are currently static (can be made dynamic)
