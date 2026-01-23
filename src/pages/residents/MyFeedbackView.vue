<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCollectionsStore } from '@/stores/collectionsData'
import { useAuthUserStore } from '@/stores/authUser'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'
import FeedbackTabs from '../admin/components/FeedbackTabs.vue'
import FeedbackStats from '../admin/components/FeedbackStats.vue'
import FeedbackFilters from '../admin/components/FeedbackFilters.vue'
import CreateFeedbackDialog from './dialogs/CreateFeedbackDialog.vue'
import type { FeedbackWithUser } from '@/stores/collectionsData'

const collectionsStore = useCollectionsStore()
const authStore = useAuthUserStore()

// State
const loading = ref(false)
const feedbacks = ref<FeedbackWithUser[]>([])
const selectedType = ref<'all' | 'collection' | 'system'>('all')
const searchQuery = ref('')
const sortBy = ref<'created_at' | 'rate' | 'type'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const createDialog = ref(false)

// Computed
const userFeedbacks = computed(() => {
  const userId = authStore.userData?.id
  if (!userId) return []

  return feedbacks.value.filter(feedback => feedback.user_id === userId)
})

const filteredFeedbacks = computed(() => {
  let filtered = userFeedbacks.value

  // Filter by type
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(feedback => feedback.type === selectedType.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(feedback =>
      feedback.title?.toLowerCase().includes(query) ||
      feedback.description?.toLowerCase().includes(query)
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
      aValue = a.rate ?? 0
      bValue = b.rate ?? 0
    } else if (sortBy.value === 'type') {
      aValue = a.type ?? ''
      bValue = b.type ?? ''
    }

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
const fetchMyFeedbacks = async () => {
  loading.value = true
  try {
    const userId = authStore.userData?.id
    if (!userId) return

    const data = await collectionsStore.fetchFeedbacksByUserId(userId)

    // Enrich with user info (though it should be the current user)
    const enrichedFeedbacks = data.map(feedback => ({
      ...feedback,
      user_email: authStore.userData?.email,
      user_name: authStore.userData?.user_metadata?.full_name || authStore.userData?.email
    }))

    feedbacks.value = enrichedFeedbacks as FeedbackWithUser[]
  } catch (error) {
    console.error('Error fetching my feedbacks:', error)
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
  fetchMyFeedbacks()
}

const handleCreateFeedback = () => {
  createDialog.value = true
}

const handleFeedbackCreated = () => {
  createDialog.value = false
  handleRefresh()
}

// Lifecycle
onMounted(() => {
  fetchMyFeedbacks()
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
                <v-icon left class="mr-2">mdi-comment-account</v-icon>
                My Feedback
                <v-spacer />
                <div class="d-flex gap-2">
                  <v-btn
                    @click="handleCreateFeedback"
                    color="primary"
                    variant="elevated"
                    size="small"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Create Feedback
                  </v-btn>
                  <v-btn
                    @click="handleRefresh"
                    :loading="loading"
                    variant="outlined"
                    size="small"
                  >
                    <v-icon left>mdi-refresh</v-icon>
                    Refresh
                  </v-btn>
                </div>
              </v-card-title>

              <v-card-text>
                <!-- Statistics Overview -->
                <FeedbackStats
                  :feedbacks="userFeedbacks"
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

      <!-- Create Feedback Dialog -->
      <CreateFeedbackDialog
        v-model="createDialog"
        @created="handleFeedbackCreated"
      />
    </template>
  </InnerLayoutWrapper>

</template>

<style scoped>
.v-card-title {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.d-flex.gap-2 {
  gap: 8px;
}
</style>
