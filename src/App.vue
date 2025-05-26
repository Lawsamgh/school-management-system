<template>
  <div 
    id="app" 
    :class="{ 
      'school-theme': isSchoolUser && currentSchoolId,
      [`school-${currentSchoolId}`]: isSchoolUser && currentSchoolId 
    }"
  >
    <nav class="navbar navbar-expand-lg navbar-light fixed-top glass-nav">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <template v-if="isLoading">
            Loading...
          </template>
          <template v-else>
            <img 
              v-if="isAuthenticated && schoolInfo.logo" 
              :src="schoolInfo.logo" 
              alt="School Logo" 
              height="40" 
              class="d-inline-block align-text-top me-2"
            >
            {{ schoolInfo.name || 'LS System' }}
          </template>
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto gap-3">
            <template v-if="!isLoading">
              <template v-if="!isAuthenticated">
                <li class="nav-item">
                  <a class="nav-link" @click="(e) => handleMenuItemClick('/', e)" :class="{ active: isRouteActive('/') }">
                    Home
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" @click="(e) => handleMenuItemClick('/contact', e)" :class="{ active: isRouteActive('/contact') }">Contact</a>
                </li>
              </template>
              <template v-else>
                <li class="nav-item">
                  <a class="nav-link" @click="(e) => handleMenuItemClick('/dashboard', e)" :class="{ active: isRouteActive('/dashboard') }">
                    <i class="fas fa-tachometer-alt me-1"></i>
                    Dashboard
                  </a>
                </li>
                <li class="nav-item dropdown position-static">
                  <a 
                    class="nav-link dropdown-toggle-desktop d-none d-lg-flex align-items-center" 
                    href="#" 
                    id="menuDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    data-bs-auto-close="outside"
                    aria-expanded="false"
                    @click="toggleMegaMenu"
                  >
                    <i class="fas fa-bars me-1"></i>
                    Menu
                    <i class="fas fa-chevron-down ms-1 dropdown-arrow"></i>
                  </a>
                  <!-- Mobile View: Menu Toggle -->
                  <a class="nav-link d-lg-none mobile-menu-toggle" href="#" data-bs-toggle="collapse" data-bs-target="#mobileMenuContent">
                    <i class="fas fa-bars me-1"></i>
                    Menu
                  </a>
                  <!-- Desktop Mega Menu -->
                  <div class="dropdown-menu mega-menu w-100" aria-labelledby="menuDropdown">
                    <div class="container py-4">
                      <div class="mega-menu-horizontal" v-if="userRole">
                        <!-- Dashboard First for All Users -->
                        <a class="mega-menu-item" @click="navigateTo('/dashboard')">
                            <div class="mega-menu-icon"><i class="fas fa-tachometer-alt"></i></div>
                            <div class="mega-menu-content"><h6>Dashboard</h6><p>Overview & quick access</p></div>
                        </a>

                        <!-- Activities Menu Item -->
                        <a class="mega-menu-item" @click="navigateTo('/activities')">
                          <div class="mega-menu-icon"><i class="fas fa-calendar-alt"></i></div>
                          <div class="mega-menu-content"><h6>Activities</h6><p>School activities and events</p></div>
                        </a>

                        <!-- Admin Menu Items -->
                        <template v-if="userRole === 'superadmin' || userRole === 'admin'">
                          <a class="mega-menu-item" @click="navigateTo('/onboard-school')" v-if="userRole === 'superadmin'">
                            <div class="mega-menu-icon"><i class="fas fa-school"></i></div>
                            <div class="mega-menu-content"><h6>Onboard School</h6><p>Register new school</p></div>
                          </a>
                          <a class="mega-menu-item" @click="navigateTo('/schools')" v-if="userRole === 'superadmin'">
                            <div class="mega-menu-icon"><i class="fas fa-school"></i></div>
                            <div class="mega-menu-content"><h6>All Schools</h6><p>Manage all schools</p></div>
                          </a>
                          <a class="mega-menu-item" @click="navigateTo('/users')">
                            <div class="mega-menu-icon"><i class="fas fa-users"></i></div>
                            <div class="mega-menu-content"><h6>Users</h6><p>Manage all users</p></div>
                          </a>
                          <a 
                            v-if="userRole === 'superadmin' || teacherPortalEnabled"
                            class="mega-menu-item"
                            @click="navigateTo('/teachers')"
                          >
                            <div class="mega-menu-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                            <div class="mega-menu-content"><h6>Teachers</h6><p>Manage teaching staff</p></div>
                          </a>
                          <a 
                            v-if="(userRole === 'superadmin' || userRole === 'admin') && (userRole === 'superadmin' || studentPortalEnabled)"
                            class="mega-menu-item"
                            @click="navigateTo('/students')"
                          >
                            <div class="mega-menu-icon"><i class="fas fa-user-graduate"></i></div>
                            <div class="mega-menu-content"><h6>Students</h6><p>Manage student records</p></div>
                          </a>
                          <a 
                            v-if="userRole === 'superadmin' || parentPortalEnabled"
                            class="mega-menu-item"
                            @click="navigateTo('/parents')"
                          >
                            <div class="mega-menu-icon"><i class="fas fa-user-friends"></i></div>
                            <div class="mega-menu-content"><h6>Parents</h6><p>Manage parent accounts</p></div>
                          </a>
                          <a 
                            v-if="showFinanceMenu"
                            class="mega-menu-item"
                            @click="navigateTo('/accountants')"
                          >
                            <div class="mega-menu-icon"><i class="fas fa-calculator"></i></div>
                            <div class="mega-menu-content"><h6>Accountants</h6><p>Manage accounting staff</p></div>
                          </a>
                          <a 
                            v-if="userRole === 'superadmin' || userRole === 'admin'"
                            class="mega-menu-item"
                            @click="navigateTo('/settings')"
                          >
                            <div class="mega-menu-icon"><i class="fas fa-cog"></i></div>
                            <div class="mega-menu-content"><h6>Settings</h6><p>School configuration</p></div>
                          </a>
                          <a 
                            v-if="userRole === 'superadmin' || userRole === 'admin'"
                            class="mega-menu-item"
                            @click="navigateTo('/audit-logs')"
                          >
                            <div class="mega-menu-icon"><i class="fas fa-history"></i></div>
                            <div class="mega-menu-content"><h6>Audit Logs</h6><p>System activity tracking</p></div>
                          </a>
                        </template>
                        
                        <!-- Other Role-Specific Menu Items -->
                        <template v-else-if="userRole === 'accountant' && authStore.financeModuleEnabled">
                          <a class="mega-menu-item" @click="navigateTo('/accountants')">
                            <div class="mega-menu-icon"><i class="fas fa-calculator"></i></div>
                            <div class="mega-menu-content"><h6>Accountants</h6><p>Manage accounting staff</p></div>
                          </a>
                        </template>
                        <template v-else-if="userRole === 'teacher' && teacherPortalEnabled">
                          <a class="mega-menu-item" @click="navigateTo('/teachers')">
                            <div class="mega-menu-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                            <div class="mega-menu-content"><h6>Teachers</h6><p>Manage teaching staff</p></div>
                          </a>
                        </template>
                        <template v-else-if="userRole === 'student' && studentPortalEnabled">
                          <a class="mega-menu-item" @click="navigateTo('/students')">
                            <div class="mega-menu-icon"><i class="fas fa-user-graduate"></i></div>
                            <div class="mega-menu-content"><h6>Students</h6><p>Manage student records</p></div>
                          </a>
                        </template>
                        <template v-else-if="userRole === 'parent' && parentPortalEnabled">
                          <a class="mega-menu-item" @click="navigateTo('/parents')">
                            <div class="mega-menu-icon"><i class="fas fa-user-friends"></i></div>
                            <div class="mega-menu-content"><h6>Parents</h6><p>Manage parent accounts</p></div>
                          </a>
                        </template>
                        <template v-else-if="userRole === 'registrar'">
                          <a class="mega-menu-item" @click="navigateTo('/users')">
                            <div class="mega-menu-icon"><i class="fas fa-users"></i></div>
                            <div class="mega-menu-content"><h6>New Enrollment</h6><p>Enroll a new student and parent</p></div>
                          </a>
                        </template>
                        <template v-else-if="userRole === 'admin'">
                          <a class="dropdown-item" href="/dashboard">Dashboard</a>
                          <a class="dropdown-item" href="/admin">Admin</a>
                        </template>
                      </div>
                    </div>
                  </div>
                  <!-- Mobile Menu Items -->
                  <div class="collapse mobile-menu-items" id="mobileMenuContent">
                    <div class="mobile-menu-section" v-if="userRole">
                      <!-- Dashboard First -->
                      <a class="dropdown-item" @click="handleMenuItemClick('/dashboard')">
                        <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                      </a>
                      
                      <!-- Activities Menu Item -->
                      <a class="dropdown-item" @click="handleMenuItemClick('/activities')">
                        <i class="fas fa-calendar-alt me-2"></i>Activities
                      </a>
                      
                      <!-- Role-Specific Mobile Menu Items -->
                      <template v-if="userRole === 'superadmin' || userRole === 'admin'">
                        <a v-if="userRole === 'superadmin'" class="dropdown-item" @click="handleMenuItemClick('/onboard-school')">
                          <i class="fas fa-school me-2"></i>Onboard School
                        </a>
                        <a v-if="userRole === 'superadmin'" class="dropdown-item" @click="handleMenuItemClick('/schools')">
                          <i class="fas fa-school me-2"></i>All Schools
                        </a>
                        <a class="dropdown-item" @click="handleMenuItemClick('/users')">
                          <i class="fas fa-users me-2"></i>Users
                        </a>
                        <a 
                          v-if="userRole === 'superadmin' || teacherPortalEnabled"
                          class="dropdown-item" 
                          @click="handleMenuItemClick('/teachers')"
                        >
                          <i class="fas fa-chalkboard-teacher me-2"></i>Teachers
                        </a>
                        <a 
                          v-if="(userRole === 'superadmin' || userRole === 'admin') && (userRole === 'superadmin' || studentPortalEnabled)"
                          class="dropdown-item" 
                          @click="handleMenuItemClick('/students')"
                        >
                          <i class="fas fa-user-graduate me-2"></i>Students
                        </a>
                        <a 
                          v-if="userRole === 'superadmin' || parentPortalEnabled"
                          class="dropdown-item" 
                          @click="handleMenuItemClick('/parents')"
                        >
                          <i class="fas fa-user-friends me-2"></i>Parents
                        </a>
                        <a 
                          v-if="showFinanceMenu"
                          class="dropdown-item" 
                          @click="handleMenuItemClick('/accountants')"
                        >
                          <i class="fas fa-calculator me-2"></i>Accountants
                        </a>
                        <a 
                          v-if="userRole === 'superadmin' || userRole === 'admin'"
                          class="dropdown-item" 
                          @click="handleMenuItemClick('/settings')"
                        >
                          <i class="fas fa-cog me-2"></i>Settings
                        </a>
                      </template>
                      <template v-else-if="userRole === 'accountant' && authStore.financeModuleEnabled">
                        <a class="dropdown-item" @click="handleMenuItemClick('/accountants')">
                          <i class="fas fa-calculator me-2"></i>Accountants
                        </a>
                      </template>
                      <template v-else-if="userRole === 'teacher' && teacherPortalEnabled">
                        <a class="dropdown-item" @click="handleMenuItemClick('/teachers')">
                          <i class="fas fa-chalkboard-teacher me-2"></i>Teachers
                        </a>
                      </template>
                      <template v-else-if="userRole === 'student' && studentPortalEnabled">
                        <a class="dropdown-item" @click="handleMenuItemClick('/students')">
                          <i class="fas fa-user-graduate me-2"></i>Students
                        </a>
                      </template>
                      <template v-else-if="userRole === 'parent' && parentPortalEnabled">
                        <a class="dropdown-item" @click="handleMenuItemClick('/parents')">
                          <i class="fas fa-user-friends me-2"></i>Parents
                        </a>
                      </template>
                      <template v-else-if="userRole === 'registrar'">
                        <a class="dropdown-item" @click="handleMenuItemClick('/users')">
                          <i class="fas fa-users me-2"></i>New Enrollment
                        </a>
                      </template>
                      <template v-else-if="userRole === 'admin'">
                        <a class="dropdown-item" @click="handleMenuItemClick('/dashboard')">Dashboard</a>
                        <a class="dropdown-item" @click="handleMenuItemClick('/admin')">Admin</a>
                      </template>
                    </div>
                  </div>
                </li>
              </template>
              <li class="nav-item ms-lg-3">
                <template v-if="!isAuthenticated">
                  <a class="nav-link login-btn" @click="(e) => handleMenuItemClick('/login', e)" :class="{ active: isRouteActive('/login') }">
                    <i class="fas fa-sign-in-alt"></i>
                    Login
                  </a>
                </template>
                <template v-else>
                  <button class="nav-link login-btn" @click="handleLogout">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </template>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Spacer for fixed navbar -->
    <div class="nav-spacer"></div>

    <router-view v-slot="{ Component }" :key="route.fullPath">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <AppFooter v-if="!isAuthenticated && !isLoading && route.path !== '/login'" />

    <!-- Use the LogoutModal component -->
    <LogoutModal 
      :show="showLogoutPrompt" 
      :loading="logoutLoading" 
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import { logActivity } from '@/lib/auditLogger'
import AppFooter from '@/components/AppFooter.vue'
import LogoutModal from '@/components/LogoutModal.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap'
import '@fortawesome/fontawesome-free/css/all.css'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isLoading = ref(true)
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)
const studentPortalEnabled = ref(false)
const teacherPortalEnabled = ref(false)
const parentPortalEnabled = ref(false)

