<template>
  <div class="container py-4 mt-4">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0 text-gray-800">User Management</h1>
        <p class="mb-0">Manage all system users and their roles</p>
      </div>
      <button 
        class="btn btn-primary" 
        @click="openAddUserModal"
        :disabled="userRole === 'superadmin' && !authStore.getSelectedSchoolId"
        :title="userRole === 'superadmin' && !authStore.getSelectedSchoolId ? 'Please select a school first' : ''"
      >
        <i class="fas fa-user-plus me-2"></i>Add New User
      </button>
    </div>

    <!-- School Selector for Superadmin -->
    <div v-if="userRole === 'superadmin'" class="mb-4">
      <SchoolSelector @school-selected="handleSchoolSelected" />
    </div>

    <!-- Show message when no school is selected for superadmin -->
    <div v-if="userRole === 'superadmin' && !authStore.getSelectedSchoolId" class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>
      Please select a school to view and manage its users.
    </div>

    <!-- Modern Add User Modal -->
    <AddUserModal 
      v-model="showAddUserModal"
      @user-added="fetchUsers"
    />

    <!-- Edit User Modal -->
    <transition name="modern-modal-fade">
      <div v-if="showEditUserModal" class="modern-modal-overlay">
        <div class="modern-modal-card">
          <button class="modern-modal-close" @click="closeEditUserModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modern-modal-header">
            <h2>Edit User</h2>
            <p class="text-muted mb-0">Update user details and role</p>
          </div>
          <form class="modern-modal-form" @submit.prevent="handleEditUser">
            <!-- Basic Information Section -->
            <div class="form-section">
              <h6 class="section-title">Basic Information</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="editUserForm.email" 
                    placeholder="Email address"
                    disabled
                  >
                </div>
                <div class="col-md-6">
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="editUserForm.username" 
                    placeholder="Enter username"
                    required
                  >
                </div>
                <div class="col-md-12">
                  <select 
                    class="form-select" 
                    v-model="editUserForm.role" 
                    required 
                    @change="handleRoleChange"
                  >
                    <option value="" disabled>Select role</option>
                    <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <input type="date" class="form-control" v-model="editUserForm.dob" placeholder="Date of Birth" required>
                </div>
                <div class="col-md-6">
                  <input type="number" class="form-control" v-model="editUserForm.age" placeholder="Age" min="0" required>
                </div>
                <div class="col-md-6">
                  <select class="form-select" v-model="editUserForm.gender" required>
                    <option v-for="g in genderOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <select class="form-select" v-model="editUserForm.nationality" required>
                    <option v-for="n in nationalityOptions" :key="n.value" :value="n.value">{{ n.label }}</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <select class="form-select" v-model="editUserForm.religion" required>
                    <option v-for="r in religionOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
                  </select>
                </div>
                <div v-if="editUserForm.role === 'student'" class="col-md-12">
                  <select class="form-select" v-model="editUserForm.class_id" :disabled="isLoadingClasses" required>
                    <option value="" disabled>Select class</option>
                    <option v-for="c in classes" :key="c.class_id" :value="c.class_id">{{ c.class_name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Role-specific Information Section -->
            <div v-if="['teacher', 'student', 'parent', 'accountant', 'registrar', 'admin'].includes(editUserForm.role)" class="form-section">
              <h6 class="section-title">Additional Information</h6>
              <div class="row g-3">
                <div class="col-md-12">
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="editUserForm.identification" 
                    placeholder="Enter identification number"
                    required
                  >
                </div>
                <div v-if="editUserForm.role === 'student'" class="col-md-12">
                  <select 
                    class="form-select" 
                    v-model="editUserForm.gradeLevel" 
                    required
                    :disabled="isLoadingGrades"
                  >
                    <option value="" disabled>Select grade level</option>
                    <option 
                      v-for="grade in grades" 
                      :key="grade.id" 
                      :value="grade.grade_level"
                    >
                      {{ grade.grade_level }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeEditUserModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="editUserLoading">
                <span v-if="editUserLoading" class="spinner-border spinner-border-sm me-2"></span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete User Modal -->
    <transition name="modern-modal-fade">
      <div v-if="showDeleteUserModal" class="modern-modal-overlay">
        <div class="modern-modal-card">
          <button class="modern-modal-close" @click="closeDeleteUserModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modern-modal-header">
            <h2>Delete User</h2>
            <p class="text-muted mb-0">Are you sure you want to delete this user?</p>
          </div>
          <div class="mb-4">
            <div class="delete-user-email"><strong>{{ deleteUserTarget?.email }}</strong></div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteUserModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteUser" :disabled="deleteUserLoading">
              <span v-if="deleteUserLoading" class="spinner-border spinner-border-sm me-2"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- View User Modal -->
    <transition name="modern-modal-fade">
      <div v-if="showViewUserModal" class="modern-modal-overlay">
        <div class="modern-modal-card">
          <button class="modern-modal-close" @click="closeViewUserModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modern-modal-header">
            <h2>User Details</h2>
            <p class="text-muted mb-0">View user information</p>
          </div>
          <div class="modern-modal-form">
            <div class="form-section user-details-section">
              <h6 class="section-title">Basic Information</h6>
              <div class="row g-2 align-items-center">
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Email</span>
                  <span class="user-details-value">{{ viewUserTarget?.email }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Username</span>
                  <span class="user-details-value">{{ viewUserTarget?.username }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Role</span>
                  <span class="user-details-value text-capitalize">{{ viewUserTarget?.role }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Status</span>
                  <span class="user-details-value">{{ viewUserTarget?.status }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Last Login</span>
                  <span class="user-details-value">{{ formatDate(viewUserTarget?.last_sign_in_at ?? null) }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Date of Birth</span>
                  <span class="user-details-value">{{ viewUserTarget?.dob || '—' }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Age</span>
                  <span class="user-details-value">{{ viewUserTarget?.age || '—' }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Gender</span>
                  <span class="user-details-value text-capitalize">{{ viewUserTarget?.gender || '—' }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Nationality</span>
                  <span class="user-details-value text-capitalize">{{ viewUserTarget?.nationality || '—' }}</span>
                </div>
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Religion</span>
                  <span class="user-details-value text-capitalize">{{ viewUserTarget?.religion || '—' }}</span>
                </div>
              </div>
            </div>
            <div class="form-section user-details-section" v-if="['teacher', 'student', 'parent', 'accountant', 'registrar', 'admin'].includes(viewUserTarget?.role ?? '')">
              <h6 class="section-title">Additional Information</h6>
              <div class="row g-2 align-items-center">
                <div class="col-md-6 user-details-field">
                  <span class="user-details-label">Identification</span>
                  <span class="user-details-value">{{ viewUserTarget?.identification }}</span>
                </div>
                <div class="col-md-6 user-details-field" v-if="viewUserTarget?.role === 'student'">
                  <span class="user-details-label">Grade Level</span>
                  <span class="user-details-value">{{ viewUserTarget?.grade_level }}</span>
                </div>
                <div class="col-md-6 user-details-field" v-if="viewUserTarget?.role === 'student'">
                  <span class="user-details-label">Class</span>
                  <span class="user-details-value">{{ viewUserTarget?.class_name || '—' }}</span>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-outline-secondary" @click="closeViewUserModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Search and Filter Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Search users..."
                v-model="searchQuery"
                @input="handleSearch"
              >
            </div>
          </div>
          <div class="col-12 col-md-3">
            <select class="form-select" v-model="roleFilter">
              <option value="">All Roles</option>
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
          </div>
          <div class="col-12 col-md-3">
            <select class="form-select" v-model="statusFilter">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div class="col-12 col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Role</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="isLoading">
                <tr v-for="n in 6" :key="n">
                  <td><div class="skeleton skeleton-badge"></div></td>
                  <td><div class="skeleton skeleton-text"></div></td>
                  <td><div class="skeleton skeleton-text"></div></td>
                  <td><div class="skeleton skeleton-badge"></div></td>
                  <td><div class="skeleton skeleton-text short"></div></td>
                  <td><div class="skeleton skeleton-actions"></div></td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <span :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(user.status)">
                      {{ user.status }}
                    </span>
                  </td>
                  <td>
                    <span :title="user.last_sign_in_at ?? undefined">
                      {{ formatDate(user.last_sign_in_at) }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-2">
                      <button 
                        class="btn btn-sm btn-outline-info" 
                        @click="openViewUserModal(user)"
                        title="View User"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        @click="openEditUserModal(user)"
                        title="Edit User"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="openDeleteUserModal(user)"
                        title="Delete User"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-4">
          <div class="text-muted">
            Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalUsers }} users
          </div>
          <nav aria-label="Page navigation">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="prevPage">Previous</button>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page" 
                class="page-item"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="goToPage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="nextPage">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

  
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import { getUsersWithRoles, deleteUser as deleteUserApi, addUserWithRole, updateUserWithRole, getGrades, getClasses } from '@/api/users'
import { useAuthStore } from '@/store/auth'
import AddUserModal from '@/components/AddUserModal.vue'
import SchoolSelector from '@/components/SchoolSelector.vue'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role: string
  status: string
  name?: string
  avatar_url?: string
  username: string
  identification?: string | null
  grade_level?: string | null
  dob?: string | null
  age?: number | null
  gender?: string | null
  class_id?: string | null
  class_name?: string | null
  nationality?: string | null
  religion?: string | null
}

interface Grade {
  id: number
  grade_level: string
}

// Add interface for user creation
interface CreateUserData {
  email: string
  username: string
  role: string
  identification?: string
  gradeLevel?: string
  dob?: string
  age?: number
  gender?: string
  class_id?: string
  nationality?: string
  religion?: string
  school_id?: string | null
}

const toast = useToast()
const isLoading = ref(true)
const users = ref<User[]>([])
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const selectedUsers = ref<string[]>([])
const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const showAddUserModal = ref(false)
const addUserForm = ref({
  email: '',
  password: '',
  username: '',
  role: '',
  identification: '',
  gradeLevel: '',
  dob: '',
  age: '',
  gender: '',
  class_id: '',
  nationality: '',
  religion: ''
})
const addUserLoading = ref(false)
const showEditUserModal = ref(false)
const editUserForm = ref({ 
  email: '', 
  username: '', 
  role: '',
  identification: '',
  gradeLevel: '',
  dob: '',
  age: '',
  gender: '',
  class_id: '',
  nationality: '',
  religion: ''
})
const editUserLoading = ref(false)
const showDeleteUserModal = ref(false)
const deleteUserTarget = ref<User | null>(null)
const deleteUserLoading = ref(false)
const grades = ref<Grade[]>([])
const isLoadingGrades = ref(false)
const showViewUserModal = ref(false)
const viewUserTarget = ref<User | null>(null)
const authStore = useAuthStore()
const currentUserRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)

// Add computed property for current user's role
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)

// Pagination computed properties
const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage))
const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage, totalUsers.value))

// Filter users based on search and filters
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  // If user is registrar, only show students and parents
  if (currentUserRole.value === 'registrar') {
    filtered = filtered.filter(user => ['student', 'parent'].includes(user.role.toLowerCase()))
  }
  
  return filtered.filter(user => {
    const matchesSearch = !searchQuery.value || 
      (user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (user.name?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesRole = !roleFilter.value || user.role === roleFilter.value
    const matchesStatus = !statusFilter.value || user.status === statusFilter.value
    
    return matchesSearch && matchesRole && matchesStatus
  })
})

// Add a computed property for role options
const allRoleOptions = [
  { value: 'superadmin', label: 'SuperAdmin' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'registrar', label: 'Registrar' },
]
const roleOptions = computed(() => {
  if (currentUserRole.value === 'admin') {
    return allRoleOptions.filter(r => r.value !== 'superadmin')
  }
  if (currentUserRole.value === 'registrar') {
    return allRoleOptions.filter(r => ['student', 'parent'].includes(r.value))
  }
  return allRoleOptions
})

// Add gender options
const genderOptions = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// Add nationality options
const nationalityOptions = [
  { value: '', label: 'Select nationality' },
  { value: 'afghan', label: 'Afghan' },
  { value: 'albanian', label: 'Albanian' },
  { value: 'algerian', label: 'Algerian' },
  { value: 'american', label: 'American' },
  { value: 'andorran', label: 'Andorran' },
  { value: 'angolan', label: 'Angolan' },
  { value: 'antiguan', label: 'Antiguan' },
  { value: 'argentine', label: 'Argentine' },
  { value: 'armenian', label: 'Armenian' },
  { value: 'australian', label: 'Australian' },
  { value: 'austrian', label: 'Austrian' },
  { value: 'azerbaijani', label: 'Azerbaijani' },
  { value: 'bahamian', label: 'Bahamian' },
  { value: 'bahraini', label: 'Bahraini' },
  { value: 'bangladeshi', label: 'Bangladeshi' },
  { value: 'barbadian', label: 'Barbadian' },
  { value: 'belarusian', label: 'Belarusian' },
  { value: 'belgian', label: 'Belgian' },
  { value: 'belizean', label: 'Belizean' },
  { value: 'beninese', label: 'Beninese' },
  { value: 'bhutanese', label: 'Bhutanese' },
  { value: 'bolivian', label: 'Bolivian' },
  { value: 'bosnian', label: 'Bosnian' },
  { value: 'botswanan', label: 'Botswanan' },
  { value: 'brazilian', label: 'Brazilian' },
  { value: 'british', label: 'British' },
  { value: 'bruneian', label: 'Bruneian' },
  { value: 'bulgarian', label: 'Bulgarian' },
  { value: 'burkinabe', label: 'Burkinabe' },
  { value: 'burmese', label: 'Burmese' },
  { value: 'burundian', label: 'Burundian' },
  { value: 'cambodian', label: 'Cambodian' },
  { value: 'cameroonian', label: 'Cameroonian' },
  { value: 'canadian', label: 'Canadian' },
  { value: 'cape verdean', label: 'Cape Verdean' },
  { value: 'central african', label: 'Central African' },
  { value: 'chadian', label: 'Chadian' },
  { value: 'chilean', label: 'Chilean' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'colombian', label: 'Colombian' },
  { value: 'comoran', label: 'Comoran' },
  { value: 'congolese', label: 'Congolese' },
  { value: 'costa rican', label: 'Costa Rican' },
  { value: 'croatian', label: 'Croatian' },
  { value: 'cuban', label: 'Cuban' },
  { value: 'cypriot', label: 'Cypriot' },
  { value: 'czech', label: 'Czech' },
  { value: 'danish', label: 'Danish' },
  { value: 'djibouti', label: 'Djibouti' },
  { value: 'dominican', label: 'Dominican' },
  { value: 'dutch', label: 'Dutch' },
  { value: 'east timorese', label: 'East Timorese' },
  { value: 'ecuadorean', label: 'Ecuadorean' },
  { value: 'egyptian', label: 'Egyptian' },
  { value: 'emirian', label: 'Emirian' },
  { value: 'equatorial guinean', label: 'Equatorial Guinean' },
  { value: 'eritrean', label: 'Eritrean' },
  { value: 'estonian', label: 'Estonian' },
  { value: 'ethiopian', label: 'Ethiopian' },
  { value: 'fijian', label: 'Fijian' },
  { value: 'filipino', label: 'Filipino' },
  { value: 'finnish', label: 'Finnish' },
  { value: 'french', label: 'French' },
  { value: 'gabonese', label: 'Gabonese' },
  { value: 'gambian', label: 'Gambian' },
  { value: 'georgian', label: 'Georgian' },
  { value: 'german', label: 'German' },
  { value: 'ghanaian', label: 'Ghanaian' },
  { value: 'greek', label: 'Greek' },
  { value: 'grenadian', label: 'Grenadian' },
  { value: 'guatemalan', label: 'Guatemalan' },
  { value: 'guinea-bissauan', label: 'Guinea-Bissauan' },
  { value: 'guinean', label: 'Guinean' },
  { value: 'guyanese', label: 'Guyanese' },
  { value: 'haitian', label: 'Haitian' },
  { value: 'herzegovinian', label: 'Herzegovinian' },
  { value: 'honduran', label: 'Honduran' },
  { value: 'hungarian', label: 'Hungarian' },
  { value: 'icelander', label: 'Icelander' },
  { value: 'indian', label: 'Indian' },
  { value: 'indonesian', label: 'Indonesian' },
  { value: 'iranian', label: 'Iranian' },
  { value: 'iraqi', label: 'Iraqi' },
  { value: 'irish', label: 'Irish' },
  { value: 'israeli', label: 'Israeli' },
  { value: 'italian', label: 'Italian' },
  { value: 'ivorian', label: 'Ivorian' },
  { value: 'jamaican', label: 'Jamaican' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'jordanian', label: 'Jordanian' },
  { value: 'kazakhstani', label: 'Kazakhstani' },
  { value: 'kenyan', label: 'Kenyan' },
  { value: 'kittian and nevisian', label: 'Kittian and Nevisian' },
  { value: 'kuwaiti', label: 'Kuwaiti' },
  { value: 'kyrgyz', label: 'Kyrgyz' },
  { value: 'laotian', label: 'Laotian' },
  { value: 'latvian', label: 'Latvian' },
  { value: 'lebanese', label: 'Lebanese' },
  { value: 'liberian', label: 'Liberian' },
  { value: 'libyan', label: 'Libyan' },
  { value: 'liechtensteiner', label: 'Liechtensteiner' },
  { value: 'lithuanian', label: 'Lithuanian' },
  { value: 'luxembourger', label: 'Luxembourger' },
  { value: 'macedonian', label: 'Macedonian' },
  { value: 'malagasy', label: 'Malagasy' },
  { value: 'malawian', label: 'Malawian' },
  { value: 'malaysian', label: 'Malaysian' },
  { value: 'maldivan', label: 'Maldivan' },
  { value: 'malian', label: 'Malian' },
  { value: 'maltese', label: 'Maltese' },
  { value: 'marshallese', label: 'Marshallese' },
  { value: 'mauritanian', label: 'Mauritanian' },
  { value: 'mauritian', label: 'Mauritian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'micronesian', label: 'Micronesian' },
  { value: 'moldovan', label: 'Moldovan' },
  { value: 'monacan', label: 'Monacan' },
  { value: 'mongolian', label: 'Mongolian' },
  { value: 'moroccan', label: 'Moroccan' },
  { value: 'mosotho', label: 'Mosotho' },
  { value: 'motswana', label: 'Motswana' },
  { value: 'mozambican', label: 'Mozambican' },
  { value: 'namibian', label: 'Namibian' },
  { value: 'nauruan', label: 'Nauruan' },
  { value: 'nepalese', label: 'Nepalese' },
  { value: 'new zealander', label: 'New Zealander' },
  { value: 'ni-vanuatu', label: 'Ni-Vanuatu' },
  { value: 'nicaraguan', label: 'Nicaraguan' },
  { value: 'nigerian', label: 'Nigerian' },
  { value: 'nigerien', label: 'Nigerien' },
  { value: 'north korean', label: 'North Korean' },
  { value: 'northern irish', label: 'Northern Irish' },
  { value: 'norwegian', label: 'Norwegian' },
  { value: 'omani', label: 'Omani' },
  { value: 'pakistani', label: 'Pakistani' },
  { value: 'palauan', label: 'Palauan' },
  { value: 'panamanian', label: 'Panamanian' },
  { value: 'papua new guinean', label: 'Papua New Guinean' },
  { value: 'paraguayan', label: 'Paraguayan' },
  { value: 'peruvian', label: 'Peruvian' },
  { value: 'polish', label: 'Polish' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'qatari', label: 'Qatari' },
  { value: 'romanian', label: 'Romanian' },
  { value: 'russian', label: 'Russian' },
  { value: 'rwandan', label: 'Rwandan' },
  { value: 'saint lucian', label: 'Saint Lucian' },
  { value: 'salvadoran', label: 'Salvadoran' },
  { value: 'samoan', label: 'Samoan' },
  { value: 'san marinese', label: 'San Marinese' },
  { value: 'sao tomean', label: 'Sao Tomean' },
  { value: 'saudi', label: 'Saudi' },
  { value: 'scottish', label: 'Scottish' },
  { value: 'senegalese', label: 'Senegalese' },
  { value: 'serbian', label: 'Serbian' },
  { value: 'seychellois', label: 'Seychellois' },
  { value: 'sierra leonean', label: 'Sierra Leonean' },
  { value: 'singaporean', label: 'Singaporean' },
  { value: 'slovakian', label: 'Slovakian' },
  { value: 'slovenian', label: 'Slovenian' },
  { value: 'solomon islander', label: 'Solomon Islander' },
  { value: 'somali', label: 'Somali' },
  { value: 'south african', label: 'South African' },
  { value: 'south korean', label: 'South Korean' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'sri lankan', label: 'Sri Lankan' },
  { value: 'sudanese', label: 'Sudanese' },
  { value: 'surinamer', label: 'Surinamer' },
  { value: 'swazi', label: 'Swazi' },
  { value: 'swedish', label: 'Swedish' },
  { value: 'swiss', label: 'Swiss' },
  { value: 'syrian', label: 'Syrian' },
  { value: 'taiwanese', label: 'Taiwanese' },
  { value: 'tajik', label: 'Tajik' },
  { value: 'tanzanian', label: 'Tanzanian' },
  { value: 'thai', label: 'Thai' },
  { value: 'togolese', label: 'Togolese' },
  { value: 'tongan', label: 'Tongan' },
  { value: 'trinidadian or tobagonian', label: 'Trinidadian or Tobagonian' },
  { value: 'tunisian', label: 'Tunisian' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'tuvaluan', label: 'Tuvaluan' },
  { value: 'ugandan', label: 'Ugandan' },
  { value: 'ukrainian', label: 'Ukrainian' },
  { value: 'uruguayan', label: 'Uruguayan' },
  { value: 'uzbekistani', label: 'Uzbekistani' },
  { value: 'venezuelan', label: 'Venezuelan' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'welsh', label: 'Welsh' },
  { value: 'yemenite', label: 'Yemenite' },
  { value: 'zambian', label: 'Zambian' },
  { value: 'zimbabwean', label: 'Zimbabwean' }
]

// Add religion options
const religionOptions = [
  { value: '', label: 'Select religion' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'islam', label: 'Islam' },
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'buddhism', label: 'Buddhism' },
  { value: 'judaism', label: 'Judaism' },
  { value: 'sikhism', label: 'Sikhism' },
  { value: 'taoism', label: 'Taoism' },
  { value: 'confucianism', label: 'Confucianism' },
  { value: 'shinto', label: 'Shinto' },
  { value: 'jainism', label: 'Jainism' },
  { value: 'zoroastrianism', label: 'Zoroastrianism' },
  { value: 'bahai', label: 'Bahai' },
  { value: 'other', label: 'Other' }
]

const classes = ref<{ class_id: string, class_name: string }[]>([])
const isLoadingClasses = ref(false)

// Fetch users from Supabase
const fetchUsers = async () => {
  isLoading.value = true
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    // For superadmin, only fetch users if a school is selected
    if (userRole.value === 'superadmin' && !schoolId) {
      users.value = []
      isLoading.value = false
      return
    }

    const { users: authUsers } = await getUsersWithRoles(
      currentUserRole.value ?? undefined,
      schoolId // Always pass schoolId for filtering
    )

    // Transform the auth users into our User interface format
    users.value = authUsers.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
      role: user.custom_role || 'user',
      status: user.confirmed_at ? 'active' : 'pending',
      name: user.user_metadata?.full_name || undefined,
      avatar_url: user.user_metadata?.avatar_url || undefined,
      username: user.username || '',
      identification: user.identification || null,
      grade_level: user.grade_level || null,
      dob: user.dob || null,
      age: typeof user.age === 'number' ? user.age : null,
      gender: user.gender || null,
      class_id: user.class_id || null,
      class_name: user.class_name || null,
      nationality: user.nationality || null,
      religion: user.religion || null
    }))
  } catch (error: any) {
    console.error('Error fetching users:', error)
    if (error.message?.includes('Missing required Supabase environment variables')) {
      toast.error('Configuration error: Missing Supabase credentials')
    } else {
      toast.error(error.message || 'Failed to fetch users')
    }
  } finally {
    isLoading.value = false
  }
}

