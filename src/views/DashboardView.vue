<template>
  <div class="dashboard">
    <div class="container py-5">
      <div class="row g-3">
        <!-- Welcome Card -->
        <div class="col-12" v-motion-slide-visible-once-bottom>
          <div class="welcome-card" :class="{ 'skeleton-loading': loading }">
            <div class="content">
              <template v-if="!loading">
                <div class="welcome-header">
                  <div class="user-info">
                    <h1>Welcome Back, <span class="text-primary">{{ userName }}</span></h1>
                    <p class="lead mb-0">Manage your enrollments and activities from your personal dashboard.</p>
                    <div class="role-badge mt-3">
                      <i class="fas fa-user-tag me-2"></i>
                      {{ userRole }}
                    </div>
                    <button 
                      v-if="['student', 'parent'].includes(userRole?.toLowerCase())"
                      class="change-password-btn ms-3 mt-3 pulse"
                      @click="handleChangePassword"
                      title="Change Password"
                    >
                      <i class="fas fa-key me-2"></i>
                      Change Password
                    </button>
                    <div 
                      v-if="userRole?.toLowerCase() === 'admin' && authStore.school?.end_date"
                      class="school-expiry mt-3 ms-3"
                    >
                      <i class="fas fa-calendar-alt me-2"></i>
                      School Session Ends: 
                      <span class="expiry-date">
                        {{ new Date(authStore.school.end_date).toLocaleDateString() }}
                      </span>
                    </div>
                  </div>
                  <div class="avatar">
                    {{ userInitials }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="skeleton-text skeleton-title"></div>
                <div class="skeleton-text skeleton-subtitle"></div>
                <div class="skeleton-badge mt-3"></div>
              </template>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="row g-3">
          <!-- Students Stats -->
          <div class="col-md-4" v-motion-slide-visible-once-bottom>
            <div class="stat-card" :class="{ 'skeleton-loading': loading }">
              <template v-if="!loading">
                <div class="stat-icon">
                  <i class="fas fa-book-reader"></i>
                </div>
                <div class="stat-content">
                  <h3>Students</h3>
                  <p class="stat-number">{{ studentCount }}</p>
                  <p class="stat-label">Active Enrollments</p>
                </div>
              </template>
              <template v-else>
                <div class="skeleton-icon"></div>
                <div class="stat-content">
                  <div class="skeleton-text skeleton-sm"></div>
                  <div class="skeleton-text skeleton-lg"></div>
                  <div class="skeleton-text skeleton-sm"></div>
                </div>
              </template>
            </div>
          </div>
          
          <!-- Teachers Stats -->
          <div class="col-md-4" v-motion-slide-visible-once-bottom>
            <div class="stat-card" :class="{ 'skeleton-loading': loading }">
              <template v-if="!loading">
                <div class="stat-icon">
                  <i class="fas fa-user-tie"></i>
                </div>
                <div class="stat-content">
                  <h3>Teachers</h3>
                  <p class="stat-number">{{ teacherCount }}</p>
                  <p class="stat-label">Active Teachers</p>
                </div>
              </template>
              <template v-else>
                <div class="skeleton-icon"></div>
                <div class="stat-content">
                  <div class="skeleton-text skeleton-sm"></div>
                  <div class="skeleton-text skeleton-lg"></div>
                  <div class="skeleton-text skeleton-sm"></div>
                </div>
              </template>
            </div>
          </div>
          
          <!-- Students 2 Stats -->
          <div class="col-md-4" v-motion-slide-visible-once-bottom>
            <div class="stat-card" :class="{ 'skeleton-loading': loading }">
              <template v-if="!loading">
                <div class="stat-icon">
                  <i class="fas fa-book-reader"></i>
                </div>
                <div class="stat-content">
                  <h3>Students 2</h3>
                  <p class="stat-number">{{ studentCount }}</p>
                  <p class="stat-label">Active Enrollments</p>
                </div>
              </template>
              <template v-else>
                <div class="skeleton-icon"></div>
                <div class="stat-content">
                  <div class="skeleton-text skeleton-sm"></div>
                  <div class="skeleton-text skeleton-lg"></div>
                  <div class="skeleton-text skeleton-sm"></div>
                </div>
              </template>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div 
            v-if="!isStudentOrParent" 
            class="col-md-12" 
            v-motion-slide-visible-once-bottom
          >
            <div class="dashboard-card" :class="{ 'skeleton-loading': loading }">
              <div class="card-header">
                <template v-if="!loading">
                  <h2>Quick Actions</h2>
                </template>
                <template v-else>
                  <div class="skeleton-text skeleton-md"></div>
                </template>
              </div>
              <div class="quick-actions">
                <template v-if="!loading">
                  <button 
                    v-if="isRegistrarOrHigher"
                    class="action-button" 
                    @click="showAddUserModal = true"
                  >
                    <i class="fas fa-plus-circle"></i>
                    <span>New Enrollment</span>
                  </button>

                  <router-link 
                    v-if="isAdminOrHigher"
                    to="/accountants"
                    class="action-button"
                  >
                    <i class="fas fa-file-invoice"></i>
                    <span>Fees and Admission Payments</span>
                  </router-link>

                  <button 
                    class="action-button"
                    @click="handleChangePassword"
                  >
                    <i class="fas fa-key"></i>
                    <span>Change Password</span>
                  </button>

                  <router-link 
                    v-if="isTeacherOrHigher"
                    to="/teachers"
                    class="action-button"
                  >
                    <i class="fas fa-chalkboard"></i>
                    <span>My Classroom</span>
                  </router-link>

                  <router-link 
                    v-if="userRole?.toLowerCase() === 'superadmin' || userRole?.toLowerCase() === 'admin'"
                    to="/settings"
                    class="action-button settings-button"
                  >
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                  </router-link>
                </template>
                <template v-else>
                  <div class="skeleton-action-button" v-for="n in 4" :key="n"></div>
                </template>
              </div>
            </div>
          </div>
          
          <!-- Recent Activities or Recent Payments -->
          <div 
            class="col-md-12" 
            v-motion-slide-visible-once-bottom
          >
            <div class="dashboard-card" :class="{ 'skeleton-loading': loading }">
              <div class="card-header">
                <template v-if="!loading">
                  <h2>{{ isAdminOrHigher ? 'Recent Payments' : 'Recent Activities' }}</h2>
                  <router-link 
                    v-if="isAdminOrHigher" 
                    to="/accountants" 
                    class="btn btn-outline-primary btn-sm"
                  >
                    View All
                  </router-link>
                  <button v-else class="btn btn-outline-primary btn-sm">View All</button>
                </template>
                <template v-else>
                  <div class="skeleton-text skeleton-md"></div>
                  <div class="skeleton-button"></div>
                </template>
              </div>

              <!-- Payment Table for Accountants, Admins and Superadmins -->
              <div 
                v-if="userRole?.toLowerCase() === 'superadmin' || userRole?.toLowerCase() === 'admin'"
                class="payments-table-container"
              >
                <div class="responsive-table">
                  <table class="table align-middle modern-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Payment ID</th>
                        <th>Payment For</th>
                        <th>Amount</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="payment in recentPayments" :key="payment.payment_id" class="payment-row">
                        <td>
                          <div class="student-info">
                            <div class="student-avatar">
                              {{ getStudentInitials(payment.student_name) }}
                            </div>
                            <div class="student-details">
                              <span class="student-name">{{ payment.student_name }}</span>
                              <small class="student-id" v-if="payment.identification">ID: {{ payment.identification }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="payment-id-container">
                            <div class="id-box">
                              <span class="payment-id">{{ payment.payment_id }}</span>
                            </div>
                            <div class="date-box" v-if="payment.payment_date">
                              <span class="payment-date">
                                {{ new Date(payment.payment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) }}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="payment-purpose">
                            {{ payment.payment_for ? payment.payment_for : 'Not specified' }}
                          </span>
                        </td>
                        <td>
                          <div class="amount-container">
                            <span class="amount-display">
                              GHC {{ formatAmount(payment.amount) }}
                            </span>
                            <span class="amount-status" v-if="payment.amount_remaining > 0">
                              <i class="fas fa-circle-exclamation status-icon"></i>
                              <small>Balance: {{ formatAmount(payment.amount_remaining) }}</small>
                            </span>
                            <span class="amount-status paid" v-else>
                              <i class="fas fa-circle-check status-icon"></i>
                              <small>Fully Paid</small>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span class="payment-method" :class="'method-' + payment.payment_type?.toLowerCase()">
                            <i 
                              :class="{
                                'fas fa-money-bill-wave': payment.payment_type?.toLowerCase() === 'cash',
                                'fas fa-mobile-alt': payment.payment_type?.toLowerCase() === 'momo',
                                'fas fa-university': payment.payment_type?.toLowerCase() === 'bank',
                                'fas fa-credit-card': !payment.payment_type || !['cash', 'momo', 'bank'].includes(payment.payment_type?.toLowerCase())
                              }" 
                              class="method-icon"
                            ></i>
                            {{ payment.payment_type }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-if="recentPayments.length === 0" class="empty-state p-4 text-center">
                    <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                    <h4>No recent payments</h4>
                    <p class="text-muted">No payment records found in the system.</p>
                  </div>
                  <div v-else-if="recentPayments.length > 5" class="view-all-link">
                    <router-link to="/accountants">
                      View all payments <i class="fas fa-arrow-right"></i>
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Regular Activity List for Other Roles -->
              <div v-else class="activity-list">
                <template v-if="!loading">
                  <div class="activity-item">
                    <div class="activity-icon bg-success-light">
                      <i class="fas fa-check-circle text-success"></i>
                    </div>
                    <div class="activity-content">
                      <h4>Program Enrollment Confirmed</h4>
                      <p>Your enrollment in "Early Learning Program" has been confirmed</p>
                      <span class="activity-time">2 hours ago</span>
                    </div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon bg-info-light">
                      <i class="fas fa-info-circle text-info"></i>
                    </div>
                    <div class="activity-content">
                      <h4>New Schedule Update</h4>
                      <p>Swimming class schedule has been updated for next week</p>
                      <span class="activity-time">1 day ago</span>
                    </div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon bg-warning-light">
                      <i class="fas fa-bell text-warning"></i>
                    </div>
                    <div class="activity-content">
                      <h4>Payment Reminder</h4>
                      <p>Upcoming payment due for "Music Classes"</p>
                      <span class="activity-time">2 days ago</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="activity-item" v-for="n in 3" :key="n">
                    <div class="skeleton-activity-icon"></div>
                    <div class="activity-content">
                      <div class="skeleton-text skeleton-md"></div>
                      <div class="skeleton-text skeleton-lg"></div>
                      <div class="skeleton-text skeleton-sm"></div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Monthly Payment Chart -->
          <div 
            v-if="showChart"
            class="col-12 mt-3" 
            v-motion-slide-visible-once-bottom
          >
            <PaymentChart />
          </div>

          <!-- Student/Parent View -->
          <div class="row g-4" v-if="isStudentOrParent">
            <!-- Student/Parent specific content -->
          </div>

          <!-- Stats Section -->
          <div class="row g-4" v-if="!isStudentOrParent">
            <div class="col-md-6 col-lg-3" v-if="isRegistrarOrHigher">
              <!-- Stats content -->
            </div>
            <div class="col-md-6 col-lg-3" v-if="isAdminOrHigher">
              <!-- Stats content -->
            </div>
            <div class="col-md-6 col-lg-3" v-if="isTeacherOrHigher">
              <!-- Stats content -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <AddUserModal 
      v-model="showAddUserModal"
      @user-added="() => showAddUserModal = false"
    />
    <ChangePasswordModal
      v-model="showChangePasswordModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { useAuthStore } from '@/store/auth'
import AddUserModal from '@/components/AddUserModal.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import PaymentChart from '@/components/PaymentChart.vue'
import { getPayments, getPaymentsByDateRange } from '@/api/payments'
import { supabase } from '@/lib/supabase'
import { Chart } from 'chart.js/auto'
import type { ChartConfiguration, TooltipItem } from 'chart.js'
import { useToast } from 'vue-toastification'
import { useSchoolValidation } from '@/composables/useSchoolValidation'
import { getUserInitials, getDisplayName } from '@/utils/userUtils'
import { useMotion } from '@vueuse/motion'

// Initialize toast and validation
const toast = useToast()
const { withSchoolValidation } = useSchoolValidation()

const authStore = useAuthStore()
const loading = ref(true)
const showAddUserModal = ref(false)
const showChangePasswordModal = ref(false)
const recentPayments = ref<any[]>([])
const teacherCount = ref(0)
const studentCount = ref(0)
const paymentChart = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref<number[]>([])
const monthlyStats = ref<number[]>(Array(12).fill(0))
const initChart = ref(false)
const chartInitialized = ref(false)
const isValidRole = computed(() => {
  const roleValue = userRole.value?.toLowerCase() || ''
  return ['accountant', 'admin', 'superadmin'].includes(roleValue)
})

// Computed property to control chart visibility
const showChart = computed(() => {
  const roleValue = userRole.value?.toLowerCase() || ''
  console.log('Role check for chart:', { role: roleValue })
  return ['accountant', 'admin'].includes(roleValue) && roleValue !== 'superadmin'
})

// Debug watcher
watch(showChangePasswordModal, (newVal) => {
  console.log('Change password modal state:', newVal)
})

// Computed property for display data
// Get user display name and initials consistently across the app
const userName = computed(() => getDisplayName(authStore))
const userRole = computed(() => {
  const role = authStore.userRole?.role || 'No Role Assigned'
  return role
})
const userInitials = computed(() => getUserInitials(userName.value))

// Get student initials using the same utility function
const getStudentInitials = (name: string): string => {
  return getUserInitials(name)
}

// Function to format amount
const formatAmount = (amount: any): string => {
  // Convert to number and handle any potential issues
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

// Fetch recent payments if user is an accountant, admin, or superadmin
const fetchRecentPayments = async () => {
  try {
    console.log('Checking role for payments:', {
      role: userRole.value,
      isAdminOrHigher: isAdminOrHigher.value
    })
    
    if (isAdminOrHigher.value) {
      console.log('Fetching payments...')
      
      // Get the school_id based on user role
      const schoolId = userRole.value?.toLowerCase() === 'admin' 
        ? authStore.userRole?.school_id 
        : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;
      
      console.log('Fetching payments with school ID:', schoolId)
      
      const data = await getPayments(schoolId);
      console.log('Received payments data:', data)
      
      // Take only the most recent 5 payments
      recentPayments.value = data?.slice(0, 5) || [];
      console.log('Set recent payments:', recentPayments.value)
    } else {
      console.log('User does not have permission to view payments')
    }
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    toast.error('Failed to load recent payments')
  }
}

// Fetch teacher count from user_roles table
const fetchTeacherCount = async () => {
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value?.toLowerCase() === 'admin' 
      ? authStore.userRole?.school_id 
      : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;

    // Base query to get teachers
    let query = supabase
      .from('user_roles')
      .select('*', { count: 'exact' })
      .eq('role', 'teacher');
    
    // Add school_id filter if available
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching teacher count:', error);
      return;
    }
    
    teacherCount.value = count || 0;
    console.log('Teacher count:', teacherCount.value);
  } catch (error) {
    console.error('Error fetching teacher count:', error);
  }
}

// Fetch student count from user_roles table
const fetchStudentCount = async () => {
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value?.toLowerCase() === 'admin' 
      ? authStore.userRole?.school_id 
      : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;

    // Base query to get students
    let query = supabase
      .from('user_roles')
      .select('*', { count: 'exact' })
      .eq('role', 'student');
    
    // Add school_id filter if available
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching student count:', error);
      return;
    }
    
    studentCount.value = count || 0;
    console.log('Student count:', studentCount.value);
  } catch (error) {
    console.error('Error fetching student count:', error);
  }
}