interface SchoolInfo {
  name: string;
  logo?: string | null;
  email: string;
  phone: string;
  address: string;
}

const schoolInfo = ref<SchoolInfo>({
  name: 'LS System',
  logo: null,
  email: '',
  phone: '',
  address: ''
})

const showLogoutPrompt = ref(false)
const logoutLoading = ref(false)

const currentSchoolId = computed(() => {
  return authStore.userRole?.school_id || authStore.getSelectedSchoolId
})

const isSchoolUser = computed(() => {
  const role = authStore.userRole?.role?.toLowerCase()
  return role === 'admin' || role === 'teacher' || role === 'student'
})

// Watch for changes in authentication state
watch(
  isAuthenticated,
  (newValue) => {
    if (!newValue) {
      // Reset school info when user becomes unauthenticated
      schoolInfo.value = {
        name: 'LS System',
        logo: null,
        email: '',
        phone: '',
        address: ''
      }
      isLoading.value = false
    }
  }
)

// Watch for changes in the auth store's school_id
watch(
  () => authStore.userRole?.school_id,
  async (newSchoolId) => {
    if (newSchoolId) {
      isLoading.value = true
      await fetchSchoolInfo(newSchoolId)
      isLoading.value = false
    }
  }
)

const handleLogout = () => {
  showLogoutPrompt.value = true
}

