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

          <!-- Image Upload Section -->
          <v-card variant="outlined" class="mb-4">
            <v-card-subtitle class="text-subtitle-2 font-weight-medium pa-4 pb-2">
              <v-icon left class="mr-2">mdi-image-plus</v-icon>
              Announcement Image (Optional)
            </v-card-subtitle>

            <v-card-text class="pt-0">
              <!-- File Input -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                style="display: none"
              />

              <!-- Upload Button -->
              <v-btn
                v-if="!imagePreview"
                variant="outlined"
                color="primary"
                @click="fileInputRef?.click()"
                :disabled="uploadingImage"
                class="mb-3"
              >
                <v-icon left>mdi-cloud-upload</v-icon>
                Choose Image
              </v-btn>

              <!-- Image Preview -->
              <div v-if="imagePreview">
                <v-img
                  :src="imagePreview"
                  height="200"
                  class="rounded mb-3"
                  cover
                >
                  <template v-slot:error>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-icon size="48" color="grey-lighten-1">mdi-image-broken</v-icon>
                    </div>
                  </template>
                </v-img>

                <!-- Image Actions -->
                <div class="d-flex gap-2">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    size="small"
                    @click="fileInputRef?.click()"
                    :disabled="uploadingImage"
                  >
                    <v-icon left>mdi-image-edit</v-icon>
                    Change Image
                  </v-btn>

                  <v-btn
                    variant="outlined"
                    color="error"
                    size="small"
                    @click="removeImage"
                    :disabled="uploadingImage"
                  >
                    <v-icon left>mdi-delete</v-icon>
                    Remove
                  </v-btn>
                </div>
              </div>

              <!-- Upload Progress -->
              <v-progress-linear
                v-if="uploadingImage"
                indeterminate
                color="primary"
                class="mt-2"
              />

              <!-- Help Text -->
              <v-card-subtitle class="text-caption text-grey-darken-1 px-0 pb-0">
                Supported formats: JPEG, PNG, GIF, WebP. Maximum size: 5MB
              </v-card-subtitle>
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="isProcessing"
        >
          Cancel
        </v-btn>
        <v-btn
          color="success"
          @click="handleSubmit"
          :loading="isProcessing"
        >
          Create Announcement
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAnnouncementsStore } from '@/stores/announcementsData'
import { useToast } from 'vue-toastification'
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

// Store and utilities
const announcementsStore = useAnnouncementsStore()
const toast = useToast()

// Form reference
const formRef = ref()
const fileInputRef = ref()

// Local form state
const localForm = ref<CreateAnnouncementData>({
  title: '',
  description: '',
  image: ''
})

// Image upload state
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string>('')
const uploadingImage = ref(false)

// Form errors
const errors = ref({
  title: '',
  description: '',
  image: ''
})

// Computed
const isProcessing = computed(() => props.loading || uploadingImage.value)

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
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB')
      return
    }

    selectedFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  selectedFile.value = null
  imagePreview.value = ''
  localForm.value.image = ''

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const uploadImageFile = async (): Promise<string | null> => {
  if (!selectedFile.value) return null

  try {
    uploadingImage.value = true
    const imageUrl = await announcementsStore.uploadImage(selectedFile.value)

    if (imageUrl) {
      return imageUrl
    } else {
      toast.error('Failed to upload image')
      return null
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    toast.error('Failed to upload image')
    return null
  } finally {
    uploadingImage.value = false
  }
}
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

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    // Upload new image if selected
    let imageUrl = ''

    if (selectedFile.value) {
      const uploadedUrl = await uploadImageFile()
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      } else {
        // Failed to upload image
        return
      }
    }

    // Clean the form data
    const formData: CreateAnnouncementData = {
      title: localForm.value.title?.trim() || '',
      description: localForm.value.description?.trim() || ''
    }

    // Add image field only if it has a value
    if (imageUrl) {
      formData.image = imageUrl
    }

    emit('submit', formData)
  } catch (error) {
    console.error('Error in form submission:', error)
    toast.error('An error occurred while creating the announcement')
  }
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

  // Reset image state
  selectedFile.value = null
  imagePreview.value = ''

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
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

.gap-2 {
  gap: 8px;
}
</style>
