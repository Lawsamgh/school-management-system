<template>
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
                <a class="nav-link dropdown-toggle-desktop d-none d-lg-flex align-items-center" href="#" id="menuDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                        <router-link to="/dashboard" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-tachometer-alt"></i></div>
                          <div class="mega-menu-content"><h6>Dashboard</h6><p>Overview & quick access</p></div>
                      </router-link>

                      <!-- Activities Menu Item -->
                      <router-link to="/activities" class="mega-menu-item">
                        <div class="mega-menu-icon"><i class="fas fa-calendar-alt"></i></div>
                        <div class="mega-menu-content"><h6>Activities</h6><p>School activities and events</p></div>
                      </router-link>

                      <!-- Admin Menu Items -->
                      <template v-if="userRole === 'superadmin' || userRole === 'admin'">
                        <router-link to="/onboard-school" class="mega-menu-item" v-if="userRole === 'superadmin'">
                          <div class="mega-menu-icon"><i class="fas fa-school"></i></div>
                          <div class="mega-menu-content"><h6>Onboard School</h6><p>Register new school</p></div>
                        </router-link>
                        <router-link to="/users" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-users"></i></div>
                          <div class="mega-menu-content"><h6>Users</h6><p>Manage all users</p></div>
                        </router-link>
                        <router-link 
                          v-if="userRole === 'superadmin' || teacherPortalEnabled"
                          to="/teachers" 
                          class="mega-menu-item"
                        >
                          <div class="mega-menu-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                          <div class="mega-menu-content"><h6>Teachers</h6><p>Manage teaching staff</p></div>
                        </router-link>
                        <router-link 
                          v-if="(userRole === 'superadmin' || userRole === 'admin') && (userRole === 'superadmin' || studentPortalEnabled)"
                          to="/students" 
                          class="mega-menu-item"
                        >
                          <div class="mega-menu-icon"><i class="fas fa-user-graduate"></i></div>
                          <div class="mega-menu-content"><h6>Students</h6><p>Manage student records</p></div>
                        </router-link>
                        <router-link 
                          v-if="userRole === 'superadmin' || parentPortalEnabled"
                          to="/parents" 
                          class="mega-menu-item"
                        >
                          <div class="mega-menu-icon"><i class="fas fa-user-friends"></i></div>
                          <div class="mega-menu-content"><h6>Parents</h6><p>Manage parent accounts</p></div>
                        </router-link>
                        <router-link 
                          v-if="isAuthenticated && (userRole === 'superadmin' || authStore.financeModuleEnabled)"
                          to="/accountants" 
                          class="mega-menu-item"
                        >
                          <div class="mega-menu-icon"><i class="fas fa-calculator"></i></div>
                          <div class="mega-menu-content"><h6>Accountants</h6><p>Manage accounting staff</p></div>
                        </router-link>
                        <router-link to="/courses" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-graduation-cap"></i></div>
                          <div class="mega-menu-content"><h6>Courses</h6><p>Manage academic courses</p></div>
                        </router-link>
                        <router-link to="/classes" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-clock"></i></div>
                          <div class="mega-menu-content"><h6>Classes</h6><p>Manage class schedules</p></div>
                        </router-link>
                        <router-link to="/engagements" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-running"></i></div>
                          <div class="mega-menu-content"><h6>Engagements</h6><p>Manage school engagements</p></div>
                        </router-link>
                        <router-link 
                          v-if="userRole === 'superadmin' || userRole === 'admin'"
                          to="/settings" 
                          class="mega-menu-item"
                        >
                          <div class="mega-menu-icon"><i class="fas fa-cog"></i></div>
                          <div class="mega-menu-content"><h6>Settings</h6><p>School configuration</p></div>
                        </router-link>
                      </template>
                      
                      <!-- Other Role-Specific Menu Items -->
                      <template v-else-if="userRole === 'accountant' && authStore.financeModuleEnabled">
                        <router-link to="/accountants" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-calculator"></i></div>
                          <div class="mega-menu-content"><h6>Accountants</h6><p>Manage accounting staff</p></div>
                        </router-link>
                      </template>
                      <template v-else-if="userRole === 'teacher' && teacherPortalEnabled">
                        <router-link to="/teachers" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                          <div class="mega-menu-content"><h6>Teachers</h6><p>Manage teaching staff</p></div>
                        </router-link>
                      </template>
                      <template v-else-if="userRole === 'student' && studentPortalEnabled">
                        <router-link to="/students" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-user-graduate"></i></div>
                          <div class="mega-menu-content"><h6>Students</h6><p>Manage student records</p></div>
                        </router-link>
                      </template>
                      <template v-else-if="userRole === 'parent' && parentPortalEnabled">
                        <router-link to="/parents" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-user-friends"></i></div>
                          <div class="mega-menu-content"><h6>Parents</h6><p>Manage parent accounts</p></div>
                        </router-link>
                      </template>
                      <template v-else-if="userRole === 'registrar'">
                        <router-link to="/users" class="mega-menu-item">
                          <div class="mega-menu-icon"><i class="fas fa-users"></i></div>
                          <div class="mega-menu-content"><h6>New Enrollment</h6><p>Enroll a new student and parent</p></div>
                        </router-link>
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
                    <a class="dropdown-item" @click="(e) => handleMenuItemClick('/dashboard', e)" :class="{ active: isRouteActive('/dashboard') }">
                      <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                    </a>
                    
                    <!-- Activities Menu Item -->
                    <a class="dropdown-item" @click="(e) => handleMenuItemClick('/activities', e)" :class="{ active: isRouteActive('/activities') }">
                      <i class="fas fa-calendar-alt me-2"></i>Activities
                    </a>
                    
                    <!-- Role-Specific Mobile Menu Items -->
                    <template v-if="userRole === 'superadmin' || userRole === 'admin'">
                      <a v-if="userRole === 'superadmin'" class="dropdown-item" @click="(e) => handleMenuItemClick('/onboard-school', e)" :class="{ active: isRouteActive('/onboard-school') }">
                        <i class="fas fa-school me-2"></i>Onboard School
                      </a>
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/users', e)" :class="{ active: isRouteActive('/users') }">
                        <i class="fas fa-users me-2"></i>Users
                      </a>
                      <a 
                        v-if="userRole === 'superadmin' || teacherPortalEnabled"
                        class="dropdown-item" 
                        @click="(e) => handleMenuItemClick('/teachers', e)" 
                        :class="{ active: isRouteActive('/teachers') }"
                      >
                        <i class="fas fa-chalkboard-teacher me-2"></i>Teachers
                      </a>
                      <a 
                        v-if="(userRole === 'superadmin' || userRole === 'admin') && (userRole === 'superadmin' || studentPortalEnabled)"
                        class="dropdown-item" 
                        @click="(e) => handleMenuItemClick('/students', e)" 
                        :class="{ active: isRouteActive('/students') }"
                      >
                        <i class="fas fa-user-graduate me-2"></i>Students
                      </a>
                      <a 
                        v-if="userRole === 'superadmin' || parentPortalEnabled"
                        class="dropdown-item" 
                        @click="(e) => handleMenuItemClick('/parents', e)" 
                        :class="{ active: isRouteActive('/parents') }"
                      >
                        <i class="fas fa-user-friends me-2"></i>Parents
                      </a>
                      <a 
                        v-if="isAuthenticated && (userRole === 'superadmin' || authStore.financeModuleEnabled)"
                        class="dropdown-item" 
                        @click="(e) => handleMenuItemClick('/accountants', e)" 
                        :class="{ active: isRouteActive('/accountants') }"
                      >
                        <i class="fas fa-calculator me-2"></i>Accountants
                      </a>
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/courses', e)" :class="{ active: isRouteActive('/courses') }">
                        <i class="fas fa-graduation-cap me-2"></i>Courses
                      </a>
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/classes', e)" :class="{ active: isRouteActive('/classes') }">
                        <i class="fas fa-clock me-2"></i>Classes
                      </a>
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/engagements', e)" :class="{ active: isRouteActive('/engagements') }">
                        <i class="fas fa-running me-2"></i>Engagements
                      </a>
                      <a 
                        v-if="userRole === 'superadmin' || userRole === 'admin'"
                        class="dropdown-item" 
                        @click="(e) => handleMenuItemClick('/settings', e)" 
                        :class="{ active: isRouteActive('/settings') }"
                      >
                        <i class="fas fa-cog me-2"></i>Settings
                      </a>
                    </template>
                    <template v-else-if="userRole === 'accountant' && authStore.financeModuleEnabled">
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/accountants', e)" :class="{ active: isRouteActive('/accountants') }">
                        <i class="fas fa-calculator me-2"></i>Accountants
                      </a>
                    </template>
                    <template v-else-if="userRole === 'teacher' && teacherPortalEnabled">
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/teachers', e)" :class="{ active: isRouteActive('/teachers') }">
                        <i class="fas fa-chalkboard-teacher me-2"></i>Teachers
                      </a>
                    </template>
                    <template v-else-if="userRole === 'student' && studentPortalEnabled">
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/students', e)" :class="{ active: isRouteActive('/students') }">
                        <i class="fas fa-user-graduate me-2"></i>Students
                      </a>
                    </template>
                    <template v-else-if="userRole === 'parent' && parentPortalEnabled">
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/parents', e)" :class="{ active: isRouteActive('/parents') }">
                        <i class="fas fa-user-friends me-2"></i>Parents
                      </a>
                    </template>
                    <template v-else-if="userRole === 'registrar'">
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/users', e)" :class="{ active: isRouteActive('/users') }">
                        <i class="fas fa-users me-2"></i>New Enrollment
                      </a>
                    </template>
                    <template v-else-if="userRole === 'admin'">
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/dashboard', e)" :class="{ active: isRouteActive('/dashboard') }">Dashboard</a>
                      <a class="dropdown-item" @click="(e) => handleMenuItemClick('/admin', e)" :class="{ active: isRouteActive('/admin') }">Admin</a>
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

  <!-- Modern Logout Confirmation -->
  <Transition name="fade">
    <div v-if="showLogoutPrompt" class="modern-prompt-overlay">
      <div class="modern-prompt-container">
        <div class="modern-prompt-icon">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <h3>Ready to Leave?</h3>
        <p>Are you sure you want to log out?</p>
        <div class="modern-prompt-actions">
          <button class="modern-btn cancel-btn" @click="cancelLogout">
            <i class="fas fa-times"></i>
            Cancel
          </button>
          <button class="modern-btn confirm-btn" @click="confirmLogout" :disabled="logoutLoading">
            <i class="fas fa-check"></i>
            {{ logoutLoading ? 'Logging out...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import AppFooter from '@/components/AppFooter.vue'
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

// Specific handler for menu item clicks
const handleMenuItemClick = async (route: string, event: Event | null = null) => {
  if (event) {
    event.preventDefault();
  }
  
  // Close any open dropdowns
  const dropdowns = document.querySelectorAll('.dropdown-menu.show')
  dropdowns.forEach(dropdown => {
    const bsDropdown = window.bootstrap.Dropdown.getInstance(dropdown.previousElementSibling as HTMLElement)
    if (bsDropdown) {
      bsDropdown.hide()
    }
  })
  
  // Close mobile menu if open
  const mobileMenuContent = document.getElementById('mobileMenuContent')
  if (mobileMenuContent && mobileMenuContent.classList.contains('show')) {
    const menuToggle = document.querySelector('a[data-bs-target="#mobileMenuContent"]') as HTMLElement
    if (menuToggle) {
      menuToggle.click()
    }
  }
  
  // Close navbar if open
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

const navigateTo = async (path: string) => {
  // Close mega menu dropdown if open
  const megaMenuDropdown = document.querySelector('.mega-menu.show')
  if (megaMenuDropdown) {
    const dropdownToggle = megaMenuDropdown.previousElementSibling as HTMLElement
    const bsDropdown = window.bootstrap.Dropdown.getInstance(dropdownToggle)
    if (bsDropdown) {
      bsDropdown.hide()
    }
  }

  // Close mobile menu if open
  const mobileMenu = document.getElementById('mobileMenuContent')
  if (mobileMenu && mobileMenu.classList.contains('show')) {
    const bsCollapse = new bootstrap.Collapse(mobileMenu)
    bsCollapse.hide()
  }

  // Close navbar if open
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

// Update the style for mega menu items
const style = document.createElement('style')
style.textContent = `
  .mega-menu-item[role="button"] {
    cursor: pointer;
  }
  
  .mega-menu-item[role="button"]:hover {
    background-color: rgba(66, 184, 131, 0.05);
}
`
document.head.appendChild(style)

// Initialize auth state and Bootstrap components
onMounted(async () => {
  document.body.classList.add('bg-light')
  isLoading.value = true
  
  // Initialize Bootstrap components
  const dropdownElementList = document.querySelectorAll('.dropdown-toggle')
  dropdownElementList.forEach(dropdownToggleEl => {
    new bootstrap.Dropdown(dropdownToggleEl)
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
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &.navbar {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .navbar-brand {
    font-weight: bold;
    color: #2c3e50;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    img {
      object-fit: contain;
    }

    &:hover {
      color: #42b883;
    }
  }

  .nav-link {
    position: relative;
    font-weight: 500;
    padding: 0.5rem 0;
    margin: 0 0.25rem;
    color: #2c3e50;
    transition: color 0.3s ease;
    cursor: pointer;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background-color: #42b883;
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    &:hover {
      color: #42b883;
    }

    &:hover::after,
    &.active::after {
      width: 100%;
    }

    &.active {
      color: #42b883;
    }

    &.login-btn {
      background-color: transparent;
      color: #42b883;
      padding: 0.6rem 1.5rem;
      border: 2px solid #42b883;
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
        background-color: #42b883;
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
        background-color: #42b883;
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
        color: #42b883;
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
  border: none;
  border-radius: 0 0 1rem 1rem;
  margin-top: 0;
  padding: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border-top: 3px solid #42b883;
  transform-origin: top;
  animation: megaMenuOpen 0.3s ease;
}

@keyframes megaMenuOpen {
  from {
    opacity: 0;
    transform: translateY(-10px) scaleY(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}

.mega-menu-horizontal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.mega-menu-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(66, 184, 131, 0.1);

  &:hover {
    transform: translateY(-5px);
    background: rgba(66, 184, 131, 0.05);
    border-color: #42b883;
  }

  .mega-menu-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(66, 184, 131, 0.1);
    border-radius: 12px;
    margin-right: 1rem;

    i {
      font-size: 1.5rem;
      color: #42b883;
    }
  }

  .mega-menu-content {
    h6 {
      color: #2c3e50;
      margin: 0;
      font-weight: 600;
    }

    p {
      color: #666;
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
    }
  }
}

// Mobile menu adjustments
@media (max-width: 991.98px) {
  .nav-link, 
  .dropdown-item, 
  .mobile-menu-toggle {
    cursor: pointer !important;
    
    &:active {
      opacity: 0.7;
    }
  }
  
  .mobile-menu-section {
    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      cursor: pointer;
      
      i {
        width: 24px;
        color: #42b883;
      }
    }
  }
  
  .mobile-menu-toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    
    &:active {
      opacity: 0.7;
    }
  }
}

.mega-menu-item.router-link-active,
.mega-menu-item.router-link-exact-active {
  background: #e6f7f0;
  border-color: #42b883;
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.08);
  color: #42b883;
}

.dropdown-item.router-link-active,
.dropdown-item.router-link-exact-active {
  background: #42b883;
  color: #fff;
}

.navbar-nav a, 
.dropdown-toggle-desktop,
.mobile-menu-toggle,
.dropdown-item,
.nav-link {
  cursor: pointer !important;
}

// Modern Prompt Styles
.modern-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1060;
}

.modern-prompt-container {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.modern-prompt-icon {
  width: 64px;
  height: 64px;
  background: #42b883;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  i {
    font-size: 28px;
    color: white;
  }
}

.modern-prompt-container h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.modern-prompt-container p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.modern-prompt-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modern-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  
  i {
    font-size: 0.875rem;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.cancel-btn {
  background: #f3f4f6;
  color: #4b5563;
  
  &:hover:not(:disabled) {
    background: #e5e7eb;
    transform: translateY(-1px);
  }
}

.confirm-btn {
  background: #42b883;
  color: white;
  
  &:hover:not(:disabled) {
    background: darken(#42b883, 5%);
    transform: translateY(-1px);
  }
}

// Fade transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style> 