const confirmLogout = async () => {
  logoutLoading.value = true
  try {
    // Get user information before signing out for audit logging
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    
    // Get school ID before signing out
    const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
    const userRoleId = authStore.userRole?.id
    
    // Log the logout action if we have a user ID - BEFORE signing out
    if (userId) {
      try {
        // Create the audit log entry directly with supabase to ensure all data is available
        const { error } = await supabase.from('audit_logs').insert({
          user_id: userId,
          user_role_id: userRoleId,
          school_id: schoolId || '00000000-0000-0000-0000-000000000000',
          action: 'logout',
          table_name: 'auth',
          record_id: String(userId),
          old_values: { timestamp: new Date().toISOString() },
          new_values: null,
          ip_address: 'client-side',
          user_agent: navigator.userAgent
        })
        
        if (error) {
          console.error('Error logging logout activity:', error)
        }
      } catch (logError) {
        console.error('Failed to log logout activity:', logError)
      }
    }
    
    // Now sign out after logging
    await authStore.signOut()
    
    // Reset school info to default values
    schoolInfo.value = {
      name: 'LS System',
      logo: null,
      email: '',
      phone: '',
      address: ''
    }
    showLogoutPrompt.value = false
    toast.success('Successfully logged out')
    router.push('/login')
    collapseMobileMenu()
  } catch (error) {
    toast.error('Error logging out')
  } finally {
    logoutLoading.value = false
  }
}

