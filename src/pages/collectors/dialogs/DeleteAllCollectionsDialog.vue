<script setup lang="ts">
import { computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  selectedStatus: string
  totalCount: number
  confirmationCode: string
  generatedCode: string
  isValidConfirmation: boolean
  loading: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:confirmationCode', value: string): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const confirmationCodeModel = computed({
  get: () => props.confirmationCode,
  set: (value) => {
    // Format input to only allow numbers and limit to 6 digits
    const cleanedInput = value.replace(/\D/g, '').slice(0, 6)
    emit('update:confirmationCode', cleanedInput)
  }
})

const getMessage = computed(() => {
  const statusText = props.selectedStatus === 'all' ? 'ALL' : props.selectedStatus.toUpperCase().replace('_', ' ')
  return `You are about to delete ${props.totalCount} ${statusText} collection${props.totalCount !== 1 ? 's' : ''}. This action cannot be undone.`
})

const formattedGeneratedCode = computed(() => {
  // Format the code with dashes for better readability: 123-456
  const code = props.generatedCode
  if (code.length === 6) {
    return `${code.slice(0, 3)}-${code.slice(3, 6)}`
  }
  return code
})

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="600" persistent>
    <v-card>
      <v-card-title class="text-h5 text-error d-flex align-center">
        <v-icon class="mr-2">mdi-delete-sweep</v-icon>
        Delete All Collections
      </v-card-title>

      <v-card-text class="pt-4">
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <v-alert-title class="text-h6">⚠️ Dangerous Action</v-alert-title>
          {{ getMessage }}
        </v-alert>

        <!-- Generated Code Display -->
        <v-card
          variant="outlined"
          color="primary"
          class="mb-4 pa-4 text-center"
        >
          <p class="text-subtitle-2 mb-2">Enter this confirmation code:</p>
          <p class="text-h4 font-mono font-weight-bold text-primary">
            {{ formattedGeneratedCode }}
          </p>
          <p class="text-caption text-grey mt-2">
            This code is generated randomly for security
          </p>
        </v-card>

        <v-text-field
          v-model="confirmationCodeModel"
          label="Enter the 6-digit confirmation code"
          variant="outlined"
          placeholder="000000"
          :error="confirmationCode.length > 0 && !isValidConfirmation"
          :error-messages="confirmationCode.length > 0 && !isValidConfirmation ? 'Please enter the correct 6-digit code' : ''"
          autofocus
          class="mt-4"
          maxlength="6"
          style="font-family: monospace;"
        >
          <template #append-inner>
            <v-icon
              v-if="isValidConfirmation"
              color="success"
            >
              mdi-check-circle
            </v-icon>
            <v-icon
              v-else-if="confirmationCode.length > 0"
              color="error"
            >
              mdi-close-circle
            </v-icon>
          </template>
        </v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="onCancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          :disabled="!isValidConfirmation"
          :loading="loading"
          @click="onConfirm"
        >
          <v-icon start>mdi-delete-sweep</v-icon>
          Delete All Collections
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
