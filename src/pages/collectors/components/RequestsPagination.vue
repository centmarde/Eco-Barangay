<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";

const { smAndDown } = useDisplay();

interface Props {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  showItemsPerPageControl?: boolean;
  itemsPerPageOptions?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 8,
  showItemsPerPageControl: true,
  itemsPerPageOptions: () => [8, 16, 24, 32, 50],
});

const emit = defineEmits<{
  "update:currentPage": [page: number];
  "update:itemsPerPage": [itemsPerPage: number];
}>();

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value: number) => emit("update:currentPage", value),
});

const itemsPerPageModel = computed({
  get: () => props.itemsPerPage,
  set: (value: number) => {
    emit("update:itemsPerPage", value);
    // Reset to page 1 when items per page changes
    emit("update:currentPage", 1);
  },
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return end > props.totalItems ? props.totalItems : end;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPageModel.value = page;
  }
};

const previousPage = () => {
  if (props.currentPage > 1) {
    currentPageModel.value = props.currentPage - 1;
  }
};

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    currentPageModel.value = props.currentPage + 1;
  }
};

// Generate visible page numbers with ellipsis
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = props.currentPage;

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    // Show pages around current page
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(total);
  }

  return pages;
});
</script>

<template>
  <div v-if="totalItems > 0" class="pagination-wrapper">
    <v-card flat class="pa-2">
      <div class="d-flex flex-column flex-sm-row align-center justify-space-between gap-3">
        <!-- Items info -->
        <div class="text-body-2 text-grey-darken-1">
          <span v-if="!smAndDown">Showing </span>
          <span class="font-weight-bold">{{ startItem }}-{{ endItem }}</span>
          of
          <span class="font-weight-bold">{{ totalItems }}</span>
          {{ smAndDown ? "" : "items" }}
        </div>

        <!-- Pagination controls -->
        <div class="d-flex align-center gap-1">
          <!-- Previous button -->
          <v-btn
            :disabled="currentPage === 1"
            :size="smAndDown ? 'small' : 'default'"
            icon
            variant="text"
            @click="previousPage"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>

          <!-- Page numbers -->
          <template v-for="(page, index) in visiblePages" :key="index">
            <v-btn
              v-if="page !== '...'"
              :color="currentPage === page ? 'primary' : ''"
              :variant="currentPage === page ? 'flat' : 'text'"
              :size="smAndDown ? 'small' : 'default'"
              :min-width="smAndDown ? '32' : '40'"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </v-btn>
            <span v-else class="px-2 text-grey">...</span>
          </template>

          <!-- Next button -->
          <v-btn
            :disabled="currentPage === totalPages"
            :size="smAndDown ? 'small' : 'default'"
            icon
            variant="text"
            @click="nextPage"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>

        <!-- Items per page selector -->
        <div v-if="showItemsPerPageControl" class="d-flex align-center gap-2">
          <span v-if="!smAndDown" class="text-body-2 text-grey-darken-1">
            Items per page:
          </span>
          <v-select
            v-model="itemsPerPageModel"
            :items="itemsPerPageOptions"
            density="compact"
            variant="outlined"
            hide-details
            :style="{ width: smAndDown ? '70px' : '80px' }"
            class="items-per-page-select"
          />
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.pagination-wrapper {
  width: 100%;
  margin-top: 16px;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.items-per-page-select :deep(.v-field) {
  font-size: 0.875rem;
}

.items-per-page-select :deep(.v-field__input) {
  padding: 4px 8px;
  min-height: 32px;
}
</style>