// Simplified updateChart function
const updateChart = async () => {
  try {
    console.log('Starting chart update with data:', monthlyStats.value)
    if (!showChart.value) {
      console.log('Chart not shown due to role')
      return
    }

    const canvas = paymentChart.value
    if (!canvas) {
      console.log('Canvas element not found')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Failed to get canvas context')
      return
    }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const chartConfig = {
      type: 'bar' as const,
      data: {
        labels: months,
        datasets: [{
          label: 'Total Payments (GHC)',
          data: monthlyStats.value,
          backgroundColor: '#42b88380',
          borderColor: '#42b883',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: '#42b883',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            backgroundColor: '#2c3e50',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context: TooltipItem<'bar'>) => `GHC ${Number(context.raw || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f0f0f0'
            },
            ticks: {
              callback: (value: number | string) => `GHC ${Number(value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart'
        }
      }
    } as ChartConfiguration<'bar', number[], string>

    // If chart exists, destroy it first
    if (chartInstance.value) {
      console.log('Destroying existing chart')
      chartInstance.value.destroy()
    }

    // Create new chart
    console.log('Creating new chart instance')
    chartInstance.value = new Chart(ctx, chartConfig)
    console.log('Chart created successfully')
  } catch (error) {
    console.error('Error creating/updating chart:', error)
    toast.error('Failed to update chart')
  }
}

// Modify the template chart container
const template = `
<div class="chart-container" style="position: relative; height: 400px; width: 100%;">
  <canvas ref="paymentChart"></canvas>
</div>
`

// Add resize handler
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// Add window resize listener
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})