// Fetch grades from Supabase
const fetchGrades = async () => {
  isLoadingGrades.value = true
  try {
    grades.value = await getGrades()
  } catch (error: any) {
    console.error('Error fetching grades:', error)
    toast.error('Failed to fetch grade levels')
  } finally {
    isLoadingGrades.value = false
  }
}

// Fetch classes for class_id dropdown
const fetchClasses = async () => {
  isLoadingClasses.value = true
  try {
    classes.value = await getClasses()
    console.log('Fetched classes:', classes.value)
  } catch (error) {
    console.error('Error fetching classes:', error)
    toast.error('Failed to fetch classes')
  } finally {
    isLoadingClasses.value = false
  }
}

// Utility functions
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const getRoleBadgeClass = (role: string) => {
  const classes = {
    superadmin: 'bg-danger',
    admin: 'bg-primary',
    teacher: 'bg-success',
    student: 'bg-info',
    parent: 'bg-warning',
    accountant: 'bg-secondary',
    registrar: 'bg-dark',
    user: 'bg-secondary'
  }
  return `badge ${classes[role as keyof typeof classes] || 'bg-secondary'}`
}

const getStatusBadgeClass = (status: string) => {
  const classes = {
    active: 'bg-success',
    inactive: 'bg-danger',
    pending: 'bg-warning'
  }
  return `badge ${classes[status as keyof typeof classes] || 'bg-secondary'}`
}