const cancelLogout = () => {
  showLogoutPrompt.value = false
}

// Check if a route is active (for highlighting active menu items)
const isRouteActive = (path: string): boolean => {
  // If it's the home route
  if (path === '/' && route.path === '/') {
    return true;
  }
  // For other routes, check if the current route starts with the path
  return path !== '/' && route.path.startsWith(path);
}

// Function to collapse mobile menu and navigate if needed
const collapseMobileMenu = (route = null) => {
  console.log('collapseMobileMenu called with route:', route);
  
  // Force close the navbar toggler
  const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement
  if (navbarToggler && navbarToggler.getAttribute('aria-expanded') === 'true') {
    navbarToggler.click()
  }
  
  // Force close the dropdown menu
  const mobileMenuContent = document.getElementById('mobileMenuContent')
  if (mobileMenuContent && mobileMenuContent.classList.contains('show')) {
    const menuToggle = document.querySelector('a[data-bs-target="#mobileMenuContent"]') as HTMLElement
    if (menuToggle) {
      menuToggle.click()
    }
  }
  
  // If a route is provided, navigate to it immediately
  if (route) {
    router.push(route).catch(err => {
      console.error('Navigation error:', err);
    });
  }
}

// Update the handleMenuItemClick function
const handleMenuItemClick = async (route: string, event: Event | null = null) => {
  if (event) {
    event.preventDefault()
  }
  
  // Close mega menu if open
  closeMegaMenu()
  
  // Close mobile menu
  closeMobileMenu()
  
  // Close the navbar collapse
  const navbarCollapse = document.getElementById('navbarNav')
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement
    if (navbarToggler) {
      navbarToggler.click()
    }
  }
  
  // Navigate to the route
  try {
    await router.push(route)
  } catch (err) {
    console.error('Navigation error:', err)
  }
}

