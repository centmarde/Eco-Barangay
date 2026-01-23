<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  itemName: string
  title?: string
  message?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Deletion',
  message: 'This action cannot be undone.'
})

const emit = defineEmits<Emits>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  dialog.value = false
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        {{ title }}
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pb-0">
        <p class="text-body-1 mb-2">
          Are you sure you want to delete <strong>{{ itemName }}</strong>?
        </p>
        <p class="text-body-2 grey--text">
          {{ message }}
        </p>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6">
        <v-spacer />

        <v-btn
          @click="handleCancel"
          variant="text"
          color="grey"
        >
          Cancel
        </v-btn>

        <v-btn
          @click="handleConfirm"
          variant="elevated"
          color="error"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card-title {
  background-color: rgba(var(--v-theme-error), 0.05);
}
</style>
