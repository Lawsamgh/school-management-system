<template>
  <div class="settings-root">
    <div class="settings-view">
      <div class="container py-5">
        <div class="settings-header mb-4">
          <h1>School Settings</h1>
          <p class="text-muted">Manage your school's configuration and preferences</p>
        </div>

        <!-- Add SchoolSelector for superadmin -->
        <div v-if="userRole === 'superadmin'" class="mb-4">
          <SchoolSelector @school-selected="handleSchoolSelected" />
        </div>

        <!-- Show message when no school is selected for superadmin -->
        <div v-if="userRole === 'superadmin' && !authStore.getSelectedSchoolId" class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          Please select a school from the dropdown above to view and manage its settings.
        </div>

        <!-- Only show settings when a school is selected for superadmin or when user is admin -->
        <div v-if="userRole === 'admin' || (userRole === 'superadmin' && authStore.getSelectedSchoolId)" class="row g-4">
          <!-- Left Side Tab Menu -->
          <div class="col-lg-3">
            <div class="settings-tabs">
              <!-- Show all tabs for admin -->
              <template v-if="userRole === 'superadmin'">
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'school' }"
                  @click="activeTab = 'school'"
                >
                  <i class="fas fa-school"></i>
                  <span>School Information</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'academic' }"
                  @click="activeTab = 'academic'"
                >
                  <i class="fas fa-futbol"></i>
                  <span>Manage Activities</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'notifications' }"
                  @click="activeTab = 'notifications'"
                >
                  <i class="fas fa-bell"></i>
                  <span>Notifications</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'security' }"
                  @click="activeTab = 'security'"
                >
                  <i class="fas fa-shield-alt"></i>
                  <span>Security</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'appearance' }"
                  @click="activeTab = 'appearance'"
                >
                  <i class="fas fa-paint-brush"></i>
                  <span>Appearance</span>
                </div>
              </template>
              <!-- Show specific tabs for admin -->
              <template v-else-if="userRole === 'admin'">
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'school' }"
                  @click="activeTab = 'school'"
                >
                  <i class="fas fa-school"></i>
                  <span>School Information</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'academic' }"
                  @click="activeTab = 'academic'"
                >
                  <i class="fas fa-running"></i>
                  <span>Manage Activities</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="col-lg-9">
            <!-- School Information - For both Admin and Superadmin -->
            <div v-show="activeTab === 'school'" class="settings-card">
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-school"></i>
                  School Information
                </h2>
                <button 
                  class="btn btn-primary save-btn" 
                  @click="saveSchoolInfo"
                  :disabled="savingSchoolInfo"
                >
                  <i class="fas fa-save me-2"></i>
                  {{ savingSchoolInfo ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
              <div class="settings-card-body">
                <div class="row g-3">
                  <!-- Add School Logo Upload Section -->
                  <div class="col-12 mb-4">
                    <div class="school-logo-section">
                      <label class="modern-label">School Logo</label>
                      <div class="logo-upload-container" :class="{ 'has-image': schoolLogoPreview }">
                        <input
                          type="file"
                          id="schoolLogo"
                          ref="schoolLogoInput"
                          class="logo-upload-input"
                          accept="image/*"
                          @change="handleLogoUpload"
                        >
                        <div class="logo-upload-content">
                          <template v-if="schoolLogoPreview">
                            <img :src="schoolLogoPreview" alt="School logo preview" class="logo-preview">
                            <button type="button" class="btn-remove-logo" @click="removeLogo">
                              <i class="fas fa-times"></i>
                            </button>
                          </template>
                          <template v-else>
                            <div class="upload-placeholder">
                              <i class="fas fa-cloud-upload-alt upload-icon"></i>
                              <p class="upload-text">
                                Drag and drop your logo here or
                                <span class="upload-browse">browse</span>
                              </p>
                              <p class="upload-hint">Supports: JPG, PNG (Max 2MB)</p>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="schoolName">School Name</label>
                      <input
                        type="text"
                        id="schoolName"
                        v-model="schoolInfo.name"
                        class="form-control"
                        placeholder="Enter school name"
                        :disabled="userRole === 'admin'"
                        :title="userRole === 'admin' ? 'School name can only be changed by superadmin' : ''"
                      >
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="schoolPhone">Phone Number</label>
                      <input
                        type="tel"
                        id="schoolPhone"
                        v-model="schoolInfo.phone"
                        class="form-control"
                        placeholder="Enter phone number"
                      >
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group">
                      <label for="schoolEmail">School Email</label>
                      <input
                        type="email"
                        id="schoolEmail"
                        v-model="schoolInfo.email"
                        class="form-control"
                        placeholder="Enter school email"
                      >
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-group">
                      <label for="schoolAddress">School Address</label>
                      <textarea
                        id="schoolAddress"
                        v-model="schoolInfo.address"
                        class="form-control"
                        rows="3"
                        placeholder="Enter school address"
                      ></textarea>
                    </div>
                  </div>
                  <!-- Add refresh message -->
                  <div v-if="showRefreshMessage" class="col-12 mt-3">
                    <div class="alert alert-info d-flex align-items-center" role="alert">
                      <i class="fas fa-sync-alt me-2"></i>
                      <span>Please refresh the page to see the updated changes.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Educational Programs - Visible to both admin and headmaster -->
            <div v-show="activeTab === 'academic'" class="settings-card">
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-running"></i>
                  Manage Activities
                </h2>
                <button 
                  class="btn btn-primary save-btn" 
                  @click="saveEducationalPrograms"
                  :disabled="savingAcademic || !isEducationalProgramFormValid"
                >
                  <i class="fas fa-save me-2"></i>
                  {{ savingAcademic ? 'Saving...' : 'Save Activity' }}
                </button>
              </div>
              <div class="settings-card-body">
                <!-- Add Program Form -->
                <div class="row g-4 align-items-stretch mb-5">
                  <div class="col-md-7">
                    <div class="program-info-container">
                      <h6 class="section-subtitle mb-4">Add New Activity</h6>
                      <div class="row g-4">
                        <div class="col-12">
                          <div class="modern-form-group">
                            <label for="programName" class="modern-label">
                              Activity Name <span class="required-field">*</span>
                            </label>
                            <input
                              type="text"
                              id="programName"
                              v-model="educationalPrograms.name"
                              class="modern-input"
                              :class="{ 'is-invalid': educationalPrograms.name.trim() === '' }"
                              placeholder="Enter program name"
                              required
                            >
                            <div class="invalid-feedback" v-if="educationalPrograms.name.trim() === ''">
                              Activity name is required
                            </div>
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="modern-form-group">
                            <label for="programDescription" class="modern-label">
                              Activity Description <span class="required-field">*</span>
                            </label>
                            <textarea
                              id="programDescription"
                              v-model="educationalPrograms.description"
                              class="modern-input modern-textarea"
                              :class="{ 'is-invalid': educationalPrograms.description.trim() === '' }"
                              rows="6"
                              placeholder="Enter program description"
                              required
                            ></textarea>
                            <div class="invalid-feedback" v-if="educationalPrograms.description.trim() === ''">
                              Activity description is required
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-5">
                    <div class="program-image-container">
                      <h6 class="section-subtitle mb-4">Activity Image <span class="required-field">*</span></h6>
                      <div class="image-upload-wrapper">
                        <div class="image-upload-container" :class="{ 'has-image': programImagePreview, 'is-invalid': isImageRequired }">
                          <input
                            type="file"
                            id="programImage"
                            ref="programImageInput"
                            class="image-upload-input"
                            accept="image/*"
                            @change="handleImageUpload"
                            required
                          >
                          <div class="image-upload-content">
                            <template v-if="programImagePreview">
                              <img :src="programImagePreview" alt="Program image preview" class="image-preview">
                              <button type="button" class="btn-remove-image" @click="removeImage">
                                <i class="fas fa-times"></i>
                              </button>
                            </template>
                            <template v-else>
                              <div class="upload-placeholder">
                                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                                <p class="upload-text">
                                  Drag and drop your image here or
                                  <span class="upload-browse">browse</span>
                                </p>
                                <p class="upload-hint">Supports: JPG, PNG, GIF (Max 5MB)</p>
                              </div>
                            </template>
                          </div>
                        </div>
                        <div class="invalid-feedback" v-if="isImageRequired">
                          Activity image is required
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Programs List -->
                <div class="programs-list mt-5">
                  <h6 class="section-subtitle mb-4">Existing Activities</h6>
                  
                  <!-- Programs Grid with Animation -->
                  <transition-group 
                    name="program-slide" 
                    tag="div" 
                    class="row g-4"
                  >
                    <div 
                      v-for="program in paginatedPrograms" 
                      :key="program.id" 
                      class="col-md-6 col-lg-4"
                    >
                      <div class="program-card">
                        <div class="program-card-image">
                          <img 
                            :src="program.program_image || 'https://via.placeholder.com/300x200'" 
                            :alt="program.program_name"
                          >
                          <button 
                            class="btn-delete-program" 
                            @click="openDeleteModal(program)"
                            type="button"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                          <button 
                            class="btn-edit-program" 
                            @click="openEditModal(program)"
                            type="button"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                        </div>
                        <div class="program-card-content">
                          <h3 class="program-card-title">{{ program.program_name }}</h3>
                          <p class="program-card-description">{{ program.program_description }}</p>
                        </div>
                      </div>
                    </div>
                  </transition-group>

                  <!-- Pagination Controls -->
                  <div class="pagination-controls mt-4" v-if="totalPages > 1">
                    <button 
                      class="btn-pagination" 
                      :disabled="currentPage === 1"
                      @click="previousPage"
                    >
                      <i class="fas fa-chevron-left"></i>
                      Previous
                    </button>
                    <div class="pagination-info">
                      Page {{ currentPage }} of {{ totalPages }}
                    </div>
                    <button 
                      class="btn-pagination" 
                      :disabled="currentPage === totalPages"
                      @click="nextPage"
                    >
                      Next
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications Settings - Visible only to superadmin -->
            <div v-if="userRole === 'superadmin'" v-show="activeTab === 'notifications'" class="settings-card">
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-bell"></i>
                  Notification Settings
                </h2>
              </div>
              <div class="settings-card-body">
                <div class="quick-settings-list">
                  <div class="quick-setting-item">
                    <div class="setting-info">
                      <h3>SMS Alerts</h3>
                      <p>Enable SMS notification</p>
                    </div>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="smsAlerts"
                        v-model="quickSettings.smsAlerts"
                        :disabled="savingNotifications"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Settings - Admin Only -->
            <div v-if="userRole === 'superadmin'" v-show="activeTab === 'security'" class="settings-card">
              <!-- ... existing security content ... -->
            </div>

            <!-- Appearance Settings - Admin Only -->
            <div v-if="userRole === 'superadmin'" v-show="activeTab === 'appearance'" class="settings-card">
              <!-- ... existing appearance content ... -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-show="isDeleteModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-exclamation-triangle text-danger"></i>
            <h3>Delete Program</h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete "<span class="fw-bold">{{ selectedProgram?.program_name }}</span>"?</p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeDeleteModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-danger ms-2" 
              @click="handleDeleteProgram"
              :disabled="isDeleting"
              type="button"
            >
              <span v-if="isDeleting">
                <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
              </span>
              <span v-else>
                <i class="fas fa-trash me-2"></i>Delete Program
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-show="isEditModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-edit text-primary"></i>
            <h3>Edit Program</h3>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-12">
                <div class="modern-form-group">
                  <label for="editProgramName" class="modern-label">
                    Program Name <span class="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    id="editProgramName"
                    v-model="editingProgram.name"
                    class="modern-input"
                    :class="{ 'is-invalid': editingProgram.name.trim() === '' }"
                    placeholder="Enter program name"
                    required
                  >
                  <div class="invalid-feedback" v-if="editingProgram.name.trim() === ''">
                    Program name is required
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="modern-form-group">
                  <label for="editProgramDescription" class="modern-label">
                    Program Description <span class="required-field">*</span>
                  </label>
                  <textarea
                    id="editProgramDescription"
                    v-model="editingProgram.description"
                    class="modern-input modern-textarea"
                    :class="{ 'is-invalid': editingProgram.description.trim() === '' }"
                    rows="6"
                    placeholder="Enter program description"
                    required
                  ></textarea>
                  <div class="invalid-feedback" v-if="editingProgram.description.trim() === ''">
                    Program description is required
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="modern-form-group">
                  <label class="modern-label">
                    Program Image
                  </label>
                  <div class="image-upload-wrapper">
                    <div class="image-upload-container" :class="{ 'has-image': editImagePreview }">
                      <input
                        type="file"
                        id="editProgramImage"
                        ref="editProgramImageInput"
                        class="image-upload-input"
                        accept="image/*"
                        @change="handleEditImageUpload"
                      >
                      <div class="image-upload-content">
                        <template v-if="editImagePreview">
                          <img :src="editImagePreview" alt="Program image preview" class="image-preview">
                          <button type="button" class="btn-remove-image" @click="removeEditImage">
                            <i class="fas fa-times"></i>
                          </button>
                        </template>
                        <template v-else>
                          <img 
                            :src="editingProgram.currentImage" 
                            alt="Current program image" 
                            class="image-preview"
                          >
                          <div class="upload-overlay">
                            <i class="fas fa-cloud-upload-alt upload-icon"></i>
                            <p class="upload-text">Click to change image</p>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeEditModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary ms-2" 
              @click="handleEditProgram"
              :disabled="isEditing || !isEditFormValid"
              type="button"
            >
              <span v-if="isEditing">
                <i class="fas fa-spinner fa-spin me-2"></i>Saving...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>Save Changes
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import SchoolSelector from '@/components/SchoolSelector.vue'

const toast = useToast()

// Add separate saving states for each card
const savingSchoolInfo = ref(false)
const savingAcademic = ref(false)
const savingNotifications = ref(false)
const isInitializing = ref(true)

const activeTab = ref('school')
const showRefreshMessage = ref(false)

const authStore = useAuthStore()
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)

const schoolInfo = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const educationalPrograms = ref({
  name: '',
  description: '',
  features: [] as string[],
  schedule: '',
  class_size: '',
  curriculum: '',
  newFeature: '' // For adding new features
})

const quickSettings = ref({
  emailNotifications: true,
  smsAlerts: false,
  publicWebsite: true
})

const programImageInput = ref<HTMLInputElement | null>(null)
const programImagePreview = ref<string | null>(null)

const programsList = ref<any[]>([])

// Delete modal state
const isDeleteModalOpen = ref(false)
const selectedProgram = ref<any>(null)
const isDeleting = ref(false)

const isImageRequired = ref(false)

const isEditModalOpen = ref(false)
const editingProgram = ref({
  id: null as number | null,
  name: '',
  description: '',
  currentImage: ''
})
const editImagePreview = ref<string | null>(null)

const isEditing = ref(false)
const isEditFormValid = ref(true)

// Add these new refs for pagination
const currentPage = ref(1)
const itemsPerPage = ref(6) // Show 6 items per page (2 rows of 3 cards)

// Add computed properties for pagination
const totalPages = computed(() => {
  return Math.ceil(programsList.value.length / itemsPerPage.value)
})

const paginatedPrograms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return programsList.value.slice(start, end)
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation: () => Promise<any>, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt === maxAttempts) throw error;
      await wait(delay * attempt); // Exponential backoff
    }
  }
};