// Simplified fetchPaymentStats function
const fetchPaymentStats = async () => {
  try {
    console.log('Fetching payment stats for year:', selectedYear.value)
    const startDate = `${selectedYear.value}-01-01`
    const endDate = `${selectedYear.value}-12-31`
    
    // Get the school_id based on user role
    const schoolId = userRole.value?.toLowerCase() === 'admin' 
      ? authStore.userRole?.school_id 
      : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;
    
    console.log('Fetching payment stats with school ID:', schoolId)
    
    // Include school_id in the API call
    const data = await getPaymentsByDateRange(startDate, endDate, schoolId)
    console.log('Payment data received:', data)

    // Reset monthly totals
    const monthlyTotals = Array(12).fill(0)
    
    // Process data
    if (data && data.length > 0) {
      data.forEach(payment => {
        const month = new Date(payment.payment_date).getMonth()
        monthlyTotals[month] += Number(payment.amount || 0)
      })
    }
    
    console.log('Processed monthly totals:', monthlyTotals)
    monthlyStats.value = monthlyTotals
    await updateChart()
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    toast.error('Failed to load payment statistics')
  }
}

// Initialize available years
const initializeYears = () => {
  const currentYear = new Date().getFullYear()
  availableYears.value = Array.from({ length: 5 }, (_, i) => currentYear - i)
}

