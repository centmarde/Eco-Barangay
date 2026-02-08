<script lang="ts" setup>
import { onMounted } from 'vue'
import { useLandingController } from '@/controller/landingController'
import Sidebar1 from '@/components/common/sideBar/Sidebar.vue'

// Navbar Components
import InsideNavbar1 from '@/components/common/insideNavbar/InsideNavbar1.vue'
import InsideNavbar2 from '@/components/common/insideNavbar/InsideNavbar2.vue'
import InsideNavbar3 from '@/components/common/insideNavbar/InsideNavbar3.vue'
import InsideNavbar4 from '@/components/common/insideNavbar/InsideNavbar4.vue'

// Footer Components
import OuterFooter from '@/components/common/outerFooters/OuterFooter.vue'
import OuterFooter2 from '@/components/common/outerFooters/OuterFooter2.vue'

const { data, fetchLandingData } = useLandingController()

onMounted(async () => {
  await fetchLandingData()
})
</script>

<template>
  <v-app>
    <!-- Left Sidebar - Takes full left side -->
    <Sidebar1 />

    <!-- Dynamic Navbar Selection - Positioned to the right of sidebar -->
    <InsideNavbar1
      v-if="data?.ui?.navbarComponent === '1'"
      :config="data?.ui"
      class="navbar-with-sidebar"
    />

    <InsideNavbar2
      v-else-if="data?.ui?.navbarComponent === '2'"
      :config="data?.ui"
      class="navbar-with-sidebar"
    />

    <InsideNavbar3
      v-else-if="data?.ui?.navbarComponent === '3'"
      :config="data?.ui"
      class="navbar-with-sidebar"
    />

    <InsideNavbar4
      v-else-if="data?.ui?.navbarComponent === '4'"
      :config="data?.ui"
      class="navbar-with-sidebar"
    />

    <v-main class="main-with-sidebar">
      <slot name="content">
        <router-view />
      </slot>
    </v-main>

    <OuterFooter
      v-if="data?.ui?.footerComponent === '1'"
      :config="data?.ui"
    />
    <OuterFooter2
      v-else-if="data?.ui?.footerComponent === '2'"
      :config="data?.ui"
    />
  </v-app>
</template>



<style scoped>
/* Navbar positioning - push to the right of sidebar */
.navbar-with-sidebar {
  margin-left: 280px; /* Match sidebar width */
  width: calc(100% - 280px); /* Adjust width to account for sidebar */
}

/* Main content positioning */
.main-with-sidebar {
  padding-left: 280px; /* Match sidebar width */
  padding-top: 64px; /* Account for navbar height */
}

/* Responsive behavior for small screens */
@media (max-width: 960px) {
  .navbar-with-sidebar {
    margin-left: 0;
    width: 100%;
  }

  .main-with-sidebar {
    padding-left: 0;
    padding-top: 64px; /* Keep top padding for mobile navbar */
  }
}

/* Ensure proper spacing and layout */
.v-app {
  position: relative;
}
</style>