// Add logo related refs
const schoolLogoInput = ref<HTMLInputElement | null>(null)
const schoolLogoPreview = ref<string | null>(null)
const currentLogoUrl = ref<string | null>(null)

// Handle logo upload
const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should not exceed 2MB')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        schoolLogoPreview.value = result
      }
    }
    reader.readAsDataURL(file)
  }
}

// Remove logo
const removeLogo = () => {
  schoolLogoPreview.value = null
  if (schoolLogoInput.value) {
    schoolLogoInput.value.value = ''
  }
}

// Modify fetchSchoolInfo to include logo
const fetchSchoolInfo = async () => {
  try {
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      console.log('No school_id found. For superadmin, please select a school first.')
      return
    }

    let query = supabase
      .from('setup')
      .select('school_name, school_email, school_contact1, school_address, school_logo')
      .eq('school_id', schoolId)

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return
      }
      throw error
    }

    if (data) {
      console.log('Fetched school data:', data)
      schoolInfo.value = {
        name: data.school_name || '',
        email: data.school_email || '',
        phone: data.school_contact1 || '',
        address: data.school_address || ''
      }
      currentLogoUrl.value = data.school_logo || null
      schoolLogoPreview.value = data.school_logo || null
    }
  } catch (error: any) {
    console.error('Error fetching school info:', error)
    toast.error('Failed to load school information')
  }
}