// Actions
const handleSearch = () => {
  currentPage.value = 1 // Reset to first page when searching
}

const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = filteredUsers.value.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const clearSelection = () => {
  selectedUsers.value = []
  selectAll.value = false
}

// Pagination methods
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// CRUD Operations
const openAddUserModal = () => {
  showAddUserModal.value = true
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
  addUserForm.value = { 
    email: '', 
    password: '', 
    username: '', 
    role: '',
    identification: '',
    gradeLevel: '',
    dob: '',
    age: '',
    gender: '',
    class_id: '',
    nationality: '',
    religion: ''
  }
}

const handleAddUser = async () => {
  addUserLoading.value = true
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    // Only include school_id for non-superadmin roles
    const schoolIdToAdd = addUserForm.value.role === 'superadmin' ? null : schoolId;

    if (!schoolIdToAdd && addUserForm.value.role !== 'superadmin') {
      throw new Error('No school ID found. Please select a school first.');
    }

    await addUserWithRole({
      email: addUserForm.value.email,
      username: addUserForm.value.username,
      role: addUserForm.value.role,
      identification: addUserForm.value.identification,
      gradeLevel: addUserForm.value.gradeLevel,
      dob: addUserForm.value.dob,
      age: addUserForm.value.age ? Number(addUserForm.value.age) : undefined,
      gender: addUserForm.value.gender,
      class_id: addUserForm.value.class_id,
      nationality: addUserForm.value.nationality,
      religion: addUserForm.value.religion,
      school_id: schoolIdToAdd // Add school_id to the user creation
    })
    toast.success('User added successfully!')
    closeAddUserModal()
    await fetchUsers()
  } catch (error: any) {
    console.error('Error adding user:', error)
    toast.error(error.message || 'Failed to add user')
  } finally {
    addUserLoading.value = false
  }
}

