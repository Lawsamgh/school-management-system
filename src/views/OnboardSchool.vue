<!-- OnboardSchool.vue -->
<template>
  <div class="onboard-school">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <!-- Header -->
          <div class="onboard-header text-center mb-5">
            <h1>Onboard School</h1>
            <p>Complete your profile in a few simple steps</p>
          </div>

          <!-- Progress Steps -->
          <div class="progress-steps mb-5">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }"></div>
            </div>
            <div class="steps-list">
              <div 
                v-for="(step, index) in steps" 
                :key="index"
                class="step-item"
                :class="{ 
                  'active': currentStep >= index + 1, 
                  'completed': currentStep > index + 1,
                  'clickable': currentStep > index + 1
                }"
                @click="currentStep > index + 1 ? currentStep = index + 1 : null"
              >
                <div class="step-circle">
                  <i v-if="currentStep > index + 1" class="bi bi-check-lg"></i>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="step-label">{{ step }}</div>
              </div>
            </div>
          </div>

          <!-- Form Card -->
          <div class="form-card">
            <div class="form-header">
              <h2>{{ formTitle }}</h2>
              <p>{{ stepDescription }}</p>
            </div>
            
            <!-- Form Content -->
            <div class="form-content">
              <!-- Step 1: Basic Information -->
              <div v-show="currentStep === 1" class="form-step">
                <div class="form-group">
                  <label class="form-label">School Name</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-building"></i>
                    </span>
                    <input 
                      v-model="formData.schoolName"
                      type="text"
                      class="form-control form-control-lg"
                      placeholder="Enter school name"
                      required
                    >
                  </div>
                </div>
                
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Email Address</label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="bi bi-envelope"></i>
                        </span>
                        <input 
                          v-model="formData.email"
                          type="email"
                          class="form-control"
                          placeholder="school@example.com"
                          required
                        >
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Phone Number</label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="bi bi-telephone"></i>
                        </span>
                        <input 
                          v-model="formData.phone"
                          type="tel"
                          class="form-control"
                          placeholder="+233 XX XXX XXXX"
                          required
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">School Address</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-geo-alt"></i>
                    </span>
                    <textarea 
                      v-model="formData.address"
                      class="form-control"
                      rows="3"
                      placeholder="Enter complete school address"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Step 2: School Details -->
              <div v-show="currentStep === 2" class="form-step">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">School Type</label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="bi bi-mortarboard"></i>
                        </span>
                        <select v-model="formData.type" class="form-select">
                          <option value="">Select school type</option>
                          <option value="primary">Primary School</option>
                          <option value="secondary">Secondary School</option>
                          <option value="both">Both Primary & Secondary</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Established Year</label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="bi bi-calendar"></i>
                        </span>
                        <input 
                          v-model="formData.establishedYear"
                          type="number"
                          class="form-control"
                          placeholder="YYYY"
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-group mt-4">
                  <label class="form-label">School Description</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-file-text"></i>
                    </span>
                    <textarea 
                      v-model="formData.description"
                      class="form-control"
                      rows="6"
                      placeholder="Tell us about your school..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Step 3: Additional Information -->
              <div v-show="currentStep === 3" class="form-step">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">Start Date</label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="bi bi-calendar"></i>
                        </span>
                        <input 
                          v-model="formData.startDate"
                          type="date"
                          class="form-control"
                          required
                        >
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-label">End Date</label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="bi bi-calendar"></i>
                        </span>
                        <input 
                          v-model="formData.endDate"
                          type="date"
                          class="form-control"
                          required
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Navigation -->
            <div class="form-navigation">
              <button 
                v-if="currentStep > 1"
                @click="prevStep"
                class="btn btn-outline"
              >
                <i class="bi bi-arrow-left"></i>
                Previous
              </button>
              <button 
                v-if="currentStep < 3"
                @click="nextStep"
                class="btn btn-primary"
              >
                Next
                <i class="bi bi-arrow-right"></i>
              </button>
              <button 
                v-else
                @click="submitForm"
                class="btn btn-success"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner"></span>
                <span v-else>
                  <i class="bi bi-check-circle"></i>
                  Complete Setup
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

const toast = useToast()
const steps = ['Basic Information', 'School Details', 'Additional Information']
const currentStep = ref(1)

const formTitle = computed(() => {
  switch (currentStep.value) {
    case 1:
      return 'School Basic Information'
    case 2:
      return 'School Details'
    case 3:
      return 'Additional Information'
    default:
      return 'Onboard Your School'
  }
})

const stepDescription = computed(() => {
  switch (currentStep.value) {
    case 1:
      return 'Let\'s start with your school\'s basic contact information'
    case 2:
      return 'Tell us more details about your institution'
    case 3:
      return 'Select the academic year duration'
    default:
      return ''
  }
})

const formData = ref({
  schoolName: '',
  email: '',
  phone: '',
  address: '',
  type: '',
  establishedYear: '',
  description: '',
  startDate: '',
  endDate: ''
})

interface FormData {
  schoolName: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  establishedYear: string;
  description: string;
  startDate: string;
  endDate: string;
}

type Step1Fields = Pick<FormData, 'schoolName' | 'email' | 'phone' | 'address'>
type Step3Fields = Pick<FormData, 'startDate' | 'endDate'>

