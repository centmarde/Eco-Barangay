<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useDisplay } from "vuetify";
import { useAnnouncementsStore } from "@/stores/announcementsData";
import { formatDate, formatRelativeTime } from "@/utils/dateHelpers";
import { getAnnouncementColor } from "@/utils/announcementHelpers";
import AnnouncementDetailDialog from "./dialogs/AnnouncementDetailDialog.vue";

const announcementsStore = useAnnouncementsStore();
const { announcements, loading, error } = storeToRefs(announcementsStore);
const { xs, sm, mdAndUp } = useDisplay();

const carouselModel = ref(0);
const selectedAnnouncement = ref<any>(null);
const dialog = ref(false);
const systemInfo = ref<any>(null);

// Fetch announcements on component mount
onMounted(async () => {
  await announcementsStore.fetchAnnouncements();

  // Fetch system info from JSON
  try {
    const response = await fetch('/data/external-page.json');
    systemInfo.value = await response.json();
  } catch (err) {
    console.error('Failed to load system info:', err);
  }
});

// Open announcement dialog
const openAnnouncement = (announcement: any) => {
  selectedAnnouncement.value = announcement;
  dialog.value = true;
};

// Use shared relative time helper wrapper to keep v-template calls similar
const getTimeAgo = (dateString: string) => {
  return formatRelativeTime(dateString || "");
};
</script>

