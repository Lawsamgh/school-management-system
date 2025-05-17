<!-- AddUserModal.vue -->
<template>
  <transition name="modern-modal-fade">
    <div v-if="modelValue" class="modern-modal-overlay">
      <div class="modern-modal-card" :class="{ 'expanded': addUserForm.role === 'student' || addUserForm.role === 'teacher' }">
        <button class="modern-modal-close" @click="closeModal" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
        <div class="modern-modal-header">
          <h2>Add New User</h2>
          <p class="text-muted mb-0">Create a new user and assign a role</p>
        </div>
        <form class="modern-modal-form" @submit.prevent="handleAddUser">
          <div class="row" :class="{ 'expanded': addUserForm.role === 'student' || addUserForm.role === 'teacher' }">
            <!-- Basic Information Section -->
            <div :class="[
              'transition-width',
              (addUserForm.role === 'student' || addUserForm.role === 'teacher') ? 'col-md-6' : 'col-md-12'
            ]">
              <div class="form-section h-100">
                <h6 class="section-title">Basic Information</h6>
                <div class="row g-3">
                  <div class="col-md-12">
                    <select 
                      class="form-select" 
                      id="addUserRole" 
                      v-model="addUserForm.role" 
                      required
                    >
                      <option value="" disabled>Select role</option>
                      <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
                    </select>
                  </div>
                  <div class="col-md-12">
                    <div class="position-relative">
                      <input 
                        type="text" 
                        class="form-control" 
                        id="addUserIdentification" 
                        v-model="addUserForm.identification" 
                        placeholder="Enter identification number" 
                        required
                        :readonly="autoGenerateEnabled && addUserForm.role !== 'superadmin' && addUserForm.role !== 'student'"
                        :style="autoGenerateEnabled && addUserForm.role !== 'superadmin' && addUserForm.role !== 'student' ? { backgroundColor: '#f8f9fa' } : {}"
                        :class="{ 
                          'is-valid': addUserForm.role === 'student' && studentIdValid === true,
                          'is-invalid': addUserForm.role === 'student' && studentIdValid === false
                        }"
                        @input="addUserForm.role === 'student' ? debouncedValidateStudentId() : null"
                      >
                      <div v-if="isGeneratingId" class="position-absolute top-50 end-0 translate-middle-y pe-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Generating ID...</span>
                        </div>
                      </div>
                      <div v-if="isCheckingStudentId" class="position-absolute top-50 end-0 translate-middle-y pe-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Checking Student ID...</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="autoGenerateEnabled && addUserForm.role && addUserForm.role !== 'superadmin' && addUserForm.role !== 'student'" class="form-text text-muted small">
                      <i class="fas fa-info-circle me-1"></i>
                      ID will be automatically generated for {{ addUserForm.role }} role
                    </div>
                    <div v-if="autoGenerateEnabled && addUserForm.role === 'student'" class="form-text text-muted small">
                      <i class="fas fa-info-circle me-1"></i>
                      Enter a custom ID for student or use school ID
                    </div>
                    <div v-if="addUserForm.role === 'student' && studentIdMessage" class="form-text small"
                      :class="{
                        'text-success': studentIdValid === true,
                        'text-danger': studentIdValid === false,
                        'text-muted': studentIdValid === null
                      }">
                      <i class="fas" :class="{
                        'fa-check-circle': studentIdValid === true,
                        'fa-exclamation-circle': studentIdValid === false,
                        'fa-info-circle': studentIdValid === null
                      }"></i>
                      {{ studentIdMessage }}
                    </div>
                  </div>
                  <div class="col-md-12">
                    <input 
                      type="email" 
                      class="form-control" 
                      id="addUserEmail" 
                      v-model="addUserForm.email" 
                      placeholder="Enter email address" 
                      required
                    >
                  </div>
                  <div class="col-md-12">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="addUserUsername" 
                      v-model="addUserForm.username" 
                      placeholder="Enter username" 
                      required
                      :readonly="isUsernameAutopopulated"
                      :class="{ 'auto-populated': isUsernameAutopopulated }"
                    >
                    <div v-if="isUsernameAutopopulated" class="form-text text-success small">
                      <i class="fas fa-check-circle me-1"></i>
                      Auto-populated from student record
                    </div>
                  </div>
                  <div class="col-md-6">
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="addUserForm.dob" 
                      placeholder="Date of Birth" 
                      required
                      @change="calculateAge"
                    >
                  </div>
                  <div class="col-md-6">
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="addUserForm.age" 
                      placeholder="Age" 
                      min="0" 
                      required
                      readonly
                      :style="{ backgroundColor: '#f8f9fa' }"
                    >
                  </div>
                  <div class="col-md-12">
                    <div class="custom-select-container">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="genderSearch"
                        @focus="showGenderDropdown = true"
                        @input="handleGenderSearch"
                        :placeholder="addUserForm.gender ? genderOptions.find(g => g.value === addUserForm.gender)?.label : 'Search gender'"
                      >
                      <div v-if="showGenderDropdown" class="custom-select-dropdown">
                        <div class="custom-select-options">
                          <div 
                            v-for="option in filteredGenders" 
                            :key="option.value"
                            class="custom-select-option"
                            @click="selectGender(option)"
                            :class="{ 'selected': option.value === addUserForm.gender }"
                          >
                            {{ option.label }}
                          </div>
                          <div v-if="filteredGenders.length === 0" class="no-results">
                            No results found
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="custom-select-container">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="nationalitySearch"
                        @focus="showNationalityDropdown = true"
                        @input="handleNationalitySearch"
                        :placeholder="addUserForm.nationality ? nationalityOptions.find(n => n.value === addUserForm.nationality)?.label : 'Search nationality'"
                      >
                      <div v-if="showNationalityDropdown" class="custom-select-dropdown">
                        <div class="custom-select-options">
                          <div 
                            v-for="option in filteredNationalities" 
                            :key="option.value"
                            class="custom-select-option"
                            @click="selectNationality(option)"
                            :class="{ 'selected': option.value === addUserForm.nationality }"
                          >
                            {{ option.label }}
                          </div>
                          <div v-if="filteredNationalities.length === 0" class="no-results">
                            No results found
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="custom-select-container">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="religionSearch"
                        @focus="showReligionDropdown = true"
                        @input="handleReligionSearch"
                        :placeholder="addUserForm.religion ? religionOptions.find(r => r.value === addUserForm.religion)?.label : 'Search religion'"
                      >
                      <div v-if="showReligionDropdown" class="custom-select-dropdown">
                        <div class="custom-select-options">
                          <div 
                            v-for="option in filteredReligions" 
                            :key="option.value"
                            class="custom-select-option"
                            @click="selectReligion(option)"
                            :class="{ 'selected': option.value === addUserForm.religion }"
                          >
                            {{ option.label }}
                          </div>
                          <div v-if="filteredReligions.length === 0" class="no-results">
                            No results found
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Role-specific Information Section -->
            <transition name="slide-fade">
              <div v-if="addUserForm.role === 'student' || addUserForm.role === 'teacher'" class="col-md-6 fade-enter">
                <div class="form-section h-100">
                  <h6 class="section-title">ACADEMIC INFORMATION</h6>
                  <div class="row g-3">
                    <!-- Academic Information -->
                    <div class="col-md-12">
                      <select 
                        class="form-select" 
                        v-model="addUserForm.class_id" 
                        :disabled="isLoadingClasses" 
                        required
                      >
                        <option value="" disabled>{{ addUserForm.role === 'student' ? 'Select class' : 'Select teaching class' }}</option>
                        <option v-for="c in classes" :key="c.class_id" :value="c.class_id">{{ c.class_name }}</option>
                      </select>
                    </div>

                    <!-- PARENT INFORMATION - Only for Students -->
                    <template v-if="addUserForm.role === 'student'">
                      <div class="col-12">
                        <h6 class="section-subtitle">PARENT INFORMATION</h6>
                      </div>
                      <div class="col-md-12">
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="addUserForm.family_name" 
                          placeholder="Parent/Guardian Name" 
                          required
                        >
                      </div>
                      <div class="col-md-12">
                        <div class="custom-select-container">
                          <input 
                            type="text" 
                            class="form-control" 
                            v-model="relationshipSearch"
                            @focus="showRelationshipDropdown = true"
                            @input="handleRelationshipSearch"
                            :placeholder="addUserForm.family_relationship ? relationshipOptions.find(r => r.value === addUserForm.family_relationship)?.label : 'Select relationship'"
                          >
                          <div v-if="showRelationshipDropdown" class="custom-select-dropdown">
                            <div class="custom-select-options">
                              <div 
                                v-for="option in filteredRelationships" 
                                :key="option.value"
                                class="custom-select-option"
                                @click="selectRelationship(option)"
                                :class="{ 'selected': option.value === addUserForm.family_relationship }"
                              >
                                {{ option.label }}
                              </div>
                              <div v-if="filteredRelationships.length === 0" class="no-results">
                                No results found
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-12">
                        <input 
                          type="email" 
                          class="form-control" 
                          v-model="addUserForm.family_email" 
                          placeholder="Parent/Guardian Email" 
                          required
                        >
                      </div>
                      <div class="col-md-12">
                        <input 
                          type="tel" 
                          class="form-control" 
                          v-model="addUserForm.emergency_contact" 
                          placeholder="Emergency Contact Number" 
                          required
                        >
                      </div>
                      <div class="col-md-12">
                        <textarea 
                          class="form-control" 
                          v-model="addUserForm.address" 
                          placeholder="Home Address"
                          rows="3"
                          required
                        ></textarea>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="addUserLoading || isGeneratingId || (addUserForm.role === 'student' && isCheckingStudentId) || (addUserForm.role === 'student' && studentIdValid === false)"
            >
              <span v-if="addUserLoading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else-if="isGeneratingId">Generating ID...</span>
              <span v-else-if="addUserForm.role === 'student' && isCheckingStudentId">Validating ID...</span>
              <span v-else>Add User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/store/auth'