const openEditUserModal = (user: User) => {
  console.log('Opening edit modal for user:', user) // Debug log
  console.log('User data from API:', {
    dob: user.dob,
    age: user.age,
    gender: user.gender,
    class_id: user.class_id,
    nationality: user.nationality,
    religion: user.religion
  }) // Debug log
  editUserForm.value = {
    email: user.email,
    username: user.username || '',
    role: user.role,
    identification: user.identification || '',
    gradeLevel: user.grade_level || '',
    dob: user.dob || '',
    age: user.age?.toString() || '',
    gender: user.gender || '',
    class_id: user.class_id || '',
    nationality: user.nationality || '',
    religion: user.religion || ''
  }
  console.log('Edit form data:', editUserForm.value) // Debug log
  showEditUserModal.value = true
}

const closeEditUserModal = () => {
  showEditUserModal.value = false
  editUserForm.value = { 
    email: '', 
    username: '', 
    role: '',
    identification: '',
    gradeLevel: '',
    dob: '',
    age: '',
    gender: '',
    class_id: '',
    nationality: '',
    religion: ''
  }
}

const handleEditUser = async () => {
  editUserLoading.value = true
  try {
    // Validate required fields based on role
    if (['teacher', 'student', 'parent', 'accountant', 'registrar', 'admin'].includes(editUserForm.value.role) && !editUserForm.value.identification) {
      throw new Error('Identification is required for this role')
    }
    if (editUserForm.value.role === 'student' && !editUserForm.value.gradeLevel) {
      throw new Error('Grade level is required for students')
    }

    // Prepare the data to send
    const updateData = {
      email: editUserForm.value.email,
      username: editUserForm.value.username,
      role: editUserForm.value.role,
      identification: editUserForm.value.identification || undefined,
      gradeLevel: editUserForm.value.gradeLevel || undefined,
      dob: editUserForm.value.dob || undefined,
      age: editUserForm.value.age ? Number(editUserForm.value.age) : undefined,
      gender: editUserForm.value.gender || undefined,
      class_id: editUserForm.value.class_id || undefined,
      nationality: editUserForm.value.nationality || undefined,
      religion: editUserForm.value.religion || undefined
    }

    console.log('Updating user with data:', updateData) // Debug log

    await updateUserWithRole(updateData)
    toast.success('User updated successfully!')
    closeEditUserModal()
    await fetchUsers() // Refresh the users list to show updated data
  } catch (error: any) {
    console.error('Error updating user:', error)
    toast.error(error.message || 'Failed to update user')
  } finally {
    editUserLoading.value = false
  }
}