// Add watch for selected school changes for superadmin
watch(
  () => authStore.getSelectedSchoolId,
  async (newSchoolId) => {
    if (userRole.value?.toLowerCase() === 'superadmin') {
      console.log('Selected school changed, refetching data...');
      await fetchTeacherCount();
      await fetchStudentCount();
      
      // Also refresh payment chart data when school changes
      if (showChart.value) {
        await fetchPaymentStats();
      }
      
      // Refresh recent payments list
      await fetchRecentPayments();
    }
  }
)

// Initialize
onMounted(async () => {
  console.log('Component mounted')
  try {
    initializeYears()
    if (showChart.value) {
      console.log('Initializing chart data...')
      await fetchPaymentStats()
    }
    await fetchRecentPayments()
    await fetchTeacherCount()
    await fetchStudentCount()
    loading.value = false
  } catch (error) {
    console.error('Error in onMounted:', error)
    loading.value = false
  }
})

// Watch for year changes with immediate option
watch(selectedYear, async (newYear, oldYear) => {
  console.log(`Year changed from ${oldYear} to ${newYear}`)
  if (showChart.value) {
    await fetchPaymentStats()
  }
}, { flush: 'post' })

// Computed property to check if user can view chart
const canViewChart = computed(() => {
  const roleValue = authStore.userRole?.role?.toLowerCase() || ''
  console.log('Current user role:', roleValue)
  return ['accountant', 'admin'].includes(roleValue.toLowerCase())
})

