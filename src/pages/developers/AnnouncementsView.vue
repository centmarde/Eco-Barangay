<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAnnouncementController } from './composables/announcementControll'
import AnnouncementsWidget from './components/AnnouncementsWidget.vue'
import InnerLayoutWrapper from '@/layouts/InnerLayoutWrapper.vue'
// Dialog Components
import {
  AnnouncementCreateDialog,
  AnnouncementEditDialog,
  AnnouncementViewDialog,
  AnnouncementDeleteDialog
} from './dialogs'

import type { Announcement } from '@/stores/announcementsData'

// Controller
const controller = useAnnouncementController()

// Local state
const viewMode = ref<'grid' | 'list'>('grid')

// Initialize
onMounted(async () => {
  await controller.fetchAnnouncements()
})

// Event handlers
const handleViewAnnouncement = (announcement: Announcement) => {
  controller.openViewDialog(announcement)
}

const handleEditAnnouncement = (announcement: Announcement) => {
  controller.openEditDialog(announcement)
}

const handleDeleteSingle = (announcementId: number) => {
  controller.selectedAnnouncements.value = [announcementId]
  controller.openDeleteDialog()
}

const handleBulkDelete = () => {
  controller.openDeleteDialog()
}

const handleSearch = async () => {
  if (controller.searchQuery.value.trim()) {
    await controller.searchAnnouncements(controller.searchQuery.value)
  } else {
    await controller.fetchAnnouncements()
  }
}

const handleCreateSubmit = async (data: any) => {
  controller.createForm.value = data
  await controller.createAnnouncement()
}

const handleEditSubmit = async (data: any) => {
  controller.editForm.value = data
  await controller.updateAnnouncement()
}

const handleDeleteConfirm = async () => {
  await controller.deleteSelectedAnnouncements()
}

const clearSearch = async () => {
  controller.searchQuery.value = ''
  await controller.fetchAnnouncements()
}
</script>