// Update the navigateTo function
const navigateTo = async (path: string) => {
  // Close mega menu dropdown if open
  closeMegaMenu()

  // Close mobile menu if open
  closeMobileMenu()

  // Close the navbar collapse
  const navbarCollapse = document.getElementById('navbarNav')
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement
    if (navbarToggler) {
      navbarToggler.click()
    }
  }

  // Navigate to the path
  try {
    await router.push(path)
  } catch (error) {
    console.error('Navigation error:', error)
  }
}

// Update the closeMobileMenu function
const closeMobileMenu = () => {
  const mobileMenu = document.getElementById('mobileMenuContent')
  const navbarCollapse = document.getElementById('navbarNav')
  
  // Close mobile menu dropdown
  if (mobileMenu && mobileMenu.classList.contains('show')) {
    const bsCollapse = new bootstrap.Collapse(mobileMenu)
    bsCollapse.hide()
  }
  
  // Close navbar collapse
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    const bsCollapse = new bootstrap.Collapse(navbarCollapse)
    bsCollapse.hide()
  }
}

// Add this function to close mega menu
const closeMegaMenu = () => {
  const megaMenu = document.querySelector('.mega-menu')
  const menuToggle = document.querySelector('.dropdown-toggle-desktop')
  
  if (megaMenu && menuToggle) {
    megaMenu.classList.remove('show')
    menuToggle.setAttribute('aria-expanded', 'false')
  }
}

// Update the style for mega menu items
const style = document.createElement('style')
style.textContent = `
  .mega-menu-item[role="button"] {
    cursor: pointer;
  }
  
  .mega-menu-item[role="button"]:hover {
    background-color: rgba(var(--primary-rgb), 0.05);
}
`
document.head.appendChild(style)

