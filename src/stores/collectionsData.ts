import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'

// Type definitions
export type Collection = {
  id: number
  created_at: string
  address: string
  request_by: string
  collector_assign: string
  status: string
  garbage_type: string
}

export type CollectionWithFeedback = Collection & {
  feedbacks?: Array<{
    id: number
    title: string
    rate: number
    description: string
    user_id: string
  }>
}

export type CollectionWithUsers = Collection & {
  requester?: {
    id: string
    email: string
    user_metadata: Record<string, any>
  }
  collector?: {
    id: string
    email: string
    user_metadata: Record<string, any>
  }
}

export type CreateCollectionData = {
  address: string
  request_by: string
  collector_assign: string
  status: string
  garbage_type: string
}

export type UpdateCollectionData = {
  address?: string
  request_by?: string
  collector_assign?: string
  status?: string
  garbage_type?: string
}

export const useCollectionsStore = defineStore('collections', () => {
  const toast = useToast()

  // State
  const collections = ref<Collection[]>([])
  const currentCollection = ref<Collection | undefined>(undefined)
  const loading = ref(false)
  const error = ref<string | undefined>(undefined)

  // Actions
  const fetchCollections = async () => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      collections.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collections'
      toast.error('Failed to fetch collections')
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionById = async (id: number) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      currentCollection.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collection'
      toast.error('Failed to fetch collection')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionsByRequestBy = async (userId: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('request_by', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collections by requester'
      toast.error('Failed to fetch collections by requester')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionsByCollectorAssign = async (userId: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('collector_assign', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collections by collector'
      toast.error('Failed to fetch collections by collector')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionsByStatus = async (status: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collections by status'
      toast.error('Failed to fetch collections by status')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionsByGarbageType = async (garbageType: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('garbage_type', garbageType)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collections by garbage type'
      toast.error('Failed to fetch collections by garbage type')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionWithFeedback = async (collectionId: number) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select(`
          *,
          feedbacks (
            id,
            title,
            rate,
            description,
            user_id
          )
        `)
        .eq('id', collectionId)
        .single()

      if (fetchError) throw fetchError

      return data as CollectionWithFeedback
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collection with feedback'
      toast.error('Failed to fetch collection with feedback')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionsWithFeedback = async () => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select(`
          *,
          feedbacks (
            id,
            title,
            rate,
            description,
            user_id
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data as CollectionWithFeedback[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collections with feedback'
      toast.error('Failed to fetch collections with feedback')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionWithUsers = async (collectionId: number) => {
    loading.value = true
    error.value = undefined

    try {
      const { data: collectionData, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single()

      if (fetchError) throw fetchError

      // Fetch requester details
      const { data: requester } = await supabase.auth.admin.getUserById(collectionData.request_by)

      // Fetch collector details
      const { data: collector } = await supabase.auth.admin.getUserById(collectionData.collector_assign)

      return {
        ...collectionData,
        requester: requester?.user,
        collector: collector?.user,
      } as CollectionWithUsers
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collection with users'
      toast.error('Failed to fetch collection with users')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionsByUserId = async (userId: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .or(`request_by.eq.${userId},collector_assign.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collections by user'
      toast.error('Failed to fetch collections by user')
      return []
    } finally {
      loading.value = false
    }
  }

  const searchCollectionsByAddress = async (searchTerm: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .ilike('address', `%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      return data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search collections by address'
      toast.error('Failed to search collections by address')
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCollectionStatsByCollector = async (collectorId: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('status')
        .eq('collector_assign', collectorId)

      if (fetchError) throw fetchError

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((c) => c.status === 'pending').length || 0,
        inProgress: data?.filter((c) => c.status === 'in_progress').length || 0,
        completed: data?.filter((c) => c.status === 'completed').length || 0,
        cancelled: data?.filter((c) => c.status === 'cancelled').length || 0,
      }

      return stats
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch collection stats'
      toast.error('Failed to fetch collection stats')
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      }
    } finally {
      loading.value = false
    }
  }

  const createCollection = async (collectionData: CreateCollectionData) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: createError } = await supabase
        .from('collections')
        .insert([collectionData])
        .select()
        .single()

      if (createError) throw createError

      if (data) {
        collections.value.unshift(data)
      }

      toast.success('Collection created successfully')
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create collection'
      toast.error('Failed to create collection')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const updateCollection = async (id: number, collectionData: UpdateCollectionData) => {
    loading.value = true
    error.value = undefined

    try {
      const { data, error: updateError } = await supabase
        .from('collections')
        .update(collectionData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        const index = collections.value.findIndex((c) => c.id === id)
        if (index !== -1) {
          collections.value[index] = data
        }
      }

      toast.success('Collection updated successfully')
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update collection'
      toast.error('Failed to update collection')
      return undefined
    } finally {
      loading.value = false
    }
  }

  const updateCollectionStatus = async (id: number, status: string) => {
    return await updateCollection(id, { status })
  }

  const assignCollector = async (id: number, collectorId: string) => {
    return await updateCollection(id, { collector_assign: collectorId })
  }

  const deleteCollection = async (id: number) => {
    loading.value = true
    error.value = undefined

    try {
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      collections.value = collections.value.filter((c) => c.id !== id)
      toast.success('Collection deleted successfully')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete collection'
      toast.error('Failed to delete collection')
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteCollectionsByUserId = async (userId: string) => {
    loading.value = true
    error.value = undefined

    try {
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .or(`request_by.eq.${userId},collector_assign.eq.${userId}`)

      if (deleteError) throw deleteError

      collections.value = collections.value.filter(
        (c) => c.request_by !== userId && c.collector_assign !== userId
      )
      toast.success('User collections deleted successfully')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user collections'
      toast.error('Failed to delete user collections')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    collections,
    currentCollection,
    loading,
    error,
    // Actions
    fetchCollections,
    fetchCollectionById,
    fetchCollectionsByRequestBy,
    fetchCollectionsByCollectorAssign,
    fetchCollectionsByStatus,
    fetchCollectionsByGarbageType,
    fetchCollectionWithFeedback,
    fetchCollectionsWithFeedback,
    fetchCollectionWithUsers,
    fetchCollectionsByUserId,
    searchCollectionsByAddress,
    fetchCollectionStatsByCollector,
    createCollection,
    updateCollection,
    updateCollectionStatus,
    assignCollector,
    deleteCollection,
    deleteCollectionsByUserId,
  }
})