const openDeleteUserModal = (user: User) => {
  deleteUserTarget.value = user
  showDeleteUserModal.value = true
}

const closeDeleteUserModal = () => {
  showDeleteUserModal.value = false
  deleteUserTarget.value = null
}

const confirmDeleteUser = async () => {
  if (!deleteUserTarget.value) return
  deleteUserLoading.value = true
  try {
    await deleteUserApi(deleteUserTarget.value.id)
    toast.success('User deleted successfully!')
    closeDeleteUserModal()
    await fetchUsers()
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete user')
  } finally {
    deleteUserLoading.value = false
  }
}

const handleRoleChange = () => {
  // Clear grade level if role is not student
  if (editUserForm.value.role !== 'student') {
    editUserForm.value.gradeLevel = ''
  }
}

const openViewUserModal = (user: User) => {
  viewUserTarget.value = user
  showViewUserModal.value = true
}

const closeViewUserModal = () => {
  showViewUserModal.value = false
  viewUserTarget.value = null
}

// Add the handler function for school selection
const handleSchoolSelected = async (schoolId: string) => {
  if (userRole.value === 'superadmin') {
    await fetchUsers() // Refetch users when school is selected
  }
}

// Add watch for selected school changes
watch(
  () => authStore.getSelectedSchoolId,
  async (newSchoolId) => {
    if (userRole.value === 'superadmin') {
      await fetchUsers() // Refetch users when selected school changes
    }
  }
)