// Computed properties for role-based checks
const isStudentOrParent = computed(() => {
  const roleValue = userRole.value?.toLowerCase() || ''
  return ['student', 'parent'].includes(roleValue)
})

const isAdminOrHigher = computed(() => {
  const roleValue = userRole.value?.toLowerCase()
  return ['accountant', 'admin', 'superadmin'].includes(roleValue)
})

const isRegistrarOrHigher = computed(() => {
  const roleValue = userRole.value?.toLowerCase()
  return ['registrar', 'superadmin', 'admin'].includes(roleValue)
})

const isTeacherOrHigher = computed(() => {
  const roleValue = userRole.value?.toLowerCase()
  return ['teacher', 'superadmin', 'admin'].includes(roleValue)
})

const canViewPayments = computed(() => {
  const roleValue = userRole.value?.toLowerCase()
  return ['accountant', 'admin', 'superadmin'].includes(roleValue)
})

const canViewFinancials = computed(() => {
  const roleValue = userRole.value?.toLowerCase()
  return ['accountant', 'admin', 'superadmin'].includes(roleValue)
})

const canViewRegistration = computed(() => {
  const roleValue = userRole.value?.toLowerCase()
  return ['registrar', 'superadmin', 'admin'].includes(roleValue)
})

const canViewTeaching = computed(() => {
  const roleValue = userRole.value?.toLowerCase()
  return ['teacher', 'superadmin', 'admin'].includes(roleValue)
})

