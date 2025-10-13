<template>
  <v-footer
    v-if="config?.showFooter && footerConfig"
    app
    class="text-white footer-compact"
    :color="footerConfig.color"
  >
    <v-container class="py-2">
      <!-- Company Info Section - Ultra Compact -->
      <v-row dense>
        <v-col cols="12" class="py-1">
          <div class="d-flex flex-column align-center text-center">
            <div class="d-flex align-center mb-1">
              <v-icon class="me-1" :icon="footerConfig.icon" size="small" />
              <span class="text-body-2 font-weight-bold">
                {{ footerConfig.companyName }}
              </span>
            </div>
            <div class="text-caption mb-1" style="font-size: 0.7rem">
              {{ footerConfig.tagline }}
            </div>

            <!-- Social Links - Ultra Compact -->
            <div class="mb-1">
              <v-btn
                v-for="social in footerConfig.socialLinks"
                :key="social.platform"
                :aria-label="social.label"
                class="mx-1"
                color="on-primary"
                icon
                size="x-small"
                variant="text"
                @click="openLink(social.url)"
              >
                <v-icon :icon="social.icon" size="16" />
              </v-btn>
            </div>

            <!-- Copyright -->
            <div class="text-caption" style="font-size: 0.65rem">
              {{ currentYear }} © {{ footerConfig.copyright }}
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Thesis Team Section - Horizontal Layout -->
      <template v-if="footerConfig.thesisTeam?.enabled">
        <v-divider class="my-2" />

        <v-row dense>
          <v-col cols="12" class="py-1">
            <div class="text-center mb-1">
              <div class="text-body-2 font-weight-bold">
                {{ footerConfig.thesisTeam.title }}
              </div>
              <div class="text-caption" style="font-size: 0.7rem">
                {{ footerConfig.thesisTeam.subtitle }}
              </div>
            </div>

            <!-- Team Members - Horizontal Compact Layout -->
            <div class="d-flex justify-center align-center flex-wrap ga-3 mt-1">
              <div
                v-for="member in footerConfig.thesisTeam.members"
                :key="member.name"
                class="d-flex align-center"
              >
                <v-avatar
                  :image="member.avatar"
                  size="32"
                  class="me-1"
                  color="primary"
                >
                  <v-icon v-if="!member.avatar" icon="mdi-account" size="16" />
                </v-avatar>

                <div class="text-start">
                  <div
                    class="text-caption font-weight-bold"
                    style="font-size: 0.7rem; line-height: 1.2"
                  >
                    {{ member.name }}
                  </div>
                  <div
                    class="text-caption"
                    style="font-size: 0.65rem; line-height: 1.2"
                  >
                    {{ member.role }}
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </template>

      <!-- Technologies Section - Ultra Compact -->
      <v-divider class="my-2" />

      <v-row dense>
        <v-col cols="12" class="py-1">
          <div class="text-center text-caption" style="font-size: 0.65rem">
            <div class="d-flex flex-wrap justify-center align-center ga-1">
              <span>Built with</span>
              <template
                v-for="(tech, index) in footerConfig.technologies"
                :key="tech.name"
              >
                <div class="d-flex align-center">
                  <v-icon
                    :color="tech.color"
                    :icon="tech.icon"
                    size="x-small"
                    class="me-1"
                  />
                  <span>{{ tech.name }}</span>
                </div>
                <span v-if="index < footerConfig.technologies.length - 1">
                  &
                </span>
              </template>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script lang="ts" setup>
import type { UIConfig } from "@/controller/landingController";
import { computed } from "vue";

interface Props {
  config?: UIConfig | null;
}

const props = defineProps<Props>();

const footerConfig = computed(() => props.config?.footer);
const currentYear = computed(() => new Date().getFullYear());

function openLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
</script>

<style scoped>
.footer-compact {
  padding: 0 !important;
}

.footer-compact .v-container {
  max-width: 100% !important;
}
</style>