const isSubmitting = ref(false)

const validateStep1 = () => {
  const requiredFields: Record<keyof Step1Fields, string> = {
    schoolName: 'School Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'School Address'
  }

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!formData.value[field as keyof Step1Fields]) {
      toast.error(`${label} is required`)
      return false
    }
  }
  return true
}

const validateStep3 = () => {
  const requiredFields: Record<keyof Step3Fields, string> = {
    startDate: 'Start Date',
    endDate: 'End Date'
  }

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!formData.value[field as keyof Step3Fields]) {
      toast.error(`${label} is required`)
      return false
    }
  }
  return true
}

const nextStep = () => {
  if (currentStep.value === 1 && !validateStep1()) {
    return
  }
  
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitForm = async () => {
  if (!validateStep1() || !validateStep3()) {
    return
  }

  isSubmitting.value = true
  try {
    // Create the school record
    const schoolData = {
      name: formData.value.schoolName,
      address: formData.value.address,
      school_description: formData.value.description,
      email: formData.value.email,
      phone: formData.value.phone,
      school_type: formData.value.type,
      year: formData.value.establishedYear,
      start_date: formData.value.startDate,
      end_date: formData.value.endDate
    }

    console.log('Attempting to create school with data:', schoolData)

    const { data, error: schoolError } = await supabase
      .from('schools')
      .insert([schoolData])
      .select()
      .single()

    if (schoolError) {
      console.error('School creation error:', {
        error: schoolError,
        status: schoolError.code,
        message: schoolError.message,
        details: schoolError.details
      })
      throw schoolError
    }

    console.log('School created successfully:', data)

    // Create the setup record with the school_id
    const { error: setupError } = await supabase
      .from('setup')
      .insert([{
        school_id: data.id,
        school_name: formData.value.schoolName
      }])

    if (setupError) {
      // If setup insertion fails, delete the school record
      await supabase
        .from('schools')
        .delete()
        .eq('id', data.id)
      
      toast.error('Error creating setup record')
      throw setupError
    } else {
      toast.success('School setup completed successfully!')
      resetForm()
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 
      (error as PostgrestError)?.message || 'Unknown error occurred'
    console.error('Detailed error in school setup:', error)
    toast.error(`Error creating school: ${errorMessage}`)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    schoolName: '',
    email: '',
    phone: '',
    address: '',
    type: '',
    establishedYear: '',
    description: '',
    startDate: '',
    endDate: ''
  }
  currentStep.value = 1
}
</script>

<style scoped lang="scss">
.onboard-school {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  padding: 2rem 0;
}

.onboard-header {
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #64748b;
  }
}

.progress-steps {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;

  .progress-bar {
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;

    .progress-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      transition: width 0.4s ease;
    }
  }
}

.steps-list {
  display: flex;
  justify-content: space-between;
  position: relative;

  .step-item {
    flex: 1;
    text-align: center;
    
    .step-circle {
      width: 40px;
      height: 40px;
      margin: 0 auto 0.75rem;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #64748b;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .step-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #64748b;
      transition: all 0.3s ease;
    }

    &.active {
      .step-circle {
        background: #10b981;
        border-color: #10b981;
        color: white;
        transform: scale(1.1);
      }

      .step-label {
        color: #10b981;
        font-weight: 600;
      }
    }

    &.completed {
      .step-circle {
        background: #10b981;
        border-color: #10b981;
        color: white;
      }

      &.clickable {
        cursor: pointer;
        
        &:hover .step-circle {
          transform: scale(1.1);
        }
      }
    }
  }
}

.form-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .form-header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    padding: 2rem;
    text-align: center;
    color: white;

    h2 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    p {
      opacity: 0.9;
      margin: 0;
    }
  }
}

.form-content {
  padding: 2rem;
}

.form-step {
  animation: fadeIn 0.4s ease;
}

.form-group {
  margin-bottom: 1.5rem;

  .form-label {
    display: block;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.75rem;
  }
}

.input-group {
  .input-group-text {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-right: none;
    padding: 0.75rem;
    color: #64748b;
    
    i {
      font-size: 1.1rem;
    }
  }

  .form-control,
  .form-select {
    border: 2px solid #e2e8f0;
    border-left: none;
    padding: 0.75rem 1rem;
    color: #1e293b;
    transition: all 0.3s ease;

    &:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);

      & + .input-group-text {
        border-color: #10b981;
      }
    }

    &::placeholder {
      color: #94a3b8;
    }
  }
}

.form-navigation {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    min-width: 140px;
    justify-content: center;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    i {
      font-size: 1.1rem;
    }
  }

  .btn-outline {
    border: 2px solid #e2e8f0;
    color: #64748b;
    background: white;

    &:hover:not(:disabled) {
      border-color: #10b981;
      color: #10b981;
    }
  }

  .btn-primary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
    }
  }

  .btn-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
    }
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .onboard-header {
    h1 {
      font-size: 2rem;
    }
  }

  .form-content {
    padding: 1.5rem;
  }

  .form-navigation {
    flex-direction: column;
    gap: 1rem;

    .btn {
      width: 100%;
    }
  }

  .steps-list {
    .step-item {
      .step-circle {
        width: 36px;
        height: 36px;
      }

      .step-label {
        font-size: 0.8rem;
      }
    }
  }
}
</style> 