// Modify the showChangePasswordModal ref to be a function
const handleChangePassword = () => {
  withSchoolValidation(async () => {
    showChangePasswordModal.value = true
  })
}
</script>

<style lang="scss" scoped>
.welcome-card {
  background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
  border-radius: 1rem;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.2);

  .content {
    position: relative;
    z-index: 1;
  }

  .decoration {
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 4rem;
    opacity: 0.2;
  }

  h1 {
    margin-bottom: 0.5rem;
    font-weight: 600;

    .text-primary {
      color: #e0fff0 !important;
    }
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2rem;
    font-weight: 500;
    font-size: 0.9rem;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #e0fff0;
    
    i {
      font-size: 1rem;
    }
  }
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    position: absolute;
    right: -1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 5rem;
    color: rgba(66, 184, 131, 0.1);
    transition: all 0.3s ease;
  }

  &:hover .stat-icon {
    transform: translateY(-50%) scale(1.1);
    color: rgba(66, 184, 131, 0.15);
  }

  .stat-content {
    position: relative;
    z-index: 1;
    padding-right: 4rem;

    h3 {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #42b883, #3aa876);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
      opacity: 0.8;
    }
  }
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1.25rem;

    .stat-icon {
      font-size: 4rem;
      right: -0.5rem;
    }

    .stat-content {
      padding-right: 3rem;

      .stat-number {
        font-size: 2rem;
      }
    }
  }
}

.dashboard-card {
  background: white;
  border-radius: 1rem;
  height: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.5rem;

  .card-header {
    padding: 1.25rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 1.25rem;
      margin: 0;
      color: #2c3e50;
    }
  }
}

