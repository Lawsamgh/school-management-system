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
                        :readonly="autoGenerateEnabled && addUserForm.role !== 'superadmin'"
                        :style="autoGenerateEnabled && addUserForm.role !== 'superadmin' ? { backgroundColor: '#f8f9fa' } : {}"
                      >
                      <div v-if="isGeneratingId" class="position-absolute top-50 end-0 translate-middle-y pe-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Generating ID...</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="autoGenerateEnabled && addUserForm.role && addUserForm.role !== 'superadmin'" class="form-text text-muted small">
                      <i class="fas fa-info-circle me-1"></i>
                      ID will be automatically generated for {{ addUserForm.role }} role
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
                    >
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
            <div v-if="addUserForm.role === 'student' || addUserForm.role === 'teacher'" class="col-md-6 fade-enter">
              <div class="form-section h-100">
                <h6 class="section-title">ACADEMIC INFORMATIONn</h6>
                <div class="row g-3">
                  <!-- Academic Information -->
                  <div v-if="addUserForm.role === 'student'" class="col-md-12">
                    <select 
                      class="form-select" 
                      v-model="addUserForm.gradeLevel" 
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
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="addUserLoading || isGeneratingId"
            >
              <span v-if="addUserLoading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else-if="isGeneratingId">Generating ID...</span>
              <span v-else>Add User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/store/auth'
import { addUserWithRole, getGrades, getClasses } from '@/api/users'
import { supabase } from '@/lib/supabase'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'user-added'): void
}>()

const toast = useToast()
const authStore = useAuthStore()
const currentUserRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)

const addUserForm = ref({
  email: '',
  username: '',
  role: '',
  identification: '',
  gradeLevel: '',
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
const grades = ref<{ id: number; grade_level: string }[]>([])
const isLoadingGrades = ref(false)
const classes = ref<{ class_id: string; class_name: string }[]>([])
const isLoadingClasses = ref(false)
const isGeneratingId = ref(false)
const autoGenerateEnabled = ref(false)

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
    gradeLevel: '',
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
}

const handleAddUser = async () => {
  if (addUserLoading.value) return

  try {
    addUserLoading.value = true

    // Get the school_id based on user role
    const schoolId = currentUserRole.value === 'admin' 
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
      identification: addUserForm.value.identification,
      gradeLevel: addUserForm.value.gradeLevel,
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

const fetchClasses = async () => {
  isLoadingClasses.value = true
  try {
    classes.value = await getClasses()
  } catch (error) {
    console.error('Error fetching classes:', error)
    toast.error('Failed to fetch classes')
  } finally {
    isLoadingClasses.value = false
  }
}

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

const selectedNationality = computed(() => {
  return addUserForm.value.nationality 
    ? nationalityOptions.find(n => n.value === addUserForm.value.nationality)?.label 
    : ''
})

const generateRoleBasedId = async (role: string) => {
  if (role === 'superadmin') return '';

  // Define role prefixes
  const prefixes: { [key: string]: string } = {
    admin: 'AD',
    teacher: 'TA',
    student: 'ST',
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
    const schoolId = currentUserRole.value === 'admin' 
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
    shouldGenerate: newRole && newRole !== 'superadmin' && autoGenerateEnabled.value 
  });
  
  addUserForm.value.identification = '';
  
  if (newRole && newRole !== 'superadmin' && autoGenerateEnabled.value) {
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
  }
});

onMounted(async () => {
  await checkAutoGenerateSettings();
  fetchGrades();
  fetchClasses();
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const containers = document.querySelectorAll('.custom-select-container')
    
    containers.forEach(container => {
      if (!container.contains(target)) {
        if (container.querySelector('input')?.placeholder.includes('nationality')) {
          showNationalityDropdown.value = false
        } else if (container.querySelector('input')?.placeholder.includes('religion')) {
          showReligionDropdown.value = false
        } else if (container.querySelector('input')?.placeholder.includes('gender')) {
          showGenderDropdown.value = false
        } else if (container.querySelector('input')?.placeholder.includes('relationship')) {
          showRelationshipDropdown.value = false
        }
      }
    })
  })
})

// Watch for school changes to recheck settings
watch(() => authStore.getSelectedSchoolId, async () => {
  await checkAutoGenerateSettings();
});
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
    background: #f8f9fa;
    border-radius: 0.75rem;
    padding: 2rem;
    margin-bottom: 1.5rem;
    height: 100%;

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
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  max-height: 250px;
  overflow-y: auto;
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
  transition: all 0.3s ease-in-out;
}

.fade-enter {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
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
</style> 