// Add click outside handler
onMounted(async () => {
  document.body.classList.add('bg-light')
  isLoading.value = true
  
  // Add click outside handler
  document.addEventListener('click', (event) => {
    const megaMenu = document.querySelector('.mega-menu')
    const menuToggle = document.querySelector('.dropdown-toggle-desktop')
    
    if (megaMenu && menuToggle) {
      const clickedElement = event.target as HTMLElement
      const isClickInside = megaMenu.contains(clickedElement) || menuToggle.contains(clickedElement)
      
      if (!isClickInside && megaMenu.classList.contains('show')) {
        megaMenu.classList.remove('show')
        menuToggle.setAttribute('aria-expanded', 'false')
      }
    }
  })
  
  // Initialize Bootstrap components
  const initializeDropdowns = () => {
    const dropdownElementList = document.querySelectorAll('[data-bs-toggle="dropdown"]')
  dropdownElementList.forEach(dropdownToggleEl => {
      // Remove existing dropdown instance if it exists
      const existingDropdown = bootstrap.Dropdown.getInstance(dropdownToggleEl)
      if (existingDropdown) {
        existingDropdown.dispose()
      }
      // Create new dropdown instance
      new bootstrap.Dropdown(dropdownToggleEl, {
        autoClose: 'outside'
      })
    })
  }

  // Initial initialization
  initializeDropdowns()

  // Re-initialize dropdowns when route changes
  router.afterEach(() => {
    nextTick(() => {
      initializeDropdowns()
    })
  })
  
  try {
    await authStore.checkUser()
    
    // If user is authenticated and has a school_id, fetch school info
    if (authStore.isAuthenticated && authStore.userRole?.school_id) {
      await fetchSchoolInfo(authStore.userRole.school_id)
    }
    
    // If user is authenticated and on login page, redirect to dashboard
    if (authStore.isAuthenticated && router.currentRoute.value.path === '/login') {
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Error during initialization:', error)
  } finally {
    isLoading.value = false
  }
})

// Add watch for route changes to reinitialize dropdowns
watch(
  () => route.path,
  () => {
    nextTick(() => {
      const dropdownElementList = document.querySelectorAll('[data-bs-toggle="dropdown"]')
      dropdownElementList.forEach(dropdownToggleEl => {
        if (!bootstrap.Dropdown.getInstance(dropdownToggleEl)) {
          new bootstrap.Dropdown(dropdownToggleEl, {
            autoClose: 'outside'
          })
        }
      })
    })
  }
)

// Function to fetch the school info, including student_portal setting
const fetchSchoolInfo = async (schoolId?: string) => {
  try {
    isLoading.value = true
    console.log('Fetching school info for ID:', schoolId)
    
    // If user is not SuperAdmin and has a school_id, fetch from setup table using school_id
    if (userRole.value !== 'superadmin' && schoolId) {
      // First check for the setup record to get student_portal setting
      const { data: setupData, error: setupError } = await supabase
        .from('setup')
        .select('*')
        .eq('school_id', schoolId)
        .single()
        
      if (!setupError && setupData) {
        // Look for student_portal field (case insensitive)
        const setupDataKeys = Object.keys(setupData)
        const studentPortalField = setupDataKeys.find(key => 
          key.toLowerCase() === 'student_portal'
        )
        
        // Update the student portal enabled state
        if (studentPortalField) {
          const value = setupData[studentPortalField]
          studentPortalEnabled.value = String(value).toUpperCase() === 'YES'
        } else {
          studentPortalEnabled.value = false
        }
        
        // Look for teacher_portal field (case insensitive)
        const teacherPortalField = setupDataKeys.find(key => 
          key.toLowerCase() === 'teacher_portal'
        )
        
        // Update the teacher portal enabled state
        if (teacherPortalField) {
          const value = setupData[teacherPortalField]
          teacherPortalEnabled.value = String(value).toUpperCase() === 'YES'
        } else {
          teacherPortalEnabled.value = false
        }
        
        // Look for parent_portal field (case insensitive)
        const parentPortalField = setupDataKeys.find(key => 
          key.toLowerCase() === 'parent_portal'
        )
        
        // Update the parent portal enabled state
        if (parentPortalField) {
          const value = setupData[parentPortalField]
          parentPortalEnabled.value = String(value).toUpperCase() === 'YES'
        } else {
          parentPortalEnabled.value = false
        }
        
        console.log('Student portal enabled:', studentPortalEnabled.value)
        console.log('Teacher portal enabled:', teacherPortalEnabled.value)
        console.log('Parent portal enabled:', parentPortalEnabled.value)
        
        // Extract school info from setup data
        schoolInfo.value = {
          name: setupData.school_name || 'LS System',
          logo: setupData.school_logo || null,
          email: setupData.school_email || '',
          phone: setupData.school_contact1 || '',
          address: setupData.school_address || ''
        }
      }
    } else if (userRole.value === 'superadmin') {
      // For SuperAdmin, fetch from setup table without school_id filter
      const { data, error } = await supabase
        .from('setup')
        .select('school_name, school_logo, school_email, school_contact1, school_address, student_portal, teacher_portal, parent_portal')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          isLoading.value = false
          return
        }
        throw error
      }

      if (data) {
        // Update portal enabled states for superadmin
        studentPortalEnabled.value = String(data.student_portal || '').toUpperCase() === 'YES'
        teacherPortalEnabled.value = String(data.teacher_portal || '').toUpperCase() === 'YES'
        parentPortalEnabled.value = String(data.parent_portal || '').toUpperCase() === 'YES'
        console.log('Student portal enabled (superadmin):', studentPortalEnabled.value)
        console.log('Teacher portal enabled (superadmin):', teacherPortalEnabled.value)
        console.log('Parent portal enabled (superadmin):', parentPortalEnabled.value)
        
        schoolInfo.value = {
          name: data.school_name || 'LS System',
          logo: data.school_logo || null,
          email: data.school_email || '',
          phone: data.school_contact1 || '',
          address: data.school_address || ''
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching school info:', error)
    schoolInfo.value = {
      name: 'LS System',
      logo: null,
      email: '',
      phone: '',
      address: ''
    }
    studentPortalEnabled.value = false
    teacherPortalEnabled.value = false
    parentPortalEnabled.value = false
  } finally {
    isLoading.value = false
  }
}

// Add computed property for finance menu visibility
const showFinanceMenu = computed(() => {
  const role = userRole.value?.toLowerCase() || ''
  
  // Always show for superadmin
  if (role === 'superadmin') {
    return true
  }
  
  // For other roles, check if finance module is enabled
  return authStore.financeModuleEnabled && ['admin', 'accountant'].includes(role)
})

// Add this function to handle menu toggle
const toggleMegaMenu = (event: Event) => {
  event.preventDefault()
  const dropdownToggle = event.currentTarget as HTMLElement
  const megaMenu = document.querySelector('.mega-menu') as HTMLElement
  const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true'
  
  if (isExpanded) {
    dropdownToggle.setAttribute('aria-expanded', 'false')
    megaMenu.classList.remove('show')
  } else {
    dropdownToggle.setAttribute('aria-expanded', 'true')
    megaMenu.classList.add('show')
  }
}

const applySchoolTheme = async (schoolId: string) => {
  try {
    const { data: theme } = await supabase
      .from('school_themes')
      .select('*')
      .eq('school_id', schoolId)
      .single()

    if (theme) {
      const schoolClass = `.school-${schoolId}`
      const root = document.documentElement
      const styleSheet = document.createElement('style')
      
      // Convert hex to RGB for rgba() usage
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null
      }

      const primaryRgb = hexToRgb(theme.primary_color)
      const secondaryRgb = hexToRgb(theme.secondary_color)

      styleSheet.textContent = `
        ${schoolClass} {
          --primary: ${theme.primary_color};
          --secondary: ${theme.secondary_color};
          --accent: ${theme.accent_color};
          --text: ${theme.text_color};
          --background: ${theme.background_color};
          --primary-rgb: ${primaryRgb ? `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}` : '66, 184, 131'};
          --secondary-rgb: ${secondaryRgb ? `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}` : '53, 73, 94'};
        }
      `
      
      // Remove any existing style for this school
      const existingStyle = document.querySelector(`style[data-school-id="${schoolId}"]`)
      if (existingStyle) {
        existingStyle.remove()
      }

      // Add the new style
      styleSheet.setAttribute('data-school-id', schoolId)
      document.head.appendChild(styleSheet)
    }
  } catch (error) {
    console.error('Error applying school theme:', error)
  }
}