<template>
  <InnerLayoutWrapper>
    <template #content>
      <v-container fluid class="pa-6">
      <v-row>
        <v-col cols="12">
          <!-- Header Section -->

            <v-card-title class="text-h5 font-weight-bold d-flex align-center">
              <v-icon left class="mr-3" color="primary">mdi-bullhorn</v-icon>
              Announcements Management
              <v-spacer />
              <v-chip
                color="primary"
                variant="outlined"
                class="ml-2"
              >
                {{ controller.announcements.value.length }} Total
              </v-chip>
            </v-card-title>

            <!-- Action Bar -->
            <v-card-text class="pb-4">
              <div class="d-flex flex-wrap align-center ga-4 mb-4">
                <!-- Search Bar -->
                <div class="flex-grow-1" style="min-width: 300px;">
                  <v-text-field
                    v-model="controller.searchQuery.value"
                    placeholder="Search announcements..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    @keyup.enter="handleSearch"
                    @click:clear="clearSearch"
                  >
                    <template v-slot:append-inner>
                      <v-btn
                        icon="mdi-magnify"
                        variant="text"
                        size="small"
                        @click="handleSearch"
                      />
                    </template>
                  </v-text-field>
                </div>

                <!-- View Mode Toggle -->
                <v-btn-toggle
                  v-model="viewMode"
                  mandatory
                  variant="outlined"
                  density="compact"
                >
                  <v-btn value="grid" icon="mdi-view-grid" />
                  <v-btn value="list" icon="mdi-view-list" />
                </v-btn-toggle>

                <!-- Action Buttons -->
                <div class="d-flex ga-2">
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="controller.openCreateDialog"
                  >
                    New Announcement
                  </v-btn>

                  <v-btn
                    v-if="controller.hasSelectedAnnouncements.value"
                    color="error"
                    prepend-icon="mdi-delete"
                    variant="outlined"
                    @click="handleBulkDelete"
                  >
                    Delete ({{ controller.selectedAnnouncements.value.length }})
                  </v-btn>
                </div>
              </div>

              <!-- Selection Controls -->
              <div v-if="controller.announcements.value.length > 0" class="d-flex align-center ga-4">
                <v-btn
                  variant="text"
                  size="small"
                  @click="controller.selectAllAnnouncements"
                >
                  {{ controller.hasSelectedAnnouncements.value ? 'Deselect All' : 'Select All' }}
                </v-btn>

                <v-chip
                  v-if="controller.hasSelectedAnnouncements.value"
                  color="primary"
                  size="small"
                >
                  {{ controller.selectedAnnouncements.value.length }} selected
                </v-chip>
              </div>
            </v-card-text>


          <!-- Content Section -->

            <v-card-text class="pa-6">
              <!-- Loading State -->
              <div v-if="controller.isLoading.value" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="64" />
                <div class="text-h6 mt-4">Loading announcements...</div>
              </div>

              <!-- Empty State -->
              <div v-else-if="controller.announcements.value.length === 0" class="text-center py-12">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">
                  mdi-bullhorn-outline
                </v-icon>
                <div class="text-h6 mb-2">No announcements found</div>
                <div class="text-body-1 text-medium-emphasis mb-4">
                  {{ controller.searchQuery.value ? 'Try adjusting your search criteria' : 'Create your first announcement to get started' }}
                </div>
                <v-btn
                  v-if="!controller.searchQuery.value"
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="controller.openCreateDialog"
                >
                  Create Announcement
                </v-btn>
              </div>

              <!-- Announcements Grid/List -->
              <div v-else>
                <!-- Grid View -->
                <v-row v-if="viewMode === 'grid'">
                  <v-col
                    v-for="announcement in controller.announcements.value"
                    :key="announcement.id"
                    cols="12"
                    sm="6"
                    lg="4"
                  >
                    <AnnouncementsWidget
                      :announcement="announcement"
                      :is-selected="controller.isAnnouncementSelected(announcement.id)"
                      @toggle-selection="controller.toggleAnnouncementSelection"
                      @view="handleViewAnnouncement"
                      @edit="handleEditAnnouncement"
                      @delete="handleDeleteSingle"
                    />
                  </v-col>
                </v-row>

                <!-- List View -->
                <v-row v-else>
                  <v-col
                    v-for="announcement in controller.announcements.value"
                    :key="announcement.id"
                    cols="12"
                    class="py-2"
                  >
                    <AnnouncementsWidget
                      :announcement="announcement"
                      :is-selected="controller.isAnnouncementSelected(announcement.id)"
                      @toggle-selection="controller.toggleAnnouncementSelection"
                      @view="handleViewAnnouncement"
                      @edit="handleEditAnnouncement"
                      @delete="handleDeleteSingle"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-card-text>

        </v-col>
      </v-row>
    </v-container>



    <!-- Create Announcement Dialog -->
    <AnnouncementCreateDialog
      v-model:show="controller.showCreateDialog.value"
      :loading="controller.isLoading.value"
      @submit="handleCreateSubmit"
      @cancel="controller.closeCreateDialog"
    />

    <!-- Edit Announcement Dialog -->
    <AnnouncementEditDialog
      v-model:show="controller.showEditDialog.value"
      :loading="controller.isLoading.value"
      :announcement="controller.editingAnnouncement.value"
      @submit="handleEditSubmit"
      @cancel="controller.closeEditDialog"
    />

    <!-- View Announcement Dialog -->
    <AnnouncementViewDialog
      v-model:show="controller.showViewDialog.value"
      :announcement="controller.viewingAnnouncement.value"
      @edit="handleEditAnnouncement"
      @close="controller.closeViewDialog"
    />

    <!-- Delete Confirmation Dialog -->
    <AnnouncementDeleteDialog
      v-model:show="controller.showDeleteDialog.value"
      :loading="controller.isLoading.value"
      :selected-ids="controller.selectedAnnouncements.value"
      :announcements="controller.announcements.value"
      @confirm="handleDeleteConfirm"
      @cancel="controller.closeDeleteDialog"
    />
		 </template>
  </InnerLayoutWrapper>
</template>

<style scoped>
/* Responsive adjustments */
@media (max-width: 960px) {
  .d-flex.flex-wrap.align-center.ga-4 {
    flex-direction: column;
    align-items: stretch !important;
  }

  .d-flex.ga-2 {
    width: 100%;
    justify-content: stretch;
  }

  .d-flex.ga-2 > * {
    flex: 1;
  }
}
</style>
