<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "vuetify";
import LoginForm from "@/components/auth/LoginForm.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";
import { useAuthUserStore } from "@/stores/authUser";
import { createDynamicThemeConfigFromExternal } from "@/themes/index";
import { useAuthPageController } from "@/controller/authPageController";

// Composables
const router = useRouter();
const route = useRoute();
const authStore = useAuthUserStore();
const theme = useTheme();
const {
  data: authPageData,
  loading: authPageLoading,
  error: authPageError,
  fetchAuthPageData,
} = useAuthPageController();

// Reactive state
const isLoginMode = ref(true);
const themeLoading = ref(true);
const themeError = ref<string | null>(null);

// Computed properties for layout
const isQuoteOnLeft = computed(() => {
  return authPageData.value?.layout?.quotePosition === "left";
});

const formSectionOrder = computed(() => {
  return isQuoteOnLeft.value ? 2 : 1;
});

const quoteSectionOrder = computed(() => {
  return isQuoteOnLeft.value ? 1 : 2;
});

// Computed background style for auth page left panel
const leftPanelStyle = computed(() => {
  const bg = authPageData.value?.backgroundImage;
  if (!bg || !bg.src) return {};
  return {
    /*  backgroundImage: `url(${bg.src})`, */
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  } as Record<string, string>;
});

const leftOverlayStyle = computed(() => {
  const overlay = authPageData.value?.backgroundImage?.overlay;
  if (!overlay || !overlay.enabled) return { backgroundColor: "transparent" };
  const color = overlay.color || "rgba(0,0,0,0.3)";
  const opacity = typeof overlay.opacity === "number" ? overlay.opacity : 0.5;
  // If color already has rgba, assume it includes alpha; otherwise apply opacity
  return {
    backgroundColor: color.includes("rgba") ? color : color,
    opacity: String(opacity),
  } as Record<string, string>;
});

// Methods
const switchToRegister = () => {
  isLoginMode.value = false;
  // Update URL without navigation
  router.replace({ query: { mode: "register" } });
};

const switchToLogin = () => {
  isLoginMode.value = true;
  // Update URL without navigation
  router.replace({ query: { mode: "login" } });
};

const toggleMode = () => {
  if (isLoginMode.value) {
    switchToRegister();
  } else {
    switchToLogin();
  }
};

const navigateHome = () => {
  router.push("/");
};

// Load dynamic theme configuration
const loadDynamicTheme = async () => {
  try {
    themeLoading.value = true;
    themeError.value = null;

    const themeConfig = await createDynamicThemeConfigFromExternal();

    // Apply the theme configuration to Vuetify
    theme.themes.value.light = themeConfig.themes.light;
    theme.themes.value.dark = themeConfig.themes.dark;

    console.log("Dynamic theme loaded successfully");
  } catch (error) {
    console.error("Failed to load dynamic theme:", error);
    themeError.value =
      error instanceof Error ? error.message : "Failed to load theme";
  } finally {
    themeLoading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  // Load auth page data first
  await fetchAuthPageData();

  // Load dynamic theme configuration
  await loadDynamicTheme();

  // Set initial mode based on query parameter
  const mode = route.query.mode;
  if (mode === "register") {
    isLoginMode.value = false;
  } else {
    isLoginMode.value = true;
  }
});

// This page uses the default layout and doesn't require authentication
</script>

<template>
  <!-- Theme Loading State -->
  <v-overlay
    v-if="themeLoading || authPageLoading"
    class="d-flex align-center justify-center"
  >
    <v-progress-circular indeterminate size="64" color="primary" />
    <div class="text-h6 ml-4">
      {{ themeLoading ? "Loading theme..." : "Loading page data..." }}
    </div>
  </v-overlay>

  <!-- Error State -->
  <v-alert
    v-if="(themeError || authPageError) && !themeLoading && !authPageLoading"
    type="error"
    class="ma-4"
    closable
    @click:close="themeError = null"
  >
    <v-alert-title>Loading Error</v-alert-title>
    {{ themeError || authPageError }}
  </v-alert>

  <!-- Full-page Background with Overlay -->
  <div
    v-if="!themeLoading && !authPageLoading && authPageData"
    class="auth-page-wrapper"
    :style="leftPanelStyle"
  >
    <div class="overlay" :style="leftOverlayStyle"></div>

    <!-- Centered Card -->
    <v-container
      fluid
      class="fill-height d-flex align-center justify-center"
      style="position: relative; z-index: 1"
    >
      <v-card
        class="auth-card bg-surface"
        elevation="12"
        max-width="1000"
        style="width: 95%; background-color: #fff"
      >
        <v-row no-gutters>
          <!-- Right: Illustration / Image -->
          <v-col
            cols="12"
            md="6"
            class="pa-8 d-flex align-center justify-center bg-surface hide-on-small"
            :order="quoteSectionOrder"
          >
            <div class="w-100 d-flex align-center justify-center">
              <img
                src="../assets/loginImage.jpg"
                alt="Login Illustration"
                style="
                  max-width: 100%;
                  max-height: 520px;
                  object-fit: contain;
                  border-radius: 16px;
                  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                "
              />
            </div>
          </v-col>

          <!-- Left: Auth Form -->
          <v-col
            cols="12"
            md="6"
            class="pa-8 d-flex align-center justify-center auth-card-border"
            :order="formSectionOrder"
          >
            <div style="width: 100%; max-width: 480px">
              <!-- Back to Home -->
              <v-btn
                variant="text"
                size="small"
                class="mb-4"
                @click="navigateHome"
              >
                <v-icon start size="16">mdi-arrow-left</v-icon>
                Back to Home
              </v-btn>

              <v-sheet elevation="0" class="pa-0">
                <div v-if="isLoginMode" key="login">
                  <LoginForm @switch-to-register="switchToRegister" />
                </div>
                <div v-else key="register">
                  <RegisterForm @switch-to-login="switchToLogin" />
                </div>
              </v-sheet>

              <!-- Social / Toggle -->
              <div class="mt-6 text-center">
                <div class="text-body-2 text-medium-emphasis mb-3">
                  Or continue with
                </div>
                <v-row no-gutters justify="center">
                  <v-col cols="auto"
                    ><v-btn
                      variant="outlined"
                      color="light"
                      size="small"
                      disabled
                      class="mx-1"
                      ><v-icon start>mdi-google</v-icon>Google</v-btn
                    ></v-col
                  >
                  <v-col cols="auto"
                    ><v-btn
                      variant="outlined"
                      color="light"
                      size="small"
                      disabled
                      class="mx-1"
                      ><v-icon start>mdi-github</v-icon>GitHub</v-btn
                    ></v-col
                  >
                </v-row>

                <v-btn
                  variant="text"
                  color="light"
                  size="small"
                  class="mt-4"
                  @click="toggleMode"
                >
                  <v-icon start>mdi-swap-horizontal</v-icon>
                  Switch to {{ isLoginMode ? "Register" : "Login" }}
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.auth-page-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow-y: auto;
}

.auth-page-wrapper .overlay {
  position: fixed;
  inset: 0;
  mix-blend-mode: multiply;
  pointer-events: none;
}

.auth-card {
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.auth-card-border {
  background-color: #fff;
  border-radius: 0 48px 48px 0;
  height: 100%;
}

@media (max-width: 959px) {
  .hide-on-small {
    display: none !important;
  }
  .auth-card-border {
    border-radius: 0 !important;
  }
}
</style>