// Modify saveSchoolInfo to include logo upload
const saveSchoolInfo = async () => {
  savingSchoolInfo.value = true
  showRefreshMessage.value = false
  try {
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    let logoUrl = currentLogoUrl.value

    // Upload new logo if exists
    if (schoolLogoPreview.value && schoolLogoPreview.value !== currentLogoUrl.value) {
      const target = schoolLogoInput.value
      const file = target?.files?.[0]
      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `school-logo-${schoolId}-${Date.now()}.${fileExt}`
          
          // Upload new logo
          const { error: uploadError } = await supabase.storage
            .from('school-logos')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            })

          if (uploadError) throw uploadError
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('school-logos')
            .getPublicUrl(fileName)
            
          logoUrl = publicUrl

          // Delete old logo if exists
          if (currentLogoUrl.value) {
            const oldLogoPath = currentLogoUrl.value.split('/').pop()
            if (oldLogoPath) {
              await supabase.storage
                .from('school-logos')
                .remove([oldLogoPath])
            }
          }
        } catch (uploadError: any) {
          console.error('Logo upload error:', uploadError)
          toast.error(uploadError.message || 'Failed to upload logo. Please make sure the file is an image and under 2MB.')
          throw new Error('Failed to upload logo')
        }
      }
    }

    // First update the schools table if superadmin
    if (userRole.value === 'superadmin') {
      const { error: schoolError } = await supabase
        .from('schools')
        .update({
          name: schoolInfo.value.name,
          email: schoolInfo.value.email,
          phone: schoolInfo.value.phone,
          address: schoolInfo.value.address
        })
        .eq('id', schoolId)

      if (schoolError) throw schoolError
    }

    // Then update the setup table
    const { data: existingData } = await supabase
      .from('setup')
      .select('id')
      .eq('school_id', schoolId)
      .single()

    const updateData = {
      school_name: schoolInfo.value.name,
      school_email: schoolInfo.value.email,
      school_contact1: schoolInfo.value.phone,
      school_address: schoolInfo.value.address,
      school_logo: logoUrl,
      school_id: schoolId
    }

    let result
    if (existingData?.id) {
      result = await supabase
        .from('setup')
        .update(updateData)
        .eq('id', existingData.id)
        .select()
    } else {
      result = await supabase
        .from('setup')
        .insert([updateData])
        .select()
    }

    if (result.error) throw result.error
    
    // Update current logo URL after successful save
    currentLogoUrl.value = logoUrl
    
    toast.success('School information saved successfully')
    showRefreshMessage.value = true

    // Refresh the school selector if it exists
    if (userRole.value === 'superadmin') {
      // Emit an event that SchoolSelector component can listen to
      window.dispatchEvent(new CustomEvent('refresh-schools'))
    }
  } catch (error: any) {
    console.error('Error saving school info:', error)
    toast.error(error.message || 'Failed to save school information')
  } finally {
    savingSchoolInfo.value = false
  }
}

