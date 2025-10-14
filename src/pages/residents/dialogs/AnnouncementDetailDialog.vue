<script setup lang="ts">
import { formatDate } from "@/utils/dateHelpers";

interface Props {
  modelValue: boolean;
  selectedAnnouncement: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
   <v-dialog
      v-model="dialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedAnnouncement" rounded="lg">
        <v-sheet color="primary" class="pa-6">
          <v-row align="center" no-gutters>
            <v-col cols="auto">
              <v-icon icon="mdi-bullhorn" class="mr-3" size="large" color="white" />
            </v-col>
            <v-col>
              <v-card-title class="text-h5 text-white pa-0">
                {{ selectedAnnouncement.title }}
              </v-card-title>
            </v-col>
            <v-col cols="auto">
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="dialog = false"
              />
            </v-col>
          </v-row>
        </v-sheet>

        <v-divider />

        <!-- Image Section (if available) -->
        <v-img
          v-if="selectedAnnouncement.image"
          :src="selectedAnnouncement.image"
          height="100%"
          min-height="400"
          max-height="600"
          cover
          class="ma-0"
        />

        <v-card-text class="pa-6" style="min-height: 200px;">
          <v-chip
            color="primary"
            variant="tonal"
            class="mb-4"
          >
            <v-icon icon="mdi-calendar" start />
            {{ formatDate(selectedAnnouncement.created_at) }}
          </v-chip>

          <v-row class="mt-4">
            <v-col cols="12">
              <span class="text-body-1" style="display: block; line-height: 1.8;">
                {{ selectedAnnouncement.description }}
              </span>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
