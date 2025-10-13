<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAnnouncementsStore } from '@/stores/announcementsData';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import './css/announcementCard.css';

const router = useRouter();
const announcementsStore = useAnnouncementsStore();
const { announcements, loading } = storeToRefs(announcementsStore);

const isVisible = ref(true);

const closeAnnouncement = () => {
  isVisible.value = false;
};

const goToAnnouncements = () => {
  router.push('/announcements');
};

const todayAnnouncement = computed(() => {
  if (!announcements.value || announcements.value.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find announcement from today only
  const todaysAnnouncement = announcements.value.find(announcement => {
    const announcementDate = new Date(announcement.created_at);
    announcementDate.setHours(0, 0, 0, 0);
    return announcementDate.getTime() === today.getTime();
  });

  // Only return if there's an announcement for today, otherwise null
  return todaysAnnouncement || null;
});

const formattedDate = computed(() => {
  if (!todayAnnouncement.value) return '';
  const date = new Date(todayAnnouncement.value.created_at);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

onMounted(async () => {
  if (announcements.value.length === 0) {
    await announcementsStore.fetchAnnouncements();
  }
});
</script>

<template>
  <div v-if="todayAnnouncement && !loading && isVisible">
    <div class="backdrop-overlay" @click="closeAnnouncement"></div>

    <div class="daily-announcement-wrapper">
      <div class="announcement-card">
        <div class="announcement-actions">
          <button class="close-button" @click="closeAnnouncement" aria-label="Close announcement">
            close
          </button>
        </div>
        <h2 class="announcement-title">{{ todayAnnouncement.title }}</h2>
        <p class="announcement-description">{{ todayAnnouncement.description }}</p>
      </div>
    </div>
  </div>
</template>