// Update the isEducationalProgramFormValid computed property
const isEducationalProgramFormValid = computed(() => {
  return educationalPrograms.value.name.trim() !== '' && 
         educationalPrograms.value.description.trim() !== '' &&
         programImagePreview.value !== null;
});

const saveEducationalPrograms = async () => {
  // Reset validation states
  isImageRequired.value = false;

  // Validate required fields
  if (!programImagePreview.value) {
    isImageRequired.value = true;
    toast.error('Please upload a program image');
    return;
  }

  if (!isEducationalProgramFormValid.value) {
    toast.error('Please fill in all required fields');
    return;
  }

  savingAcademic.value = true;
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.');
    }

    // Upload image if exists
    let programImageUrl = null
    if (programImagePreview.value) {
      const target = programImageInput.value as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `program-image-${Date.now()}.${fileExt}`
          
          // Retry the upload operation
          const { data: uploadData, error: uploadError } = await retryOperation(async () => {
            const result = await supabase.storage
              .from('program-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              })
            
            if (result.error) {
              throw new Error(result.error.message)
            }
            return result
          });

          if (uploadError) {
            throw uploadError
          }
          
          // Get public URL with retry
          const { data: { publicUrl } } = await retryOperation(async () => {
            return supabase.storage
              .from('program-images')
              .getPublicUrl(fileName)
          });
            
          programImageUrl = publicUrl
          
          toast.success('Image uploaded successfully')
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError)
          throw new Error('Failed to upload image. Please check your connection and try again.')
        }
      }
    }

    // Insert into programs table with retry and include school_id
    const { data: programData, error: programError } = await retryOperation(async () => {
      return supabase
        .from('programs')
        .insert([{
          program_name: educationalPrograms.value.name,
          program_description: educationalPrograms.value.description,
          program_image: programImageUrl,
          school_id: schoolId // Add school_id to the insert
        }])
        .select()
        .single()
    });

    if (programError) throw programError

    toast.success('Activity saved successfully')
    
    // Reset form after successful save
    educationalPrograms.value = {
      name: '',
      description: '',
      features: [],
      schedule: '',
      class_size: '',
      curriculum: '',
      newFeature: ''
    }
    programImagePreview.value = null
    if (programImageInput.value) {
      programImageInput.value.value = ''
    }

    // Fetch updated programs list
    await fetchEducationalPrograms()
    
  } catch (error: any) {
    console.error('Error saving activity:', error)
    toast.error(
      error.message === 'Failed to fetch' 
        ? 'Unable to reach the server. Please check your network connection.'
        : error.message || 'Failed to save activity'
    )
  } finally {
    savingAcademic.value = false
  }
}

