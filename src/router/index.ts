import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'
import { validateSchoolSession } from './middleware'
import { supabase } from '@/lib/supabase'
// @ts-ignore - Bootstrap types are not available
import 'bootstrap'
import AuditLogs from '@/components/AuditLogs.vue'

// Type declaration for Bootstrap Dropdown instance
declare global {
  interface Window {
    bootstrap: {
      Dropdown: {
        getInstance(element: Element): { hide(): void } | null
      }
    }
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/ActivitiesView.vue'),
    meta: { requiresAuth: true, allowedRoles: ['superadmin', 'admin', 'teacher', 'student', 'parent', 'accountant', 'registrar'] }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  // Protected Routes
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teachers',
    name: 'Teachers',
    component: () => import('@/views/TeachersView.vue'),
    meta: { requiresAuth: true },
    beforeEnter: async (to, from, next) => {
      const authStore = useAuthStore()
      const toast = useToast()
      
      // Always allow superadmin
      if (authStore.userRole?.role?.toLowerCase() === 'superadmin') {
        return next()
      }
      
      // For other roles, check teacher_portal setting
      try {
        // Get school_id
        const schoolId = authStore.userRole?.school_id
        
        if (!schoolId) {
          toast.error('Missing school information')
          return next('/dashboard')
        }
        
        // Query setup table for teacher_portal field
        const { data, error } = await supabase
          .from('setup')
          .select('*')
          .eq('school_id', schoolId)
          .single()
          
        if (error) {
          console.error('Error checking teacher portal status:', error)
          return next('/dashboard')
        }
        
        // Look for teacher_portal field (case insensitive)
        if (data) {
          const setupDataKeys = Object.keys(data)
          const teacherPortalField = setupDataKeys.find(key => 
            key.toLowerCase() === 'teacher_portal'
          )
          
          // Check if teacher portal is enabled
          if (teacherPortalField && String(data[teacherPortalField]).toUpperCase() === 'YES') {
            return next()
          }
        }
        
        // If we get here, teacher portal is disabled
        toast.error('Teacher portal is disabled')
        return next('/dashboard')
      } catch (error) {
        console.error('Error in teacher route guard:', error)
        return next('/dashboard')
      }
    }
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('@/views/StudentsView.vue'),
    meta: { requiresAuth: true },
    beforeEnter: async (to, from, next) => {
      const authStore = useAuthStore()
      const toast = useToast()
      
      // Always allow superadmin
      if (authStore.userRole?.role?.toLowerCase() === 'superadmin') {
        return next()
      }
      
      // For other roles, check student_portal setting
      try {
        // Get school_id
        const schoolId = authStore.userRole?.school_id
        
        if (!schoolId) {
          toast.error('Missing school information')
          return next('/dashboard')
        }
        
        // Query setup table for student_portal field
        const { data, error } = await supabase
          .from('setup')
          .select('*')
          .eq('school_id', schoolId)
          .single()
          
        if (error) {
          console.error('Error checking student portal status:', error)
          return next('/dashboard')
        }
        
        // Look for student_portal field (case insensitive)
        if (data) {
          const setupDataKeys = Object.keys(data)
          const studentPortalField = setupDataKeys.find(key => 
            key.toLowerCase() === 'student_portal'
          )
          
          // Check if student portal is enabled
          if (studentPortalField && String(data[studentPortalField]).toUpperCase() === 'YES') {
            return next()
          }
        }
        
        // If we get here, student portal is disabled
        toast.error('Student portal is disabled')
        return next('/dashboard')
      } catch (error) {
        console.error('Error in student route guard:', error)
        return next('/dashboard')
      }
    }
  },
  {
    path: '/parents',
    name: 'Parents',
    component: () => import('@/views/ParentsView.vue'),
    meta: { requiresAuth: true },
    beforeEnter: async (to, from, next) => {
      const authStore = useAuthStore()
      const toast = useToast()
      
      // Always allow superadmin
      if (authStore.userRole?.role?.toLowerCase() === 'superadmin') {
        return next()
      }
      
      // For other roles, check parent_portal setting
      try {
        // Get school_id
        const schoolId = authStore.userRole?.school_id
        
        if (!schoolId) {
          toast.error('Missing school information')
          return next('/dashboard')
        }
        
        // Query setup table for parent_portal field
        const { data, error } = await supabase
          .from('setup')
          .select('*')
          .eq('school_id', schoolId)
          .single()
          
        if (error) {
          console.error('Error checking parent portal status:', error)
          return next('/dashboard')
        }
        
        // Look for parent_portal field (case insensitive)
        if (data) {
          const setupDataKeys = Object.keys(data)
          const parentPortalField = setupDataKeys.find(key => 
            key.toLowerCase() === 'parent_portal'
          )
          
          // Check if parent portal is enabled
          if (parentPortalField && String(data[parentPortalField]).toUpperCase() === 'YES') {
            return next()
          }
        }
        
        // If we get here, parent portal is disabled
        toast.error('Parent portal is disabled')
        return next('/dashboard')
      } catch (error) {
        console.error('Error in parent route guard:', error)
        return next('/dashboard')
      }
    }
  },
  {
    path: '/accountants',
    name: 'Accountants',
    component: () => import('@/views/AccountantsView.vue'),
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      const toast = useToast()
      
      // Always allow superadmin
      if (authStore.userRole?.role?.toLowerCase() === 'superadmin') {
        return next()
      }
      
      // For other roles, check finance module
      if (authStore.financeModuleEnabled) {
        return next()
      } else {
        toast.error('Finance module is disabled')
        return next('/dashboard')
      }
    }
  },
  {
    path: '/courses',
    name: 'Course Management',
    component: () => import('@/views/ProgramManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/classes',
    name: 'Classes',
    component: () => import('@/views/ClassesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/engagements',
    name: 'Engagement Management',
    component: () => import('@/views/ActivityManagementView.vue'),
    meta: { requiresAuth: true }
  },
  // Academic Routes
  {
    path: '/grades',
    name: 'Grades',
    component: () => import('@/views/GradesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: () => import('@/views/AttendanceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/views/PaymentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('@/views/DocumentsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['superadmin', 'admin']
    }
  },
  // Communication Routes
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/MessagesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('@/views/AnnouncementsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/CalendarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('@/views/HelpView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/onboard-school',
    name: 'OnboardSchool',
    component: () => import('@/views/OnboardSchool.vue'),
    meta: { requiresAuth: true, allowedRoles: ['superadmin'] }
  },
  {
    path: '/audit-logs',
    name: 'audit-logs',
    component: AuditLogs,
    meta: {
      requiresAuth: true,
      allowedRoles: ['superadmin', 'admin']
    }
  },
  // Test route for PromptModal
  {
    path: '/test-modal',
    name: 'TestModal',
    component: () => import('@/views/TestPromptModal.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const toast = useToast()
  
  try {
    // Check user session on first navigation
    if (!authStore.isAuthenticated) {
      await authStore.checkUser()
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    const allowedRoles = to.meta.allowedRoles as string[] | undefined

    // Check role-based access
    if (requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else if (requiresGuest && authStore.isAuthenticated) {
      next('/dashboard')
    } else if (requiresAuth && allowedRoles && !allowedRoles.includes(authStore.userRole?.role?.toLowerCase() || '')) {
      next('/dashboard')
    } else {
      // Validate school dates for non-superadmin users
      if (requiresAuth && authStore.isAuthenticated && authStore.userRole?.role !== 'superadmin') {
        const isValid = await authStore.validateSchoolDates()
        if (!isValid) {
          await authStore.signOut()
          toast.error('Your school session has expired. Please contact the administrator.')
          next('/login')
          return
        }
      }
      next()
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'School session has expired') {
      toast.error('Your school session has expired. Please contact the administrator.')
      next('/login')
    } else {
      console.error('Navigation error:', error)
      next('/login')
    }
  }
})

// Add afterEach hook to clean up UI after navigation
router.afterEach(() => {
  // Close any open menus/dropdowns after navigation completes
  const dropdowns = document.querySelectorAll('.dropdown-menu.show')
  dropdowns.forEach(dropdown => {
    const bsDropdown = window.bootstrap.Dropdown.getInstance(dropdown.previousElementSibling as HTMLElement)
    if (bsDropdown) {
      bsDropdown.hide()
    }
  })

  // Close mobile menu if open
  const navbarCollapse = document.getElementById('navbarNav')
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement
    if (navbarToggler) {
      navbarToggler.click()
    }
  }
})

// Add the validation middleware
router.beforeEach(validateSchoolSession)

export default router 