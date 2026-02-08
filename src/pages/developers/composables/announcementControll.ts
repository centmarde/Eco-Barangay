import { ref, computed } from 'vue'
import { useAnnouncementsStore } from '@/stores/announcementsData'
import { useToast } from 'vue-toastification'
import type {
  Announcement,
  CreateAnnouncementData,
  UpdateAnnouncementData
} from '@/stores/announcementsData'

export const useAnnouncementController = () => {
  const announcementsStore = useAnnouncementsStore()
  const toast = useToast()

  // Local state
  const loading = ref(false)
  const selectedAnnouncements = ref<number[]>([])
  const editingAnnouncement = ref<Announcement | null>(null)
  const showCreateDialog = ref(false)
  const showEditDialog = ref(false)
  const showDeleteDialog = ref(false)
  const showViewDialog = ref(false)
  const viewingAnnouncement = ref<Announcement | null>(null)
  const searchQuery = ref('')

  // Form data
  const createForm = ref<CreateAnnouncementData>({
    title: '',
    description: '',
    image: ''
  })

  const editForm = ref<UpdateAnnouncementData>({
    title: '',
    description: '',
    image: ''
  })

  // Computed
  const announcements = computed(() => announcementsStore.announcements)
  const isLoading = computed(() => loading.value || announcementsStore.loading)
  const error = computed(() => announcementsStore.error)

  // Filtered announcements based on search
  const filteredAnnouncements = computed(() => {
    if (!searchQuery.value.trim()) {
      return announcements.value
    }

    const query = searchQuery.value.toLowerCase()
    return announcements.value.filter(announcement =>
      announcement.title.toLowerCase().includes(query) ||
      announcement.description.toLowerCase().includes(query)
    )
  })

  // Has selected announcements
  const hasSelectedAnnouncements = computed(() => selectedAnnouncements.value.length > 0)

  // Actions
  const fetchAnnouncements = async () => {
    try {
      loading.value = true
      await announcementsStore.fetchAnnouncements()
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      loading.value = false
    }
  }

  const searchAnnouncements = async (query: string) => {
    try {
      loading.value = true
      const results = await announcementsStore.searchAnnouncements(query)
      return results
    } catch (error) {
      console.error('Error searching announcements:', error)
      toast.error('Failed to search announcements')
      return []
    } finally {
      loading.value = false
    }
  }

  const openCreateDialog = () => {
    resetCreateForm()
    showCreateDialog.value = true
  }

  const openEditDialog = (announcement: Announcement) => {
    editingAnnouncement.value = { ...announcement }
    editForm.value = {
      title: announcement.title,
      description: announcement.description,
      image: announcement.image
    }
    showEditDialog.value = true
  }

  const openViewDialog = (announcement: Announcement) => {
    viewingAnnouncement.value = announcement
    showViewDialog.value = true
  }

  const openDeleteDialog = () => {
    if (selectedAnnouncements.value.length === 0) {
      toast.warning('Please select announcements to delete')
      return
    }
    showDeleteDialog.value = true
  }

  const createAnnouncement = async () => {
    if (!validateCreateForm()) return

    try {
      loading.value = true
      const result = await announcementsStore.createAnnouncement(createForm.value)

      if (result) {
        toast.success('Announcement created successfully')
        closeCreateDialog()
        await fetchAnnouncements()
      } else {
        toast.error('Failed to create announcement')
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error('Failed to create announcement')
    } finally {
      loading.value = false
    }
  }

  const updateAnnouncement = async () => {
    if (!editingAnnouncement.value || !validateEditForm()) return

    try {
      loading.value = true
      const result = await announcementsStore.updateAnnouncement(
        editingAnnouncement.value.id,
        editForm.value
      )

      if (result) {
        toast.success('Announcement updated successfully')
        closeEditDialog()
        await fetchAnnouncements()
      } else {
        toast.error('Failed to update announcement')
      }
    } catch (error) {
      console.error('Error updating announcement:', error)
      toast.error('Failed to update announcement')
    } finally {
      loading.value = false
    }
  }

  const deleteSelectedAnnouncements = async () => {
    try {
      loading.value = true

      if (selectedAnnouncements.value.length === 1) {
        const success = await announcementsStore.deleteAnnouncement(selectedAnnouncements.value[0])
        if (success) {
          toast.success('Announcement deleted successfully')
        } else {
          toast.error('Failed to delete announcement')
        }
      } else {
        const success = await announcementsStore.deleteMultipleAnnouncements(selectedAnnouncements.value)
        if (success) {
          toast.success(`${selectedAnnouncements.value.length} announcements deleted successfully`)
        } else {
          toast.error('Failed to delete announcements')
        }
      }

      selectedAnnouncements.value = []
      closeDeleteDialog()
      await fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcements:', error)
      toast.error('Failed to delete announcements')
    } finally {
      loading.value = false
    }
  }

  // Dialog controls
  const closeCreateDialog = () => {
    showCreateDialog.value = false
    resetCreateForm()
  }

  const closeEditDialog = () => {
    showEditDialog.value = false
    editingAnnouncement.value = null
    resetEditForm()
  }

  const closeDeleteDialog = () => {
    showDeleteDialog.value = false
  }

  const closeViewDialog = () => {
    showViewDialog.value = false
    viewingAnnouncement.value = null
  }

  // Form helpers
  const resetCreateForm = () => {
    createForm.value = {
      title: '',
      description: '',
      image: ''
    }
  }

  const resetEditForm = () => {
    editForm.value = {
      title: '',
      description: '',
      image: ''
    }
  }

  const validateCreateForm = (): boolean => {
    if (!createForm.value.title.trim()) {
      toast.error('Title is required')
      return false
    }
    if (!createForm.value.description.trim()) {
      toast.error('Description is required')
      return false
    }
    return true
  }

  const validateEditForm = (): boolean => {
    if (!editForm.value.title?.trim()) {
      toast.error('Title is required')
      return false
    }
    if (!editForm.value.description?.trim()) {
      toast.error('Description is required')
      return false
    }
    return true
  }

  // Selection helpers
  const toggleAnnouncementSelection = (announcementId: number) => {
    const index = selectedAnnouncements.value.indexOf(announcementId)
    if (index > -1) {
      selectedAnnouncements.value.splice(index, 1)
    } else {
      selectedAnnouncements.value.push(announcementId)
    }
  }

  const selectAllAnnouncements = () => {
    if (selectedAnnouncements.value.length === filteredAnnouncements.value.length) {
      selectedAnnouncements.value = []
    } else {
      selectedAnnouncements.value = filteredAnnouncements.value.map(a => a.id)
    }
  }

  const isAnnouncementSelected = (announcementId: number): boolean => {
    return selectedAnnouncements.value.includes(announcementId)
  }

  // Utility functions
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number = 100): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return {
    // State
    announcements: filteredAnnouncements,
    selectedAnnouncements,
    editingAnnouncement,
    viewingAnnouncement,
    searchQuery,
    createForm,
    editForm,

    // Dialog states
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    showViewDialog,

    // Computed
    isLoading,
    error,
    hasSelectedAnnouncements,

    // Actions
    fetchAnnouncements,
    searchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteSelectedAnnouncements,

    // Dialog controls
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeCreateDialog,
    closeEditDialog,
    closeDeleteDialog,
    closeViewDialog,

    // Selection
    toggleAnnouncementSelection,
    selectAllAnnouncements,
    isAnnouncementSelected,

    // Utilities
    formatDate,
    truncateText
  }
}
