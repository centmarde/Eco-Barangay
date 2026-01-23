<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useCollectionsStore } from '@/stores/collectionsData'
import FeedbackCard from './FeedbackCard.vue'
import FeedbackDetailsDialog from '../dialogs/FeedbackDetailsDialog.vue'
import DeleteConfirmDialog from '../dialogs/DeleteConfirmDialog.vue'
import type { FeedbackWithUser } from '@/stores/collectionsData'

interface Props {
  feedbacks: FeedbackWithUser[]
  loading: boolean
  type: string
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()
const collectionsStore = useCollectionsStore()

// Dialog states
const detailsDialog = ref(false)
const deleteDialog = ref(false)
const selectedFeedback = ref<FeedbackWithUser | null>(null)

// Pagination
const itemsPerPage = ref(10)
const currentPage = ref(1)

const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return props.feedbacks.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(props.feedbacks.length / itemsPerPage.value)
)

// Methods
const handleViewDetails = (feedback: FeedbackWithUser) => {
  selectedFeedback.value = feedback
  detailsDialog.value = true
}

const handleDeleteFeedback = (feedback: FeedbackWithUser) => {
  selectedFeedback.value = feedback
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedFeedback.value) return

  try {
    const success = await collectionsStore.deleteFeedback(selectedFeedback.value.id)

    if (success) {
      toast.success('Feedback deleted successfully')
      emit('refresh')
    } else {
      toast.error('Failed to delete feedback')
    }
  } catch (error) {
    console.error('Error deleting feedback:', error)
    toast.error('An error occurred while deleting feedback')
  } finally {
    deleteDialog.value = false
    selectedFeedback.value = null
  }
}

const getEmptyMessage = () => {
  switch (props.type) {
    case 'collection':
      return 'No collection feedbacks found'
    case 'system':
      return 'No system feedbacks found'
    default:
      return 'No feedbacks found'
  }
}

const getEmptyIcon = () => {
  switch (props.type) {
    case 'collection':
      return 'mdi-truck-remove'
    case 'system':
      return 'mdi-cog-off'
    default:
      return 'mdi-comment-remove'
  }
}
</script>

<template>
  <div class="feedback-list">
    <!-- Loading State -->
    <div v-if="loading" class="pa-4">
      <v-skeleton-loader
        v-for="i in 5"
        :key="i"
        type="card"
        class="mb-4"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="feedbacks.length === 0"
      class="empty-state text-center pa-8"
    >
      <v-icon :icon="getEmptyIcon()" size="64" color="grey-lighten-1" />
      <h3 class="text-h6 mt-4 mb-2">{{ getEmptyMessage() }}</h3>
      <p class="text-body-2 grey--text">
        {{ type === 'all' ? 'Try adjusting your search filters.' : `No ${type} feedbacks have been submitted yet.` }}
      </p>
    </div>

    <!-- Feedback Grid -->
    <div v-else>
      <v-row>
        <v-col
          v-for="feedback in paginatedFeedbacks"
          :key="feedback.id"
          cols="12"
          lg="6"
          xl="4"
        >
          <FeedbackCard
            :feedback="feedback"
            @view-details="handleViewDetails"
            @delete="handleDeleteFeedback"
          />
        </v-col>
      </v-row>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          variant="elevated"
        />
      </div>

      <!-- Items per page -->
      <div class="d-flex justify-center align-center mt-4">
        <span class="text-body-2 mr-4">Items per page:</span>
        <v-select
          v-model="itemsPerPage"
          :items="[5, 10, 25, 50]"
          variant="outlined"
          density="compact"
          style="max-width: 100px;"
        />
      </div>
    </div>

    <!-- Dialogs -->
    <FeedbackDetailsDialog
      v-model="detailsDialog"
      :feedback="selectedFeedback"
    />

    <DeleteConfirmDialog
      v-model="deleteDialog"
      :item-name="selectedFeedback?.title || 'this feedback'"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.feedback-list {
  min-height: 400px;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