.activity-list {
  padding: 1.5rem;

  .activity-item {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    &:not(:last-child) {
      margin-bottom: 1rem;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      flex-shrink: 0;

      &.bg-success-light {
        background-color: rgba(66, 184, 131, 0.1);
      }

      &.bg-info-light {
        background-color: rgba(33, 150, 243, 0.1);
      }

      &.bg-warning-light {
        background-color: rgba(255, 165, 2, 0.1);
      }

      i {
        font-size: 1.2rem;
      }
    }

    .activity-content {
      flex-grow: 1;

      h4 {
        font-size: 1rem;
        margin: 0 0 0.25rem;
        color: #2c3e50;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }

      .activity-time {
        font-size: 0.8rem;
        color: #999;
        display: block;
        margin-top: 0.25rem;
      }
    }
  }
}

.quick-actions {
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;

  .action-button {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border: none;
    background: #f8f9fa;
    border-radius: 0.5rem;
    color: #2c3e50;
    transition: all 0.3s ease;
    cursor: pointer;
    flex: 0 0 auto;
    min-width: 200px;
    justify-content: center;

    &:hover {
      background: #42b883;
      color: white;
      transform: translateY(-5px);
    }

    i {
      font-size: 1.2rem;
      margin-right: 1rem;
    }

    span {
      font-weight: 500;
    }
  }
}

// Add router-link style to remove underline
.action-button.router-link-active,
.action-button {
  text-decoration: none;
}

@media (max-width: 768px) {
  .welcome-card {
    padding: 1.5rem;

    .decoration {
      display: none;
    }
  }

  .stat-card {
    padding: 1rem;
  }
}

// Skeleton Loading Styles
.skeleton-loading {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-text {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  
  &.skeleton-title {
    height: 2.5rem;
    width: 60%;
  }
  
  &.skeleton-subtitle {
    height: 1.5rem;
    width: 80%;
  }
  
  &.skeleton-sm {
    height: 1rem;
    width: 40%;
  }
  
  &.skeleton-md {
    height: 1.5rem;
    width: 50%;
  }
  
  &.skeleton-lg {
    height: 2rem;
    width: 70%;
  }
}

.skeleton-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  height: 2rem;
  width: 120px;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(66, 184, 131, 0.1);
  margin-bottom: 1rem;
}

.skeleton-activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(66, 184, 131, 0.1);
  margin-right: 1rem;
  flex-shrink: 0;
}

.skeleton-button {
  width: 80px;
  height: 32px;
  border-radius: 4px;
  background: rgba(66, 184, 131, 0.1);
}

.skeleton-action-button {
  height: 48px;
  width: 200px;
  display: inline-block;
  border-radius: 8px;
  background: rgba(66, 184, 131, 0.1);
  margin: 0 0.5rem 0.5rem;
  
  &:last-child {
    margin-bottom: 0.5rem;
  }
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;

  .user-info {
    flex: 1;
  }

  .avatar {
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4.2rem;
    font-weight: 50;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column-reverse;
    align-items: center;
    text-align: center;
    gap: 1.5rem;

    .avatar {
      width: 120px;
      height: 120px;
      font-size: 1.8rem;
    }

    .user-info {
      .role-badge,
      .change-password-btn {
        display: inline-flex;
        margin: 0.5rem;
      }
    }
  }
}

.change-password-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.2rem;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 2rem;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  }

  i {
    font-size: 1.1rem;
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 2px 12px rgba(255, 255, 255, 0.4);
  }
  100% {
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
  }
}

.pulse {
  animation: pulse 2s infinite;
}

.school-expiry {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  font-weight: 500;
  font-size: 0.9rem;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #e0fff0;
  
  i {
    font-size: 1rem;
  }

  .expiry-date {
    font-weight: 600;
    margin-left: 0.5rem;
    color: #ffffff;
  }
}

