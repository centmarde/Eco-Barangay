<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAnnouncementsStore } from "@/stores/announcementsData";
import { formatDate, formatRelativeTime } from "@/utils/dateHelpers";
import { getAnnouncementColor } from "@/utils/announcementHelpers";

const announcementsStore = useAnnouncementsStore();
const { announcements, loading, error } = storeToRefs(announcementsStore);

const selectedAnnouncement = ref<any>(null);
const dialog = ref(false);

// Fetch announcements on component mount
onMounted(async () => {
  await announcementsStore.fetchAnnouncements();
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
  <v-container fluid class="pa-4">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-sheet
          color="green-darken-2"
          elevation="4"
          rounded="lg"
          class="pa-6"
        >
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="12" md="auto">
              <div class="d-flex align-center">
                <v-avatar
                  color="white"
                  size="64"
                  class="mr-4"
                >
                  <v-icon icon="mdi-bullhorn" size="40" color="green-darken-2" />
                </v-avatar>
                <div>
                  <v-card-title class="text-h4 font-weight-bold text-white pa-0">
                    Community Announcements
                  </v-card-title>
                  <v-card-subtitle class="text-subtitle-1 text-white pa-0 mt-1">
                    Stay updated with the latest news from your barangay
                  </v-card-subtitle>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="auto" class="mt-4 mt-md-0">
              <v-chip
                v-if="announcements.length"
                color="white"
                size="large"
                class="font-weight-bold"
              >
                <v-icon icon="mdi-bell-ring" start />
                {{ announcements.length }} New
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

    <!-- Announcements Grid -->
    <v-row v-else>
      <v-col
        v-for="(announcement, index) in announcements"
        :key="announcement.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            :elevation="isHovering ? 12 : 3"
            rounded="lg"
            class="d-flex flex-column h-100"
            @click="openAnnouncement(announcement)"
          >
            <!-- Colored Header Strip -->
            <v-sheet
              :color="getAnnouncementColor(index)"
              height="4"
              class="mb-0"
            />

            <v-card-title class="text-wrap pt-4 pb-2 px-4">
              <div class="d-flex align-start">
                <v-icon
                  icon="mdi-bullhorn"
                  :color="getAnnouncementColor(index)"
                  class="mr-2 mt-1"
                  size="small"
                />
                <span>{{ announcement.title }}</span>
              </div>
            </v-card-title>

            <v-card-subtitle class="px-4 pb-3">
              <v-chip
                size="small"
                variant="tonal"
                :color="getAnnouncementColor(index)"
                class="mr-2"
              >
                <v-icon icon="mdi-clock-outline" start size="x-small" />
                {{ getTimeAgo(announcement.created_at) }}
              </v-chip>
            </v-card-subtitle>

            <v-divider />

            <v-card-text class="px-4 py-4 flex-grow-1">
              <v-row dense>
                <v-col cols="12">
                  <span class="text-body-2">
                    {{ announcement.description.length > 120 ? announcement.description.substring(0, 120) + '...' : announcement.description }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider />

            <v-card-actions class="px-4 py-3">
              <v-spacer />
              <v-btn
                :color="getAnnouncementColor(index)"
                variant="tonal"
                size="small"
                append-icon="mdi-arrow-right"
              >
                Read More
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <!-- Announcement Detail Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedAnnouncement" rounded="lg">
        <v-sheet color="primary" class="pa-6">
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon icon="mdi-bullhorn" class="mr-3" size="large" color="white" />
            </v-col>
            <v-col>
              <v-card-title class="text-h5 text-white pa-0">
                {{ selectedAnnouncement.title }}
              </v-card-title>
            </v-col>
            <v-col cols="auto">
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="dialog = false"
              />
            </v-col>
          </v-row>
        </v-sheet>

        <v-divider />

        <v-card-text class="pa-6">
          <v-chip
            color="primary"
            variant="tonal"
            class="mb-4"
          >
            <v-icon icon="mdi-calendar" start />
            {{ formatDate(selectedAnnouncement.created_at) }}
          </v-chip>

          <v-row class="mt-4">
            <v-col cols="12">
              <span class="text-body-1">
                {{ selectedAnnouncement.description }}
              </span>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
