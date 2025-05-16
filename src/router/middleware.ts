import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

// List of routes that don't need school validation
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/contact']

export async function validateSchoolSession(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Skip validation for public routes
  if (publicRoutes.includes(to.path)) {
    return next()
  }

  const authStore = useAuthStore()
  const toast = useToast()

  // Skip validation for superadmin
  if (authStore.userRole?.role?.toLowerCase() === 'superadmin') {
    return next()
  }

  try {
    const schoolId = authStore.userRole?.school_id

    if (!schoolId) {
      console.error('No school ID available')
      toast.error('School data not available')
      return next('/login')
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
      return next('/login')
    }

    if (!schoolData || !schoolData.end_date) {
      console.error('No end date set for school')
      toast.error('School session end date not set')
      return next('/login')
    }

    const currentDate = new Date().toISOString().split('T')[0]
    const isValid = currentDate <= schoolData.end_date

    if (!isValid) {
      toast.error('School session has expired')
      await authStore.signOut()
      return next('/login')
    }

    return next()
  } catch (error) {
    console.error('Error in school validation:', error)
    toast.error('Failed to validate school session')
    return next('/login')
  }
} 