<template>
  <v-container fluid :class="xs ? 'pa-2' : sm ? 'pa-3' : 'pa-4'">
    <!-- Header Section -->
    <v-row :class="xs ? 'mb-3' : sm ? 'mb-4' : 'mb-6'">
      <v-col cols="12">
        <v-sheet
          color="green-darken-2"
          elevation="4"
          rounded="lg"
          :class="xs ? 'pa-3' : sm ? 'pa-4' : 'pa-6'"
        >
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="12" md="auto">
              <div :class="xs ? 'd-flex align-center' : 'd-flex align-center'">
                <v-avatar
                  color="white"
                  :size="xs ? 32 : sm ? 40 : 64"
                  :class="xs ? 'mr-3' : sm ? 'mr-3' : 'mr-4'"
                >
                  <v-icon
                    icon="mdi-bullhorn"
                    :size="xs ? 18 : sm ? 24 : 40"
                    color="green-darken-2"
                  />
                </v-avatar>
                <div>
                  <v-card-title
                    :class="[
                      xs ? 'text-subtitle-1' : sm ? 'text-h6' : 'text-h4',
                      'font-weight-bold text-white pa-0'
                    ]"
                  >
                    {{ xs ? 'Announcements' : 'Community Announcements' }}
                  </v-card-title>
                  <v-card-subtitle
                    v-if="!xs"
                    :class="[
                      sm ? 'text-body-2' : 'text-subtitle-1',
                      'text-white pa-0 mt-1'
                    ]"
                  >
                    Stay updated with the latest news from your barangay
                  </v-card-subtitle>
                </div>
              </div>
            </v-col>
            <v-col
              cols="12"
              md="auto"
              :class="xs ? 'mt-2 d-flex justify-start' : sm ? 'mt-3 d-flex justify-center' : 'mt-4 mt-md-0'"
            >
              <v-chip
                v-if="announcements.length"
                color="white"
                :size="xs ? 'small' : sm ? 'default' : 'large'"
                :class="xs ? 'font-weight-medium text-caption' : 'font-weight-bold'"
              >
                <v-icon
                  icon="mdi-bell-ring"
                  start
                  :size="xs ? 'small' : 'default'"
                />
                {{ announcements.length }} {{ xs ? '' : 'New' }}
              </v-chip>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col v-for="i in 6" :key="i" cols="12" sm="6" md="4">
        <v-skeleton-loader
          type="card, article"
          elevation="2"
          rounded="lg"
        />
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          prominent
          border="start"
          icon="mdi-alert-circle"
        >
          <v-alert-title class="text-h6 mb-2">Error Loading Announcements</v-alert-title>
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="!announcements.length">
      <v-col cols="12">
        <v-sheet
          color="grey-lighten-4"
          rounded="lg"
          border
          class="pa-12 text-center"
        >
          <v-avatar
            color="grey-lighten-3"
            size="120"
            class="mb-6"
          >
            <v-icon icon="mdi-bullhorn-outline" size="80" color="grey-darken-1" />
          </v-avatar>
          <v-card-title class="text-h5 font-weight-bold mb-3 justify-center">
            No Announcements Yet
          </v-card-title>
          <v-card-subtitle class="text-body-1 text-grey-darken-1 mb-4">
            Check back later for important updates and news from your barangay
          </v-card-subtitle>
          <v-btn
            color="primary"
            variant="tonal"
            size="large"
            prepend-icon="mdi-refresh"
            @click="announcementsStore.fetchAnnouncements()"
          >
            Refresh
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Announcements Carousel -->
    <v-row v-else>
      <v-col cols="12" md="8">
        <v-carousel
          v-model="carouselModel"
          cycle
          :interval="5000"
          hide-delimiter-background
          show-arrows="hover"
          height="600"
        >
          <v-carousel-item
            v-for="(announcement, index) in announcements"
            :key="announcement.id"
          >
            <!-- Image Section (if available) -->
            <v-img
              v-if="announcement.image"
              :src="announcement.image"
              height="100%"
              cover
              class="text-white"
              style="cursor: pointer;"
              @click="openAnnouncement(announcement)"
            >
              <div class="d-flex flex-column fill-height pa-6">
                <!-- Colored Header Strip -->
                <div
                  :style="{ backgroundColor: getAnnouncementColor(index) }"
                  class="mb-4"
                  style="height: 6px; width: 100%; border-radius: 3px;"
                />

                <div class="text-h4 font-weight-bold text-shadow mb-2">
                  <v-icon
                    icon="mdi-bullhorn"
                    :color="getAnnouncementColor(index)"
                    class="mr-3"
                    size="large"
                  />
                  {{ announcement.title }}
                </div>

                <v-chip
                  size="large"
                  variant="elevated"
                  :color="getAnnouncementColor(index)"
                  class="mb-4 align-self-start"
                >
                  <v-icon icon="mdi-clock-outline" start />
                  {{ getTimeAgo(announcement.created_at) }}
                </v-chip>

                <v-spacer />

                <div class="text-h6 text-shadow mb-4">
                  {{ announcement.description.length > 200 ? announcement.description.substring(0, 200) + '...' : announcement.description }}
                </div>

                <v-chip
                  :color="getAnnouncementColor(index)"
                  variant="elevated"
                  size="large"
                  class="align-self-start"
                >
                  <v-icon icon="mdi-calendar" start />
                  {{ formatDate(announcement.created_at) }}
                </v-chip>
              </div>
            </v-img>

            <!-- No Image Section -->
            <div
              v-else
              class="d-flex flex-column fill-height pa-8"
              :style="{
                background: `linear-gradient(135deg, ${getAnnouncementColor(index)}15 0%, ${getAnnouncementColor(index)}30 100%)`,
                height: '100%',
                cursor: 'pointer'
              }"
              @click="openAnnouncement(announcement)"
            >
              <!-- Colored Header Strip -->
              <div
                :style="{ backgroundColor: getAnnouncementColor(index) }"
                class="mb-6"
                style="height: 6px; width: 100%; border-radius: 3px;"
              />

              <div class="text-h3 font-weight-bold mb-4">
                <v-icon
                  icon="mdi-bullhorn"
                  :color="getAnnouncementColor(index)"
                  class="mr-3"
                  size="x-large"
                />
                {{ announcement.title }}
              </div>

              <v-chip
                size="large"
                variant="elevated"
                :color="getAnnouncementColor(index)"
                class="mb-6 align-self-start"
              >
                <v-icon icon="mdi-clock-outline" start />
                {{ getTimeAgo(announcement.created_at) }}
              </v-chip>

              <v-spacer />

              <div class="text-h5 mb-6">
                {{ announcement.description.length > 200 ? announcement.description.substring(0, 200) + '...' : announcement.description }}
              </div>

              <v-chip
                :color="getAnnouncementColor(index)"
                variant="elevated"
                size="large"
                class="align-self-start"
              >
                <v-icon icon="mdi-calendar" start />
                {{ formatDate(announcement.created_at) }}
              </v-chip>
            </div>
          </v-carousel-item>
        </v-carousel>

        <!-- Carousel Info -->
        <v-row class="mt-4" justify="center">
          <v-col cols="auto">
            <v-chip
              color="green-darken-2"
              variant="tonal"
              size="large"
            >
              <v-icon icon="mdi-image-multiple" start />
              {{ carouselModel + 1 }} / {{ announcements.length }}
            </v-chip>
          </v-col>
        </v-row>
      </v-col>

      <!-- System Introduction Column -->
      <v-col v-if="systemInfo" cols="12" md="4">
        <div

        >
          <!-- Header -->

            <div class="d-flex align-center mb-2">
              <v-icon
                icon="mdi-recycle"

                size="large"
                class="mr-3"
              />
              <v-card-title class="text-h5 font-weight-bold  pa-0">
                About the System
              </v-card-title>
            </div>
            <v-card-subtitle class=" pa-0 my-2" style="opacity: 0.9;">
              {{ systemInfo.subtitle }}
            </v-card-subtitle>


          <v-divider />

          <!-- Content -->

            <!-- Title Section -->
            <div class="my-4">
              <v-chip
                :color="systemInfo.theme.primaryColor"
                variant="tonal"
                class="mb-3"
                size="small"
              >
                <v-icon icon="mdi-information" start size="small" />
                Introduction
              </v-chip>
              <h3 class="text-h6 font-weight-bold mb-3">
                {{ systemInfo.title }}
              </h3>
              <p class="text-body-2 text-medium-emphasis" style="line-height: 1.7;">
                {{ systemInfo.description }}
              </p>
            </div>

            <v-divider class="my-4" />

            <!-- Key Features -->
            <div class="mb-4">
              <v-chip
                :color="systemInfo.theme.primaryColor"
                variant="tonal"
                class="mb-3"
                size="small"
              >
                <v-icon icon="mdi-star" start size="small" />
                Key Features
              </v-chip>

              <v-list bg-color="transparent" density="compact">
                <v-list-item
                  v-for="(feature, index) in systemInfo.features"
                  :key="index"
                  class="px-0 mb-2"
                >
                  <template #prepend>
                    <v-avatar
                      :color="systemInfo.theme.secondaryColor"
                      size="40"
                      class="mr-3"
                    >
                      <v-icon
                        :icon="feature.icon"
                        :color="systemInfo.theme.primaryColor"
                        size="small"
                      />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium mb-1">
                    {{ feature.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption" style="white-space: normal; line-height: 1.4;">
                    {{ feature.description }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>

            <v-divider class="my-4" />

            <!-- Footer Info -->
            <div class="text-center">
              <v-chip
                :color="systemInfo.theme.primaryColor"
                variant="outlined"
                size="small"
              >
                <v-icon icon="mdi-update" start size="x-small" />
                Version {{ systemInfo.version }} • Updated {{ systemInfo.lastUpdated }}
              </v-chip>
            </div>

        </div>
      </v-col>
    </v-row>

    <!-- Announcement Detail Dialog -->
    <AnnouncementDetailDialog
      v-model="dialog"
      :selected-announcement="selectedAnnouncement"
    />
  </v-container>
</template>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}
</style>
