<template>
  <div class="modal fade" id="scheduleModal" tabindex="-1" aria-labelledby="scheduleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <h5 class="modal-title" id="scheduleModalLabel">
              <i class="fas" :class="isEditing ? 'fa-edit text-primary' : 'fa-plus-circle text-success'"></i>
              {{ isEditing ? 'Edit Schedule' : 'Add Schedule' }}
          </h5>
            <p class="modal-subtitle" v-if="isEditing">
              Editing schedule for {{ formData.subject_name }}
            </p>
            <div v-if="hasUnsavedChanges" class="unsaved-changes-badge">
              <i class="fas fa-exclamation-circle"></i>
              Unsaved changes
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close"
            @click="handleCloseButton"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="schedule-form">
            <!-- Subject Name -->
            <div class="form-group mb-4">
              <label for="subjectName" class="form-label">
                <i class="fas fa-book text-primary me-2"></i>Subject Name
                <span class="text-danger">*</span>
              </label>
              <select
                id="subjectName"
                v-model="formData.subject_name"
                class="form-control form-control-lg"
                required
                :disabled="loadingSubjects"
              >
                <option value="" disabled>
                  {{ loadingSubjects ? 'Loading subjects...' : 'Select Subject' }}
                </option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.name">
                  {{ subject.name }}
                </option>
              </select>
              <div v-if="subjects.length === 0 && !loadingSubjects" class="form-text text-muted">
                <i class="fas fa-info-circle me-1"></i>
                No subjects found for this class. Please add subjects first.
              </div>
            </div>

            <!-- Day of Week - Non-editable -->
            <div class="form-group mb-4">
              <label class="form-label">
                <i class="fas fa-calendar-day text-primary me-2"></i>Day of Week
              </label>
              <div class="form-control form-control-lg non-editable">
                {{ formData.day_of_week }}
              </div>
            </div>

            <!-- Time Range -->
            <div class="time-range mb-4" v-if="!isEditing">
              <label class="form-label">
                <i class="fas fa-clock text-primary me-2"></i>Time Range
              </label>
              <div class="row g-3">
                <div class="col-6">
                  <div class="time-input">
                    <label class="small-label">Start Time</label>
                    <div class="form-control form-control-lg non-editable">
                      {{ formatDisplayTime(formData.start_time) }}
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="time-input">
                    <label for="endTime" class="small-label">End Time</label>
                    <select
                      class="form-control form-control-lg"
                      id="endTime"
                      v-model="formData.end_time"
                      required
                    >
                      <option value="">Select end time</option>
                      <option 
                        v-for="time in availableEndTimes" 
                        :key="time"
                        :value="time"
                      >
                        {{ formatDisplayTime(time) }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Room Number -->
            <div class="form-group mb-4">
              <label for="roomNumber" class="form-label">
                <i class="fas fa-door-open text-primary me-2"></i>Room Number
              </label>
              <input
                type="text"
                class="form-control form-control-lg"
                id="roomNumber"
                v-model="formData.room_number"
                placeholder="Enter room number (optional)"
              >
            </div>

            <div class="modal-footer border-0 px-0">
              <div class="modal-actions">
                <button 
                  type="button" 
                  class="btn btn-soft btn-lg" 
                  data-bs-dismiss="modal"
                >
                  <span class="btn-content">
                    <i class="fas fa-arrow-left me-2"></i>
                    <span>Cancel</span>
                </span>
                </button>
                <button 
                  type="submit" 
                  class="btn btn-gradient btn-lg" 
                  :class="{ 'is-loading': isSubmitting }"
                  :disabled="isSubmitting"
                >
                  <span class="btn-content">
                    <i class="fas" :class="isEditing ? 'fa-save' : 'fa-plus'"></i>
                    <span class="ms-2">{{ isEditing ? 'Update Schedule' : 'Add Schedule' }}</span>
                    <svg class="btn-loader" viewBox="0 0 24 24">
                      <circle class="btn-loader-path" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteConfirmModalLabel">
            <i class="fas fa-trash-alt text-danger me-2"></i>
            Delete Schedule
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this schedule?</p>
          <p class="text-muted mb-0">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-soft" data-bs-dismiss="modal">
            <i class="fas fa-times me-2"></i>Cancel
          </button>
          <button type="button" class="btn btn-danger" @click="confirmDelete">
            <i class="fas fa-trash-alt me-2"></i>Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Modal } from 'bootstrap'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

interface ClassSchedule {
  id: string
  class_id: number
  subject_name: string
  teacher_name: string
  day_of_week: string
  start_time: string
  end_time: string
  room_number: string | null
  is_active: boolean
}

const props = defineProps<{
  classId: string | number | null,
  classSchedules?: ClassSchedule[]
}>()

const emit = defineEmits(['schedule-added', 'schedule-updated', 'fetch-schedules'])

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const modal = ref<Modal | null>(null)
const isEditing = ref(false)

const formData = ref({
  id: null as string | null,
  class_id: props.classId,
  subject_name: '',
  day_of_week: '',
  start_time: '',
  end_time: '',
  room_number: '',
  is_active: true
})

