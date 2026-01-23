<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  search: string
  sortBy: 'created_at' | 'rate' | 'type'
  sortOrder: 'asc' | 'desc'
}

interface Emits {
  (e: 'search', value: string): void
  (e: 'sort', field: 'created_at' | 'rate' | 'type', order: 'asc' | 'desc'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localSearch = ref(props.search)

const sortOptions = [
  { text: 'Date Created', value: 'created_at' },
  { text: 'Rating', value: 'rate' },
  { text: 'Type', value: 'type' }
]

const orderOptions = [
  { text: 'Newest First', value: 'desc' },
  { text: 'Oldest First', value: 'asc' }
]

const handleSearchChange = () => {
  emit('search', localSearch.value)
}

const handleSortChange = (field: 'created_at' | 'rate' | 'type') => {
  emit('sort', field, props.sortOrder)
}

const handleOrderChange = (order: 'asc' | 'desc') => {
  emit('sort', props.sortBy, order)
}

const clearSearch = () => {
  localSearch.value = ''
  handleSearchChange()
}
</script>

<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-text>
      <v-row align="center">
        <!-- Search -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localSearch"
            @input="handleSearchChange"
            label="Search feedbacks"
            placeholder="Search by title, description, or user..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            @click:clear="clearSearch"
          />
        </v-col>

        <!-- Sort By -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="sortBy"
            @update:model-value="handleSortChange"
            :items="sortOptions"
            item-title="text"
            item-value="value"
            label="Sort by"
            variant="outlined"
            density="compact"
          />
        </v-col>

        <!-- Sort Order -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="sortOrder"
            @update:model-value="handleOrderChange"
            :items="orderOptions"
            item-title="text"
            item-value="value"
            label="Order"
            variant="outlined"
            density="compact"
          />
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
