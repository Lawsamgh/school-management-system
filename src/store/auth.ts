import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UserRole {
  id: string
  email: string
  username: string
  role: 'superadmin' | 'admin' | 'teacher' | 'student' | 'parent' | 'accountant'
  created_at: string
  school_id: string | null
}

interface School {
  id: string
  name: string
  email: string
  phone: string
  address: string
  school_type: string
  year: string
  logo_url: string | null
  start_date: string
  end_date: string
}

interface AuthState {
  user: User | null
  userRole: UserRole | null
  school: School | null
  loading: boolean
  selectedSchoolId: string | null
  financeModuleEnabled: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    userRole: null,
    school: null,
    loading: false,
    selectedSchoolId: null,
    financeModuleEnabled: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    userRoleDisplay: (state) => state.userRole?.role || 'No Role Assigned',
    currentSchool: (state) => state.school,
    getSelectedSchoolId: (state) => state.selectedSchoolId
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
    },

    setFinanceModuleEnabled(enabled: boolean) {
      this.financeModuleEnabled = enabled
    },

    setSelectedSchoolId(schoolId: string | null) {
      this.selectedSchoolId = schoolId
      // Store in localStorage for persistence
      if (schoolId) {
        localStorage.setItem('selectedSchoolId', schoolId)
      } else {
        localStorage.removeItem('selectedSchoolId')
      }
    },

    async fetchUserRole() {
      if (!this.user?.email) return null

      try {
        const userEmail = this.user.email.toLowerCase()
        console.log('Attempting to fetch role for email:', userEmail)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Error getting session:', sessionError.message)
          return
        }

        // First get user role
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('email', userEmail)
          .single()

        if (error) {
          console.error('Error fetching role:', error.message)
          this.userRole = null
          return
        }

        console.log('User role data:', {
          role: userRoles.role,
          school_id: userRoles.school_id,
          username: userRoles.username
        })

        // Debug: Check if school exists
        if (userRoles.school_id) {
          const { data: schoolCheck, error: schoolCheckError } = await supabase
            .from('schools')
            .select('id, name')
            .order('created_at', { ascending: false })
            .limit(5)

          console.log('Recent schools in database:', schoolCheck)
        }

        this.userRole = userRoles
        
        // For superadmin, we don't need a school_id, they can select any school
        if (userRoles.role === 'superadmin') {
          const storedSchoolId = localStorage.getItem('selectedSchoolId')
          if (storedSchoolId) {
            this.selectedSchoolId = storedSchoolId
            await this.fetchSchoolDetails(storedSchoolId)
          }
        } 
        // For other roles, use their assigned school_id
        else if (userRoles.school_id) {
          await this.fetchSchoolDetails(userRoles.school_id)
        }

        console.log('Final user state:', {
          role: this.userRole?.role,
          hasSchool: !!this.school,
          schoolName: this.school?.name,
          selectedSchoolId: this.selectedSchoolId,
          schoolId: userRoles.school_id // Add this to debug
        })
      } catch (error) {
        console.error('Error fetching user role:', error)
        this.userRole = null
      }
    },

    async fetchSchoolDetails(schoolId: string) {
      try {
        console.log('Starting school details fetch for ID:', schoolId)
        
        if (!schoolId) {
          console.log('No school ID provided')
          this.school = null
          return
        }

        // Get the current session to ensure we have the auth token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Error getting session:', sessionError.message)
          return
        }

        if (!session) {
          console.error('No active session')
          return
        }

        console.log('Fetching with auth token for user:', session.user.email)

        // Then try to fetch the specific school
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id, name, email, phone, address, school_type, year, logo_url, start_date, end_date')
          .eq('id', schoolId)
          .single()

        if (schoolError) {
          console.error('Error fetching school details:', schoolError.message)
          this.school = null
          return
        }

        if (!schoolData) {
          console.error('No school found with id:', schoolId)
          this.school = null
          return
        }

        console.log('Successfully fetched school details:', {
          id: schoolData.id,
          name: schoolData.name,
          start_date: schoolData.start_date,
          end_date: schoolData.end_date
        })

        this.school = schoolData
      } catch (error) {
        console.error('Error fetching school details:', error)
        this.school = null
      }
    },

    async validateSchoolDates(): Promise<boolean> {
      // Skip validation for superadmin
      if (this.userRole?.role === 'superadmin') {
        return true
      }

      if (!this.school) {
        console.error('Cannot validate dates: No school details available')
        return false
      }

      const currentDate = new Date().toISOString().split('T')[0]
      const startDate = this.school.start_date
      const endDate = this.school.end_date

      console.log('Validating school dates:', {
        currentDate,
        startDate,
        endDate,
        isValid: currentDate >= startDate && currentDate <= endDate
      })

      return currentDate >= startDate && currentDate <= endDate
    },

    async checkUser() {
      try {
        this.loading = true
        const { data: { user } } = await supabase.auth.getUser()
        this.user = user
        
        if (user) {
          console.log('Authenticated user email:', user.email)
          await this.fetchUserRole()
          
          // Add date validation for non-superadmin users
          if (this.userRole?.role !== 'superadmin') {
            const isValid = await this.validateSchoolDates()
            if (!isValid) {
              await this.signOut()
              throw new Error('School session has expired')
            }
            
            // Check finance module setting for non-superadmin users
            await this.checkFinanceModuleEnabled()
          } else {
            // For superadmin, always enable finance module
            this.financeModuleEnabled = true
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
        this.user = null
        this.userRole = null
        this.school = null
        throw error
      } finally {
        this.loading = false
      }
    },

    async checkFinanceModuleEnabled() {
      try {
        // Skip if not authenticated
        if (!this.user || !this.userRole) {
          console.log('User not authenticated, skipping finance check')
          this.financeModuleEnabled = false
          return
        }
        
        // Skip for superadmin, they always have finance enabled
        if (this.userRole?.role === 'superadmin') {
          this.financeModuleEnabled = true
          return
        }
        
        // Get the school_id
        const schoolId = this.userRole?.school_id
        if (!schoolId) {
          console.log('No school ID found, finance module disabled')
          this.financeModuleEnabled = false
          return
        }
        
        // Fetch the setup record
        const { data, error } = await supabase
          .from('setup')
          .select('*')
          .eq('school_id', schoolId)
          .single()
          
        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No setup record found for school, finance module disabled')
            this.financeModuleEnabled = false
            return
          }
          throw error
        }
        
        // Find finance field, looking for various possible names
        const setupDataKeys = Object.keys(data)
        const financeField = setupDataKeys.find(key => 
          key.toLowerCase() === 'finance' || 
          key.toLowerCase() === 'financefield'
        )
        
        // Check if finance module is enabled
        const financeValue = financeField ? data[financeField] || 'No' : 'No'
        this.financeModuleEnabled = String(financeValue).toUpperCase() === 'YES'
        
        console.log('Finance module enabled:', this.financeModuleEnabled)
      } catch (error) {
        console.error('Error checking finance module:', error)
        // Default to disabled on error
        this.financeModuleEnabled = false
      }
    },

    async signOut() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.userRole = null
        this.school = null
        this.selectedSchoolId = null
        localStorage.removeItem('selectedSchoolId')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }
  }
}) 