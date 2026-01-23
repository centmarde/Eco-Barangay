<script setup lang="ts">
import { computed } from 'vue'
import type { FeedbackWithUser } from '@/stores/collectionsData'

interface Props {
  feedbacks: FeedbackWithUser[]
  loading: boolean
}

const props = defineProps<Props>()

// Statistics computed properties
const stats = computed(() => {
  const total = props.feedbacks.length
  const collectionFeedbacks = props.feedbacks.filter(f => f.type === 'collection')
  const systemFeedbacks = props.feedbacks.filter(f => f.type === 'system')

  const ratedFeedbacks = props.feedbacks.filter(f => f.rate !== null && f.rate !== undefined)
  const averageRating = ratedFeedbacks.length > 0
    ? ratedFeedbacks.reduce((sum, f) => sum + (f.rate || 0), 0) / ratedFeedbacks.length
    : 0

  // Rating distribution
  const ratingDistribution = {
    1: ratedFeedbacks.filter(f => f.rate === 1).length,
    2: ratedFeedbacks.filter(f => f.rate === 2).length,
    3: ratedFeedbacks.filter(f => f.rate === 3).length,
    4: ratedFeedbacks.filter(f => f.rate === 4).length,
    5: ratedFeedbacks.filter(f => f.rate === 5).length,
  }

  return {
    total,
    collectionCount: collectionFeedbacks.length,
    systemCount: systemFeedbacks.length,
    averageRating: Math.round(averageRating * 10) / 10,
    ratedCount: ratedFeedbacks.length,
    ratingDistribution
  }
})

const getRatingColor = (rating: number) => {
  if (rating >= 4) return 'success'
  if (rating >= 3) return 'warning'
  return 'error'
}

const getPercentage = (value: number, total: number) => {
  return total > 0 ? Math.round((value / total) * 100) : 0
}
</script>

<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-title class="text-h6 font-weight-bold">
      <v-icon left class="mr-2">mdi-chart-line</v-icon>
      Feedback Statistics
    </v-card-title>

    <v-card-text>
      <!-- No Data Fallback -->
      <v-row v-if="!loading && stats.total === 0">
        <v-col cols="12">
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-comment-off-outline</v-icon>
            <div class="text-h6 text-grey-darken-1 mb-2">No Feedback Data</div>
            <div class="text-body-2 text-grey">
              There are no feedbacks to display statistics for yet.
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="!loading && stats.total > 0">
        <!-- Total Feedbacks -->
        <v-col cols="12" sm="6" md="3">
          <v-card variant="tonal" color="primary" class="h-100">
            <v-card-text class="text-center d-flex flex-column justify-center" style="min-height: 140px;">
              <v-icon size="32" class="mb-2">mdi-comment-multiple</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
              <div class="text-subtitle-1">Total Feedbacks</div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Collection Feedbacks -->
        <v-col cols="12" sm="6" md="3">
          <v-card variant="tonal" color="info" class="h-100">
            <v-card-text class="text-center d-flex flex-column justify-center" style="min-height: 140px;">
              <v-icon size="32" class="mb-2">mdi-truck</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.collectionCount }}</div>
              <div class="text-subtitle-1">Collection</div>
              <div class="text-caption">
                {{ getPercentage(stats.collectionCount, stats.total) }}% of total
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- System Feedbacks -->
        <v-col cols="12" sm="6" md="3">
          <v-card variant="tonal" color="warning" class="h-100">
            <v-card-text class="text-center d-flex flex-column justify-center" style="min-height: 140px;">
              <v-icon size="32" class="mb-2">mdi-cog</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.systemCount }}</div>
              <div class="text-subtitle-1">System</div>
              <div class="text-caption">
                {{ getPercentage(stats.systemCount, stats.total) }}% of total
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Average Rating -->
        <v-col cols="12" sm="6" md="3">
          <v-card variant="tonal" :color="getRatingColor(stats.averageRating)" class="h-100">
            <v-card-text class="text-center d-flex flex-column justify-center" style="min-height: 140px;">
              <v-icon size="32" class="mb-2">mdi-star</v-icon>
              <div class="text-h4 font-weight-bold d-flex align-center justify-center">
                {{ stats.averageRating || 0 }}
                <v-rating
                  :model-value="stats.averageRating || 0"
                  readonly
                  density="compact"
                  size="small"
                  class="ml-2"
                />
              </div>
              <div class="text-subtitle-1">Average Rating</div>
              <div class="text-caption">
                {{ stats.ratedCount }} rated feedbacks
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Rating Distribution -->
      <v-row v-if="!loading && stats.ratedCount > 0 && stats.total > 0" class="mt-2">
        <v-col cols="12">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1 font-weight-bold">
              <v-icon left class="mr-2">mdi-chart-bar</v-icon>
              Rating Distribution
            </v-card-title>
            <v-card-text>
              <v-row justify="center" class="g-4">
                <v-col
                  v-for="(count, rating) in stats.ratingDistribution"
                  :key="rating"
                  cols="12"
                  sm="6"
                  md="2"
                  lg="2"
                  class="d-flex"
                >
                  <v-card
                    variant="tonal"
                    :color="getRatingColor(Number(rating))"
                    class="w-100 h-100"
                  >
                    <v-card-text class="text-center pa-3">
                      <div class="d-flex align-center justify-center mb-2">
                        <span class="text-h6 font-weight-bold mr-1">{{ rating }}</span>
                        <v-icon size="20" :color="getRatingColor(Number(rating))">mdi-star</v-icon>
                      </div>
                      <v-progress-circular
                        :model-value="getPercentage(count, stats.ratedCount)"
                        :color="getRatingColor(Number(rating))"
                        size="60"
                        width="8"
                        class="mb-2"
                      >
                        <span class="text-caption font-weight-bold">
                          {{ getPercentage(count, stats.ratedCount) }}%
                        </span>
                      </v-progress-circular>
                      <div class="text-caption font-weight-medium">
                        {{ count }} {{ count === 1 ? 'review' : 'reviews' }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="loading">
        <v-col cols="12" sm="6" md="3" v-for="i in 4" :key="i">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.v-card-text {
  padding: 16px;
}
</style>