const isSubmitting = ref(false)

// Track form changes
const initialFormData = ref<string | null>(null)
const hasUnsavedChanges = ref(false)

// Get auth store instance
const authStore = useAuthStore()

// Get toast instance
const toast = useToast()

const subjects = ref<{ id: string; name: string }[]>([])
const loadingSubjects = ref(false)

// Update the availableEndTimes computed property with proper null checks
const availableEndTimes = computed(() => {
  if (!formData.value.start_time || !formData.value.day_of_week) return []
  
  const [startHours, startMinutes] = formData.value.start_time.split(':').map(Number)
  const times: string[] = []
  
  // Only show times up to 17:00 (5:00 PM)
  for (let h = startHours + 1; h <= 17; h++) {
    const time = `${h.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`
    times.push(time)
  }
  
  return times
})

// Update the watch to not automatically set end time
watch(() => formData.value.start_time, () => {
  formData.value.end_time = '' // Reset end time when start time changes
})

// Initialize form tracking
const initializeFormTracking = () => {
  initialFormData.value = JSON.stringify(formData.value)
  hasUnsavedChanges.value = false
}

// Check for unsaved changes
const checkUnsavedChanges = () => {
  if (!initialFormData.value) return false
  return initialFormData.value !== JSON.stringify(formData.value)
}

// Watch for form changes
watch(
  () => formData.value,
  () => {
    hasUnsavedChanges.value = checkUnsavedChanges()
  },
  { deep: true }
)

// Handle modal close attempt
const handleCloseAttempt = (event?: Event) => {
  // Only handle if it's not from the close button
  const target = event?.target as HTMLElement
  if (target?.classList.contains('btn-close')) {
    return
  }

  resetForm(true)
}

const resetForm = (preserveDay: boolean = false) => {
  const currentDay = preserveDay ? formData.value.day_of_week : ''
  formData.value = {
    id: null,
    class_id: props.classId,
    subject_name: '',
    day_of_week: currentDay,
    start_time: '',
    end_time: '',
    room_number: '',
    is_active: true
  }
  isEditing.value = false
  hasUnsavedChanges.value = false
  initialFormData.value = null
}

