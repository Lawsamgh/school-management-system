import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'

export function useSchoolValidation() {
  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const validateSchoolSession = async (): Promise<boolean> => {
    // Skip validation for superadmin
    if (authStore.userRole?.role?.toLowerCase() === 'superadmin') {
      return true
    }

    try {
      // Get the current school_id
      const schoolId = authStore.userRole?.school_id
      
      if (!schoolId) {
        console.error('No school ID available')
        toast.error('School data not available')
        return false
      }

      // Fetch fresh school data from Supabase
      const { data: schoolData, error } = await supabase
        .from('schools')
        .select('end_date')
        .eq('id', schoolId)
        .single()

      if (error) {
        console.error('Error fetching school data:', error)
        toast.error('Failed to validate school session')
        return false
      }

      if (!schoolData || !schoolData.end_date) {
        console.error('No end date set for school')
        toast.error('School session end date not set')
        return false
      }

      const currentDate = new Date().toISOString().split('T')[0]
      const isValid = currentDate <= schoolData.end_date

      if (!isValid) {
        toast.error('School session has expired')
        await authStore.signOut()
        router.push('/login')
      }

      return isValid
    } catch (error) {
      console.error('Error in school validation:', error)
      toast.error('Failed to validate school session')
      return false
    }
  }

  const withSchoolValidation = async (callback: () => Promise<void> | void) => {
    try {
      const isValid = await validateSchoolSession()
      if (isValid) {
        await callback()
      }
    } catch (error) {
      console.error('Error in school validation:', error)
      toast.error('An error occurred while validating school session')
    }
  }

  return {
    validateSchoolSession,
    withSchoolValidation
  }
} 