// Watch for school changes
watch(currentSchoolId, (newSchoolId) => {
  if (newSchoolId && isSchoolUser.value) {
    applySchoolTheme(newSchoolId)
  }
})

onMounted(() => {
  if (currentSchoolId.value && isSchoolUser.value) {
    applySchoolTheme(currentSchoolId.value)
  }
})
</script>

<style lang="scss">
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.glass-nav {
  background: var(--background);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &.navbar {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .navbar-brand {
    font-weight: 600;
    color: var(--text);
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    img {
      object-fit: contain;
    }

    &:hover {
      color: var(--primary);
    }
  }

  .nav-link {
    position: relative;
    font-weight: 500;
    padding: 0.5rem 0;
    margin: 0 0.25rem;
    color: var(--text);
    transition: color 0.3s ease;
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background-color: var(--primary);
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    &:hover {
      color: var(--primary);
    }

    &:hover::after,
    &.active::after {
      width: 100%;
    }

    &.active {
      color: var(--primary);
    }

    &.login-btn {
      background-color: transparent;
      color: var(--primary);
      padding: 0.6rem 1.5rem;
      border: 2px solid var(--primary);
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        font-size: 1rem;
        transition: transform 0.3s ease;
      }

      &:hover, &.active {
        background-color: var(--primary);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(66, 184, 131, 0.2);

        i {
          transform: translateX(2px);
        }
      }

      &:active {
        transform: translateY(0);
      }

      &.active {
        transform: none;
        background-color: var(--primary);
        color: white;
      }

      @media (max-width: 991.98px) {
        width: 100%;
        margin: 0.5rem 0;
        text-align: center;
        justify-content: center;
      }
    }
  }

  .navbar-toggler {
    border: none;
    padding: 0.5rem;
    
    &:focus {
      box-shadow: none;
      outline: none;
    }
  }
}

