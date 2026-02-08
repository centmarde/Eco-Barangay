<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon left class="mr-2" color="success">mdi-plus-circle</v-icon>
        Create New Announcement
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="localForm.title"
            label="Title *"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[v => !!v || 'Title is required']"
            :error="!!errors.title"
            :error-messages="errors.title"
            required
          />

          <v-textarea
            v-model="localForm.description"
            label="Description *"
            variant="outlined"
            rows="4"
            class="mb-4"
            :rules="[v => !!v || 'Description is required']"
            :error="!!errors.description"
            :error-messages="errors.description"
            required
          />

          <v-text-field
            v-model="localForm.image"
            label="Image URL (Optional)"
            variant="outlined"
            density="comfortable"
            placeholder="https://example.com/image.jpg"
            :error="!!errors.image"
            :error-messages="errors.image"
          />

          <!-- Image Preview -->
          <div v-if="localForm.image && isValidImageUrl" class="mt-4">
            <v-card class="pa-2" variant="outlined">
              <v-card-subtitle class="text-caption">Image Preview:</v-card-subtitle>
              <v-img
                :src="localForm.image"
                height="200"
                class="rounded mt-2"
                cover
              >
                <template v-slot:error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon size="48" color="grey-lighten-1">mdi-image-broken</v-icon>
                  </div>
                </template>
              </v-img>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="success"
          @click="handleSubmit"
          :loading="loading"
        >
          Create Announcement
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CreateAnnouncementData } from '@/stores/announcementsData'

interface Props {
  show: boolean
  loading?: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'submit', data: CreateAnnouncementData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Form reference
const formRef = ref()

// Local form state
const localForm = ref<CreateAnnouncementData>({
  title: '',
  description: '',
  image: ''
})

// Form errors
const errors = ref({
  title: '',
  description: '',
  image: ''
})

// Computed
const isValidImageUrl = computed(() => {
  if (!localForm.value.image) return false
  try {
    const url = new URL(localForm.value.image)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
})

// Watch for dialog show/hide
watch(
  () => props.show,
  (isShowing) => {
    if (isShowing) {
      // Reset errors when dialog opens
      errors.value = {
        title: '',
        description: '',
        image: ''
      }
    } else {
      // Reset form when dialog closes
      resetForm()
    }
  }
)

// Methods
const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.value = {
    title: '',
    description: '',
    image: ''
  }

  // Validate title
  if (!localForm.value.title?.trim()) {
    errors.value.title = 'Title is required'
    isValid = false
  }

  // Validate description
  if (!localForm.value.description?.trim()) {
    errors.value.description = 'Description is required'
    isValid = false
  }

  // Validate image URL if provided
  if (localForm.value.image && !isValidImageUrl.value) {
    errors.value.image = 'Please enter a valid image URL'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  // Clean the form data
  const formData: CreateAnnouncementData = {
    title: localForm.value.title?.trim() || '',
    description: localForm.value.description?.trim() || ''
  }

  // Add image field only if it has a value
  const imageValue = localForm.value.image?.trim()
  if (imageValue) {
    formData.image = imageValue
  }

  emit('submit', formData)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const resetForm = () => {
  localForm.value = {
    title: '',
    description: '',
    image: ''
  }

  errors.value = {
    title: '',
    description: '',
    image: ''
  }

  // Reset form validation
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}
</script>

<style scoped>
.v-card-subtitle {
  font-weight: 500;
  opacity: 0.8;
}
</style>
