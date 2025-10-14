<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useLandingController } from "@/controller/landingController";
import OuterLayoutWrapper from "@/layouts/OuterLayoutWrapper.vue";

const router = useRouter();
const theme = useTheme();
const { data, loading, error, fetchLandingData } = useLandingController();

// Compute the image source based on theme
const heroImage = computed(() => {
  return theme.global.current.value.dark
    ? new URL("@/assets/landingDark.png", import.meta.url).href
    : new URL("@/assets/landing.png", import.meta.url).href;
});

onMounted(async () => {
  await fetchLandingData();
});

function navigateToAuth() {
  router.push("/auth");
}

function scrollToFeatures() {
  const element = document.querySelector("#features");
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function openGithub() {
  window.open("https://github.com", "_blank", "noopener,noreferrer");
}

function openDocumentation() {
  window.open("https://vuetifyjs.com/", "_blank", "noopener,noreferrer");
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <OuterLayoutWrapper>
    <template #content>
      <div class="landing-view">
        <!-- Loading State -->
        <v-container
          v-if="loading"
          class="d-flex justify-center align-center loading-state"
        >
          <v-progress-circular
            color="primary"
            indeterminate
            :size="48"
            :width="2"
          />
        </v-container>

        <!-- Error State -->
        <v-container
          v-else-if="error"
          class="d-flex justify-center align-center error-state"
        >
          <v-alert
            color="error"
            density="compact"
            type="error"
            variant="tonal"
            class="minimal-alert"
          >
            {{ error }}
          </v-alert>
        </v-container>

        <!-- Content -->
        <div v-else-if="data">
          <!-- Hero Section -->
          <section class="hero-section">
            <v-container class="hero-container">
              <v-row align="center">
                <!-- Left Side: Text Content -->
                <v-col cols="12" md="4">
                  <div class="hero-content">
                    <h1 class="hero-title">
                      {{ data.title }}
                    </h1>

                    <h2 class="hero-subtitle">
                      {{ data.subtitle }}
                    </h2>

                    <p class="hero-description">
                      {{ data.description }}
                    </p>

                    <v-btn
                      color="primary"
                      size="large"
                      variant="flat"
                      class="cta-btn"
                      @click="navigateToAuth"
                    >
                      Get Started
                    </v-btn>
                  </div>
                </v-col>

                <!-- Right Side: Image -->
                <v-col cols="12" md="8">
                  <div class="hero-image-wrapper">
                    <img
                      :src="heroImage"
                      alt="Landing page illustration"
                      class="hero-image"
                    />
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </section>

          <!-- Features Section -->
          <section id="features" class="features-section">
            <v-container>
              <div class="section-header">
                <h2 class="section-title">Key Features</h2>
                <p class="section-subtitle">
                  Everything you need for modern academic writing
                </p>
              </div>

              <div class="features-grid">
                <div
                  v-for="(feature, index) in data.features"
                  :key="index"
                  class="feature-card"
                >
                  <div class="feature-icon">
                    <v-icon :icon="feature.icon" size="24" color="primary" />
                  </div>

                  <h3 class="feature-title">
                    {{ feature.title }}
                  </h3>

                  <p class="feature-description">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
            </v-container>
          </section>

          <!-- About Section -->
          <section id="about" class="about-section">
            <v-container>
              <div class="about-content">
                <h2 class="section-title">About This Template</h2>

                <div class="about-card">
                  <div class="about-info">
                    <div class="info-item">
                      <span class="info-label">Version</span>
                      <span class="info-value">{{ data.version }}</span>
                    </div>

                    <div class="info-item">
                      <span class="info-label">Created by</span>
                      <span class="info-value">{{ data.author }}</span>
                    </div>

                    <div class="info-item">
                      <span class="info-label">Last updated</span>
                      <span class="info-value">{{
                        formatDate(data.lastUpdated)
                      }}</span>
                    </div>
                  </div>

                  <v-btn
                    color="primary"
                    size="large"
                    block
                    variant="outlined"
                    class="doc-btn"
                    @click="openDocumentation"
                  >
                    <v-icon start size="20">mdi-book-open-outline</v-icon>
                    Documentation
                  </v-btn>
                </div>
              </div>
            </v-container>
          </section>

          <!-- Footer -->
          <footer class="footer-section">
            <v-container>
              <div class="footer-content">
                <p class="footer-text">Open source and available on GitHub</p>

                <v-btn
                  variant="text"
                  size="small"
                  class="github-link"
                  @click="openGithub"
                >
                  <v-icon start size="18">mdi-github</v-icon>
                  View Source
                </v-btn>
              </div>
            </v-container>
          </footer>
        </div>
      </div>
    </template>
  </OuterLayoutWrapper>
</template>

<style scoped>
@import "./css/landingView.css";
</style>
