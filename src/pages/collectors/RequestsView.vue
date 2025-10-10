<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'

const loading = ref(false)

onMounted(() => {
  // Initialize component
})
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title class="text-h5 font-weight-bold">
                <v-icon left>mdi-clipboard-text</v-icon>
                Collection Requests
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <p class="text-body-1">
                      Manage and view all collection requests here.
                    </p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
</style>
