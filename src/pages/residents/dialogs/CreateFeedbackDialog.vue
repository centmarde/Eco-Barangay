<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useCollectionsStore } from '@/stores/collectionsData'
import { useAuthUserStore } from '@/stores/authUser'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()
const collectionsStore = useCollectionsStore()
const authStore = useAuthUserStore()

// Form data
const form = ref({
  title: '',
  description: '',
  rate: undefined as number | undefined,
  type: 'system' as 'collection' | 'system',
  collection_id: undefined as number | undefined
})

// State
const loading = ref(false)
const valid = ref(false)

// Collections for dropdown (when type is collection)
const collections = ref<any[]>([])
const loadingCollections = ref(false)

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Validation rules
const rules = {
  title: [
    (v: string) => !!v || 'Title is required',
    (v: string) => v.length >= 5 || 'Title must be at least 5 characters',
    (v: string) => v.length <= 100 || 'Title must be less than 100 characters'
  ],
  description: [
    (v: string) => !!v || 'Description is required',
    (v: string) => v.length >= 10 || 'Description must be at least 10 characters',
    (v: string) => v.length <= 500 || 'Description must be less than 500 characters'
  ],
  rate: [
    (v: number | undefined) => v === undefined || (v >= 1 && v <= 5) || 'Rating must be between 1 and 5'
  ],
  collection_id: [
    (v: number | undefined) => {
      if (form.value.type === 'collection') {
        return !!v || 'Collection is required for collection feedback'
      }
      return true
    }
  ]
}

// Watch type change to fetch collections
watch(() => form.value.type, async (newType) => {
  if (newType === 'collection') {
    await fetchUserCollections()
  } else {
    form.value.collection_id = undefined
  }
})

// Methods
const fetchUserCollections = async () => {
  loadingCollections.value = true
  try {
    const userId = authStore.userData?.id
    if (!userId) return

    const data = await collectionsStore.fetchCollectionsByRequestBy(userId)
    collections.value = data.map(collection => ({
      title: `#${collection.id} - ${collection.address} (${collection.status})`,
      value: collection.id,
      subtitle: `${collection.garbage_type} - ${new Date(collection.created_at).toLocaleDateString()}`
    }))
  } catch (error) {
    console.error('Error fetching collections:', error)
    toast.error('Failed to load your collections')
  } finally {
    loadingCollections.value = false
  }
}

const handleSubmit = async () => {
  if (!valid.value) {
    toast.error('Please fill all required fields correctly')
    return
  }

  loading.value = true
  try {
    const userId = authStore.userData?.id
    if (!userId) {
      toast.error('User not authenticated')
      return
    }

    const feedbackData = {
      user_id: userId,
      title: form.value.title,
      description: form.value.description,
      rate: form.value.rate,
      type: form.value.type,
      collection_id: form.value.type === 'collection' ? form.value.collection_id : undefined
    }

    const result = await collectionsStore.createFeedback(feedbackData)

    if (result) {
      toast.success('Feedback submitted successfully!')
      resetForm()
      emit('created')
    } else {
      toast.error('Failed to submit feedback')
    }
  } catch (error) {
    console.error('Error creating feedback:', error)
    toast.error('An error occurred while submitting feedback')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    rate: undefined,
    type: 'system',
    collection_id: undefined
  }
}

const closeDialog = () => {
  resetForm()
  dialog.value = false
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    persistent
    scrollable
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-comment-plus" color="primary" class="mr-2" />
          <span>Create New Feedback</span>
        </div>

        <v-btn
          @click="closeDialog"
          icon="mdi-close"
          variant="text"
          size="small"
        />
      </v-card-title>

      <v-divider />

      <!-- Form -->
      <v-card-text class="pa-6">
        <v-form v-model="valid" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Feedback Type -->
            <v-col cols="12">
              <v-select
                v-model="form.type"
                :items="[
                  { title: 'System Feedback', value: 'system' },
                  { title: 'Collection Feedback', value: 'collection' }
                ]"
                item-title="title"
                item-value="value"
                label="Feedback Type"
                variant="outlined"
                :disabled="loading"
                prepend-icon="mdi-format-list-bulleted-type"
                hint="Choose whether this is feedback about the system or a specific collection"
                persistent-hint
              />
            </v-col>

            <!-- Collection Selection (only for collection feedback) -->
            <v-col cols="12" v-if="form.type === 'collection'">
              <v-select
                v-model="form.collection_id"
                :items="collections"
                item-title="title"
                item-value="value"
                label="Select Collection"
                variant="outlined"
                :loading="loadingCollections"
                :disabled="loading || loadingCollections"
                :rules="rules.collection_id"
                prepend-icon="mdi-truck"
                hint="Select the collection request you want to provide feedback for"
                persistent-hint
              >
                <template v-slot:item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Title -->
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                :rules="rules.title"
                label="Feedback Title"
                variant="outlined"
                :disabled="loading"
                prepend-icon="mdi-format-title"
                counter="100"
                hint="Provide a clear, concise title for your feedback"
                persistent-hint
              />
            </v-col>

            <!-- Rating -->
            <v-col cols="12">
              <div class="mb-2">
                <label class="text-body-2 font-weight-medium mb-2 d-block">
                  <v-icon icon="mdi-star" class="mr-1" />
                  Rating (Optional)
                </label>
                <v-rating
                  v-model="form.rate"
                  :rules="rules.rate"
                  hover
                  clearable
                  color="primary"
                  :disabled="loading"
                  class="mb-2"
                />
                <div class="text-caption grey--text">
                  Rate your experience from 1 (poor) to 5 (excellent)
                </div>
              </div>
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                :rules="rules.description"
                label="Feedback Description"
                variant="outlined"
                :disabled="loading"
                prepend-icon="mdi-text"
                counter="500"
                rows="4"
                hint="Provide detailed feedback to help us improve our services"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />

        <v-btn
          @click="closeDialog"
          variant="text"
          color="grey"
          :disabled="loading"
        >
          Cancel
        </v-btn>

        <v-btn
          @click="handleSubmit"
          variant="elevated"
          color="primary"
          :loading="loading"
          :disabled="!valid"
        >
          Submit Feedback
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card-title {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.v-form {
  width: 100%;
}
</style>
