<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCollectionsStore } from '@/stores/collectionsData'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'
import FeedbackTabs from './components/FeedbackTabs.vue'
import FeedbackStats from './components/FeedbackStats.vue'
import FeedbackFilters from './components/FeedbackFilters.vue'
import type { FeedbackWithUser } from '@/stores/collectionsData'

const collectionsStore = useCollectionsStore()

// State
const loading = ref(false)
const feedbacks = ref<FeedbackWithUser[]>([])
const selectedType = ref<'all' | 'collection' | 'system'>('all')
const searchQuery = ref('')
const sortBy = ref<'created_at' | 'rate' | 'type'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Computed
const filteredFeedbacks = computed(() => {
  let filtered = feedbacks.value

  // Filter by type
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(feedback => feedback.type === selectedType.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(feedback =>
      feedback.title?.toLowerCase().includes(query) ||
      feedback.description?.toLowerCase().includes(query) ||
      feedback.user_name?.toLowerCase().includes(query) ||
      feedback.user_email?.toLowerCase().includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue: any = a[sortBy.value]
    let bValue: any = b[sortBy.value]

    if (sortBy.value === 'created_at') {
      aValue = new Date(a.created_at).getTime()
      bValue = new Date(b.created_at).getTime()
    } else if (sortBy.value === 'rate') {
      // Handle null/undefined rates - treat as 0
      aValue = a.rate ?? 0
      bValue = b.rate ?? 0
    } else if (sortBy.value === 'type') {
      // Handle null/undefined types - treat as empty string
      aValue = a.type ?? ''
      bValue = b.type ?? ''
    }

    // Handle null/undefined values in comparison
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder.value === 'asc' ? -1 : 1
    if (bValue == null) return sortOrder.value === 'asc' ? 1 : -1

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

// Methods
const fetchAllFeedbacks = async () => {
  loading.value = true
  try {
    const data = await collectionsStore.fetchFeedbacksWithUserInfo()
    feedbacks.value = data
  } catch (error) {
    console.error('Error fetching feedbacks:', error)
  } finally {
    loading.value = false
  }
}

const handleTypeChange = (type: 'all' | 'collection' | 'system') => {
  selectedType.value = type
}

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleSort = (field: 'created_at' | 'rate' | 'type', order: 'asc' | 'desc') => {
  sortBy.value = field
  sortOrder.value = order
}

const handleRefresh = () => {
  fetchAllFeedbacks()
}

// Lifecycle
onMounted(() => {
  fetchAllFeedbacks()
})
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title class="text-h5 font-weight-bold d-flex align-center">
                <v-icon left class="mr-2">mdi-comment-multiple</v-icon>
                Feedback Management
                <v-spacer />
                <v-btn
                  @click="handleRefresh"
                  :loading="loading"
                  variant="outlined"
                  size="small"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </v-card-title>

              <v-card-text>
                <!-- Statistics Overview -->
                <FeedbackStats
                  :feedbacks="feedbacks"
                  :loading="loading"
                  class="mb-6"
                />

                <!-- Filters and Search -->
                <FeedbackFilters
                  :search="searchQuery"
                  :sort-by="sortBy"
                  :sort-order="sortOrder"
                  @search="handleSearch"
                  @sort="handleSort"
                  class="mb-4"
                />

                <!-- Feedback Tabs -->
                <FeedbackTabs
                  :feedbacks="filteredFeedbacks"
                  :loading="loading"
                  :selected-type="selectedType"
                  @type-change="handleTypeChange"
                  @refresh="handleRefresh"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
.v-card-title {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
