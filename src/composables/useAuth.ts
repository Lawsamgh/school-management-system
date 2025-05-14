import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

export function useAuth() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()
  const toast = useToast()

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Set the user first
      authStore.setUser(data.user)
      
      // Then immediately fetch the user role and validate dates
      await authStore.fetchUserRole()

      // Check school dates for non-superadmin users
      if (authStore.userRole?.role !== 'superadmin') {
        const isValid = await authStore.validateSchoolDates()
        if (!isValid) {
          await authStore.signOut()
          throw new Error('School session has expired')
        }
      }

      // Only show welcome message if everything is valid
      toast.success('Welcome back!')
      return { success: true }
      
    } catch (e: any) {
      if (e.message === 'School session has expired') {
        error.value = 'Your school session has expired. Please contact the administrator.'
      } else {
        error.value = e.message
      }
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    login
  }
} 