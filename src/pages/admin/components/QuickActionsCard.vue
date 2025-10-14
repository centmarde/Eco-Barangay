<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import type { QuickAction } from "@/stores/dashboard";

interface Props {
  actions: QuickAction[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigate: [route: string];
}>();

const { mobile } = useDisplay();
const quickActionCols = computed(() => (mobile.value ? 6 : 3));

const handleActionClick = (route: string) => {
  emit("navigate", route);
};
</script>

<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <v-card elevation="2" :class="mobile ? 'pa-4' : 'pa-6'">
        <v-card-title
          :class="mobile ? 'text-h6 mb-3 pa-0' : 'text-h5 mb-4 pa-0'"
        >
          <v-icon :class="mobile ? 'mr-1' : 'mr-2'" :size="mobile ? 20 : 24">
            mdi-lightning-bolt
          </v-icon>
          Quick Actions
        </v-card-title>

        <v-row dense>
          <v-col
            v-for="action in actions"
            :key="action.title"
            cols="6"
            :md="quickActionCols"
          >
            <v-card
              :color="action.color"
              variant="tonal"
              :class="mobile ? 'pa-2' : 'pa-4'"
              class="action-card cursor-pointer h-100"
              elevation="1"
              hover
              @click="handleActionClick(action.route)"
            >
              <div
                class="text-center d-flex flex-column align-center justify-center h-100"
              >
                <v-icon
                  :color="action.color"
                  :size="mobile ? 32 : 48"
                  class="mb-2"
                >
                  {{ action.icon }}
                </v-icon>
                <div
                  :class="mobile ? 'text-caption' : 'text-h6'"
                  class="font-weight-bold mb-1 text-wrap"
                  style="word-break: break-word; line-height: 1.2"
                >
                  {{ action.title }}
                </div>
                <div v-if="!mobile" class="text-caption text-medium-emphasis">
                  {{ action.description }}
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.action-card {
  transition: all 0.3s ease;
  min-height: 120px;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.text-wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  white-space: normal !important;
  max-width: 100%;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .action-card {
    min-height: 110px;
  }
}
</style>
