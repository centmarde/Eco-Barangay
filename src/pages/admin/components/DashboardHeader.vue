<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useDisplay } from "vuetify";
import { useAuthUserStore } from "@/stores/authUser";
import { useUserRolesStore } from "@/stores/roles";

const authStore = useAuthUserStore();
const rolesStore = useUserRolesStore();
const { mobile } = useDisplay();

onMounted(async () => {
    // Ensure we have roles loaded to map the ID
    if (rolesStore.roles.length === 0) {
        await rolesStore.fetchRoles();
    }
});

const roleTitle = computed(() => {
    const roleId = authStore.userRole;
    if (!roleId) return "Administrator"; // Fallback
    
    const role = rolesStore.roles.find(r => r.id === roleId);
    return role?.title || "Administrator";
});
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
          {{ roleTitle }}
        </v-chip>
      </div>
    </v-col>
  </v-row>
</template>