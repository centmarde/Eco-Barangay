import { ref } from 'vue'

/**
 * Composable for handling collection deletion confirmations
 */
export const useDeleteConfirmation = () => {
  const showDeleteAllDialog = ref(false)
  const confirmationCode = ref('')
  const generatedCode = ref('')
  const isValidConfirmation = ref(false)
  const deleteLoading = ref(false)

  /**
   * Generates a random 6-digit confirmation code
   */
  const generateConfirmationCode = (): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    generatedCode.value = code
    return code
  }

  /**
   * Validates if the user typed the correct 6-digit confirmation code
   */
  const validateConfirmation = (code: string): boolean => {
    const isValid = code.trim() === generatedCode.value
    isValidConfirmation.value = isValid
    return isValid
  }

  /**
   * Formats the code input to only allow numbers and limit to 6 digits
   */
  const formatCodeInput = (input: string): string => {
    // Remove non-numeric characters and limit to 6 digits
    const cleanedInput = input.replace(/\D/g, '').slice(0, 6)
    return cleanedInput
  }

  /**
   * Resets the confirmation dialog state
   */
  const resetConfirmation = () => {
    confirmationCode.value = ''
    generatedCode.value = ''
    isValidConfirmation.value = false
    deleteLoading.value = false
    showDeleteAllDialog.value = false
  }

  /**
   * Opens the delete all confirmation dialog and generates a new code
   */
  const openDeleteAllDialog = () => {
    resetConfirmation()
    generateConfirmationCode()
    showDeleteAllDialog.value = true
  }

  /**
   * Gets the confirmation message for delete all operation
   */
  const getDeleteAllMessage = (selectedStatus: string, totalCount: number): string => {
    const statusText = selectedStatus === 'all' ? 'ALL' : selectedStatus.toUpperCase().replace('_', ' ')
    return `You are about to delete ${totalCount} ${statusText} collection${totalCount !== 1 ? 's' : ''}. This action cannot be undone.`
  }

  return {
    showDeleteAllDialog,
    confirmationCode,
    generatedCode,
    isValidConfirmation,
    deleteLoading,
    validateConfirmation,
    formatCodeInput,
    resetConfirmation,
    openDeleteAllDialog,
    getDeleteAllMessage,
    generateConfirmationCode
  }
}