// Update fetch function to get school-specific programs
const fetchEducationalPrograms = async () => {
  try {
    // Get the school_id based on user role
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      console.log('No school_id found. For superadmin, please select a school first.');
      programsList.value = [];
      return;
    }

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('school_id', schoolId) // Filter by school_id
      .order('created_at', { ascending: false });

    if (error) throw error;

    programsList.value = data || [];
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    toast.error('Failed to load activities');
    programsList.value = [];
  }
}

// Update the watch for smsAlerts
watch(() => quickSettings.value.smsAlerts, async (newValue) => {
  // Skip saving during initialization
  if (isInitializing.value) {
    return
  }
  
  console.log('SMS Alert changed to:', newValue)
  await saveNotificationSettings()
})

const fetchNotificationSettings = async () => {
  try {
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      console.log('No school_id found. For superadmin, please select a school first.')
      return
    }

    console.log('Fetching notification settings for school:', schoolId)
    const { data, error } = await supabase
      .from('setup')
      .select('sms')
      .eq('school_id', schoolId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No notification settings found for school:', schoolId)
        // Set default value when no settings exist
        quickSettings.value.smsAlerts = false
        return
      }
      throw error
    }

    if (data) {
      console.log('Fetched notification settings:', {
        schoolId,
        smsEnabled: data.sms === 'true'
      })
      isInitializing.value = true // Set flag before changing value
      quickSettings.value.smsAlerts = data.sms === 'true'
      // Use nextTick to ensure the watch doesn't trigger immediately
      nextTick(() => {
        isInitializing.value = false
      })
    }
  } catch (error: any) {
    console.error('Error fetching notification settings:', error)
    toast.error('Failed to load notification settings')
  } finally {
    // Reset initialization flag after a short delay
    setTimeout(() => {
      isInitializing.value = false
    }, 100)
  }
}

const saveNotificationSettings = async () => {
  savingNotifications.value = true
  try {
    console.log('Saving SMS setting:', quickSettings.value.smsAlerts)
    
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    const { data: existingData } = await supabase
      .from('setup')
      .select('id')
      .eq('school_id', schoolId)
      .single()

    const smsValue = quickSettings.value.smsAlerts ? 'true' : 'false'
    console.log('SMS value to save:', smsValue)

    const updateData = {
      sms: smsValue,
      school_id: schoolId
    }

    let result
    if (existingData?.id) {
      console.log('Updating existing record:', existingData.id)
      result = await supabase
        .from('setup')
        .update(updateData)
        .eq('id', existingData.id)
        .select()
    } else {
      console.log('Creating new record')
      result = await supabase
        .from('setup')
        .insert([updateData])
        .select()
    }

    if (result.error) throw result.error
    
    console.log('Save result:', result)
    toast.success('Notification settings saved successfully')
  } catch (error: any) {
    console.error('Error saving notification settings:', error)
    toast.error(error.message || 'Failed to save notification settings')
  } finally {
    savingNotifications.value = false
  }
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should not exceed 5MB')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        programImagePreview.value = result
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  programImagePreview.value = null
  if (programImageInput.value) {
    programImageInput.value.value = ''
  }
}