.payments-table-container {
  padding: 0;
  margin-bottom: 0;
  
  .responsive-table {
    overflow-x: auto;
    
    .modern-table {
      width: 100%;
      margin-bottom: 0;
      border-collapse: separate;
      border-spacing: 0;
      
      thead {
        background-color: #f9fafb;
        
        th {
          font-weight: 600;
          color: #4b5563;
          padding: 1rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          
          &:first-child {
            border-top-left-radius: 0.5rem;
          }
          
          &:last-child {
            border-top-right-radius: 0.5rem;
          }
        }
      }
      
      tbody {
        .payment-row {
          transition: all 0.2s ease;
          
          &:hover {
            background-color: #f9fafb;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          
          td {
            padding: 1rem;
            vertical-align: middle;
            border-bottom: 1px solid #f2f2f2;
            font-size: 0.95rem;
            
            &:first-child {
              padding-left: 1.5rem;
            }
            
            &:last-child {
              padding-right: 1.5rem;
            }
          }
          
          &:last-child td {
            border-bottom: none;
            
            &:first-child {
              border-bottom-left-radius: 0.5rem;
            }
            
            &:last-child {
              border-bottom-right-radius: 0.5rem;
            }
          }
        }
      }
    }
  }
  
  .student-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .student-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(66, 184, 131, 0.2);
    }
    
    .student-details {
      display: flex;
      flex-direction: column;
      
      .student-name {
        font-weight: 600;
        color: #1f2937;
        line-height: 1.2;
      }
      
      .student-id {
        color: #6b7280;
        font-size: 0.75rem;
        margin-top: 0.2rem;
      }
    }
  }
  
  .payment-id-container {
    display: flex;
    flex-direction: column;
    
    .id-box {
      display: inline-block;
      margin-bottom: 0.3rem;
      
      .payment-id {
        font-family: 'Courier New', monospace;
        font-weight: 600;
        color: #4b5563;
        font-size: 0.875rem;
        background-color: #f3f4f6;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        display: inline-block;
      }
    }
    
    .date-box {
      display: inline-block;
      
      .payment-date {
        color: #6b7280;
        font-size: 0.75rem;
        white-space: nowrap;
      }
    }
  }
  
  .payment-purpose {
    color: #6366f1;
    font-size: 0.9rem;
    font-weight: 500;
    background-color: #eef2ff;
    padding: 0.3rem 0.6rem;
    border-radius: 20px;
    display: inline-block;
  }
  
  .amount-container {
    display: flex;
    flex-direction: column;
    
    .amount-display {
      font-weight: 700;
      color: #42b883;
      font-size: 1rem;
    }
    
    .amount-status {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.3rem;
      color: #f59e0b;
      font-size: 0.75rem;
      
      .status-icon {
        font-size: 0.8rem;
      }
      
      &.paid {
        color: #10b981;
      }
    }
  }
  
  .payment-method {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 600;
    gap: 0.4rem;
    
    .method-icon {
      font-size: 0.9rem;
    }
    
    &.method-cash {
      background-color: #e3f8ef;
      color: #2c845e;
    }
    
    &.method-momo {
      background-color: #fff5e6;
      color: #ff9500;
    }
    
    &.method-bank {
      background-color: #e6f4ff;
      color: #0085ff;
    }
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #6c757d;
    
    h4 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      margin-bottom: 0;
    }
  }
  
  .view-all-link {
    text-align: center;
    padding: 1rem;
    border-top: 1px solid #f2f2f2;
    
    a {
      display: inline-flex;
      align-items: center;
      color: #42b883;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      
      i {
        margin-left: 0.5rem;
        transition: transform 0.2s ease;
      }
      
      &:hover {
        color: darken(#42b883, 10%);
        
        i {
          transform: translateX(3px);
        }
      }
    }
  }
}

.chart-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;

  .card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 1.25rem;
      margin: 0;
      color: #2c3e50;
    }
  }
  
  .chart-container {
    min-height: 400px;
    padding: 1.5rem;
    background: white;
    border-radius: 0 0 1rem 1rem;
  }
  
  .chart-controls {
    .form-select {
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 0.5rem;
      padding: 0.375rem 2rem 0.375rem 0.75rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: #2c3e50;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #42b883;
      }
      
      &:focus {
        border-color: #42b883;
        box-shadow: 0 0 0 0.2rem rgba(66, 184, 131, 0.25);
      }
    }
  }
}

.chart-skeleton {
  height: 400px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-end;
  background: white;
  border-radius: 0 0 1rem 1rem;
  
  .skeleton-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 2rem 0;
    
    .skeleton-bar {
      width: calc(100% / 13);
      background: rgba(66, 184, 131, 0.1);
      border-radius: 8px 8px 0 0;
      animation: pulse 1.5s infinite;
      
      @for $i from 1 through 12 {
        &:nth-child(#{$i}) {
          height: calc(20% + #{$i * 5});
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style> 