const show = (scheduleData?: any, selectedDay?: string, selectedTime?: string) => {
  if (scheduleData) {
    isEditing.value = true
    formData.value = {
      id: scheduleData.id,
      class_id: scheduleData.class_id,
      subject_name: scheduleData.subject_name,
      day_of_week: scheduleData.day_of_week,
      start_time: scheduleData.start_time,
      end_time: scheduleData.end_time,
      room_number: scheduleData.room_number,
      is_active: scheduleData.is_active
    }
  } else {
    resetForm()
    // Auto-populate day of week and start time if provided
    if (selectedDay) {
      formData.value.day_of_week = selectedDay
    }
    if (selectedTime) {
      // Convert time format from "7:00 AM" to "07:00"
      const [time, period] = selectedTime.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12
      } else if (period === 'AM' && hours === 12) {
        hours = 0
      }
      
      // Format as HH:mm
      formData.value.start_time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
  }
  // Fetch subjects when modal opens
  if (formData.value.class_id) {
    fetchSubjects()
  }
  initializeFormTracking()
  modal.value?.show()
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    
    // Get school ID from auth store
    const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
    
    if (!schoolId) {
      throw new Error('No school ID found. Please contact your administrator.')
    }
    
    if (isEditing.value) {
      const { error } = await supabase
        .from('class_schedules')
        .update({
          subject_name: formData.value.subject_name,
          day_of_week: formData.value.day_of_week,
          start_time: formData.value.start_time,
          end_time: formData.value.end_time,
          room_number: formData.value.room_number
        })
        .eq('id', formData.value.id)

      if (error) throw error
      toast.success('Schedule updated successfully')
      emit('schedule-updated')
    } else {
      // Get current user's role ID from auth store
      const roleId = authStore.userRole?.id
      if (!roleId) {
        throw new Error('User role not found. Please log in again.')
      }

      console.log('Fetching teacher info with:', { roleId, schoolId })

      // Fetch teacher's details from user_roles
      const { data: teacherData, error: teacherError } = await supabase
        .from('user_roles')
        .select('id, username, identification')
        .eq('id', roleId)  // Using the role ID instead of user UUID
        .eq('school_id', schoolId)
        .single()

      if (teacherError) {
        console.error('Teacher fetch error:', teacherError)
        throw new Error('Failed to fetch teacher information: ' + teacherError.message)
      }

      if (!teacherData) {
        throw new Error('No teacher record found.')
      }

      console.log('Found teacher data:', teacherData)

      // Use username for teacher name
      const teacherName = teacherData.username || 'Unknown Teacher'

      const { error } = await supabase
        .from('class_schedules')
        .insert([{
          class_id: props.classId,
          school_id: schoolId,
          teacher_id: teacherData.id,  // Add teacher_id from user_roles
          subject_name: formData.value.subject_name,
          teacher_name: teacherName,
          day_of_week: formData.value.day_of_week,
          start_time: formData.value.start_time,
          end_time: formData.value.end_time,
          room_number: formData.value.room_number,
          is_active: true
        }])

      if (error) throw error
      toast.success('Schedule added successfully')
      emit('schedule-added')
    }

    hasUnsavedChanges.value = false
    modal.value?.hide()
    resetForm()
  } catch (error) {
    console.error('Error saving schedule:', error)
    if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error('Failed to save schedule. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Add time formatting function
const formatDisplayTime = (time: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Add new function for close button
const handleCloseButton = () => {
  resetForm(true)
  modal.value?.hide()
}

const deleteConfirmModal = ref<Modal | null>(null)
const scheduleToDelete = ref<ClassSchedule | null>(null)

const confirmDelete = async () => {
  if (!scheduleToDelete.value) return

  try {
    const { error: deleteError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', scheduleToDelete.value.id)

    if (deleteError) throw deleteError

    // Refresh the schedules
    emit('fetch-schedules')
    toast.success('Schedule deleted successfully')
  } catch (err) {
    console.error('Error deleting schedule:', err)
    toast.error('Failed to delete schedule. Please try again.')
  } finally {
    deleteConfirmModal.value?.hide()
    scheduleToDelete.value = null
  }
}

const showDeleteConfirm = (schedule: ClassSchedule) => {
  scheduleToDelete.value = schedule
  deleteConfirmModal.value?.show()
}

// Add fetchSubjects function
const fetchSubjects = async () => {
  try {
    loadingSubjects.value = true
    // Get school ID from auth store
    const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
    
    if (!schoolId || !formData.value.class_id) return

    const { data, error } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('school_id', schoolId)
      .eq('class_id', formData.value.class_id)
      .order('name', { ascending: true })

    if (error) throw error
    subjects.value = data || []
  } catch (error: any) {
    console.error('Error fetching subjects:', error)
    toast.error('Failed to load subjects: ' + (error.message || 'Unknown error'))
  } finally {
    loadingSubjects.value = false
  }
}

// Watch for changes in class_id to fetch subjects
watch(() => formData.value.class_id, () => {
  if (formData.value.class_id) {
    fetchSubjects()
  } else {
    subjects.value = []
  }
})

onMounted(() => {
  const modalElement = document.getElementById('scheduleModal')
  const deleteConfirmModalElement = document.getElementById('deleteConfirmModal')
  
  if (modalElement) {
    modal.value = new Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    })
    modalElement.addEventListener('hide.bs.modal', handleCloseAttempt)
  }

  if (deleteConfirmModalElement) {
    deleteConfirmModal.value = new Modal(deleteConfirmModalElement)
  }
})

defineExpose({ show })
</script>

<style scoped>
.modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.modal-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title {
  color: #1a237e;
  font-weight: 600;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.modal-subtitle {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  color: #344767;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.small-label {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.form-control, .form-select {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 0.25rem rgba(25, 118, 210, 0.1);
}

.time-range {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.time-input {
  display: flex;
  flex-direction: column;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: flex-end;
}

.btn {
  position: relative;
  padding: 0.75rem 1.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.01em;
  overflow: hidden;
  transform: translateY(0);
  border: none;
}

.btn:active {
  transform: translateY(1px);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-soft {
  background: #f8f9fa;
  color: #495057;
  box-shadow: inset 0 0 0 2px #e9ecef;
}

.btn-soft:hover {
  background: #e9ecef;
  box-shadow: inset 0 0 0 2px #dee2e6;
  transform: translateY(-2px);
}

.btn-soft:active {
  background: #dee2e6;
}

.btn-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-gradient:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.btn-gradient:active:not(:disabled) {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
}

.btn-gradient:disabled {
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-loader {
  position: absolute;
  width: 24px;
  height: 24px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.btn-loader-path {
  animation: spin 1s linear infinite;
  transform-origin: center;
}

.is-loading .btn-content {
  opacity: 0;
}

.is-loading .btn-loader {
  opacity: 1;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .form-control, .form-select {
    padding: 0.5rem 0.75rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    padding: 0.875rem;
  }
}

.unsaved-changes-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fff3cd;
  color: #856404;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.unsaved-changes-badge i {
  font-size: 0.875rem;
}

.non-editable {
  background-color: #f8f9fa;
  color: #495057;
  cursor: not-allowed;
  user-select: none;
  border-color: #e9ecef;
}

.non-editable:focus {
  border-color: #e9ecef;
  box-shadow: none;
}

/* Add styles for the delete confirmation modal */
#deleteConfirmModal .modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

#deleteConfirmModal .modal-header {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-bottom: 2px solid #fecaca;
}

#deleteConfirmModal .modal-title {
  color: #dc2626;
  font-weight: 600;
}

#deleteConfirmModal .modal-body {
  padding: 1.5rem;
  color: #495057;
}

#deleteConfirmModal .modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.btn-danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.3);
  transform: translateY(-2px);
}

.btn-danger:active {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
}
</style> 