// Spacer to prevent content from hiding behind fixed navbar
.nav-spacer {
  height: 76px; // Adjust this value based on your navbar height
}

// Add smooth scroll behavior
html {
  scroll-behavior: smooth;
}

// Responsive adjustments
@media (max-width: 991.98px) {
  .mega-menu {
    display: none !important;
  }

  .navbar-nav {
    padding: 1rem 0;
    
    .nav-item.dropdown {
      .nav-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        &::after {
          margin-left: 0.5rem;
        }
      }
      
      &.show .nav-link {
        color: var(--primary);
      }
    }
  }

  .navbar-collapse {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
}

// Add mobile menu items
@media (max-width: 991.98px) {
  .mobile-menu-items {
    display: block;
  }
}

@media (min-width: 992px) {
  .mobile-menu-items {
    display: none;
  }
}

// Remove unused mega menu styles
.mega-menu-cards,
.mega-menu-grid,
.mega-grid-item,
.quick-links-container,
.quick-link-item,
.mega-card {
  display: none;
}

// Keep only the necessary mega menu styles for the admin menu
.mega-menu {
  margin-top: 0.5rem;
  border: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: slideDown 0.3s ease forwards;
  position: absolute;
  left: 0;
  right: 0;
  background: var(--background);
  z-index: 1050;
  padding: 1.5rem;
  display: none;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  top: calc(100% + 0.5rem); /* Position it slightly lower */

  &.show {
    display: block;
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mega-menu-horizontal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.mega-menu-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background: var(--background);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  color: inherit;

  &:hover {
    transform: translateY(-2px);
    background: rgba(var(--primary-rgb), 0.05);
    border-color: var(--primary);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.1);
  }

  .mega-menu-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-rgb), 0.1);
    border-radius: 12px;
    margin-right: 1rem;
    flex-shrink: 0;

    i {
      font-size: 1.5rem;
      color: var(--primary);
    }
  }

  .mega-menu-content {
    flex-grow: 1;
    
    h6 {
      color: var(--text);
      margin: 0;
      font-weight: 600;
      font-size: 1rem;
    }

    p {
      color: var(--text-light, #666);
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      opacity: 0.8;
    }
  }
}

// Dropdown toggle desktop styles
.dropdown-toggle-desktop {
  position: relative;
  padding: 0.5rem 1rem !important;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(var(--primary-rgb), 0.1);
  }

  &[aria-expanded="true"] {
    background: rgba(var(--primary-rgb), 0.15);
    color: var(--primary);

    .dropdown-arrow {
      transform: rotate(180deg);
    }
  }
  
  .dropdown-arrow {
    transition: transform 0.2s ease;
  }
}

// Mobile menu item styles
.mobile-menu-items {
  .dropdown-item {
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }
    
    &:hover {
      background-color: rgba(var(--primary-rgb), 0.1);
      color: var(--primary);
      
      i {
        transform: translateX(2px);
      }
    }
    
    i {
      transition: transform 0.2s ease;
    }
  }
}

// Default theme (for superadmin and fallback)
:root {
  --primary: #42b883;
  --secondary: #35495e;
  --accent: #42b883;
  --text: #2c3e50;
  --background: #ffffff;
  --primary-rgb: 66, 184, 131;
  --secondary-rgb: 53, 73, 94;
}

// User dropdown styles
.user-dropdown {
  min-width: 280px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: var(--background);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
  overflow: hidden;

  .user-header {
    padding: 1.25rem;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%);
    color: white;

    .user-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .user-role {
      opacity: 0.9;
      font-size: 0.875rem;
    }
  }

  .dropdown-item {
    padding: 0.75rem 1.25rem;
    color: var(--text);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    i {
      color: var(--primary);
      font-size: 1rem;
      opacity: 0.8;
      transition: all 0.2s ease;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary);

      i {
        opacity: 1;
        transform: scale(1.1);
      }
    }

    &.danger {
      color: var(--danger);
      border-top: 1px solid var(--border);

      i {
        color: var(--danger);
      }

      &:hover {
        background: rgba(var(--danger-rgb), 0.1);
        color: var(--danger);
      }
    }
  }

  .school-selector {
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--border);
    background: var(--background-light);

    label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    select {
      width: 100%;
      padding: 0.5rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--background);
      color: var(--text);
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }
    }
  }
}
</style> 