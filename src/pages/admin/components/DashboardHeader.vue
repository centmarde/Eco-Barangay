<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import { useAuthUserStore } from "@/stores/authUser";

const authStore = useAuthUserStore();
const { mobile } = useDisplay();
</script>

<template>
  <v-row class="mb-4">
    <v-col cols="12">
      <div
        :class="
          mobile
            ? 'd-flex flex-column'
            : 'd-flex align-center justify-space-between'
        "
      >
        <div :class="mobile ? 'mb-3' : ''">
          <h1
            :class="mobile ? 'text-h5' : 'text-h4'"
            class="font-weight-bold mb-2"
          >
            Admin Dashboard
          </h1>
          <p
            :class="mobile ? 'text-body-2' : 'text-subtitle-1'"
            class="text-medium-emphasis"
          >
            Welcome back, {{ authStore.userName }}!
          </p>
        </div>
        <v-chip
          color="success"
          variant="tonal"
          prepend-icon="mdi-shield-check"
          :size="mobile ? 'default' : 'large'"
        >
          Administrator
        </v-chip>
      </div>
    </v-col>
  </v-row>
</template>