// Modal functions
const openDeleteModal = (program: any) => {
  console.log('Opening modal for program:', program)
  selectedProgram.value = program
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedProgram.value = null
}

const handleDeleteProgram = async () => {
  if (!selectedProgram.value) return

  isDeleting.value = true
  try {
    // Delete the program image from storage if it exists
    if (selectedProgram.value.program_image) {
      const imagePath = selectedProgram.value.program_image.split('/').pop()
      if (imagePath) {
        await supabase.storage
          .from('program-images')
          .remove([imagePath])
      }
    }

    // Delete the program from the database
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', selectedProgram.value.id)

    if (error) throw error

    // Remove from local list
    programsList.value = programsList.value.filter(p => p.id !== selectedProgram.value.id)
    toast.success('Program deleted successfully')
    closeDeleteModal()
  } catch (error: any) {
    console.error('Error deleting program:', error)
    toast.error(error.message || 'Failed to delete program')
  } finally {
    isDeleting.value = false
  }
}

// Add these new functions after activeTab declaration
const saveActiveTab = (tab: string) => {
  localStorage.setItem('settings_active_tab', tab)
}

// Add a watch for activeTab
watch(activeTab, (newTab) => {
  saveActiveTab(newTab)
})

// Modify the onMounted function
onMounted(async () => {
  try {
    // Get saved tab from localStorage
    const savedTab = localStorage.getItem('settings_active_tab')
    if (savedTab) {
      activeTab.value = savedTab
    }
    
    // If user is admin or superadmin has selected a school, fetch all settings
    if (userRole.value === 'admin' || (userRole.value === 'superadmin' && authStore.getSelectedSchoolId)) {
      await Promise.all([
        fetchSchoolInfo(),
        fetchEducationalPrograms(),
        fetchNotificationSettings()
      ])
    }
  } catch (error: any) {
    console.error('Error loading settings:', error)
    toast.error('Failed to load settings')
  }
})

// Add this function to handle adding features
const addFeature = () => {
  if (educationalPrograms.value.newFeature.trim()) {
    educationalPrograms.value.features.push(educationalPrograms.value.newFeature.trim())
    educationalPrograms.value.newFeature = ''
  }
}

// Add this function to remove features
const removeFeature = (index: number) => {
  educationalPrograms.value.features.splice(index, 1)
}

const openEditModal = (program: any) => {
  console.log('Opening edit modal for program:', program)
  editingProgram.value = {
    id: program.id,
    name: program.program_name,
    description: program.program_description,
    currentImage: program.program_image || 'https://via.placeholder.com/300x200'
  }
  editImagePreview.value = null
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editingProgram.value = {
    id: null,
    name: '',
    description: '',
    currentImage: ''
  }
  editImagePreview.value = null
}

const handleEditImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should not exceed 5MB')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        editImagePreview.value = result
      }
    }
    reader.readAsDataURL(file)
  }
}

const removeEditImage = () => {
  editImagePreview.value = null
}

const handleEditProgram = async () => {
  isEditing.value = true;
  try {
    // Validate form
    if (!editingProgram.value.name.trim() || !editingProgram.value.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate image
    if (!editImagePreview.value && !editingProgram.value.currentImage) {
      toast.error('Please upload a new image or select an existing one');
      return;
    }

    // Get the school_id based on user role
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.');
    }

    let programImageUrl = editingProgram.value.currentImage;

    // Upload new image if exists
    if (editImagePreview.value) {
      const target = document.getElementById('editProgramImage') as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `program-image-${Date.now()}.${fileExt}`
          
          // Retry the upload operation
          const { data: uploadData, error: uploadError } = await retryOperation(async () => {
            const result = await supabase.storage
              .from('program-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              })
            
            if (result.error) {
              throw new Error(result.error.message)
            }
            return result
          });

          if (uploadError) {
            throw uploadError
          }
          
          // Get public URL with retry
          const { data: { publicUrl } } = await retryOperation(async () => {
            return supabase.storage
              .from('program-images')
              .getPublicUrl(fileName)
          });
            
          programImageUrl = publicUrl
          
          // Delete old image if it exists and is different from the placeholder
          if (editingProgram.value.currentImage && !editingProgram.value.currentImage.includes('placeholder')) {
            const oldImagePath = editingProgram.value.currentImage.split('/').pop()
            if (oldImagePath) {
              await supabase.storage
                .from('program-images')
                .remove([oldImagePath])
            }
          }
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError)
          throw new Error('Failed to upload image. Please check your connection and try again.')
        }
      }
    }

    // Update program with school_id
    const { data: programData, error: programError } = await retryOperation(async () => {
      return supabase
        .from('programs')
        .update({
          program_name: editingProgram.value.name,
          program_description: editingProgram.value.description,
          program_image: programImageUrl,
          school_id: schoolId // Add school_id to the update
        })
        .eq('id', editingProgram.value.id)
        .select()
        .single();
    });

    if (programError) throw programError;

    // Update local list
    programsList.value = programsList.value.map(p =>
      p.id === editingProgram.value.id ? {
        ...p,
        program_name: editingProgram.value.name,
        program_description: editingProgram.value.description,
        program_image: programImageUrl,
        school_id: schoolId
      } : p
    );

    toast.success('Program updated successfully');
    closeEditModal();
  } catch (error: any) {
    console.error('Error updating program:', error);
    toast.error(error.message || 'Failed to update program');
  } finally {
    isEditing.value = false;
  }
}