// Initialize
onMounted(() => {
  fetchUsers()
  fetchGrades()
  fetchClasses()
})
</script>

<style scoped lang="scss">
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.card {
  max-width: 100%;
  overflow-x: auto;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  transform: none !important;
  transition: none !important;

  .card-body {
    padding: 1.5rem;
  }

  &:hover {
    transform: none !important;
    box-shadow: none;
  }
}

.search-box {
  position: relative;
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
  }
  
  .search-input {
    padding-left: 35px;
  }
}

.user-avatar {
  img {
    object-fit: cover;
  }
}

.bulk-actions-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  
  .container {
    max-width: 1280px;
    margin: 0 auto;
  }
  
  &.show {
    transform: translateY(0);
  }
}

.table {
  margin-bottom: 0;
  
  tbody tr {
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f8f9fa !important;
      cursor: pointer;
    }
  }
  
  tr.selected {
    background-color: #f8f9fa;
  }
  
  th {
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 2px solid #dee2e6;
  }

  td {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 1px solid #dee2e6;
  }
}

.badge {
  padding: 0.5em 0.75em;
  font-weight: 500;
  text-transform: capitalize;
}

.pagination {
  .page-link {
    color: #42b883;
    
    &:hover {
      color: darken(#42b883, 10%);
    }
  }
  
  .active .page-link {
    background-color: #42b883;
    border-color: #42b883;
    color: white;
  }
}

@media (max-width: 1400px) {
  .container {
    max-width: 1140px;
  }
}

@media (max-width: 1200px) {
  .container {
    max-width: 960px;
  }
}

@media (max-width: 992px) {
  .container {
    max-width: 720px;
  }
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

// Modern Modal Styles
.modern-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.modern-modal-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 40px rgba(30, 41, 59, 0.18);
  max-width: 800px;
  width: 100%;
  padding: 2.5rem 3rem 2rem 3rem;
  position: relative;
  animation: modal-pop-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modern-modal-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;
  &:hover {
    color: #42b883;
  }
}

.modern-modal-header {
  margin-bottom: 1.5rem;
  text-align: center;
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: #2c3e50;
  }
  p {
    font-size: 1rem;
    color: #6c757d;
  }
}

