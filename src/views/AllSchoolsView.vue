<template>
  <div class="all-schools-view">
    <div class="container py-5">
      <div class="row g-4">
        <!-- Header -->
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="page-title">
              <i class="fas fa-school text-primary me-2"></i>
              All Schools
            </h1>
            <div class="actions">
              <button 
                v-if="userRole === 'superadmin'" 
                class="btn btn-primary" 
                @click="navigateToOnboarding"
              >
                <i class="fas fa-plus-circle me-2"></i>
                Add New School
              </button>
            </div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="col-12">
          <div class="search-filter-container">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                class="form-control search-input" 
                placeholder="Search schools..." 
                v-model="searchQuery"
              >
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div v-if="loading" class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading schools...</p>
        </div>

        <!-- Error Message -->
        <div v-else-if="error" class="col-12">
          <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
        </div>

        <!-- No Schools Found -->
        <div v-else-if="filteredSchools.length === 0" class="col-12">
          <div class="empty-state">
            <div class="empty-state-icon">
              <i class="fas fa-school"></i>
            </div>
            <h3>No Schools Found</h3>
            <p>There are no schools matching your search criteria.</p>
          </div>
        </div>

        <!-- Schools Grid -->
        <template v-else>
          <div 
            v-for="school in filteredSchools" 
            :key="school.id" 
            class="col-md-6 col-lg-4"
            v-motion-fade-visible
          >
            <div class="school-card">
              <div class="school-logo">
                <img 
                  v-if="school.logo" 
                  :src="school.logo" 
                  :alt="school.name"
                  @error="handleImageError"
                >
                <div v-else class="default-logo">
                  <i class="fas fa-school"></i>
                </div>
              </div>
              <div class="school-details">
                <h3 class="school-name">{{ school.name }}</h3>
                <div class="school-meta">
                  <div class="meta-item">
                    <i class="fas fa-envelope text-primary"></i>
                    <span>{{ school.email || 'No email provided' }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-phone text-primary"></i>
                    <span>{{ school.phone || 'No phone provided' }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="fas fa-map-marker-alt text-primary"></i>
                    <span>{{ school.address || 'No address provided' }}</span>
                  </div>
                  <div class="school-stats">
                    <div class="meta-item stat-item">
                      <i class="fas fa-users text-primary"></i>
                      <span>{{ school.staffCount }} {{ school.staffCount === 1 ? 'Staff' : 'Staff' }}</span>
                    </div>
                    <div class="meta-item stat-item">
                      <i class="fas fa-user-graduate text-primary"></i>
                      <span>{{ school.studentCount }} {{ school.studentCount === 1 ? 'Student' : 'Students' }}</span>
                    </div>
                    <div class="meta-item stat-item">
                      <i class="fas fa-users-cog text-primary"></i>
                      <span>{{ school.totalCount }} {{ school.totalCount === 1 ? 'Total User' : 'Total Users' }}</span>
                    </div>
                  </div>
                </div>
                <div class="school-actions">
                  <button 
                    class="btn btn-outline-primary btn-sm" 
                    @click="selectSchool(school)"
                  >
                    <i class="fas fa-sign-in-alt me-1"></i>
                    Select
                  </button>
                  <button 
                    v-if="userRole === 'superadmin'" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="editSchool(school)"
                  >
                    <i class="fas fa-edit me-1"></i>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import { logActivity } from '@/lib/auditLogger'

// Initialize router, auth store and toast
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State variables
const loading = ref(true)
const error = ref<string | null>(null)
const schools = ref<any[]>([])
const searchQuery = ref('')

// Computed properties
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || '')

const filteredSchools = computed(() => {
  if (!searchQuery.value.trim()) return schools.value
  
  const query = searchQuery.value.toLowerCase().trim()
  return schools.value.filter(school => 
    school.name.toLowerCase().includes(query) ||
    (school.email && school.email.toLowerCase().includes(query)) ||
    (school.phone && school.phone.toLowerCase().includes(query)) ||
    (school.address && school.address.toLowerCase().includes(query))
  )
})

// Methods
const fetchSchools = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch schools data
    const { data: schoolsData, error: fetchError } = await supabase
      .from('schools')
      .select(`
        id, 
        name, 
        email, 
        phone, 
        address,
        setup(school_logo)
      `)
      .order('name')
    
    if (fetchError) throw fetchError
    
    // Get counts for each school
    const schoolCounts = await Promise.all((schoolsData || []).map(async (school) => {
      // Get staff count
      const { count: staffCount, error: staffError } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', school.id)
        .in('role', ['admin', 'teacher', 'registrar', 'accountant'])
      
      if (staffError) {
        console.error(`Error fetching staff count for school ${school.id}:`, staffError)
      }
      
      // Get student count
      const { count: studentCount, error: studentError } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', school.id)
        .eq('role', 'student')
      
      if (studentError) {
        console.error(`Error fetching student count for school ${school.id}:`, studentError)
      }
      
      // Get total user count
      const { count: totalCount, error: totalError } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', school.id)
      
      if (totalError) {
        console.error(`Error fetching total count for school ${school.id}:`, totalError)
      }
      
      return { 
        schoolId: school.id, 
        staffCount: staffCount || 0,
        studentCount: studentCount || 0,
        totalCount: totalCount || 0
      }
    }))
    
    // Create a map of school IDs to counts for easier lookup
    const countsMap: Record<string, { staffCount: number; studentCount: number; totalCount: number }> = 
      schoolCounts.reduce((map: Record<string, any>, item) => {
        map[item.schoolId] = {
          staffCount: item.staffCount,
          studentCount: item.studentCount,
          totalCount: item.totalCount
        }
        return map
      }, {})
    
    // Transform data to include logo from setup table and counts
    schools.value = (schoolsData || []).map(school => ({
      id: school.id,
      name: school.name,
      email: school.email,
      phone: school.phone,
      address: school.address,
      logo: school.setup?.[0]?.school_logo || null,
      staffCount: countsMap[school.id]?.staffCount || 0,
      studentCount: countsMap[school.id]?.studentCount || 0,
      totalCount: countsMap[school.id]?.totalCount || 0
    }))
    
    // Log activity
    await logActivity('update', 'schools', '0', '', { count: schools.value.length })
  } catch (err: any) {
    console.error('Error fetching schools:', err)
    error.value = 'Failed to load schools. Please try again later.'
  } finally {
    loading.value = false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-school-logo.png'
}