import { addUserWithRole, getClasses } from '@/api/users'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { logActivity } from '@/lib/auditLogger'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'user-added'): void
}>()

const toast = useToast()
const authStore = useAuthStore()
const currentUserRole = computed(() => {
  const role = authStore.userRole?.role?.toLowerCase() || null
  console.log('Computed currentUserRole:', role)
  return role
})

const addUserForm = ref({
  email: '',
  username: '',
  role: '',
  identification: '',
  dob: '',
  age: undefined as number | undefined,
  gender: '',
  class_id: '',
  nationality: '',
  religion: '',
  family_name: '',
  family_relationship: '',
  family_email: '',
  emergency_contact: '',
  address: ''
})

const addUserLoading = ref(false)
const classes = ref<{ class_id: string; class_name: string }[]>([])
const isLoadingClasses = ref(false)
const isGeneratingId = ref(false)
const autoGenerateEnabled = ref(false)
const isUsernameAutopopulated = ref(false) // Track if username was auto-populated

// Add refs for student ID validation
const isCheckingStudentId = ref(false);
const studentIdValid = ref<boolean | null>(null);
const studentIdMessage = ref('');
const setupData = ref<{ student_check?: string } | null>(null);

// Add a debounced validation function for student ID
const validateStudentId = async () => {
  // Only validate for student role and if ID is provided
  if (addUserForm.value.role !== 'student' || !addUserForm.value.identification) {
    studentIdValid.value = null;
    studentIdMessage.value = '';
    // Clear username and family_name when ID is cleared
    if (isUsernameAutopopulated.value) {
      addUserForm.value.username = '';
      addUserForm.value.family_name = '';
      isUsernameAutopopulated.value = false;
    }
    return;
  }

  try {
    isCheckingStudentId.value = true;
    studentIdValid.value = null; // Reset to null while checking
    studentIdMessage.value = 'Checking if validation is enabled...';
    
    // First check if validation is enabled for this school
    // Get the school_id
    const schoolId = ['admin', 'registrar'].includes(currentUserRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      console.error('No school ID available');
      studentIdValid.value = null;
      studentIdMessage.value = '';
      isCheckingStudentId.value = false;
      return;
    }

    // Check setup settings - using regular supabase client for setup table
    const { data: setupDataResult, error: setupError } = await supabase
      .from('setup')
      .select('student_check')
      .eq('school_id', schoolId)
      .single();

    if (setupError) {
      console.error('Error checking student_check setting:', setupError);
      studentIdValid.value = null;
      studentIdMessage.value = '';
      isCheckingStudentId.value = false;
      return;
    }
    
    // Store the setup data for reference in the UI
    setupData.value = setupDataResult;

    // If validation is not enabled, don't show any validation messages
    if (!setupDataResult?.student_check || setupDataResult.student_check.toLowerCase() !== 'yes') {
      console.log('Student ID validation is disabled');
      studentIdValid.value = null;
      studentIdMessage.value = '';
      isCheckingStudentId.value = false;
      return;
    }
    
    // If we reach here, validation is enabled, so proceed with checking
    studentIdMessage.value = 'Checking student ID...';
    
    // Check if student exists in payments table using exact match first
    const trimmedId = addUserForm.value.identification.trim();
    
    // Use supabaseAdmin for payments table access
    if (!supabaseAdmin) {
      console.error('Admin client not available');
      studentIdValid.value = false;
      studentIdMessage.value = 'Error checking student ID. Please contact administrator.';
      isCheckingStudentId.value = false;
      return;
    }
    
    // First try exact match - include student_name and payment_by fields
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('identification, school_id, student_name, payment_by')
      .eq('school_id', schoolId)
      .eq('identification', trimmedId)
      .limit(10);

    if (paymentError) {
      console.error('Error checking student ID:', paymentError);
      studentIdValid.value = false;
      studentIdMessage.value = 'Error checking student ID. Please try again.';
      return;
    }

    // Check if we found an exact match
    let exists = paymentData && paymentData.length > 0;
    let matchedPayment = paymentData && paymentData.length > 0 ? paymentData[0] : null;

    // If no exact match, try case-insensitive search
    if (!exists) {
      console.log('No exact match found, trying case-insensitive search...');
      
      // Use Postgres ILIKE for case-insensitive search with wildcards
      const { data: caseInsensitiveResults, error: caseInsensitiveError } = await supabaseAdmin
        .from('payments')
        .select('identification, school_id, student_name, payment_by')
        .eq('school_id', schoolId)
        .or(`identification.ilike.${trimmedId},identification.ilike.%${trimmedId}%`)
        .limit(10);
        
      if (!caseInsensitiveError && caseInsensitiveResults && caseInsensitiveResults.length > 0) {
        console.log('Found case-insensitive matches:', caseInsensitiveResults);
        exists = true;
        matchedPayment = caseInsensitiveResults[0];
        
        // Display the exact ID that matched for clarity
        const matchedIds = caseInsensitiveResults.map(r => r.identification);
        console.log('Matched IDs:', matchedIds);
      }
    }
    
    // If still no match, try one more approach with a more flexible search
    if (!exists) {
      console.log('No matches found, trying more flexible pattern matching...');
      
      // Try a more flexible pattern match
      const { data: flexibleResults, error: flexibleError } = await supabaseAdmin
        .from('payments')
        .select('identification, school_id, student_name, payment_by')
        .eq('school_id', schoolId)
        .or(`identification.ilike.%${trimmedId}%,identification.ilike.${trimmedId}%,identification.ilike.%${trimmedId}`)
        .limit(10);
      
      if (!flexibleError && flexibleResults && flexibleResults.length > 0) {
        console.log('Found matches with flexible pattern matching:', flexibleResults);
        exists = true;
        matchedPayment = flexibleResults[0];
        
        // If we found matches, suggest these IDs to the user
        const matchedIds = flexibleResults.map(r => r.identification);
        console.log('Matched IDs with flexible search:', matchedIds);
        
        // Update available IDs if we don't have any yet
        if (!availableStudentIds.value.length) {
          availableStudentIds.value = matchedIds;
          hasLoadedStudentIds.value = true;
        }
      }
    }

    // Detailed debugging
    console.log('Student ID check details:', {
      enteredId: addUserForm.value.identification,
      trimmedId: trimmedId,
      schoolId: schoolId,
      paymentData: paymentData,
      paymentCount: paymentData?.length || 0,
      exists: exists,
      matchedPayment: matchedPayment
    });

    // Try a broader search without the school_id filter for debugging
    const { data: allPaymentsWithThisId, error: broadSearchError } = await supabaseAdmin
      .from('payments')
      .select('identification, school_id, student_name, payment_by')
      .ilike('identification', `%${trimmedId}%`)
      .limit(10);

    console.log('Broader search results without school filter:', {
      results: allPaymentsWithThisId,
      count: allPaymentsWithThisId?.length || 0,
      error: broadSearchError
    });

    studentIdValid.value = exists;
    
    if (exists && matchedPayment) {
      studentIdMessage.value = 'Student ID found in payment records!';
      
      // Auto-populate username with student_name if available
      if (matchedPayment.student_name && !addUserForm.value.username) {
        addUserForm.value.username = matchedPayment.student_name;
        isUsernameAutopopulated.value = true; // Set flag to make username field readonly
        console.log('Auto-populated username with student name:', matchedPayment.student_name);
      }
      
      // Auto-populate family_name with payment_by if available
      if (matchedPayment.payment_by && !addUserForm.value.family_name) {
        addUserForm.value.family_name = matchedPayment.payment_by;
        console.log('Auto-populated family name with payment by:', matchedPayment.payment_by);
      }
    } else {
      studentIdMessage.value = 'Student ID not found in payment records.';
      
      // Clear username and family_name when ID is not found
      if (isUsernameAutopopulated.value) {
        addUserForm.value.username = '';
        addUserForm.value.family_name = '';
        isUsernameAutopopulated.value = false;
      }
      
      // Refresh available IDs to help the user
      fetchAvailableStudentIds();
    }
  } catch (error) {
    console.error('Error validating student ID:', error);
    studentIdValid.value = false;
    studentIdMessage.value = 'Error checking student ID. Please try again.';
    
    // Clear username and family_name on error
    if (isUsernameAutopopulated.value) {
      addUserForm.value.username = '';
      addUserForm.value.family_name = '';
      isUsernameAutopopulated.value = false;
    }
  } finally {
    isCheckingStudentId.value = false;
  }
};

