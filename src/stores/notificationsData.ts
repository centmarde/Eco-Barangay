import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'

// Type definitions
export type Notification = {
  id: number
  created_at: string
  title: string
  description: string
  is_read: boolean
}

export type CreateNotificationData = {
  title: string
  description: string
  is_read?: boolean
}

export type UpdateNotificationData = {
  title?: string
  description?: string
  is_read?: boolean
}

export const useNotificationsStore = defineStore('notifications', () => {
  const toast = useToast()

  // State
  const notifications = ref<Notification[]>([])
  const currentNotification = ref<Notification | undefined>(undefined)
  const loading = ref(false)
  const error = ref<string | undefined>(undefined)

  // Actions
  const fetchNotifications = async () => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      notifications.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
      toast.error('Failed to fetch notifications')
    } finally {
      loading.value = false
    }
  }

  const fetchNotificationById = async (id: number) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      currentNotification.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notification'
      toast.error('Failed to fetch notification')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadNotifications = async () => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch unread notifications'
      toast.error('Failed to fetch unread notifications')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchReadNotifications = async () => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch read notifications'
      toast.error('Failed to fetch read notifications')
      return []
    } finally {
      loading.value = false
    }
  }

  const createNotification = async (notificationData: CreateNotificationData) => {
    loading.value = true
    error.value = undefined

    try {
      const dataToInsert = {
        ...notificationData,
        is_read: notificationData.is_read ?? false
      }

      const { data, error: createError } = await supabase
        .from('notifications')
        .insert([dataToInsert])
        .select()
        .single()

      if (createError) throw createError

      if (data) {
        notifications.value.unshift(data)
      }

      toast.success('Notification created successfully')
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create notification'
      toast.error('Failed to create notification')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const updateNotification = async (id: number, notificationData: UpdateNotificationData) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: updateError } = await supabase
        .from('notifications')
        .update(notificationData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        const index = notifications.value.findIndex((n) => n.id === id)
        if (index !== -1) {
          notifications.value[index] = data
        }
      }

      toast.success('Notification updated successfully')
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update notification'
      toast.error('Failed to update notification')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: number) => {
    return await updateNotification(id, { is_read: true })
  }

  const markAsUnread = async (id: number) => {
    return await updateNotification(id, { is_read: false })
  }

  const markAllAsRead = async () => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)
        .select()

      if (updateError) throw updateError

      if (data) {
        data.forEach((updatedNotification) => {
          const index = notifications.value.findIndex((n) => n.id === updatedNotification.id)
          if (index !== -1) {
            notifications.value[index] = updatedNotification
          }
        })
      }

      toast.success('All notifications marked as read')
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark all as read'
      toast.error('Failed to mark all as read')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const deleteNotification = async (id: number) => {
    loading.value = true
    error.value = undefined

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      notifications.value = notifications.value.filter((n) => n.id !== id)
      toast.success('Notification deleted successfully')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete notification'
      toast.error('Failed to delete notification')
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteAllReadNotifications = async () => {
    loading.value = true
    error.value = undefined

    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('is_read', true)

      if (deleteError) throw deleteError

      notifications.value = notifications.value.filter((n) => !n.is_read)
      toast.success('All read notifications deleted successfully')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete read notifications'
      toast.error('Failed to delete read notifications')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    notifications,
    currentNotification,
    loading,
    error,
    // Actions
    fetchNotifications,
    fetchNotificationById,
    fetchUnreadNotifications,
    fetchReadNotifications,
    createNotification,
    updateNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,
  }
})
