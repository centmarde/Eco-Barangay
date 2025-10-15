<script lang="ts" setup>
import type {
  CTAButton,
  NavigationItem,
  UIConfig,
  LogoConfig,
} from "@/controller/landingController";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "@/composables/useTheme";
import { useDisplay } from "vuetify";

interface Props {
  config?: UIConfig | null;
}

const props = defineProps<Props>();
const router = useRouter();

// Responsive breakpoints
const { mobile } = useDisplay();

// Mobile drawer state
const mobileDrawer = ref(false);

// Theme management
const {
  toggleTheme: handleToggleTheme,
  getCurrentTheme,
  isLoadingTheme,
} = useTheme();

// Scroll detection for mobile drawer auto-close
let lastScrollY = ref(0);
let ticking = ref(false);

const handleScroll = () => {
  if (!ticking.value) {
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      // Close mobile drawer when scrolling down
      if (
        mobile.value &&
        mobileDrawer.value &&
        currentScrollY > lastScrollY.value
      ) {
        mobileDrawer.value = false;
      }

      lastScrollY.value = currentScrollY;
      ticking.value = false;
    });
    ticking.value = true;
  }
};

// Add scroll listener on mount, remove on unmount
onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  lastScrollY.value = window.scrollY;
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const navbarConfig = computed(() => props.config?.navbar);

// Theme toggle computed properties
const currentTheme = computed(() => getCurrentTheme());
const themeIcon = computed(() => {
  return currentTheme.value === "dark"
    ? "mdi-white-balance-sunny"
    : "mdi-weather-night";
});
const themeTooltip = computed(() => {
  return `Switch to ${currentTheme.value === "dark" ? "light" : "dark"} theme`;
});

function toggleTheme() {
  handleToggleTheme();
}

function handleNavigation(item: NavigationItem) {
  // Close mobile drawer when navigating
  if (mobile.value) {
    mobileDrawer.value = false;
  }

  switch (item.action) {
    case "scroll": {
      scrollToSection(item.target);
      break;
    }
    case "navigate": {
      router.push(item.target);
      break;
    }
    case "external": {
      window.open(item.target, "_blank", "noopener,noreferrer");
      break;
    }
  }
}

function handleCTAAction(button: CTAButton) {
  // Close mobile drawer when using CTA
  if (mobile.value) {
    mobileDrawer.value = false;
  }

  switch (button.action) {
    case "scroll": {
      scrollToSection(button.target);
      break;
    }
    case "navigate": {
      router.push(button.target);
      break;
    }
    case "external": {
      window.open(button.target, "_blank", "noopener,noreferrer");
      break;
    }
  }
}

function scrollToSection(sectionId: string) {
  const element = document.querySelector(`#${sectionId}`);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
</script>

<template>
  <v-navigation-drawer
    v-if="mobile && config?.showNavbar && navbarConfig"
    v-model="mobileDrawer"
    temporary
    location="start"
    :color="navbarConfig.color"
    width="280"
    :elevation="navbarConfig.elevation"
  >
    <div class="pa-4 d-flex align-center">
      <template v-if="navbarConfig?.logo?.src">
        <v-img
          :src="navbarConfig.logo.src"
          :alt="navbarConfig.logo.alt"
          width="50"
          height="50"
          class="me-2 rounded-circle"
          cover
        >
          <template #error>
            <v-icon class="me-2" :icon="navbarConfig.icon" size="large" />
          </template>
        </v-img>
      </template>
      <template v-else>
        <v-icon class="me-2" :icon="navbarConfig?.icon" size="large" />
      </template>
      <span class="text-h6 font-weight-bold">{{ navbarConfig?.title }}</span>
    </div>

    <v-divider />

    <v-list>
      <v-list-item
        v-for="item in navbarConfig.navigationItems"
        :key="item.label"
        @click="handleNavigation(item)"
      >
        <v-list-item-title>{{ item.label }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-divider />

    <div class="pa-4">
      <v-btn
        :loading="isLoadingTheme"
        variant="outlined"
        block
        class="mb-2"
        @click="toggleTheme"
      >
        <v-icon :icon="themeIcon" class="me-2" />
        {{ themeTooltip }}
      </v-btn>

      <v-btn
        v-if="navbarConfig.ctaButton"
        :color="navbarConfig.ctaButton.color"
        :variant="navbarConfig.ctaButton.variant"
        block
        @click="handleCTAAction(navbarConfig.ctaButton)"
      >
        {{ navbarConfig.ctaButton.label }}
      </v-btn>
    </div>
  </v-navigation-drawer>

  <v-toolbar
    v-if="config?.showNavbar && navbarConfig"
    app
    height="75"
    :color="navbarConfig.color"
    :density="navbarConfig.density"
    :elevation="navbarConfig.elevation"
    class="px-6"
  >
    <template #prepend>
      <v-btn
        v-if="mobile"
        icon
        variant="text"
        @click="mobileDrawer = !mobileDrawer"
      >
        <v-icon icon="mdi-menu" />
      </v-btn>

      <div class="d-flex align-center">
        <template v-if="navbarConfig?.logo?.src">
          <v-img
            :src="navbarConfig.logo.src"
            :alt="navbarConfig.logo.alt"
            width="50"
            height="50"
            class="me-2 rounded-circle"
            cover
          >
            <template #error>
              <v-icon class="me-2" :icon="navbarConfig.icon" size="large" />
            </template>
          </v-img>
        </template>

        <template v-else>
          <v-icon class="me-2" :icon="navbarConfig?.icon" size="large" />
        </template>

        <span class="text-h6 font-weight-bold ms-2">{{
          navbarConfig?.title
        }}</span>
      </div>
    </template>

    <v-spacer />

    <template #append>
      <template v-if="!mobile">
        <v-btn
          v-for="item in navbarConfig.navigationItems"
          :key="item.label"
          color="on-primary"
          variant="text"
          @click="handleNavigation(item)"
        >
          {{ item.label }}
        </v-btn>
      </template>

      <v-btn
        :loading="isLoadingTheme"
        size="small"
        variant="text"
        @click="toggleTheme"
      >
        <v-icon :icon="themeIcon" />
        <v-tooltip activator="parent" location="bottom">
          {{ themeTooltip }}
        </v-tooltip>
      </v-btn>
    </template>
  </v-toolbar>
</template>