// Use a simple debounce implementation for the validation
let studentIdDebounceTimer: number | null = null;
const debouncedValidateStudentId = () => {
  if (studentIdDebounceTimer) {
    clearTimeout(studentIdDebounceTimer);
  }
  
  studentIdDebounceTimer = window.setTimeout(() => {
    validateStudentId();
  }, 500); // 500ms debounce delay
};

// Role options
const allRoleOptions = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'registrar', label: 'Registrar' }
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

// Gender options
const genderOptions = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// Nationality options
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

// Religion options
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

// Relationship options
const relationshipOptions = [
  { value: '', label: 'Select relationship' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' }
]

const nationalitySearch = ref('')
const showNationalityDropdown = ref(false)

const filteredNationalities = computed(() => {
  if (!nationalitySearch.value) return nationalityOptions.slice(1)
  const search = nationalitySearch.value.toLowerCase()
  return nationalityOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleNationalitySearch = () => {
  if (!showNationalityDropdown.value) {
    showNationalityDropdown.value = true
  }
}

interface SelectOption {
  value: string;
  label: string;
}

const selectNationality = (option: SelectOption) => {
  addUserForm.value.nationality = option.value
  nationalitySearch.value = ''
  showNationalityDropdown.value = false
}

const religionSearch = ref('')
const showReligionDropdown = ref(false)

const filteredReligions = computed(() => {
  if (!religionSearch.value) return religionOptions.slice(1) // Skip the "Select religion" option
  const search = religionSearch.value.toLowerCase()
  return religionOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleReligionSearch = () => {
  showReligionDropdown.value = true
}

const selectReligion = (option: SelectOption) => {
  addUserForm.value.religion = option.value
  religionSearch.value = option.label
  showReligionDropdown.value = false
}

const genderSearch = ref('')
const showGenderDropdown = ref(false)

const filteredGenders = computed(() => {
  if (!genderSearch.value) return genderOptions.slice(1) // Skip the "Select gender" option
  const search = genderSearch.value.toLowerCase()
  return genderOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleGenderSearch = () => {
  showGenderDropdown.value = true
}

const selectGender = (option: SelectOption) => {
  addUserForm.value.gender = option.value
  genderSearch.value = option.label
  showGenderDropdown.value = false
}

const relationshipSearch = ref('')
const showRelationshipDropdown = ref(false)

const filteredRelationships = computed(() => {
  if (!relationshipSearch.value) return relationshipOptions.slice(1) // Skip the "Select relationship" option
  const search = relationshipSearch.value.toLowerCase()
  return relationshipOptions
    .filter(option => option.value && option.label.toLowerCase().includes(search))
})

const handleRelationshipSearch = () => {
  showRelationshipDropdown.value = true
}

const selectRelationship = (option: SelectOption) => {
  addUserForm.value.family_relationship = option.value
  relationshipSearch.value = option.label
  showRelationshipDropdown.value = false
}

const closeModal = () => {
  emit('update:modelValue', false)
  addUserForm.value = { 
    email: '', 
    username: '', 
    role: '',
    identification: '',
    dob: '',
    age: undefined,
    gender: '',
    class_id: '',
    nationality: '',
    religion: '',
    family_name: '',
    family_relationship: '',
    family_email: '',
    emergency_contact: '',
    address: ''
  }
  // Reset validation states
  studentIdValid.value = null;
  studentIdMessage.value = '';
  isUsernameAutopopulated.value = false; // Reset the auto-populated flag
  if (studentIdDebounceTimer) {
    clearTimeout(studentIdDebounceTimer);
    studentIdDebounceTimer = null;
  }
}

const handleAddUser = async () => {
  if (addUserLoading.value) return
  
  // Prevent submission if student ID is being checked or is invalid
  if (addUserForm.value.role === 'student' && (isCheckingStudentId.value || studentIdValid.value === false)) {
    toast.error('Please wait for student ID validation to complete or fix the invalid ID');
    return;
  }

  try {
    // If role is student, first check if validation is required
    if (addUserForm.value.role === 'student' && addUserForm.value.identification) {
      console.log('Checking if student ID validation is needed...');
      
      // Show loading state
      addUserLoading.value = true;
      
      // Get the school_id
      const schoolId = ['admin', 'registrar'].includes(currentUserRole.value || '') 
        ? authStore.userRole?.school_id 
        : authStore.getSelectedSchoolId;

      if (!schoolId) {
        console.error('No school ID available');
        throw new Error('No school ID found. Please select a school first.');
      }

      // Check if student validation is enabled
      const { data: setupDataResult, error: setupError } = await supabase
        .from('setup')
        .select('student_check')
        .eq('school_id', schoolId)
        .single();

      if (setupError) {
        console.error('Error checking student_check setting:', setupError);
        // Continue with form submission even if we can't check the setting
      } else {
        console.log('Student check setting for form submission:', {
          setupData: setupDataResult,
          student_check: setupDataResult?.student_check,
          shouldValidate: setupDataResult?.student_check?.toLowerCase() === 'yes'
        });

        // Only validate if student_check is 'Yes'
        if (setupDataResult?.student_check?.toLowerCase() === 'yes') {
          console.log('Validating student ID before form submission...');
          
          // Check if admin client is available
          if (!supabaseAdmin) {
            console.error('Admin client not available');
            toast.error('Error accessing payment records. Please contact administrator.');
            addUserLoading.value = false;
            return;
          }
          
          // Trim the student ID for consistency
          const trimmedId = addUserForm.value.identification.trim();
          
          // First try exact match
          const { data: paymentData, error: paymentError } = await supabaseAdmin
            .from('payments')
            .select('identification, school_id')
            .eq('school_id', schoolId)
            .eq('identification', trimmedId)
            .limit(10);

          if (paymentError) {
            console.error('Error checking student ID:', paymentError);
            toast.error('Error checking student ID. Please try again.');
            addUserLoading.value = false;
            return;
          }

          // Check if we found an exact match
          let studentExists = paymentData && paymentData.length > 0;

          // If no exact match, try case-insensitive search
          if (!studentExists) {
            console.log('No exact match found during form submission, trying case-insensitive search...');
            
            // Use Postgres ILIKE for case-insensitive search with wildcards
            const { data: caseInsensitiveResults, error: caseInsensitiveError } = await supabaseAdmin
              .from('payments')
              .select('identification, school_id')
              .eq('school_id', schoolId)
              .or(`identification.ilike.${trimmedId},identification.ilike.%${trimmedId}%`)
              .limit(10);
              
            if (!caseInsensitiveError && caseInsensitiveResults && caseInsensitiveResults.length > 0) {
              console.log('Found case-insensitive matches during form submission:', caseInsensitiveResults);
              studentExists = true;
              
              // Use the exact ID that matched in the database for consistency
              if (caseInsensitiveResults[0]?.identification) {
                addUserForm.value.identification = caseInsensitiveResults[0].identification;
                console.log('Updated student ID to match database:', addUserForm.value.identification);
              }
            }
          }
           
          // If still no match, try one more approach with a more flexible search
          if (!studentExists) {
            console.log('No matches found during form submission, trying more flexible pattern matching...');
            
            // Try a more flexible pattern match
            const { data: flexibleResults, error: flexibleError } = await supabaseAdmin
              .from('payments')
              .select('identification, school_id')
              .eq('school_id', schoolId)
              .or(`identification.ilike.%${trimmedId}%,identification.ilike.${trimmedId}%,identification.ilike.%${trimmedId}`)
              .limit(10);
            
            if (!flexibleError && flexibleResults && flexibleResults.length > 0) {
              console.log('Found matches with flexible pattern matching during form submission:', flexibleResults);
              studentExists = true;
              
              // Use the exact ID that matched in the database for consistency
              if (flexibleResults[0]?.identification) {
                addUserForm.value.identification = flexibleResults[0].identification;
                console.log('Updated student ID to match database (flexible search):', addUserForm.value.identification);
              }
            }
          }
          
          // Detailed debugging
          console.log('Student ID check details for form submission:', {
            enteredId: addUserForm.value.identification,
            trimmedId,
            schoolId,
            paymentData,
            paymentCount: paymentData?.length || 0,
            studentExists
          });
          
          if (!studentExists) {
            toast.error('Student ID not found in payment records. Please check and try again.');
            addUserLoading.value = false;
            return;
          }
        } else {
          console.log('Student ID validation is disabled, skipping validation');
        }
      }
    } else {
      addUserLoading.value = true;
    }

    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(currentUserRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    // Only include school_id for non-superadmin roles
    const schoolIdToAdd = addUserForm.value.role === 'superadmin' ? null : schoolId;

    if (!schoolIdToAdd && addUserForm.value.role !== 'superadmin') {
      throw new Error('No school ID found. Please select a school first.');
    }

    const userData = await addUserWithRole({
      email: addUserForm.value.email,
      username: addUserForm.value.username,
      role: addUserForm.value.role,
      identification: addUserForm.value.identification.trim(), // Ensure ID is trimmed
      dob: addUserForm.value.dob,
      age: addUserForm.value.age || undefined,
      gender: addUserForm.value.gender,
      class_id: addUserForm.value.class_id,
      nationality: addUserForm.value.nationality,
      religion: addUserForm.value.religion,
      school_id: schoolIdToAdd,
      family_name: addUserForm.value.family_name,
      family_relationship: addUserForm.value.family_relationship,
      family_email: addUserForm.value.family_email,
      emergency_contact: addUserForm.value.emergency_contact,
      address: addUserForm.value.address
    })
    
    // Log the activity to audit_logs
    try {
      await logActivity(
        'create',
        'users',
        userData.user.id,
        null,
        {
          email: addUserForm.value.email,
          username: addUserForm.value.username,
          role: addUserForm.value.role,
          identification: addUserForm.value.identification.trim(),
          school_id: schoolIdToAdd
        }
      )
    } catch (logError) {
      console.error('Error logging user creation:', logError)
      // Don't fail the operation if logging fails
    }

    toast.success('User added successfully! Default password is: 12345678')
    emit('user-added')
    closeModal()
  } catch (error: any) {
    console.error('Error adding user:', error)
    toast.error(error.message || 'Failed to add user')
  } finally {
    addUserLoading.value = false
  }
}

// Fetch initial data
const fetchClasses = async () => {
  isLoadingClasses.value = true
  try {
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(currentUserRole.value || '')
      ? authStore.userRole?.school_id // Use registrar's assigned school_id
      : currentUserRole.value === 'admin'
        ? authStore.userRole?.school_id
        : authStore.getSelectedSchoolId;
    
    console.log('Current user role:', currentUserRole.value);
    console.log('School ID for fetching classes:', schoolId);
    
    // Only fetch classes if we have a valid school ID
    if (!schoolId) {
      classes.value = []
      console.error('No school ID available for fetching classes')
      return
    }

    // Pass the schoolId to getClasses
    classes.value = await getClasses(schoolId)
    console.log('Fetched classes:', classes.value)
  } catch (error) {
    console.error('Error fetching classes:', error)
    toast.error('Failed to fetch classes')
  } finally {
    isLoadingClasses.value = false
  }
}

// Add watch for role changes to fetch classes
watch(() => addUserForm.value.role, (newRole) => {
  if (newRole === 'student' || newRole === 'teacher') {
    fetchClasses()
  }
})

// Add watch for currentUserRole changes
watch(() => currentUserRole.value, (newRole) => {
  if (newRole) {
    fetchClasses()
  }
})

// Add the calculateAge function
const calculateAge = () => {
  if (addUserForm.value.dob) {
    const birthDate = new Date(addUserForm.value.dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    addUserForm.value.age = age
  } else {
    addUserForm.value.age = undefined
  }
}

// Add a watch for DOB changes
watch(() => addUserForm.value.dob, (newDob) => {
  if (newDob) {
    calculateAge()
  }
})

// Add a watch for identification changes when role is student
watch(() => addUserForm.value.identification, (newId, oldId) => {
  if (addUserForm.value.role === 'student' && !newId && oldId && isUsernameAutopopulated.value) {
    // Clear username and family_name when ID is manually cleared
    addUserForm.value.username = '';
    addUserForm.value.family_name = '';
    isUsernameAutopopulated.value = false;
    console.log('Cleared auto-populated fields because student ID was cleared');
  }
})

const selectedNationality = computed(() => {
  return addUserForm.value.nationality 
    ? nationalityOptions.find(n => n.value === addUserForm.value.nationality)?.label 
    : ''
})

const generateRoleBasedId = async (role: string) => {
  if (role === 'superadmin' || role === 'student') return '';

  // Define role prefixes
  const prefixes: { [key: string]: string } = {
    admin: 'AD',
    teacher: 'TA',
    student: 'ST', // Keep this for reference, even though student IDs aren't auto-generated now
    parent: 'PA',
    accountant: 'AC',
    registrar: 'RG'
  };

  const prefix = prefixes[role];
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      // Start a transaction to ensure atomicity
      const { data: latestId, error: queryError } = await supabase
        .rpc('get_next_id_for_role', {
          role_prefix: prefix,
          role_name: role
        });

      if (queryError) throw queryError;

      if (latestId) {
        // Verify the generated ID is truly unique
        const { data: existingUser, error: verifyError } = await supabase
          .from('user_roles')
          .select('identification')
          .eq('identification', latestId)
          .single();

        if (verifyError && verifyError.code === 'PGRST116') {
          // No existing user found with this ID, we can use it
          return latestId;
        }
      }

      // If we get here, either no ID was generated or it was already taken
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100 * attempts)); // Exponential backoff
    } catch (error) {
      console.error('Error generating ID:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100 * attempts));
    }
  }

  // If all attempts fail, generate a timestamp-based fallback ID
  const timestamp = Date.now().toString().slice(-6); // Take last 6 digits of timestamp
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 random digits
  const fallbackId = `${prefix}${timestamp}${random}`;
  
  // Verify the fallback ID
  const { data: existingUser, error: verifyError } = await supabase
    .from('user_roles')
    .select('identification')
    .eq('identification', fallbackId)
    .single();

  if (verifyError && verifyError.code === 'PGRST116') {
    return fallbackId;
  }

  throw new Error('Could not generate a unique ID. Please try again.');
};

// Function to check if auto-generation is enabled in setup
const checkAutoGenerateSettings = async () => {
  try {
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(currentUserRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      console.error('No school ID available');
      autoGenerateEnabled.value = false;
      return;
    }

    const { data, error } = await supabase
      .from('setup')
      .select('auto_generate_id')
      .eq('school_id', schoolId)
      .single();

    if (error) throw error;
    console.log('Auto generate settings:', data); // Debug log
    autoGenerateEnabled.value = data?.auto_generate_id === 'Yes';
  } catch (error) {
    console.error('Error checking auto-generate settings:', error);
    autoGenerateEnabled.value = false;
  }
};

// Update the role watcher
watch(() => addUserForm.value.role, async (newRole) => {
  console.log('Role changed:', { 
    newRole, 
    autoGenerateEnabled: autoGenerateEnabled.value,
    shouldGenerate: newRole && newRole !== 'superadmin' && newRole !== 'student' && autoGenerateEnabled.value 
  });
  
  // Reset validation state and auto-populated flags
  studentIdValid.value = null;
  studentIdMessage.value = '';
  isUsernameAutopopulated.value = false;
  
  // Always reset these flags when role changes
  hasLoadedStudentIds.value = false;
  availableStudentIds.value = [];
  
  // If role is student, fetch available student IDs and check if we should clear the ID
  if (newRole === 'student') {
    // Force fetch available IDs regardless of previous state
    fetchAvailableStudentIds();
    
    // Check if student_check is enabled
    const schoolId = ['admin', 'registrar'].includes(currentUserRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;
      
    if (schoolId) {
      try {
        const { data: setupData, error } = await supabase
          .from('setup')
          .select('student_check')
          .eq('school_id', schoolId)
          .single();
          
        if (!error && setupData) {
          // Only clear the identification field if student_check is not 'Yes'
          if (setupData.student_check?.toLowerCase() !== 'yes') {
            console.log('Student check is not enabled, clearing identification field');
            addUserForm.value.identification = '';
          } else {
            console.log('Student check is enabled, keeping identification field');
          }
        }
      } catch (err) {
        console.error('Error checking student_check setting:', err);
      }
    }
  } else if (newRole && newRole !== 'superadmin' && autoGenerateEnabled.value) {
    // For non-student roles, clear the ID field and generate a new one if auto-generate is enabled
    addUserForm.value.identification = '';
    try {
      isGeneratingId.value = true;
      const id = await generateRoleBasedId(newRole);
      console.log('Generated ID:', id);
      if (!id) throw new Error('Failed to generate ID');
      addUserForm.value.identification = id;
    } catch (error) {
      console.error('Error in ID generation:', error);
      toast.error('Failed to generate identification number. Please try again.');
      addUserForm.value.role = '';
    } finally {
      isGeneratingId.value = false;
    }
  } else {
    // For superadmin or when auto-generate is disabled, just clear the ID
    addUserForm.value.identification = '';
  }
});

onMounted(() => {
  // Fetch classes when component mounts
  fetchClasses();
  
  // Listen for clicks outside dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.custom-select-container')) {
      showGenderDropdown.value = false;
      showNationalityDropdown.value = false;
      showReligionDropdown.value = false;
      showRelationshipDropdown.value = false;
    }
  });
})

// Watch for school changes to recheck settings
watch(() => authStore.getSelectedSchoolId, async () => {
  await checkAutoGenerateSettings();
  // Reload classes when school changes
  fetchClasses();
});

// Add a function to fetch available student IDs
const availableStudentIds = ref<string[]>([]);
const isLoadingStudentIds = ref(false);
const hasLoadedStudentIds = ref(false);

const fetchAvailableStudentIds = async () => {
  // Only fetch IDs when role is student
  if (addUserForm.value.role !== 'student') return;
  
  // Reset the loaded state when fetching again
  hasLoadedStudentIds.value = false;
  isLoadingStudentIds.value = true;
  availableStudentIds.value = [];
  
  try {
    // Get the school_id
    const schoolId = ['admin', 'registrar'].includes(currentUserRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      console.error('No school ID available');
      return;
    }
    
    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('Admin client not available');
      toast.error('Error accessing payment records. Please contact administrator.');
      return;
    }
    
    console.log('Fetching student IDs from payments table for school:', schoolId);
    
    // Fetch all distinct student IDs from payments table for this school using admin client
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('identification')
      .eq('school_id', schoolId)
      .not('identification', 'is', null)  // Exclude null values
      .order('identification')
      .limit(100);
    
    if (error) {
      console.error('Error fetching student IDs:', error);
      return;
    }
    
    // Extract unique IDs and filter out empty strings
    const uniqueIds = [...new Set(data?.map(item => item.identification?.trim()))]
      .filter(id => id && id.trim() !== '');
    
    availableStudentIds.value = uniqueIds;
    
    console.log('Available student IDs in payments table:', {
      count: uniqueIds.length,
      ids: uniqueIds,
      rawData: data
    });
    
    hasLoadedStudentIds.value = true;
  } catch (error) {
    console.error('Error in fetchAvailableStudentIds:', error);
  } finally {
    isLoadingStudentIds.value = false;
  }
};
</script>

<style scoped lang="scss">
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
  overflow: hidden; // Prevent body scroll
}

.modern-modal-card {
  background: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 40px rgba(30, 41, 59, 0.18);
  max-width: 800px;
  width: 95%;
  padding: 2.5rem 3rem 2rem 3rem;
  position: relative;
  animation: modal-pop-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transition: all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  will-change: transform, max-width;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: visible; // Changed from auto to visible to allow dropdowns to show

  &.expanded {
    max-width: 1200px;
  }
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
    background: #f8fafc;
    border-radius: 1rem;
    padding: 1.5rem;
    height: auto;
    margin-bottom: 1rem;
    overflow: visible; // Added to ensure dropdowns are visible
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    &:hover {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }

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
    position: relative;
    padding-bottom: 0.75rem;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background: #42b883;
      border-radius: 3px;
    }
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
  transition: opacity 0.3s, transform 0.3s;
}
.modern-modal-fade-enter-from,
.modern-modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// Slide fade transition for the right panel
.slide-fade-enter-active {
  transition: all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

@media (max-width: 1200px) {
  .modern-modal-card {
    max-width: 95%;
    width: 95%;
  }
}

@media (max-width: 768px) {
  .modern-modal-card {
    padding: 2rem 1.5rem 1.5rem 1.5rem;
  }
  
  .row > [class*="col-"] {
    margin-bottom: 1rem;
  }
}

.custom-select-container {
  position: relative;
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1060; // Increased z-index to appear above modal
  max-height: 200px;
  overflow-y: auto;
  animation: dropdown-fade-in 0.2s ease;
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-select-options {
  padding: 0.5rem 0;
}

.custom-select-option {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    color: #42b883;
  }
  
  &.selected {
    background: #42b883;
    color: white;
    
    &:hover {
      background: #3aa876;
    }
  }
}

.no-results {
  padding: 0.75rem 1rem;
  color: #64748b;
  text-align: center;
  font-style: italic;
}

/* Custom scrollbar for the dropdown */
.custom-select-dropdown {
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}

// Add transition styles
.transition-width {
  transition: all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: width, flex-basis, transform;
  transform-origin: left center;
  
  &.col-md-12 {
    animation: width-full 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  &.col-md-6 {
    animation: width-half 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes width-full {
  from { width: 50%; }
  to { width: 100%; }
}

@keyframes width-half {
  from { width: 100%; }
  to { width: 50%; }
}

.fade-enter {
  animation: fadeIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.form-control {
  &.form-control {
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

  &[type="tel"] {
    letter-spacing: 0.5px;
  }
}

textarea.form-control {
  height: auto !important;
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
}

.section-subtitle {
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

// Add CSS for the available ID badges
.available-ids-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 100px;
  overflow-y: auto;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.available-id-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.available-id-badge:hover {
  background-color: #42b883;
  color: white;
}

// Add animation for form inputs
.form-control, .form-select {
  &:focus {
    animation: input-pulse 1s ease;
  }
}

@keyframes input-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(66, 184, 131, 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(66, 184, 131, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 184, 131, 0);
  }
}

// Row animation
.row.expanded {
  animation: row-expand 0.65s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes row-expand {
  from {
    opacity: 0.95;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Add styling for auto-populated fields
.auto-populated {
  background-color: #f0f9f4 !important;
  border-color: #42b883 !important;
  color: #2c3e50 !important;
  font-weight: 500;
  box-shadow: inset 0 0 0 1px rgba(66, 184, 131, 0.2);
}
</style> 