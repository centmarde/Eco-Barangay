<script setup lang="ts">
import { computed } from 'vue'
import FeedbackList from './FeedbackList.vue'
import type { FeedbackWithUser } from '@/stores/collectionsData'

interface Props {
  feedbacks: FeedbackWithUser[]
  loading: boolean
  selectedType: 'all' | 'collection' | 'system'
}

interface Emits {
  (e: 'type-change', type: 'all' | 'collection' | 'system'): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed filtered feedbacks for each tab
const allFeedbacks = computed(() => props.feedbacks)
const collectionFeedbacks = computed(() =>
  props.feedbacks.filter(f => f.type === 'collection')
)
const systemFeedbacks = computed(() =>
  props.feedbacks.filter(f => f.type === 'system')
)

// Tab definitions
const tabs = computed(() => [
  {
    key: 'all',
    title: 'All Feedbacks',
    icon: 'mdi-comment-multiple',
    count: allFeedbacks.value.length,
    color: 'primary'
  },
  {
    key: 'collection',
    title: 'Collection',
    icon: 'mdi-truck',
    count: collectionFeedbacks.value.length,
    color: 'info'
  },
  {
    key: 'system',
    title: 'System',
    icon: 'mdi-cog',
    count: systemFeedbacks.value.length,
    color: 'secondary'
  }
])

const handleTabChange = (value: unknown) => {
  const tabKey = value as 'all' | 'collection' | 'system'
  emit('type-change', tabKey)
}

const getFeedbacksForTab = (tabKey: string) => {
  switch (tabKey) {
    case 'collection':
      return collectionFeedbacks.value
    case 'system':
      return systemFeedbacks.value
    default:
      return allFeedbacks.value
  }
}
</script>

<template>
  <v-card variant="outlined">
    <v-tabs
      :model-value="selectedType"
      @update:model-value="handleTabChange"
      bg-color="transparent"
      color="primary"
      grow
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.key"
        :value="tab.key"
        class="font-weight-medium"
      >
        <v-icon :icon="tab.icon" class="mr-2" />
        {{ tab.title }}
        <v-chip
          :color="tab.color"
          size="small"
          variant="tonal"
          class="ml-2"
        >
          {{ tab.count }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <v-divider />

    <v-tabs-window :model-value="selectedType" class="mt-2">
      <v-tabs-window-item
        v-for="tab in tabs"
        :key="tab.key"
        :value="tab.key"
      >
        <FeedbackList
          :feedbacks="getFeedbacksForTab(tab.key)"
          :loading="loading"
          :type="tab.key"
          @refresh="emit('refresh')"
        />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<style scoped>
.v-tab {
  text-transform: none !important;
}
</style>