// Add pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Reset pagination when programs list changes
watch(programsList, () => {
  currentPage.value = 1
})

// Add watch for selectedSchoolId changes
watch(
  () => authStore.getSelectedSchoolId,
  async (newSchoolId) => {
    if (newSchoolId && userRole.value === 'superadmin') {
      // Reset loading states
      savingSchoolInfo.value = false
      savingAcademic.value = false
      savingNotifications.value = false
      
      // Reset form data
      schoolInfo.value = {
        name: '',
        email: '',
        phone: '',
        address: ''
      }
      schoolLogoPreview.value = null
      currentLogoUrl.value = null
      
      try {
        // Fetch all settings when school is selected
        await Promise.all([
          fetchSchoolInfo(),
          fetchEducationalPrograms(),
          fetchNotificationSettings()
        ])
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to load some settings')
      }
    }
  },
  { immediate: true } // This will make it run immediately on component mount
)

// Add the handler function in the script section
const handleSchoolSelected = async (schoolId: string) => {
  if (schoolId) {
    // Reset loading states
    savingSchoolInfo.value = false
    savingAcademic.value = false
    savingNotifications.value = false
    
    // Reset form data
    schoolInfo.value = {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
    schoolLogoPreview.value = null
    currentLogoUrl.value = null
    
    try {
      // Fetch all settings when school is selected
      await Promise.all([
        fetchSchoolInfo(),
        fetchEducationalPrograms(),
        fetchNotificationSettings()
      ])
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load some settings')
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-view {
  .settings-header {
    h1 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  }

  // Add logo upload styles
  .school-logo-section {
    .logo-upload-container {
      height: 200px;
      border: 2px dashed #e2e8f0;
      border-radius: 1rem;
      padding: 0;
      text-align: center;
      transition: all 0.3s ease;
      background: white;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      &:hover {
        border-color: #42b883;
        background: #f8fafc;
      }

      &.has-image {
        padding: 0;
        border-style: solid;
        border-color: #e2e8f0;

        .logo-preview {
          width: auto;
          height: 100%;
          max-width: 100%;
          object-fit: contain;
          border-radius: 0.75rem;
        }

        &:hover {
          border-color: #42b883;
        }
      }

      .logo-upload-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }

      .logo-upload-content {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .upload-placeholder {
        padding: 2rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
      }

      .upload-icon {
        font-size: 2.5rem;
        color: #42b883;
        margin-bottom: 1.5rem;
      }

      .upload-text {
        color: #334155;
        margin-bottom: 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
      }

      .upload-browse {
        color: #42b883;
        text-decoration: underline;
        font-weight: 500;
        cursor: pointer;
      }

      .upload-hint {
        color: #64748b;
        font-size: 0.85rem;
        margin: 0;
      }

      .btn-remove-logo {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #ef4444;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 3;

        &:hover {
          background: white;
          transform: scale(1.1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        i {
          font-size: 1rem;
        }
      }
    }
  }

  .settings-tabs {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .settings-tab-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;

      i {
        font-size: 1.2rem;
        color: #64748b;
        width: 24px;
        text-align: center;
      }

      span {
        color: #64748b;
        font-weight: 500;
      }

      &:hover {
        background: #f8f9fa;
        border-left-color: #42b883;

        i, span {
          color: #42b883;
        }
      }

      &.active {
        background: #f1f5f9;
        border-left-color: #42b883;

        i, span {
          color: #42b883;
        }
      }
    }
  }

  .settings-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .settings-card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        font-size: 1.25rem;
        margin: 0;
        color: #2c3e50;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        i {
          color: #42b883;
          font-size: 1.2rem;
        }
      }

      .save-btn {
        background: #42b883;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:hover:not(:disabled) {
          background: darken(#42b883, 5%);
        }

        &:disabled {
          background: #42b883;
          opacity: 0.7;
        }
      }
    }

    .settings-card-body {
      padding: 2rem;
    }
  }

  .quick-settings-list {
    .quick-setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;

      &:not(:last-child) {
        border-bottom: 1px solid #eee;
      }

      .setting-info {
        h3 {
          font-size: 1rem;
          margin: 0 0 0.25rem;
          color: #2c3e50;
        }

        p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
      }

      .form-check-input {
        width: 3rem;
        height: 1.5rem;
        cursor: pointer;

        &:checked {
          background-color: #42b883;
          border-color: #42b883;
        }

        &:focus {
          border-color: #42b883;
          box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
        }
      }
    }
  }

  .alert {
    border-radius: 0.5rem;
    border: none;
    background-color: rgba(66, 184, 131, 0.1);
    color: #42b883;
    
    i {
      font-size: 1.1rem;
    }
  }
}