.modern-modal-form {
  .form-section {
    background: #f8f9fa;
    border-radius: 0.75rem;
    padding: 2rem;
    margin-bottom: 1.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 1.25rem;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-control,
  .form-select {
    height: 3.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: #fff;
    transition: all 0.2s ease;
    font-size: 0.95rem;

    &:disabled {
      background-color: #f1f5f9;
      cursor: not-allowed;
      opacity: 0.8;
    }

    &::placeholder {
      color: #94a3b8;
    }

    &:focus {
      border-color: #42b883;
      box-shadow: 0 0 0 0.2rem rgba(66, 184, 131, 0.15);
    }
  }

  .form-select {
    color: #1e293b;
    
    option:first-child {
      color: #94a3b8;
    }
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    border-radius: 0.5rem;
    transition: all 0.2s ease;

    &.btn-primary {
      background: #42b883;
      border: none;

      &:hover {
        background: #369f6b;
      }

      &:disabled {
        background: #a8e6c1;
      }
    }

    &.btn-outline-secondary {
      border-color: #e2e8f0;
      color: #64748b;

      &:hover {
        background: #f8f9fa;
        border-color: #cbd5e1;
        color: #475569;
      }
    }
  }
}

// Modal fade/scale animation
.modern-modal-fade-enter-active,
.modern-modal-fade-leave-active {
  transition: opacity 0.2s;
}
.modern-modal-fade-enter-from,
.modern-modal-fade-leave-to {
  opacity: 0;
}

.skeleton {
  display: inline-block;
  height: 1.2em;
  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 37%, #f0f0f0 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.2s ease-in-out infinite;
  border-radius: 0.4em;
}
.skeleton-checkbox {
  width: 1.2em;
  height: 1.2em;
  border-radius: 0.25em;
}
.skeleton-badge {
  width: 4em;
  height: 1.2em;
}
.skeleton-text {
  width: 10em;
  height: 1.2em;
}
.skeleton-text.short {
  width: 6em;
}
.skeleton-actions {
  width: 3em;
  height: 1.2em;
}
@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.delete-user-email {
  text-align: center;
  font-size: 1.1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 850px) {
  .modern-modal-card {
    max-width: 95%;
    padding: 2rem 1.5rem 1.5rem 1.5rem;
  }
}

.user-details-section {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.2rem 1.2rem 0.7rem 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(30,41,59,0.04);
}
.user-details-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}
.user-details-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.97rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.2px;
}
.user-details-value {
  font-size: 1.08rem;
  color: #222f3e;
  font-weight: 500;
  word-break: break-word;
}
.user-status-chip {
  display: inline-block;
  padding: 0.35em 1.1em;
  border-radius: 1em;
  font-size: 0.98em;
  font-weight: 600;
  text-transform: capitalize;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #d1d5db;
  margin-top: 2px;
}
.user-status-chip.active {
  background: #e9fbe7;
  color: #22c55e;
  border: 1px solid #b6f2c2;
}
</style> 