const selectSchool = async (school: any) => {
  try {
    await authStore.setSelectedSchoolId(school.id)
    toast.success(`Selected ${school.name}`)
    
    // Log activity
    await logActivity('update', 'user_preferences', '0', '', { 
      action: 'select_school',
      school_id: school.id,
      school_name: school.name
    })
    
    // Navigate to dashboard
    router.push('/dashboard')
  } catch (err) {
    console.error('Error selecting school:', err)
    toast.error('Failed to select school')
  }
}

const editSchool = (school: any) => {
  // Select this school first
  authStore.setSelectedSchoolId(school.id)
  
  // Navigate to settings page
  router.push('/settings')
}

const navigateToOnboarding = () => {
  router.push('/onboard-school')
}

// Fetch schools when component mounts
onMounted(() => {
  fetchSchools()
})
</script>

<style scoped lang="scss">
.all-schools-view {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-title {
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0;
}

.search-filter-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-box {
  flex-grow: 1;
  position: relative;
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }
  
  .search-input {
    padding-left: 2.5rem;
    height: 48px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    
    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.15);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  .empty-state-icon {
    font-size: 3rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #64748b;
  }
}

.school-card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .school-logo {
    height: 150px;
    background-color: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .default-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      
      i {
        font-size: 4rem;
        color: #94a3b8;
        opacity: 0.6;
      }
    }
  }
  
  .school-details {
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    
    .school-name {
      font-weight: 600;
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: var(--text);
    }
    
    .school-meta {
      margin-bottom: 1.5rem;
      flex-grow: 1;
      
      .meta-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.75rem;
        
        i {
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          width: 16px;
          text-align: center;
        }
        
        span {
          color: #64748b;
          font-size: 0.9rem;
          word-break: break-word;
        }
        
        &.staff-count {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px dashed #e2e8f0;
          
          i {
            color: var(--primary);
          }
          
          span {
            font-weight: 600;
            color: #475569;
          }
        }
      }
      
      .school-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px dashed #e2e8f0;
        
        .stat-item {
          flex: 1;
          min-width: 30%;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          background-color: #f8fafc;
          border-radius: 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          
          i {
            margin-right: 0;
            margin-bottom: 0.25rem;
            font-size: 1.25rem;
            width: auto;
          }
          
          span {
            font-weight: 600;
            color: #475569;
          }
        }
      }
    }
    
    .school-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: auto;
      
      .btn {
        flex: 1;
      }
    }
  }
}
</style> 