// Make the left sidebar sticky on larger screens
@media (min-width: 992px) {
  .settings-tabs {
    position: sticky;
    top: 2rem;
  }
}

// Responsive adjustments
@media (max-width: 991px) {
  .settings-tabs {
    margin-bottom: 2rem;
  }

  .settings-card {
    .settings-card-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;

      .save-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}

.section-subtitle {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
}

.program-info-container,
.program-image-container {
  height: 100%;
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.5rem;
}

.modern-form-group {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.modern-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #334155;
  font-weight: 500;
  font-size: 0.95rem;
}

.modern-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: #1e293b;

  &:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.modern-textarea {
  resize: vertical;
  min-height: 120px;
}

.input-hint {
  display: block;
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
}

.image-upload-wrapper {
  height: auto;
  margin-bottom: 1rem;
}

.image-upload-container {
  height: 250px;
  min-height: unset;
  border: 2px dashed #e2e8f0;
  border-radius: 1rem;
  padding: 0;
  text-align: center;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: #42b883;
    background: #f8fafc;
  }

  &.has-image {
    padding: 0;
    border-style: solid;
    border-color: #e2e8f0;

    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 0.75rem;
    }

    &:hover {
      border-color: #42b883;
    }
  }

  &.is-invalid {
    border-color: #dc3545;
    
    .upload-icon {
      color: #dc3545;
    }
  }

  .image-upload-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }

  .image-upload-content {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .upload-placeholder {
    padding: 2rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
  }

  .upload-icon {
    font-size: 2.5rem;
    color: #42b883;
    margin-bottom: 1.5rem;
  }

  .upload-text {
    color: #334155;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
  }

  .upload-browse {
    color: #42b883;
    text-decoration: underline;
    font-weight: 500;
    cursor: pointer;
  }

  .upload-hint {
    color: #64748b;
    font-size: 0.85rem;
    margin: 0;
  }

  .btn-remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #ef4444;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 3;

    &:hover {
      background: white;
      transform: scale(1.1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }

    i {
      font-size: 1rem;
    }
  }
}

// Responsive adjustments
@media (max-width: 767px) {
  .program-image-container {
    margin-top: 1.5rem;
  }

  .image-upload-container {
    min-height: 250px;
  }

  .settings-card-body {
    padding: 1.5rem;
  }
}

// Add these to your existing styles
.required-field {
  color: #dc3545;
  margin-left: 4px;
}

.is-invalid {
  border-color: #dc3545;
  
  &:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  font-size: 0.875em;
  color: #dc3545;
}

.modern-input {
  &.is-invalid {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  }
}

// Add these new styles for the program cards
.programs-list {
  .program-card {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 350px;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .program-card-image {
      width: 100%;
      height: 180px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.2));
        pointer-events: none;
      }

      .btn-delete-program,
      .btn-edit-program {
        position: absolute;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
        z-index: 3;
        border: none;

        &:hover {
          transform: scale(1.1);
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        i {
          font-size: 1rem;
        }
      }

      .btn-delete-program {
        top: 1rem;
        right: 1rem;
        background: rgba(239, 68, 68, 0.9);

        &:hover {
          background: #ef4444;
        }
      }

      .btn-edit-program {
        top: 1rem;
        right: 4rem;
        background: rgba(66, 184, 131, 0.9);

        &:hover {
          background: #42b883;
        }
      }
    }

    .program-card-content {
      padding: 1rem;
      background: white;
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;

      .program-card-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.5rem;
        line-height: 1.3;
        height: auto;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .program-card-description {
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0 0 0.5rem 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex-grow: 1;
      }
    }
  }
}

// Modal styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 10000;
}

.modal-content {
  .modal-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #e5e7eb;

    i {
      font-size: 1.5rem;
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .modal-body {
    padding: 1.5rem;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    
    .row {
      margin: 0;
      
      .col-12 {
        padding: 0.75rem;
      }
    }
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }
}

.features-input-group {
  .features-list {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;

    span {
      color: #1e293b;
      font-size: 0.9rem;
    }

    .btn-remove-feature {
      background: none;
      border: none;
      padding: 0;
      color: #ef4444;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: scale(1.1);
      }

      i {
        font-size: 0.8rem;
      }
    }
  }
}

// Add these new styles for the edit modal
.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  .upload-icon {
    font-size: 2rem;
    color: white;
    margin-bottom: 1rem;
  }

  .upload-text {
    color: white;
    font-size: 1rem;
    margin: 0;
  }
}

// Add these new styles for pagination and animations
.program-slide-move {
  transition: transform 0.5s ease;
}

.program-slide-enter-active,
.program-slide-leave-active {
  transition: all 0.5s ease;
}

.program-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.program-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 0;

  .btn-pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    background: white;
    color: #1e293b;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover:not(:disabled) {
      border-color: #42b883;
      color: #42b883;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f8fafc;
    }

    i {
      font-size: 0.8rem;
    }
  }

  .pagination-info {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

// Responsive adjustments for pagination
@media (max-width: 767px) {
  .pagination-controls {
    flex-direction: column;
    gap: 1rem;

    .btn-pagination {
      width: 100%;
      justify-content: center;
    }
  }
}
</style> 